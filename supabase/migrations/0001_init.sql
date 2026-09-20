-- ============================================================
-- Nocap — initial schema
-- Run this in the Supabase SQL editor (or via `supabase db push`)
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES
-- One row per auth user (anonymous or upgraded). Created via trigger.
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  avatar_seed jsonb not null default '{}'::jsonb,
  is_anonymous boolean not null default true,
  total_xp integer not null default 0,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  leaderboard_unlocked boolean not null default false,
  unlocked_at timestamptz,
  created_at timestamptz not null default now()
);

-- Auto-create a profile row whenever a new auth user signs up (incl. anonymous)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, is_anonymous)
  values (
    new.id,
    'nocapper_' || substr(replace(new.id::text, '-', ''), 1, 8),
    coalesce(new.is_anonymous, true)
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- THEMES — dynamic, backend-driven theming
-- ============================================================
create table public.themes (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  is_active boolean not null default false,
  tokens jsonb not null,
  created_at timestamptz not null default now()
);

-- Only one theme should be active at a time
create unique index one_active_theme on public.themes (is_active) where (is_active = true);

insert into public.themes (name, is_active, tokens) values (
  'soft_neon_default',
  true,
  '{
    "bg": "#0a0a0f",
    "panel": "#13121a",
    "panelRaised": "#191826",
    "border": "#26243a",
    "text": "#f0eef5",
    "textDim": "#8f8ba3",
    "gradientStart": "#e0308f",
    "gradientEnd": "#6a2fd9",
    "success": "#4fd6a3",
    "warning": "#e0a44d"
  }'::jsonb
);

-- ============================================================
-- TEMPLATES — blueprint for a program (built-in / user / AI)
-- ============================================================
create type template_source as enum ('builtin', 'user_created', 'ai_generated');

create table public.templates (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  category text not null default 'custom',
  duration_weeks integer, -- null = ongoing habit, no fixed end
  source template_source not null default 'user_created',
  is_public boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.template_days (
  id uuid primary key default uuid_generate_v4(),
  template_id uuid not null references public.templates(id) on delete cascade,
  week_num integer not null default 1,
  day_index integer not null, -- 1..7 within the week
  day_label text not null,
  is_rest_day boolean not null default false,
  notes text,
  unique (template_id, week_num, day_index)
);

create type proof_type as enum ('photo', 'timer', 'self_check');

create table public.template_blocks (
  id uuid primary key default uuid_generate_v4(),
  template_day_id uuid not null references public.template_days(id) on delete cascade,
  label text not null,
  task text not null,
  proof_type proof_type not null default 'self_check',
  target_duration_minutes integer, -- used when proof_type = 'timer'
  sort_order integer not null default 0
);

-- ============================================================
-- PROGRAMS — a user's running instance of a template
-- ============================================================
create type program_status as enum ('active', 'paused', 'completed', 'abandoned');

create table public.programs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  template_id uuid not null references public.templates(id) on delete restrict,
  start_date date not null default current_date,
  status program_status not null default 'active',
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  total_xp integer not null default 0,
  created_at timestamptz not null default now()
);

-- ============================================================
-- TASK LOGS — the actual proof submissions
-- ============================================================
create type task_status as enum ('completed', 'incomplete_early_exit', 'skipped');

create table public.task_logs (
  id uuid primary key default uuid_generate_v4(),
  program_id uuid not null references public.programs(id) on delete cascade,
  template_block_id uuid not null references public.template_blocks(id) on delete cascade,
  scheduled_date date not null,
  status task_status not null,
  proof_type_used proof_type not null,
  photo_path text,               -- Supabase Storage object path, if proof_type = photo
  photo_shared boolean not null default false,
  timer_seconds_target integer,
  timer_seconds_actual integer,
  xp_earned integer not null default 0,
  completed_at timestamptz not null default now(),
  unique (program_id, template_block_id, scheduled_date)
);

-- ============================================================
-- AI PLAN REQUESTS
-- ============================================================
create type ai_request_status as enum ('pending', 'completed', 'failed');

create table public.ai_plan_requests (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  goal_description text not null,
  intake_answers jsonb not null default '{}'::jsonb,
  generated_template_id uuid references public.templates(id),
  status ai_request_status not null default 'pending',
  created_at timestamptz not null default now()
);

-- ============================================================
-- LEADERBOARD VIEWS
-- ============================================================
create view public.leaderboard_global as
select
  p.id as user_id,
  p.username,
  p.avatar_seed,
  p.current_streak,
  p.total_xp,
  rank() over (order by p.current_streak desc, p.total_xp desc) as rank
from public.profiles p
where p.leaderboard_unlocked = true;

create view public.leaderboard_by_template as
select
  pr.id as program_id,
  pr.user_id,
  prof.username,
  prof.avatar_seed,
  pr.template_id,
  t.category,
  pr.current_streak,
  pr.total_xp,
  rank() over (
    partition by t.category
    order by pr.current_streak desc, pr.total_xp desc
  ) as rank
from public.programs pr
join public.profiles prof on prof.id = pr.user_id
join public.templates t on t.id = pr.template_id
where prof.leaderboard_unlocked = true
  and pr.status = 'active';

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles enable row level security;
alter table public.templates enable row level security;
alter table public.template_days enable row level security;
alter table public.template_blocks enable row level security;
alter table public.programs enable row level security;
alter table public.task_logs enable row level security;
alter table public.ai_plan_requests enable row level security;
alter table public.themes enable row level security;

-- Profiles: everyone can read basic public fields (needed for leaderboard),
-- but only the owner can update their own row.
create policy "profiles are publicly readable"
  on public.profiles for select using (true);

create policy "users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Themes: readable by everyone, not writable by clients.
create policy "themes are publicly readable"
  on public.themes for select using (true);

-- Templates: built-in and public templates are readable by everyone;
-- users can always read/write their own.
create policy "templates readable if public or own"
  on public.templates for select
  using (is_public = true or source = 'builtin' or owner_id = auth.uid());

create policy "users can create their own templates"
  on public.templates for insert
  with check (owner_id = auth.uid());

create policy "users can update their own templates"
  on public.templates for update
  using (owner_id = auth.uid());

-- Template days/blocks inherit visibility from their parent template
create policy "template_days follow template visibility"
  on public.template_days for select
  using (
    exists (
      select 1 from public.templates t
      where t.id = template_id
        and (t.is_public = true or t.source = 'builtin' or t.owner_id = auth.uid())
    )
  );

create policy "template_blocks follow template visibility"
  on public.template_blocks for select
  using (
    exists (
      select 1 from public.template_days d
      join public.templates t on t.id = d.template_id
      where d.id = template_day_id
        and (t.is_public = true or t.source = 'builtin' or t.owner_id = auth.uid())
    )
  );

-- Programs: only the owning user can see/manage their own programs
create policy "users manage own programs"
  on public.programs for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Task logs: only reachable through the owning program
create policy "users manage own task logs"
  on public.task_logs for all
  using (
    exists (
      select 1 from public.programs pr
      where pr.id = program_id and pr.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.programs pr
      where pr.id = program_id and pr.user_id = auth.uid()
    )
  );

-- AI plan requests: only the requesting user can see their own requests
create policy "users manage own ai requests"
  on public.ai_plan_requests for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
