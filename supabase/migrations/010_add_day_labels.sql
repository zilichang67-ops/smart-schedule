-- Phase 11: Day labels (birthdays, holidays, etc.)
create table if not exists public.day_labels (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  label_date date not null,
  title text not null,
  color text default '#f59e0b' not null,
  created_at timestamp with time zone default now() not null
);

alter table public.day_labels enable row level security;

create policy "Users can view own labels"
  on public.day_labels for select using (auth.uid() = user_id);
create policy "Users can insert own labels"
  on public.day_labels for insert with check (auth.uid() = user_id);
create policy "Users can update own labels"
  on public.day_labels for update using (auth.uid() = user_id);
create policy "Users can delete own labels"
  on public.day_labels for delete using (auth.uid() = user_id);

create index if not exists day_labels_user_date_idx on public.day_labels(user_id, label_date);
