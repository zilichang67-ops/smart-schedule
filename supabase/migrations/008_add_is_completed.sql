-- Phase 9: Mark activities as completed
ALTER TABLE public.activities
  ADD COLUMN IF NOT EXISTS is_completed boolean default false not null;
