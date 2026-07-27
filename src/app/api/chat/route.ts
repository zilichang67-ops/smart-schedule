import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { type ChatMessage, type Activity } from "@/types/activity";

export const runtime = "nodejs";

function getGroq() {
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
}

const SYSTEM_PROMPT = `You are an intelligent scheduling assistant.

{{ROLE_CONTEXT}}

CAPABILITIES:
1. CREATE activities from messy text
2. MODIFY existing activities (change time, title, notes, date)
3. DELETE existing activities (single or bulk)
4. MOVE activities to different times/dates
5. SCHEDULE unscheduled items (assign time/date to pool items)

EXISTING ACTIVITIES are listed in the context below. You MUST reference them by title when modifying or deleting.

DELETE RULES:
- Single delete: action="delete_activity", target_title="exact title from list", target_date="YYYY-MM-DD"
- Bulk delete by date: action="bulk_delete", delete_filter={"date":"YYYY-MM-DD"}
- Bulk delete all unscheduled: action="bulk_delete", delete_filter={"unscheduled_only":true}
- Always confirm what you're deleting in your message

MODIFY RULES:
- Modify: action="modify_activity", target_title="exact title from list", target_date="YYYY-MM-DD", updates={changed fields}
- Only include fields that changed: start_time, end_time, title, notes, activity_date
- Always confirm what you changed

CREATE RULES:
- Create: action="create_activity", activities=[{title, start_time, end_time, notes, activity_date, is_recurring, recurrence_pattern}]
- MILESTONES (single-point actions like "leave at 3pm"): set start_time AND end_time to same value
- If start but no end, default +1 hour (unless milestone)

If info is MISSING for a create, ask 1-2 short questions. Do NOT include JSON in that case.

RESPONSE FORMAT (always JSON in \`\`\`json\n...\n\`\`\`):
{
  "action": "create_activity" | "modify_activity" | "delete_activity" | "move_activity" | "schedule_unscheduled" | "bulk_delete",
  "activities": [{ ... }],
  "target_title": "string",
  "target_date": "YYYY-MM-DD",
  "updates": { ... },
  "delete_filter": { "date": "YYYY-MM-DD", "title": "string", "unscheduled_only": boolean },
  "message": "Brief confirmation of what you did"
}

Keep responses SHORT and friendly. Today's date: {{TODAY}}`;

export async function POST(request: Request) {
  try {
    const { messages, today, existingActivities, userRole } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages array required." }, { status: 400 });
    }

    const scheduled = existingActivities?.filter((a: Activity) => a.is_scheduled) || [];
    const unscheduled = existingActivities?.filter((a: Activity) => !a.is_scheduled) || [];

    const activityContext = `\n\nEXISTING ACTIVITIES (reference these exactly by title for modify/delete):\nSCHEDULED:\n${scheduled.map((a: Activity) =>
      `- "${a.title}" on ${a.activity_date} ${a.start_time || '??:??'}-${a.end_time || '??:??'} (id: ${a.id})`
    ).join("\n") || "(none)"}\n\nUNSCHEDULED POOL:\n${unscheduled.map((a: Activity) =>
      `- "${a.title}" [precision: ${a.unscheduled_precision || 'NONE'}] ${a.target_date ? `(target: ${a.target_date})` : '(no date)'} (id: ${a.id})`
    ).join("\n") || "(none)"}`;

    const roleContext = userRole === "worker"
      ? `You are assisting a working professional. Use terminology like "meetings", "projects", "deep work", "admin", "client calls", "deadlines".`
      : `You are assisting a high school student. Use terminology like "classes", "homework", "study blocks", "exams", "P.E.".`;

    const groqMessages = [
      {
        role: "system" as const,
        content: SYSTEM_PROMPT
          .replace("{{ROLE_CONTEXT}}", roleContext)
          .replace("{{TODAY}}", today || new Date().toISOString().split("T")[0])
          + activityContext,
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
