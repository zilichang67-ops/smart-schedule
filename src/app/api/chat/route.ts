import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { type ChatMessage, type Activity } from "@/types/activity";

export const runtime = "nodejs";

function getGroq() {
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
}

const SYSTEM_PROMPT = `You are a scheduling assistant for high school students. You help parse, create, modify, move, schedule unscheduled items, and delete calendar activities.

CAPABILITIES:
1. CREATE activities from messy text
2. MODIFY existing activities (change time, title, notes, date)
3. DELETE activities (single, by date range, or bulk)
4. MOVE activities to different times/dates
5. SCHEDULE unscheduled items (assign time/date to items from unscheduled pool)

RESPONSE FORMAT:
Always respond with JSON in \`\`\`json\n...\n\`\`\` containing:
{
  "action": "create_activity" | "modify_activity" | "delete_activity" | "move_activity" | "schedule_unscheduled" | "bulk_delete",
  "activities": [{ ... }],  // for create
  "target_title": "string", // for modify/delete/move/schedule_unscheduled
  "target_date": "YYYY-MM-DD", // date context for the target
  "updates": { ... }, // for modify/move/schedule_unscheduled
  "delete_filter": { "date": "YYYY-MM-DD" | null, "title": "string" | null, "unscheduled_only": boolean | null }, // for delete/bulk_delete
  "message": "Brief confirmation."
}

If info is MISSING for a create, ask 1-2 short questions. Do NOT include JSON in that case.

RULES:
- start_time/end_time: "HH:MM" format, 24-hour
- activity_date: "YYYY-MM-DD"
- MILESTONES: Single-point actions (leave, arrive, turn in) → set start_time AND end_time to same value
- For other activities with start but no end, default end to +1 hour
- SCHEDULE_UNSCHEDULED: When user says "schedule X to [time]", find the unscheduled item by title, set its start_time, end_time, activity_date, is_scheduled=true, unscheduled_precision=null
- BULK_DELETE: When user says "delete all for Friday" or "clear unscheduled for this month", use delete_filter with date/title/unscheduled_only
- For modifications, only include fields that should change
- Keep responses SHORT and friendly
- Today's date is provided for context`;

export async function POST(request: Request) {
  try {
    const { messages, today, existingActivities } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages array required." }, { status: 400 });
    }

    const scheduled = existingActivities?.filter((a: Activity) => a.is_scheduled) || [];
    const unscheduled = existingActivities?.filter((a: Activity) => !a.is_scheduled) || [];

    const activityContext = existingActivities?.length
      ? `\n\nEXISTING ACTIVITIES:\nSCHEDULED:\n${scheduled.map((a: Activity) =>
          `- "${a.title}" on ${a.activity_date} ${a.start_time || '??:??'}-${a.end_time || '??:??'} (id: ${a.id})`
        ).join("\n") || "(none)"}\n\nUNSCHEDULED POOL:\n${unscheduled.map((a: Activity) =>
          `- "${a.title}" [precision: ${a.unscheduled_precision || 'NONE'}] ${a.target_date ? `(target: ${a.target_date})` : '(no date)'} (id: ${a.id})`
        ).join("\n") || "(none)"}`
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
          delete_filter: parsed.delete_filter || null,
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
