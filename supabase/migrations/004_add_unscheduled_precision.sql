-- Phase 5: Unscheduled precision tiers

alter table public.activities
  add column if not exists unscheduled_precision text,
  add column if not exists target_date date;
