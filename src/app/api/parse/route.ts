import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { type ParsedActivity } from "@/types/activity";

export const runtime = "nodejs";

function getGroq() {
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
}

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Please provide text to parse." },
        { status: 400 }
      );
    }

    const prompt = `You are a schedule parser for a high school student. Parse the following messy daily notes into structured activities.

Rules:
1. Extract discrete activities from the text.
2. For each activity, provide:
   - title: A clean, concise activity name
   - start_time: 24-hour format "HH:MM" if mentioned, null if not
   - end_time: 24-hour format "HH:MM" if mentioned, null if not
   - notes: Any extra context like "with Alex", "at the field", location info, etc. null if none
   - is_scheduled: true if the activity has a specific time, false if no time mentioned
3. If an activity has a start time but no end time, set end_time to 1 hour after start_time.
4. If no time indicators exist at all, mark is_scheduled as false.
5. Parse times naturally: "4pm" → "16:00", "6-7:30pm" → start "18:00" end "19:30", "sometime" → no time.
6. Only return valid JSON, no explanations.

Return a JSON array of objects with this exact structure:
[
  {
    "title": "string",
    "start_time": "HH:MM" or null,
    "end_time": "HH:MM" or null,
    "notes": "string" or null,
    "is_scheduled": boolean
  }
]

Student notes:
"""
${text}
"""`;

    const completion = await getGroq().chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      max_tokens: 2048,
    });

    const content = completion.choices[0]?.message?.content || "[]";

    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "Failed to parse AI response." },
        { status: 500 }
      );
    }

    const activities: ParsedActivity[] = JSON.parse(jsonMatch[0]);

    const validated = activities.map((a) => ({
      title: a.title || "Untitled Activity",
      start_time: a.start_time || null,
      end_time: a.end_time || null,
      notes: a.notes || null,
      is_scheduled: a.is_scheduled !== false && a.start_time !== null,
    }));

    return NextResponse.json({ activities: validated });
  } catch (error) {
    console.error("Parse error:", error);
    return NextResponse.json(
      { error: "Failed to parse schedule. Please try again." },
      { status: 500 }
    );
  }
}
