-- Phase 2: Add weekly tracking and recurring activity support

-- Add activity_date column for weekly tracking
alter table public.activities
  add column if not exists activity_date date;

-- Backfill activity_date from created_at for existing records
update public.activities
  set activity_date = created_at::date
  where activity_date is null;

-- Make activity_date required going forward
alter table public.activities
  alter column activity_date set not null,
  alter column activity_date set default current_date;

-- Add recurring activity columns
alter table public.activities
  add column if not exists is_recurring boolean default false not null;

alter table public.activities
  add column if not exists recurrence_pattern text;

alter table public.activities
  add column if not exists parent_activity_id uuid references public.activities(id) on delete cascade;

-- Index for weekly queries
create index if not exists activities_user_date_idx on public.activities(user_id, activity_date);
create index if not exists activities_parent_idx on public.activities(parent_activity_id);
