import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { type ChatMessage, type Activity } from "@/types/activity";

export const runtime = "nodejs";

function getGroq() {
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
}

const SYSTEM_PROMPT = `You are a scheduling assistant for high school students. You help parse, create, modify, and delete calendar activities.

CAPABILITIES:
1. CREATE activities from messy text
2. MODIFY existing activities (change time, title, notes, date)
3. DELETE activities
4. MOVE activities to different times/dates

RESPONSE FORMAT:
Always respond with JSON in \`\`\`json\n...\n\`\`\` containing:
{
  "action": "create_activity" | "modify_activity" | "delete_activity" | "move_activity",
  "activities": [{ ... }],  // for create
  "target_title": "string", // for modify/delete/move - title of activity to change
  "target_date": "YYYY-MM-DD", // date of the activity to change
  "updates": { "title": "...", "start_time": "...", "end_time": "...", "notes": "...", "activity_date": "..." }, // for modify/move
  "message": "Brief confirmation."
}

If info is MISSING for a create, ask 1-2 short questions. Do NOT include JSON in that case.

RULES:
- start_time/end_time: "HH:MM" format, 24-hour
- activity_date: "YYYY-MM-DD"
- is_recurring: boolean
- recurrence_pattern: "DAILY", "MON,WED,FRI", etc. or null
- recurrence_start_date/end_date: "YYYY-MM-DD" or null for date-bounded
- If start_time given but no end_time, default end to +1 hour
- For modifications, only include fields that should change
- Keep responses SHORT and friendly
- Today's date is provided for context`;

export async function POST(request: Request) {
  try {
    const { messages, today, existingActivities } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages array required." }, { status: 400 });
    }

    const activityContext = existingActivities?.length
      ? `\n\nEXISTING ACTIVITIES ON SCHEDULE:\n${existingActivities.map((a: Activity) =>
          `- "${a.title}" on ${a.activity_date} ${a.start_time || '??:??'}-${a.end_time || '??:??'} (id: ${a.id})`
        ).join("\n")}`
      : "";

    const groqMessages = [
      {
        role: "system" as const,
        content: SYSTEM_PROMPT + `\n\nToday's date: ${today || new Date().toISOString().split("T")[0]}` + activityContext,
      },
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
          message: parsed.message || "Done!",
          action: parsed.action || "create_activity",
          activities: parsed.activities || [],
          target_title: parsed.target_title || null,
          target_date: parsed.target_date || null,
          updates: parsed.updates || null,
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
