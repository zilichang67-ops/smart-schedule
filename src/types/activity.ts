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
  color_hex: string | null;
  recurrence_start_date: string | null;
  recurrence_end_date: string | null;
  unscheduled_precision: string | null;
  target_date: string | null;
  group_id: string | null;
  reminder_trigger_minutes: number | null;
  is_completed: boolean;
  created_at: string;
}

export interface ActivityGroup {
  id: string;
  user_id: string;
  name: string;
  parent_group_id: string | null;
  color_hex: string | null;
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
  recurrence_start_date: string | null;
  recurrence_end_date: string | null;
  unscheduled_precision: string | null;
  target_date: string | null;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface UserProfile {
  id: string;
  display_name: string | null;
  scene_color_theme: string;
  preferred_language: string;
  user_role: string;
  created_at: string;
}

export type UserRole = "student" | "worker";

export type SceneThemeId =
  | "indigo"
  | "ocean"
  | "sunset"
  | "forest"
  | "amethyst";

export interface SceneTheme {
  id: SceneThemeId;
  name: string;
  accent: string;
  accentLight: string;
  bg: string;
  card: string;
  border: string;
}
