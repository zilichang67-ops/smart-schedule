-- Phase 6: Activity groups, reminders, extended unscheduled

-- Activity groups (hierarchical categories)
create table if not exists public.activity_groups (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  parent_group_id uuid references public.activity_groups(id) on delete set null,
  color_hex text,
  created_at timestamp with time zone default now() not null
);

alter table public.activity_groups enable row level security;

create policy "Users can view own groups"
  on public.activity_groups for select using (auth.uid() = user_id);
create policy "Users can insert own groups"
  on public.activity_groups for insert with check (auth.uid() = user_id);
create policy "Users can update own groups"
  on public.activity_groups for update using (auth.uid() = user_id);
create policy "Users can delete own groups"
  on public.activity_groups for delete using (auth.uid() = user_id);

create index if not exists activity_groups_user_idx on public.activity_groups(user_id);

-- Add group_id and reminder to activities
alter table public.activities
  add column if not exists group_id uuid references public.activity_groups(id) on delete set null,
  add column if not exists reminder_trigger_minutes integer;
