-- Phase 3: User profiles, advanced activity properties

-- User profiles table
create table if not exists public.user_profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  display_name text,
  scene_color_theme text default 'indigo' not null,
  created_at timestamp with time zone default now() not null
);

alter table public.user_profiles enable row level security;

create policy "Users can view own profile"
  on public.user_profiles for select using (auth.uid() = id);
create policy "Users can insert own profile"
  on public.user_profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile"
  on public.user_profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, display_name)
  values (new.id, new.raw_user_meta_data->>'display_name');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Activity color and recurrence bounds
alter table public.activities
  add column if not exists color_hex text,
  add column if not exists recurrence_start_date date,
  add column if not exists recurrence_end_date date;
