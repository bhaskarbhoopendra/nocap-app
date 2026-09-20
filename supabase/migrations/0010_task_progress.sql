-- ============================================================
-- Task-level start/pause/complete progress (F3.2/F3.5 combined) — lets a
-- task_logs row exist *before* completion, so the Today screen can show a
-- task as "in progress" and a timer can resume correctly across
-- navigation/backgrounding, not just record a single final write.
--
-- Previously a task_logs row only ever meant "this task is done" (status
-- not null, completed_at defaulted to now() at insert time). Now a row can
-- also represent an active/paused attempt: status is null and completed_at
-- is null until the user actually finishes or ends early.
--
-- Run this in the Supabase SQL editor, after 0001-0009.
-- ============================================================

alter table public.task_logs
  alter column status drop not null,
  alter column completed_at drop not null,
  alter column completed_at drop default,
  add column started_at timestamptz,
  add column elapsed_seconds integer not null default 0,
  -- Non-null while the timer is actively ticking; null while paused or
  -- before the first start. Current elapsed = elapsed_seconds + (now() -
  -- running_since) when this is set, else just elapsed_seconds.
  add column running_since timestamptz;

-- Photo-proof blocks need their own timer too (the task detail screen shows
-- a timer for both `timer` and `photo` proof types — only `photo` also
-- requires a snap on top). Every photo block seeded before this decision
-- (0003/0006/0007/0009) left target_duration_minutes null; backfill a
-- reasonable default for the capture-prep window.
update public.template_blocks
set target_duration_minutes = 10
where proof_type = 'photo' and target_duration_minutes is null;
