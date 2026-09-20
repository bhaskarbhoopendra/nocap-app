-- ============================================================
-- F2.3 — Enforce at most one active program per user
-- Same idiom already used in this schema for themes.is_active (0001_init.sql).
-- Run this in the Supabase SQL editor.
-- ============================================================

create unique index one_active_program_per_user
  on public.programs (user_id)
  where (status = 'active');
