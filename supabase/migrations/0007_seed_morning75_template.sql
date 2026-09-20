-- ============================================================
-- Seed: Morning 75 Deep Work & Study Sprint (Card 2 on Program Library —
-- previously a paramless "Preview" card with no template behind it, same
-- as Calisthenics still is). Mirrors the shape of
-- 0006_reseed_job_prep_template.sql: real hero stats, one seeded phase
-- (Weeks 1-2 of a 6-week program), 3 XP-bearing blocks per active day.
--
-- Weeks 3-6 are intentionally not seeded yet — same honest "not seeded
-- yet" posture as Job Prep's Phases 2-4: the phase pill just won't exist
-- for them until that content is authored.
--
-- Run this in the Supabase SQL editor, after 0001-0006.
-- ============================================================

do $$
declare
  v_template_id uuid;
  v_day_id uuid;
begin
  -- Idempotent re-run safety: wipe the old row (cascades to template_days,
  -- template_blocks, template_weeks, template_workload_categories).
  delete from public.templates where name = 'Morning 75 Deep Work & Study Sprint';

  insert into public.templates
    (owner_id, name, description, category, duration_weeks, source, schedule_type,
     is_public, pace_hours_per_week, trust_rating, review_count, integrity_label, total_hours)
  values (
    null,
    'Morning 75 Deep Work & Study Sprint',
    'Complete uninterrupted 75-minute high-cognition sessions before 9:00 AM. Anti-distraction timer enforcement with live focus validation.',
    'deep_work', 6, 'builtin', 'fixed_days', true,
    9, 4.8, 890, 'Anti-Distraction Lock', 45
  )
  returning id into v_template_id;

  insert into public.template_workload_categories (template_id, label, percentage, hours, color_role, sort_order)
  values
    (v_template_id, 'Deep Work Sessions', 73, 33, 'primary', 1),
    (v_template_id, 'Reflection & Logging', 16, 7, 'secondary', 2),
    (v_template_id, 'Weekly Retro & Planning', 11, 5, 'tertiary', 3);

  -- ============================================================
  -- WEEK 1 — Momentum Phase
  -- ============================================================
  insert into public.template_weeks (template_id, week_num, phase_num, phase_label, title, subtitle, total_hours)
  values (v_template_id, 1, 1, 'Momentum Phase', 'Building the 75-Minute Habit', 'Baseline focus reps & distraction-free ritual', 9);

  insert into public.template_days (template_id, week_num, day_index, day_label, is_rest_day)
  values (v_template_id, 1, 1, 'Day 1: Deep Work Baseline', false) returning id into v_day_id;
  insert into public.template_blocks (template_day_id, label, task, proof_type, target_duration_minutes, xp_value, sort_order)
  values
    (v_day_id, 'Focus Timer: Baseline 75-Minute Block', 'Complete one uninterrupted 75-minute deep work block before 9:00 AM. Phone in another room, single tab/app open, live-monitored timer with no pause allowed.', 'timer', 75, 75, 1),
    (v_day_id, 'Notebook Snapshot: Session Notes', 'Live photo of your handwritten notes or output from today''s session.', 'photo', null, 30, 2),
    (v_day_id, 'Distraction-Free Confirmation', 'Honest log: zero phone pickups, tab switches logged, session started before 9:00 AM.', 'self_check', null, 15, 3);

  insert into public.template_days (template_id, week_num, day_index, day_label, is_rest_day)
  values (v_template_id, 1, 2, 'Day 2: Reading & Active Recall', false) returning id into v_day_id;
  insert into public.template_blocks (template_day_id, label, task, proof_type, target_duration_minutes, xp_value, sort_order)
  values
    (v_day_id, 'Focus Timer: Reading & Recall Block', '75-minute deep reading session followed by closed-book active recall, no notes open while recalling.', 'timer', 75, 75, 1),
    (v_day_id, 'Notebook Snapshot: Recall Sheet', 'Live photo of your closed-book recall sheet written immediately after reading.', 'photo', null, 30, 2),
    (v_day_id, 'Distraction-Free Confirmation', 'Honest log confirming the session ran fully uninterrupted before 9:00 AM.', 'self_check', null, 15, 3);

  insert into public.template_days (template_id, week_num, day_index, day_label, is_rest_day)
  values (v_template_id, 1, 3, 'Day 3: Problem Sets & Deliberate Practice', false) returning id into v_day_id;
  insert into public.template_blocks (template_day_id, label, task, proof_type, target_duration_minutes, xp_value, sort_order)
  values
    (v_day_id, 'Focus Timer: Deliberate Practice Block', '75-minute block working only on problems you got wrong before — no new material.', 'timer', 75, 75, 1),
    (v_day_id, 'Notebook Snapshot: Worked Solutions', 'Live photo of today''s worked problems and corrections.', 'photo', null, 30, 2),
    (v_day_id, 'Distraction-Free Confirmation', 'Honest log noting which prior mistakes were specifically targeted today.', 'self_check', null, 15, 3);

  insert into public.template_days (template_id, week_num, day_index, day_label, is_rest_day)
  values (v_template_id, 1, 4, 'Day 4: Writing & Synthesis', false) returning id into v_day_id;
  insert into public.template_blocks (template_day_id, label, task, proof_type, target_duration_minutes, xp_value, sort_order)
  values
    (v_day_id, 'Focus Timer: Synthesis Writing Block', '75-minute block writing a synthesis summary of the week''s material in your own words.', 'timer', 75, 75, 1),
    (v_day_id, 'Notebook Snapshot: Synthesis Draft', 'Live photo of today''s written synthesis draft.', 'photo', null, 30, 2),
    (v_day_id, 'Distraction-Free Confirmation', 'Honest log confirming no reference material was open while writing from memory.', 'self_check', null, 15, 3);

  insert into public.template_days (template_id, week_num, day_index, day_label, is_rest_day)
  values (v_template_id, 1, 5, 'Day 5: Review & Spaced Repetition', false) returning id into v_day_id;
  insert into public.template_blocks (template_day_id, label, task, proof_type, target_duration_minutes, xp_value, sort_order)
  values
    (v_day_id, 'Focus Timer: Spaced Repetition Block', '75-minute block reviewing flashcards/notes from earlier in the week using spaced repetition.', 'timer', 75, 75, 1),
    (v_day_id, 'Notebook Snapshot: Review Log', 'Live photo of your spaced-repetition review log or deck stats screenshot.', 'photo', null, 30, 2),
    (v_day_id, 'Distraction-Free Confirmation', 'Honest confidence rating (1-5) logged for each topic reviewed today.', 'self_check', null, 15, 3);

  insert into public.template_days (template_id, week_num, day_index, day_label, is_rest_day)
  values (v_template_id, 1, 6, 'Day 6: Weekly Retro & Light Review', false) returning id into v_day_id;
  insert into public.template_blocks (template_day_id, label, task, proof_type, target_duration_minutes, xp_value, sort_order)
  values
    (v_day_id, 'Focus Timer: Retro & Light Review Block', '75-minute block: first 45 reviewing the week''s weakest topic, last 30 writing a written retro.', 'timer', 75, 75, 1),
    (v_day_id, 'Notebook Snapshot: Retro Notes', 'Live photo of your written Week 1 retro: what stuck, what needs another pass.', 'photo', null, 30, 2),
    (v_day_id, 'Distraction-Free Confirmation', 'Honest self-audit confirming all 6 sessions this week started before 9:00 AM.', 'self_check', null, 15, 3);

  insert into public.template_days (template_id, week_num, day_index, day_label, is_rest_day, notes)
  values (v_template_id, 1, 7, 'Day 7 · Recovery (Rest)', true,
    'One full rest day per week — no session required, streak protected.');

  -- ============================================================
  -- WEEK 2 — Momentum Phase (cont.)
  -- ============================================================
  insert into public.template_weeks (template_id, week_num, phase_num, phase_label, title, subtitle, total_hours)
  values (v_template_id, 2, 1, 'Momentum Phase', 'Compounding the Habit', 'Concept mapping, applied drills & teach-back', 9);

  insert into public.template_days (template_id, week_num, day_index, day_label, is_rest_day)
  values (v_template_id, 2, 1, 'Day 8: Deep Work — Compounding Momentum', false) returning id into v_day_id;
  insert into public.template_blocks (template_day_id, label, task, proof_type, target_duration_minutes, xp_value, sort_order)
  values
    (v_day_id, 'Focus Timer: Compounding Momentum Block', '75-minute block building directly on Week 1''s weakest topic, identified in your retro.', 'timer', 75, 75, 1),
    (v_day_id, 'Notebook Snapshot: Session Notes', 'Live photo of today''s notes or output.', 'photo', null, 30, 2),
    (v_day_id, 'Distraction-Free Confirmation', 'Honest log: zero phone pickups, session started before 9:00 AM.', 'self_check', null, 15, 3);

  insert into public.template_days (template_id, week_num, day_index, day_label, is_rest_day)
  values (v_template_id, 2, 2, 'Day 9: Reading & Concept Mapping', false) returning id into v_day_id;
  insert into public.template_blocks (template_day_id, label, task, proof_type, target_duration_minutes, xp_value, sort_order)
  values
    (v_day_id, 'Focus Timer: Concept Mapping Block', '75-minute block reading new material, then drawing a concept map linking it to prior weeks.', 'timer', 75, 75, 1),
    (v_day_id, 'Notebook Snapshot: Concept Map', 'Live photo of your hand-drawn concept map.', 'photo', null, 30, 2),
    (v_day_id, 'Distraction-Free Confirmation', 'Honest log confirming the map was drawn from memory before checking source material.', 'self_check', null, 15, 3);

  insert into public.template_days (template_id, week_num, day_index, day_label, is_rest_day)
  values (v_template_id, 2, 3, 'Day 10: Applied Problem Drills', false) returning id into v_day_id;
  insert into public.template_blocks (template_day_id, label, task, proof_type, target_duration_minutes, xp_value, sort_order)
  values
    (v_day_id, 'Focus Timer: Applied Drills Block', '75-minute block applying this week''s concepts to 3 new practice problems, timed per problem.', 'timer', 75, 75, 1),
    (v_day_id, 'Notebook Snapshot: Drill Solutions', 'Live photo of today''s 3 worked practice problems.', 'photo', null, 30, 2),
    (v_day_id, 'Distraction-Free Confirmation', 'Honest log noting per-problem time and where you got stuck.', 'self_check', null, 15, 3);

  insert into public.template_days (template_id, week_num, day_index, day_label, is_rest_day)
  values (v_template_id, 2, 4, 'Day 11: Writing & Teach-Back', false) returning id into v_day_id;
  insert into public.template_blocks (template_day_id, label, task, proof_type, target_duration_minutes, xp_value, sort_order)
  values
    (v_day_id, 'Focus Timer: Teach-Back Block', '75-minute block writing a teach-back explanation simple enough for a beginner to follow.', 'timer', 75, 75, 1),
    (v_day_id, 'Notebook Snapshot: Teach-Back Draft', 'Live photo of your written teach-back explanation.', 'photo', null, 30, 2),
    (v_day_id, 'Distraction-Free Confirmation', 'Honest log confirming no jargon was left unexplained in the teach-back.', 'self_check', null, 15, 3);

  insert into public.template_days (template_id, week_num, day_index, day_label, is_rest_day)
  values (v_template_id, 2, 5, 'Day 12: Interleaved Review', false) returning id into v_day_id;
  insert into public.template_blocks (template_day_id, label, task, proof_type, target_duration_minutes, xp_value, sort_order)
  values
    (v_day_id, 'Focus Timer: Interleaved Review Block', '75-minute block mixing review questions from both weeks in random order, no blocking by topic.', 'timer', 75, 75, 1),
    (v_day_id, 'Notebook Snapshot: Interleaved Set', 'Live photo of your worked interleaved review set.', 'photo', null, 30, 2),
    (v_day_id, 'Distraction-Free Confirmation', 'Honest log flagging which topics still felt shaky under interleaving.', 'self_check', null, 15, 3);

  insert into public.template_days (template_id, week_num, day_index, day_label, is_rest_day)
  values (v_template_id, 2, 6, 'Day 13: Phase Retro & Commitment Check', false) returning id into v_day_id;
  insert into public.template_blocks (template_day_id, label, task, proof_type, target_duration_minutes, xp_value, sort_order)
  values
    (v_day_id, 'Focus Timer: Phase Retro Block', '75-minute block: review every flagged shaky topic from Day 12, then write a full Momentum Phase retro.', 'timer', 75, 75, 1),
    (v_day_id, 'Notebook Snapshot: Phase Retro', 'Live photo of your written Momentum Phase retro: strongest habit, weakest habit, plan for next phase.', 'photo', null, 30, 2),
    (v_day_id, 'Distraction-Free Confirmation', 'Honest self-audit confirming all 12 sessions across Weeks 1-2 started before 9:00 AM.', 'self_check', null, 15, 3);

  insert into public.template_days (template_id, week_num, day_index, day_label, is_rest_day, notes)
  values (v_template_id, 2, 7, 'Day 14 · Recovery (Rest)', true,
    'One full rest day per week — no session required, streak protected.');

end $$;
