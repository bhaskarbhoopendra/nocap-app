-- ============================================================
-- Seed Program Library card presentation for the two existing templates,
-- and fully seed the third card (100-Day Calisthenics & Mobility never had
-- a real template row at all — it was pure hardcoded JSX).
--
-- Run this in the Supabase SQL editor, after 0008.
-- ============================================================

do $$
declare
  v_job_prep_id uuid;
  v_morning75_id uuid;
  v_calisthenics_id uuid;
  v_day_id uuid;
begin
  -- ------------------------------------------------------------
  -- 14-Week Job Prep & Interview Engine — presentation only
  -- (curriculum already seeded by 0006).
  -- ------------------------------------------------------------
  select id into v_job_prep_id from public.templates
    where name = '14-Week Job Prep & Interview Engine';

  update public.templates set
    icon = 'code', icon_color = '#ffb0ce',
    badge_label = 'Built-in Track', badge_accent = 'primary',
    review_label_suffix = 'reviews',
    cta_label = 'Clone Track', cta_is_primary = true,
    footer_icon = 'view_timeline', footer_icon_color = '#d1bcff',
    footer_label = 'Daily Protocol', footer_subtitle = '2 Problems • 45m Pomodoro • Git Commit'
  where id = v_job_prep_id;

  delete from public.template_tags where template_id = v_job_prep_id;
  insert into public.template_tags (template_id, icon, icon_color, accent, label, sort_order)
  values
    (v_job_prep_id, 'lock_clock', '#ffb0ce', 'primary', 'Photo + Timer Blocks', 1),
    (v_job_prep_id, 'group', '#dfbec9', 'neutral', '1.2k nocappers active', 2),
    (v_job_prep_id, 'event_repeat', '#00dbe9', 'tertiary', '98 Days Duration', 3);

  -- ------------------------------------------------------------
  -- Morning 75 Deep Work & Study Sprint — presentation only
  -- (curriculum already seeded by 0007).
  -- ------------------------------------------------------------
  select id into v_morning75_id from public.templates
    where name = 'Morning 75 Deep Work & Study Sprint';

  update public.templates set
    icon = 'hourglass_empty', icon_color = '#00dbe9',
    badge_label = 'Built-in • Sprint', badge_accent = 'tertiary',
    review_label_suffix = 'active',
    cta_label = 'Preview', cta_is_primary = false,
    footer_icon = 'verified_user', footer_icon_color = '#00dbe9',
    footer_label = 'Proof Rule', footer_subtitle = 'Zero tab switching • Live timer finish'
  where id = v_morning75_id;

  delete from public.template_tags where template_id = v_morning75_id;
  insert into public.template_tags (template_id, icon, icon_color, accent, label, sort_order)
  values
    (v_morning75_id, 'timer', '#00dbe9', 'tertiary', 'Timer-based Enforcement', 1),
    (v_morning75_id, 'calendar_month', '#dfbec9', 'neutral', '42-Day Cycle', 2),
    (v_morning75_id, 'local_fire_department', '#d1bcff', 'secondary', '3.4x Streak Multiplier', 3);

  -- ------------------------------------------------------------
  -- 12-Week Calisthenics & Mobility Reset — brand new template, full seed
  -- (never had a real row — Card 3 was pure hardcoded JSX before this).
  -- ------------------------------------------------------------
  delete from public.templates where name = '12-Week Calisthenics & Mobility Reset';

  insert into public.templates
    (owner_id, name, description, category, duration_weeks, source, schedule_type,
     is_public, pace_hours_per_week, trust_rating, review_count, integrity_label, total_hours,
     icon, icon_color, badge_label, badge_accent, review_label_suffix,
     cta_label, cta_is_primary, footer_icon, footer_icon_color, footer_label, footer_subtitle)
  values (
    null,
    '12-Week Calisthenics & Mobility Reset',
    'Progressive bodyweight volume: 100 pull-ups, 200 pushups, 15m hip mobility daily. Daily timestamped mirror confirmation required.',
    'fitness', 12, 'builtin', 'fixed_days', true,
    8, 5.0, 610, 'Zero-Cheat Sync', 40,
    'sports_gymnastics', '#d1bcff', 'Built-in • Hard', 'secondary', 'active',
    'Preview', false, 'center_focus_strong', '#ffb0ce', 'Anti-Cheat Mode', 'EXIF metadata + live camera capture'
  )
  returning id into v_calisthenics_id;

  insert into public.template_tags (template_id, icon, icon_color, accent, label, sort_order)
  values
    (v_calisthenics_id, 'photo_camera', '#ffb0ce', 'primary', 'Photo-proof Verified', 1),
    (v_calisthenics_id, 'calendar_today', '#dfbec9', 'neutral', '84 Days Duration', 2),
    (v_calisthenics_id, 'military_tech', '#d1bcff', 'secondary', 'Gold Badge Tier', 3);

  insert into public.template_workload_categories (template_id, label, percentage, hours, color_role, sort_order)
  values
    (v_calisthenics_id, 'Push Volume', 35, 14, 'primary', 1),
    (v_calisthenics_id, 'Pull Volume', 35, 14, 'secondary', 2),
    (v_calisthenics_id, 'Mobility & Core', 30, 12, 'tertiary', 3);

  -- ============================================================
  -- WEEK 1 — Volume Foundation
  -- ============================================================
  insert into public.template_weeks (template_id, week_num, phase_num, phase_label, title, subtitle, total_hours)
  values (v_calisthenics_id, 1, 1, 'Volume Foundation', 'Baseline Volume & Mirror Discipline', 'Push/pull/leg baselines & timestamped proof ritual', 10);

  insert into public.template_days (template_id, week_num, day_index, day_label, is_rest_day)
  values (v_calisthenics_id, 1, 1, 'Day 1: Push Volume Baseline', false) returning id into v_day_id;
  insert into public.template_blocks (template_day_id, label, task, proof_type, target_duration_minutes, xp_value, sort_order)
  values
    (v_day_id, 'Workout Timer: Push Circuit', '200 total pushups across max-effort sets (any split), inside a live-monitored 45-minute session.', 'timer', 45, 50, 1),
    (v_day_id, 'Mirror Confirmation Snap', 'Timestamped mirror photo taken immediately after the final set, in workout clothes with visible clock/watch.', 'photo', null, 50, 2),
    (v_day_id, 'Rep Count Honesty Log', 'Honest log of every set and rep count, including any failed reps.', 'self_check', null, 20, 3);

  insert into public.template_days (template_id, week_num, day_index, day_label, is_rest_day)
  values (v_calisthenics_id, 1, 2, 'Day 2: Pull Volume Baseline', false) returning id into v_day_id;
  insert into public.template_blocks (template_day_id, label, task, proof_type, target_duration_minutes, xp_value, sort_order)
  values
    (v_day_id, 'Workout Timer: Pull Circuit', '100 total pull-ups across max-effort sets (assisted variations allowed), inside a live-monitored 45-minute session.', 'timer', 45, 50, 1),
    (v_day_id, 'Mirror Confirmation Snap', 'Timestamped mirror photo taken immediately after the final set.', 'photo', null, 50, 2),
    (v_day_id, 'Rep Count Honesty Log', 'Honest log of every set and rep count, including assistance used.', 'self_check', null, 20, 3);

  insert into public.template_days (template_id, week_num, day_index, day_label, is_rest_day)
  values (v_calisthenics_id, 1, 3, 'Day 3: Leg & Core Baseline', false) returning id into v_day_id;
  insert into public.template_blocks (template_day_id, label, task, proof_type, target_duration_minutes, xp_value, sort_order)
  values
    (v_day_id, 'Workout Timer: Leg & Core Circuit', 'Bodyweight squats, lunges, and a core finisher inside a live-monitored 45-minute session.', 'timer', 45, 50, 1),
    (v_day_id, 'Mirror Confirmation Snap', 'Timestamped mirror photo taken immediately after the final set.', 'photo', null, 50, 2),
    (v_day_id, 'Rep Count Honesty Log', 'Honest log of every set and rep count for legs and core.', 'self_check', null, 20, 3);

  insert into public.template_days (template_id, week_num, day_index, day_label, is_rest_day)
  values (v_calisthenics_id, 1, 4, 'Day 4: Mobility & Recovery Flow', false) returning id into v_day_id;
  insert into public.template_blocks (template_day_id, label, task, proof_type, target_duration_minutes, xp_value, sort_order)
  values
    (v_day_id, 'Workout Timer: Hip Mobility Flow', '15 minutes of hip mobility flow plus 30 minutes of light active recovery, live-monitored.', 'timer', 45, 50, 1),
    (v_day_id, 'Mirror Confirmation Snap', 'Timestamped mirror photo of your end-range hip mobility position.', 'photo', null, 50, 2),
    (v_day_id, 'Rep Count Honesty Log', 'Honest log noting which mobility drills felt restricted today.', 'self_check', null, 20, 3);

  insert into public.template_days (template_id, week_num, day_index, day_label, is_rest_day)
  values (v_calisthenics_id, 1, 5, 'Day 5: Push + Pull Combo', false) returning id into v_day_id;
  insert into public.template_blocks (template_day_id, label, task, proof_type, target_duration_minutes, xp_value, sort_order)
  values
    (v_day_id, 'Workout Timer: Combo Circuit', 'Alternating push/pull superset circuit inside a live-monitored 45-minute session.', 'timer', 45, 50, 1),
    (v_day_id, 'Mirror Confirmation Snap', 'Timestamped mirror photo taken immediately after the final set.', 'photo', null, 50, 2),
    (v_day_id, 'Rep Count Honesty Log', 'Honest log of every superset round completed.', 'self_check', null, 20, 3);

  insert into public.template_days (template_id, week_num, day_index, day_label, is_rest_day)
  values (v_calisthenics_id, 1, 6, 'Day 6: Max Rep Test & Retro', false) returning id into v_day_id;
  insert into public.template_blocks (template_day_id, label, task, proof_type, target_duration_minutes, xp_value, sort_order)
  values
    (v_day_id, 'Workout Timer: Max Rep Test', 'One max-effort set each for pushups, pull-ups, and squats, timed and recorded.', 'timer', 45, 50, 1),
    (v_day_id, 'Mirror Confirmation Snap', 'Timestamped mirror photo taken at the end of the max rep test.', 'photo', null, 50, 2),
    (v_day_id, 'Rep Count Honesty Log', 'Honest written retro comparing today''s max reps against Day 1''s baseline.', 'self_check', null, 20, 3);

  insert into public.template_days (template_id, week_num, day_index, day_label, is_rest_day, notes)
  values (v_calisthenics_id, 1, 7, 'Day 7 · Recovery (Rest)', true,
    'One full rest day per week — no session required, streak protected.');

  -- ============================================================
  -- WEEK 2 — Volume Foundation (cont.)
  -- ============================================================
  insert into public.template_weeks (template_id, week_num, phase_num, phase_label, title, subtitle, total_hours)
  values (v_calisthenics_id, 2, 1, 'Volume Foundation', 'Progressive Overload Week', 'Adding volume on top of Week 1''s baseline', 10);

  insert into public.template_days (template_id, week_num, day_index, day_label, is_rest_day)
  values (v_calisthenics_id, 2, 1, 'Day 8: Push Volume — Progressive Overload', false) returning id into v_day_id;
  insert into public.template_blocks (template_day_id, label, task, proof_type, target_duration_minutes, xp_value, sort_order)
  values
    (v_day_id, 'Workout Timer: Push Circuit+', '200+ total pushups, adding one extra set beyond Day 1''s baseline, inside a live-monitored 45-minute session.', 'timer', 45, 50, 1),
    (v_day_id, 'Mirror Confirmation Snap', 'Timestamped mirror photo taken immediately after the final set.', 'photo', null, 50, 2),
    (v_day_id, 'Rep Count Honesty Log', 'Honest log confirming total volume exceeded Day 1''s baseline.', 'self_check', null, 20, 3);

  insert into public.template_days (template_id, week_num, day_index, day_label, is_rest_day)
  values (v_calisthenics_id, 2, 2, 'Day 9: Pull Volume — Progressive Overload', false) returning id into v_day_id;
  insert into public.template_blocks (template_day_id, label, task, proof_type, target_duration_minutes, xp_value, sort_order)
  values
    (v_day_id, 'Workout Timer: Pull Circuit+', '100+ total pull-ups, reducing assistance from Day 2 where possible, inside a live-monitored 45-minute session.', 'timer', 45, 50, 1),
    (v_day_id, 'Mirror Confirmation Snap', 'Timestamped mirror photo taken immediately after the final set.', 'photo', null, 50, 2),
    (v_day_id, 'Rep Count Honesty Log', 'Honest log confirming reduced assistance versus Day 2.', 'self_check', null, 20, 3);

  insert into public.template_days (template_id, week_num, day_index, day_label, is_rest_day)
  values (v_calisthenics_id, 2, 3, 'Day 10: Leg & Core — Progressive Overload', false) returning id into v_day_id;
  insert into public.template_blocks (template_day_id, label, task, proof_type, target_duration_minutes, xp_value, sort_order)
  values
    (v_day_id, 'Workout Timer: Leg & Core Circuit+', 'Added single-leg variations and a longer core finisher versus Day 3, live-monitored 45 minutes.', 'timer', 45, 50, 1),
    (v_day_id, 'Mirror Confirmation Snap', 'Timestamped mirror photo taken immediately after the final set.', 'photo', null, 50, 2),
    (v_day_id, 'Rep Count Honesty Log', 'Honest log of every set and rep count for legs and core.', 'self_check', null, 20, 3);

  insert into public.template_days (template_id, week_num, day_index, day_label, is_rest_day)
  values (v_calisthenics_id, 2, 4, 'Day 11: Mobility & Recovery Flow', false) returning id into v_day_id;
  insert into public.template_blocks (template_day_id, label, task, proof_type, target_duration_minutes, xp_value, sort_order)
  values
    (v_day_id, 'Workout Timer: Hip Mobility Flow', '15 minutes of hip mobility flow plus 30 minutes of light active recovery, live-monitored.', 'timer', 45, 50, 1),
    (v_day_id, 'Mirror Confirmation Snap', 'Timestamped mirror photo comparing end-range mobility against Day 4.', 'photo', null, 50, 2),
    (v_day_id, 'Rep Count Honesty Log', 'Honest log noting mobility improvement or restriction since Day 4.', 'self_check', null, 20, 3);

  insert into public.template_days (template_id, week_num, day_index, day_label, is_rest_day)
  values (v_calisthenics_id, 2, 5, 'Day 12: Full-Body Combo', false) returning id into v_day_id;
  insert into public.template_blocks (template_day_id, label, task, proof_type, target_duration_minutes, xp_value, sort_order)
  values
    (v_day_id, 'Workout Timer: Full-Body Circuit', 'Full-body superset combining push, pull, and leg movements, live-monitored 45 minutes.', 'timer', 45, 50, 1),
    (v_day_id, 'Mirror Confirmation Snap', 'Timestamped mirror photo taken immediately after the final set.', 'photo', null, 50, 2),
    (v_day_id, 'Rep Count Honesty Log', 'Honest log of every superset round completed.', 'self_check', null, 20, 3);

  insert into public.template_days (template_id, week_num, day_index, day_label, is_rest_day)
  values (v_calisthenics_id, 2, 6, 'Day 13: Max Rep Retest & Phase Retro', false) returning id into v_day_id;
  insert into public.template_blocks (template_day_id, label, task, proof_type, target_duration_minutes, xp_value, sort_order)
  values
    (v_day_id, 'Workout Timer: Max Rep Retest', 'Re-run Day 6''s max-effort test for pushups, pull-ups, and squats, timed and recorded.', 'timer', 45, 50, 1),
    (v_day_id, 'Mirror Confirmation Snap', 'Timestamped mirror photo taken at the end of the retest.', 'photo', null, 50, 2),
    (v_day_id, 'Rep Count Honesty Log', 'Honest written retro comparing today''s max reps against Day 6, plus a plan for Weeks 3-12.', 'self_check', null, 20, 3);

  insert into public.template_days (template_id, week_num, day_index, day_label, is_rest_day, notes)
  values (v_calisthenics_id, 2, 7, 'Day 14 · Recovery (Rest)', true,
    'One full rest day per week — no session required, streak protected.');

end $$;
