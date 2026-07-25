export interface Activity {
  id: string;
  user_id: string;
  title: string;
  start_time: string | null;
  end_time: string | null;
  notes: string | null;
  is_scheduled: boolean;
  created_at: string;
}

export interface ParsedActivity {
  title: string;
  start_time: string | null;
  end_time: string | null;
  notes: string | null;
  is_scheduled: boolean;
}
