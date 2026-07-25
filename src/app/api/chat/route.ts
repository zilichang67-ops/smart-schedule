import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { type ChatMessage } from "@/types/activity";

export const runtime = "nodejs";

function getGroq() {
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
}

const SYSTEM_PROMPT = `You are a scheduling assistant for high school students. You help parse messy notes into structured calendar activities.

When a user sends you a message, evaluate if you have enough information to create an activity. You need:
- title (required)
- activity_date (a specific date in YYYY-MM-DD format, or null if unknown)
- start_time (HH:MM format, or null)
- end_time (HH:MM format, or null)
- notes (extra context)
- is_recurring (boolean)
- recurrence_pattern (e.g., "DAILY", "WEEKLY", "MON,WED,FRI", or null)

RULES FOR YOUR RESPONSE:
1. If you have ALL the info needed (at minimum a title), respond with a JSON block wrapped in \`\`\`json\n...\n\`\`\` containing:
   {
     "action": "create_activity",
     "activities": [{ "title": "...", "activity_date": "YYYY-MM-DD" or null, "start_time": "HH:MM" or null, "end_time": "HH:MM" or null, "notes": "..." or null, "is_recurring": boolean, "recurrence_pattern": "..." or null }],
     "message": "Brief confirmation of what you're adding."
   }

2. If info is MISSING (no date, no time, or unclear what the activity is), respond with ONLY a conversational question. Do NOT include any JSON. Just ask 1-2 short questions like:
   - "What day is that?"
   - "What time does it start and end?"
   - "When do you have soccer practice?"

3. For recurrence patterns:
   - "every day" / "daily" → recurrence_pattern: "DAILY"
   - "every Monday" → "MON"
   - "every weekday" → "MON,TUE,WED,THU,FRI"
   - "every Tuesday and Thursday" → "TUE,THU"
   - "every week" / "weekly" → repeat on the same day of the week

4. If the user says something like "move that to 5pm" or "cancel that", interpret it as an update/delete action:
   { "action": "update_activity" | "delete_activity", "activity_title": "...", "updates": {...}, "message": "..." }

5. Keep responses SHORT and friendly. You're talking to a high school student.
6. Today's date is provided in each request for context.`;

export async function POST(request: Request) {
  try {
    const { messages, today } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array required." },
        { status: 400 }
      );
    }

    const groqMessages = [
      { role: "system" as const, content: SYSTEM_PROMPT + `\n\nToday's date: ${today || new Date().toISOString().split("T")[0]}` },
      ...messages.map((m: ChatMessage) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    const completion = await getGroq().chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: groqMessages,
      temperature: 0.3,
      max_tokens: 1024,
    });

    const content = completion.choices[0]?.message?.content || "";

    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        return NextResponse.json({
          message: parsed.message || "Activity added!",
          action: parsed.action || "create_activity",
          activities: parsed.activities || [],
        });
      } catch {
        return NextResponse.json({ message: content, action: null, activities: [] });
      }
    }

    return NextResponse.json({ message: content, action: null, activities: [] });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "Failed to process. Please try again." },
      { status: 500 }
    );
  }
}
