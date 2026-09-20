-- ============================================================
-- F2.1 — Seed one real built-in template: 14-Week Job Prep & Interview Engine
-- Trimmed to Week 1 (7 days) only — proves the pipeline end-to-end without
-- hand-authoring the full 98-day schedule. Day 7 is a rest day (no blocks).
-- Run this in the Supabase SQL editor.
-- ============================================================

with new_template as (
  insert into public.templates
    (owner_id, name, description, category, duration_weeks, source, schedule_type, is_public)
  values (
    null,
    '14-Week Job Prep & Interview Engine',
    'Strict technical accountability: Daily LeetCode matrix, mock interview recordings, and portfolio commits with live screenshot proofs.',
    'career',
    14,
    'builtin',
    'fixed_days',
    true
  )
  returning id
),
days as (
  insert into public.template_days (template_id, week_num, day_index, day_label, is_rest_day, notes)
  select
    new_template.id,
    1,
    d.day_index,
    case when d.day_index = 7 then 'Day 7 · Streak Shield (Rest)' else 'Day ' || d.day_index end,
    d.day_index = 7,
    case when d.day_index = 7
      then 'Sundays are designated Streak Shields & reflection days — no penalty for rest.'
      else null
    end
  from new_template, generate_series(1, 7) as d(day_index)
  returning id, day_index
)
insert into public.template_blocks (template_day_id, label, task, proof_type, target_duration_minutes, sort_order)
select
  days.id,
  block.label,
  block.task,
  block.proof_type::proof_type,
  block.target_duration_minutes,
  block.sort_order
from days
cross join (
  values
    ('Morning LeetCode Matrix',
     'Complete 2 Data Structures & Algorithms problems (Trees & Graph traversal focus) inside a live-monitored 60-minute focus timer. Zero tab switching permitted.',
     'timer', 60, 1),
    ('System Architecture Document',
     'Produce a clean live photo or direct screenshot of your Git commit log and a UML/system design whiteboard sketch for today''s portfolio work.',
     'photo', null, 2),
    ('Recruiter & Peer Outreach',
     'Honest non-spam log of 3 personalized outreach messages or referral follow-ups sent today.',
     'self_check', null, 3)
) as block(label, task, proof_type, target_duration_minutes, sort_order)
where days.day_index <> 7;
