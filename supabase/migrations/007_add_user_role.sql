-- Phase 8: User role + forgot password support
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS user_role text default 'student' not null;
