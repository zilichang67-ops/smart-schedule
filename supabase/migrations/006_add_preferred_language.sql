-- Phase 7: Add preferred_language to user_profiles
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS preferred_language text default 'en' not null;
