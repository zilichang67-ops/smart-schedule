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
      return NextResponse.json({ error: "Please provide text to parse." }, { status: 400 });
    }

    const prompt = `You are a schedule parser for a high school student. Parse the following messy daily notes into structured activities.

Rules:
1. Extract discrete activities from the text.
2. For each activity, provide:
   - title: A clean, concise activity name
   - start_time: 24-hour format "HH:MM" if mentioned, null if not
   - end_time: 24-hour format "HH:MM" if mentioned, null if not
   - notes: Extra context like "with Alex", "at the field", etc. null if none
   - is_scheduled: true if the activity has a specific time, false otherwise
   - activity_date: YYYY-MM-DD if a specific date is mentioned, null otherwise
   - is_recurring: true if the activity repeats
   - recurrence_pattern: "DAILY", "MON,TUE,WED,THU,FRI", "MON,WED,FRI", "WEEKLY", or null
   - recurrence_start_date: YYYY-MM-DD for date-bounded patterns (e.g., "from Aug 1 to Sep 29"), null otherwise
   - recurrence_end_date: YYYY-MM-DD for date-bounded patterns, null otherwise
3. MILESTONES: If the phrasing is a single-point action (e.g., "leave school at 3pm", "bus arrives at 7:15", "turn in paper at midnight"), set start_time AND end_time to the SAME value. Do NOT apply the 1-hour fallback. These are point-in-time events.
4. For other activities with a start time but no end time, default end to 1 hour after start.
5. If no time indicators, mark is_scheduled as false.
6. Parse "4pm" → "16:00", "6-7:30pm" → start "18:00" end "19:30".
6. For date-bounded recurrences like "from Aug 1 to Sep 29 every Friday 3:50pm":
   - title: extract from context
   - recurrence_pattern: "FRI"
   - start_time: "15:50", end_time: "16:50"
   - recurrence_start_date: "YYYY-MM-DD"
   - recurrence_end_date: "YYYY-MM-DD"
7. Only return valid JSON, no explanations.

Return a JSON array:
[{
  "title": "string", "start_time": "HH:MM" or null, "end_time": "HH:MM" or null,
  "notes": "string" or null, "is_scheduled": boolean, "activity_date": "YYYY-MM-DD" or null,
  "is_recurring": boolean, "recurrence_pattern": "string" or null,
  "recurrence_start_date": "YYYY-MM-DD" or null, "recurrence_end_date": "YYYY-MM-DD" or null,
  "unscheduled_precision": "NONE" | "MONTH" | "DATE" or null,
  "target_date": "YYYY-MM-DD" or null
}]

Unscheduled precision rules:
- If no time is given but a month is mentioned (e.g., "sometime in October"): unscheduled_precision="MONTH", target_date="YYYY-MM-01"
- If no time is given but a specific day is mentioned (e.g., "on Tuesday"): unscheduled_precision="DATE", target_date="YYYY-MM-DD" (compute the date)
- If completely vague (e.g., "study chemistry"): unscheduled_precision="NONE", target_date=null
- If a time IS given, leave unscheduled_precision=null and target_date=null (it's scheduled)

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
      return NextResponse.json({ error: "Failed to parse AI response." }, { status: 500 });
    }

    const activities: ParsedActivity[] = JSON.parse(jsonMatch[0]);

    const validated = activities.map((a) => ({
      title: a.title || "Untitled Activity",
      start_time: a.start_time || null,
      end_time: a.end_time || null,
      notes: a.notes || null,
      is_scheduled: a.is_scheduled !== false && a.start_time !== null,
      activity_date: a.activity_date || null,
      is_recurring: a.is_recurring || false,
      recurrence_pattern: a.recurrence_pattern || null,
      recurrence_start_date: a.recurrence_start_date || null,
      recurrence_end_date: a.recurrence_end_date || null,
      unscheduled_precision: a.unscheduled_precision || null,
      target_date: a.target_date || null,
    }));

    return NextResponse.json({ activities: validated });
  } catch (error) {
    console.error("Parse error:", error);
    return NextResponse.json({ error: "Failed to parse schedule. Please try again." }, { status: 500 });
  }
}
