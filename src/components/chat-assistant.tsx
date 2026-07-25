"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { type ChatMessage, type Activity, type ActivityGroup } from "@/types/activity";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Send, X, MessageCircle } from "lucide-react";
import { useI18n } from "@/i18n/context";

interface Props {
  onActivityParsed: (activities: Omit<Activity, "id" | "user_id" | "created_at">[]) => void;
  onActivityModified: (targetTitle: string, targetDate: string, updates: Record<string, unknown>) => void;
  onActivityDeleted: (targetTitle: string, targetDate: string) => void;
  onScheduleUnscheduled: (targetTitle: string, targetDate: string, updates: Record<string, unknown>) => void;
  onBulkDelete: (filter: { date?: string | null; title?: string | null; unscheduled_only?: boolean | null; group_id?: string | null }) => void;
  today: string;
  existingActivities: Activity[];
  existingGroups: ActivityGroup[];
  userRole?: string;
  fixingActivity?: Activity | null;
  onClearFixing?: () => void;
}

const WELCOME: ChatMessage = {
  role: "assistant",
  content: "Hey! I'm your schedule assistant. Tell me about your activities, or ask me to modify, delete, or schedule unscheduled items.",
};

export function ChatAssistant({
  onActivityParsed, onActivityModified, onActivityDeleted,
  onScheduleUnscheduled, onBulkDelete,
  today, existingActivities, existingGroups, userRole, fixingActivity, onClearFixing,
}: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fixingRef = useRef<string | null>(null);
  const { t } = useI18n();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const doSend = useCallback(async (text: string) => {
    setLoading(true);
    const newMsgs: ChatMessage[] = [];
    setMessages((prev) => {
      newMsgs.push(...prev, { role: "user", content: text });
      return newMsgs;
    });

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMsgs,
          today,
          existingActivities,
          existingGroups,
          userRole: userRole || "student",
        }),
      });

      const data = await res.json();

      if (data.error) {
        setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, something went wrong." }]);
        return;
      }

      setMessages((prev) => [...prev, { role: "assistant", content: data.message }]);

      if (data.action === "create_activity" && data.activities?.length > 0) {
        onActivityParsed(data.activities);
      } else if ((data.action === "modify_activity" || data.action === "move_activity") && data.target_title && data.target_date && data.updates) {
        onActivityModified(data.target_title, data.target_date, data.updates);
      } else if (data.action === "schedule_unscheduled" && data.target_title && data.target_date) {
        onScheduleUnscheduled(data.target_title, data.target_date, data.updates || {});
      } else if (data.action === "delete_activity" && data.target_title && data.target_date) {
        onActivityDeleted(data.target_title, data.target_date);
      } else if ((data.action === "bulk_delete") && data.delete_filter) {
        onBulkDelete(data.delete_filter);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Network error. Try again?" }]);
    } finally {
      setLoading(false);
      onClearFixing?.();
    }
  }, [today, existingActivities, existingGroups, userRole, onActivityParsed, onActivityModified, onActivityDeleted, onScheduleUnscheduled, onBulkDelete, onClearFixing]);

  useEffect(() => {
    if (fixingActivity && open && fixingRef.current !== fixingActivity.id) {
      fixingRef.current = fixingActivity.id;
      const fixMsg = `I want to fix: "${fixingActivity.title}" on ${fixingActivity.activity_date} at ${fixingActivity.start_time || "no time set"}. What should I change?`;
      setMessages((prev) => [...prev, { role: "user", content: fixMsg }]);
      doSend(fixMsg);
    }
  }, [fixingActivity, open, doSend]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const text = input.trim();
    setInput("");
    await doSend(text);
  };

  if (!open) {
    return (
      <Button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 z-50"
        size="lg"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-[380px] max-w-[calc(100vw-3rem)] h-[520px] max-h-[calc(100vh-6rem)] flex flex-col shadow-2xl z-50 border-border/50">
      <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b border-border/50">
        <CardTitle className="text-sm flex items-center gap-2">
          <Bot className="h-4 w-4 text-primary" />
          {t.aiAssistant}
        </CardTitle>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setOpen(false)}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg px-3 py-2 text-sm animate-pulse">
              {t.thinking}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </CardContent>

      <div className="p-3 border-t border-border/50">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={fixingActivity ? `${t.fixPlaceholder} "${fixingActivity.title}"...` : (userRole === "worker" ? t.aiHintWorker : t.aiHintStudent)}
            disabled={loading}
            className="text-sm"
          />
          <Button type="submit" size="sm" disabled={loading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </Card>
  );
}
