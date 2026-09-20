-- ============================================================
-- F1.1 — Dual scheduling model (fixed_days vs frequency)
-- Run this in the Supabase SQL editor (or via `supabase db push`)
-- ============================================================

-- A template is either a fixed day-by-day plan (existing template_days /
-- day_index model from 0001) or a frequency-based one ("5 days/week", with
-- no fixed calendar position) — the Custom Builder UI already exposes this
-- choice, this migration gives it somewhere real to be saved.
create type schedule_type as enum ('fixed_days', 'frequency');

alter table public.templates
  add column schedule_type schedule_type not null default 'fixed_days';

-- A block now attaches via one of two paths:
--   - template_day_id: fixed_days templates, unchanged from 0001
--   - template_id (+ optional frequency_days_per_week): frequency templates,
--     which have no calendar day to hang off of
-- template_day_id is relaxed to nullable so a frequency block can omit it;
-- the check constraint below keeps exactly one path populated.
alter table public.template_blocks
  alter column template_day_id drop not null,
  add column template_id uuid references public.templates(id) on delete cascade,
  add column frequency_days_per_week integer;

alter table public.template_blocks
  add constraint template_blocks_single_attachment check (
    (template_day_id is not null and template_id is null)
    or (template_day_id is null and template_id is not null)
  );

alter table public.template_blocks
  add constraint template_blocks_frequency_days_only check (
    frequency_days_per_week is null or template_id is not null
  );

-- Replace the select policy so visibility resolves through whichever
-- attachment path a given block actually uses.
drop policy "template_blocks follow template visibility" on public.template_blocks;

create policy "template_blocks follow template visibility"
  on public.template_blocks for select
  using (
    exists (
      select 1 from public.template_days d
      join public.templates t on t.id = d.template_id
      where d.id = template_blocks.template_day_id
        and (t.is_public = true or t.source = 'builtin' or t.owner_id = auth.uid())
    )
    or exists (
      select 1 from public.templates t
      where t.id = template_blocks.template_id
        and (t.is_public = true or t.source = 'builtin' or t.owner_id = auth.uid())
    )
  );

-- Note: template_days/template_blocks still have no insert/update/delete
-- policies (only select, per 0001) — the Custom Builder screen is UI-only
-- so far (see CLAUDE.md / product roadmap F2.4), so write access is
-- deliberately left for that later migration rather than guessed at here.
