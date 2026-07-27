-- Phase 10: Timezone support
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS timezone text default 'UTC' not null;
