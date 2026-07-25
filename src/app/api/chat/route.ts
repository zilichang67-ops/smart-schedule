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
- recurrence_start_date (YYYY-MM-DD or null - when recurrence begins)
- recurrence_end_date (YYYY-MM-DD or null - when recurrence ends)

RULES:
1. If you have ALL the info (at minimum a title), respond with JSON in \`\`\`json\n...\n\`\`\`:
   {
     "action": "create_activity",
     "activities": [{
       "title": "...", "activity_date": "YYYY-MM-DD" or null,
       "start_time": "HH:MM" or null, "end_time": "HH:MM" or null,
       "notes": "..." or null, "is_recurring": boolean,
       "recurrence_pattern": "..." or null,
       "recurrence_start_date": "YYYY-MM-DD" or null,
       "recurrence_end_date": "YYYY-MM-DD" or null
     }],
     "message": "Brief confirmation."
   }

2. If info is MISSING, ask 1-2 short conversational questions. No JSON.

3. Recurrence patterns:
   - "every day" / "daily" → "DAILY"
   - "every Monday" → "MON"
   - "every weekday" → "MON,TUE,WED,THU,FRI"
   - "every Tuesday and Thursday" → "TUE,THU"
   - "every week" / "weekly" → repeat on same day of week
   - "from Aug 1 to Sep 29 every Friday" → pattern "FRI", start "2025-08-01", end "2025-09-29"

4. If start_time missing but end_time given, default start to 1 hour before end.
5. If end_time missing but start_time given, default end to 1 hour after start.

6. For date-bounded recurrences: generate instances ONLY within the date range.

Keep responses SHORT and friendly. Today's date is provided in each request.`;

export async function POST(request: Request) {
  try {
    const { messages, today } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages array required." }, { status: 400 });
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
    return NextResponse.json({ error: "Failed to process." }, { status: 500 });
  }
}
