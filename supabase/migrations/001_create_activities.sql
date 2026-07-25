-- Smart Schedule: Create activities table
-- Run this in the Supabase SQL Editor or via supabase CLI

create table if not exists public.activities (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  start_time time without time zone,
  end_time time without time zone,
  notes text,
  is_scheduled boolean default true not null,
  created_at timestamp with time zone default now() not null
);

-- Enable Row Level Security
alter table public.activities enable row level security;

-- Policy: Users can only read their own activities
create policy "Users can view own activities"
  on public.activities for select
  using (auth.uid() = user_id);

-- Policy: Users can insert their own activities
create policy "Users can insert own activities"
  on public.activities for insert
  with check (auth.uid() = user_id);

-- Policy: Users can update their own activities
create policy "Users can update own activities"
  on public.activities for update
  using (auth.uid() = user_id);

-- Policy: Users can delete their own activities
create policy "Users can delete own activities"
  on public.activities for delete
  using (auth.uid() = user_id);

-- Create index for faster queries
create index if not exists activities_user_id_idx on public.activities(user_id);
