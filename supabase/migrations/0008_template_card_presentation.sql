-- ============================================================
-- Program Library card presentation — makes the "Featured Templates" card
-- list on ProgramsScreen a real map over `templates` instead of 3
-- hardcoded JSX blocks (icon/badge/rating-suffix/tags/footer/CTA were all
-- screen-hardcoded per card). Same intent as 0005_dynamic_template_content:
-- every visual piece of a template's presentation becomes a real
-- column/row an admin dashboard can set later.
--
-- Colors/icon names for a single leaf Icon prop are stored as plain
-- text/hex (matches the existing PROOF_TYPE_META precedent — that's a
-- component prop, not a NativeWind className). Anything that maps to a
-- Tailwind className instead goes through `template_accent_role`, a small
-- enum, so the actual className strings stay static in the client's
-- ACCENT_*_CLASS maps (NativeWind's compiler needs those literal strings
-- present in source, not assembled at runtime from a DB string).
--
-- Run this in the Supabase SQL editor, after 0001-0007.
-- ============================================================

create type template_accent_role as enum ('primary', 'secondary', 'tertiary', 'neutral');

alter table public.templates
  add column icon text not null default 'bolt',
  add column icon_color text not null default '#ffb0ce',
  add column badge_label text not null default 'Built-in',
  add column badge_accent template_accent_role not null default 'primary',
  add column review_label_suffix text not null default 'reviews',
  add column cta_label text not null default 'Preview',
  add column cta_is_primary boolean not null default false,
  add column footer_icon text not null default 'view_timeline',
  add column footer_icon_color text not null default '#d1bcff',
  add column footer_label text not null default 'Daily Protocol',
  add column footer_subtitle text;

create table public.template_tags (
  id uuid primary key default uuid_generate_v4(),
  template_id uuid not null references public.templates(id) on delete cascade,
  icon text not null,
  icon_color text not null,
  accent template_accent_role not null default 'neutral',
  label text not null,
  sort_order integer not null default 0
);

alter table public.template_tags enable row level security;

-- Same read-visibility rule as template_weeks/template_workload_categories:
-- readable wherever the parent template is. No insert/update/delete
-- policies yet — future admin-dashboard work, not guessed at here.
create policy "template_tags follow template visibility"
  on public.template_tags for select
  using (
    exists (
      select 1 from public.templates t
      where t.id = template_tags.template_id
        and (t.is_public = true or t.source = 'builtin' or t.owner_id = auth.uid())
    )
  );
