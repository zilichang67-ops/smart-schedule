import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { type ChatMessage, type Activity } from "@/types/activity";

export const runtime = "nodejs";

function getGroq() {
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
}

const SYSTEM_PROMPT = `You are an intelligent scheduling assistant. You have deep calendar awareness, group management, and predictive scheduling capabilities.

{{ROLE_CONTEXT}}

CAPABILITIES:
1. CREATE activities from messy text
2. MODIFY existing activities (time, title, notes, date, group)
3. DELETE activities (single, by date, by group, or bulk)
4. MOVE activities to different times/dates
5. SCHEDULE unscheduled items (assign time/date to pool items)
6. ASSIGN GROUPS: Map activities to category groups
7. PREDICTIVE SCATTER: Generate evenly-spaced study/prep blocks across a date range
8. SMART CLARIFICATIONS: Cross-reference conflicts before asking questions

GROUPS:
- Groups are hierarchical: "School" -> "STEM", "School" -> "P.E.", "Personal" -> "Health"
- When creating/modifying activities, you can assign them to a group by name
- Available groups are listed in the context

RESPONSE FORMAT:
Always respond with JSON in \`\`\`json\n...\n\`\`\`:
{
  "action": "create_activity" | "modify_activity" | "delete_activity" | "move_activity" | "schedule_unscheduled" | "bulk_delete" | "assign_group" | "predictive_scatter",
  "activities": [{ ... }],
  "target_title": "string",
  "target_date": "YYYY-MM-DD",
  "updates": { ... },
  "delete_filter": { "date", "title", "group_id", "unscheduled_only" },
  "group_name": "string",
  "group_id": "string",
  "scatter_config": { "title": "string", "start_date": "YYYY-MM-DD", "end_date": "YYYY-MM-DD", "sessions_per_week": number, "duration_minutes": number, "preferred_times": ["HH:MM"], "group_name": "string", "reminder_minutes": number },
  "message": "Brief confirmation."
}

SMART CLARIFICATIONS:
- When user requests a time that conflicts with existing events, CHECK the schedule and suggest alternatives
- Example: "Soccer ends at 4:30, want me to put Math at 4:30 instead?"
- Reference group context when relevant: "That's under your STEM group, want to keep it there?"

PREDICTIVE SCATTER:
- When user says "help me prepare for X exam in 2 weeks", generate evenly-spaced study blocks
- Check existing schedule for free slots, avoid conflicts
- Spread sessions logically (e.g., 4 sessions/week for 2 weeks = 8 blocks)
- Add reminder if appropriate

RULES:
- start_time/end_time: "HH:MM" 24-hour, MILESTONES set same value
- unscheduled_precision: "NONE"/"MONTH"/"DATE"/"WEEK", target_date for broad items
- If start but no end, default +1 hour (unless milestone)
- For modifications, only include changed fields
- Keep responses SHORT and friendly
- Today's date provided for context`;

export async function POST(request: Request) {
  try {
    const { messages, today, existingActivities, userRole } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages array required." }, { status: 400 });
    }

    const scheduled = existingActivities?.filter((a: Activity) => a.is_scheduled) || [];
    const unscheduled = existingActivities?.filter((a: Activity) => !a.is_scheduled) || [];

    const activityContext = `\n\nEXISTING ACTIVITIES:\nSCHEDULED:\n${scheduled.map((a: Activity) =>
      `- "${a.title}" on ${a.activity_date} ${a.start_time || '??:??'}-${a.end_time || '??:??'} (id: ${a.id})`
    ).join("\n") || "(none)"}\n\nUNSCHEDULED POOL:\n${unscheduled.map((a: Activity) =>
      `- "${a.title}" [precision: ${a.unscheduled_precision || 'NONE'}] ${a.target_date ? `(target: ${a.target_date})` : '(no date)'} (id: ${a.id})`
    ).join("\n") || "(none)"}`;

    const roleContext = userRole === "worker"
      ? `You are assisting a working professional. Use terminology like "meetings", "projects", "deep work", "admin", "client calls", "deadlines". Suggest groups like "Work", "Projects", "Meetings", "Admin".`
      : `You are assisting a high school student. Use terminology like "classes", "homework", "study blocks", "exams", "P.E.". Suggest groups like "School", "STEM", "P.E.", "Personal".`;

    const groqMessages = [
      {
        role: "system" as const,
        content: SYSTEM_PROMPT.replace("{{ROLE_CONTEXT}}", roleContext) + `\n\nToday's date: ${today || new Date().toISOString().split("T")[0]}` + activityContext,
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
      max_tokens: 1500,
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
          group_name: parsed.group_name || null,
          group_id: parsed.group_id || null,
          scatter_config: parsed.scatter_config || null,
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
