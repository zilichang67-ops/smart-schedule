export interface Activity {
  id: string;
  user_id: string;
  title: string;
  start_time: string | null;
  end_time: string | null;
  notes: string | null;
  is_scheduled: boolean;
  activity_date: string;
  is_recurring: boolean;
  recurrence_pattern: string | null;
  parent_activity_id: string | null;
  created_at: string;
}

export interface ParsedActivity {
  title: string;
  start_time: string | null;
  end_time: string | null;
  notes: string | null;
  is_scheduled: boolean;
  activity_date: string | null;
  is_recurring: boolean;
  recurrence_pattern: string | null;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
