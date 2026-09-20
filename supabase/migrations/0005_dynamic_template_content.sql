-- ============================================================
-- Dynamic template content — makes every piece of the Template Detail
-- screen a real column/row instead of screen-hardcoded content, so a
-- future admin dashboard can create/edit templates without touching code.
--
-- New surface area:
--   - templates: hero stats (pace, trust rating, review count, integrity
--     label, total workload hours)
--   - template_weeks: one row per week — title/subtitle/hours/phase
--     grouping (template_days already carries day-level content via its
--     existing week_num column from 0001_init.sql; this is the missing
--     week-level layer)
--   - template_workload_categories: the "Workload Calibration" bar's
--     category breakdown (label/percentage/hours), a variable number of
--     categories per template rather than a hardcoded 3
--   - template_blocks.xp_value: XP is now a real per-block column instead
--     of being derived client-side from proof_type
--
-- Run this in the Supabase SQL editor.
-- ============================================================

alter table public.templates
  add column pace_hours_per_week integer,
  add column trust_rating numeric(2, 1),
  add column review_count integer not null default 0,
  add column integrity_label text not null default 'Zero-Cheat Sync',
  add column total_hours integer;

alter table public.template_blocks
  add column xp_value integer not null default 0;

create table public.template_weeks (
  id uuid primary key default uuid_generate_v4(),
  template_id uuid not null references public.templates(id) on delete cascade,
  week_num integer not null,
  phase_num integer not null,
  phase_label text not null,
  title text not null,
  subtitle text,
  total_hours integer,
  unique (template_id, week_num)
);

create table public.template_workload_categories (
  id uuid primary key default uuid_generate_v4(),
  template_id uuid not null references public.templates(id) on delete cascade,
  label text not null,
  percentage integer not null check (percentage between 0 and 100),
  hours integer,
  -- Matches the app's fixed 3-accent palette (primary/secondary/tertiary) so
  -- the client can pick the right token color without hardcoding a 4th one.
  color_role text not null check (color_role in ('primary', 'secondary', 'tertiary')),
  sort_order integer not null default 0
);

alter table public.template_weeks enable row level security;
alter table public.template_workload_categories enable row level security;

-- Same read-visibility rule as template_days/template_blocks: readable
-- wherever the parent template is (public.templates already has this exact
-- policy shape — mirrored here). No insert/update/delete policies yet, same
-- as template_days/template_blocks — write access is future admin-dashboard
-- work, not guessed at here.
create policy "template_weeks follow template visibility"
  on public.template_weeks for select
  using (
    exists (
      select 1 from public.templates t
      where t.id = template_weeks.template_id
        and (t.is_public = true or t.source = 'builtin' or t.owner_id = auth.uid())
    )
  );

create policy "template_workload_categories follow template visibility"
  on public.template_workload_categories for select
  using (
    exists (
      select 1 from public.templates t
      where t.id = template_workload_categories.template_id
        and (t.is_public = true or t.source = 'builtin' or t.owner_id = auth.uid())
    )
  );
