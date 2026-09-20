-- ============================================================
-- Reseed: 14-Week Job Prep & Interview Engine — full 4-week (Phase 1)
-- curriculum, replacing the thin 7-day placeholder from 0003 now that the
-- Template Detail screen renders real weeks/phases/workload data (0005).
--
-- Weeks 5-14 (Phases 2-4) are intentionally not seeded yet — the phase
-- pills for them still render (derived from template_weeks), they just
-- have no week cards under them until that content is authored, same
-- honest "not seeded yet" posture as everywhere else in this schema.
--
-- Run this in the Supabase SQL editor, after 0004 and 0005.
-- ============================================================

do $$
declare
  v_template_id uuid;
  v_day_id uuid;
begin
  -- Idempotent re-run safety: wipe the old row (cascades to template_days,
  -- template_blocks, template_weeks, template_workload_categories).
  delete from public.templates where name = '14-Week Job Prep & Interview Engine';

  insert into public.templates
    (owner_id, name, description, category, duration_weeks, source, schedule_type,
     is_public, pace_hours_per_week, trust_rating, review_count, integrity_label, total_hours)
  values (
    null,
    '14-Week Job Prep & Interview Engine',
    'Strict technical accountability: Daily LeetCode matrix, mock recordings, and live screenshot proofs.',
    'career', 14, 'builtin', 'fixed_days', true,
    15, 4.9, 420, 'Zero-Cheat Sync', 210
  )
  returning id into v_template_id;

  insert into public.template_workload_categories (template_id, label, percentage, hours, color_role, sort_order)
  values
    (v_template_id, 'Coding', 50, 105, 'primary', 1),
    (v_template_id, 'Sys Design', 30, 63, 'secondary', 2),
    (v_template_id, 'Drills', 20, 42, 'tertiary', 3);

  -- ============================================================
  -- WEEK 1 — Arrays & Pointers
  -- ============================================================
  insert into public.template_weeks (template_id, week_num, phase_num, phase_label, title, subtitle, total_hours)
  values (v_template_id, 1, 1, 'Foundations', 'Arrays & Pointers', 'Two-pointers, sliding window & complexity invariants', 15);

  insert into public.template_days (template_id, week_num, day_index, day_label, is_rest_day)
  values (v_template_id, 1, 1, 'Day 1: Arrays & Sliding Window', false) returning id into v_day_id;
  insert into public.template_blocks (template_day_id, label, task, proof_type, target_duration_minutes, xp_value, sort_order)
  values
    (v_day_id, 'Focus Timer: Arrays & Sliding Window', 'Complete 3Sum, Trapping Rain Water, and Sliding Window Maximum inside a live-monitored 60-minute focus timer. Zero tab switching permitted.', 'timer', 60, 60, 1),
    (v_day_id, 'Whiteboard Snap: Edge Cases', 'Live photo of a whiteboard diagram covering two-pointer swap invariants and boundary conditions.', 'photo', null, 40, 2),
    (v_day_id, 'Peer Log: Syntax Digest', 'Honest log reviewing 2 peer submissions and confirming your own complexity analysis notes.', 'self_check', null, 20, 3);

  insert into public.template_days (template_id, week_num, day_index, day_label, is_rest_day)
  values (v_template_id, 1, 2, 'Day 2: Binary Search & Prefix Sums', false) returning id into v_day_id;
  insert into public.template_blocks (template_day_id, label, task, proof_type, target_duration_minutes, xp_value, sort_order)
  values
    (v_day_id, 'Focus Timer: Binary Search Set', 'Solve rotated-array search, first/last position, and prefix-sum range queries inside a live-monitored 75-minute focus timer.', 'timer', 75, 60, 1),
    (v_day_id, 'Whiteboard Snap: Invariant Proof', 'Live photo proving your binary search loop invariant holds on paper.', 'photo', null, 40, 2),
    (v_day_id, 'Peer Log: Complexity Review', 'Honest log confirming O(log n) bounds on today''s 3 solved problems.', 'self_check', null, 20, 3);

  insert into public.template_days (template_id, week_num, day_index, day_label, is_rest_day)
  values (v_template_id, 1, 3, 'Day 3: Linked Lists & Fast/Slow Pointers', false) returning id into v_day_id;
  insert into public.template_blocks (template_day_id, label, task, proof_type, target_duration_minutes, xp_value, sort_order)
  values
    (v_day_id, 'Focus Timer: Pointer Drills', 'Solve cycle detection, middle-of-list, and reorder-list inside a live-monitored 70-minute focus timer.', 'timer', 70, 60, 1),
    (v_day_id, 'Whiteboard Snap: Node Diagram', 'Live photo of a hand-drawn linked list diagram showing pointer rewiring steps.', 'photo', null, 40, 2),
    (v_day_id, 'Peer Log: Edge Case Audit', 'Honest log confirming null-pointer and single-node edge cases were tested.', 'self_check', null, 20, 3);

  insert into public.template_days (template_id, week_num, day_index, day_label, is_rest_day)
  values (v_template_id, 1, 4, 'Day 4: Monotonic Stack & Deque Drills', false) returning id into v_day_id;
  insert into public.template_blocks (template_day_id, label, task, proof_type, target_duration_minutes, xp_value, sort_order)
  values
    (v_day_id, 'Focus Timer: Monotonic Templates', 'Solve next-greater-element, daily temperatures, and sliding window maximum via deque inside a live-monitored 90-minute focus timer.', 'timer', 90, 60, 1),
    (v_day_id, 'Whiteboard Snap: Stack Trace', 'Live photo of your stack push/pop trace for one worked example.', 'photo', null, 40, 2),
    (v_day_id, 'Peer Log: Template Reuse', 'Honest log noting which monotonic template applied to each problem.', 'self_check', null, 20, 3);

  insert into public.template_days (template_id, week_num, day_index, day_label, is_rest_day)
  values (v_template_id, 1, 5, 'Day 5: Diagnostic Sprint & Retro', false) returning id into v_day_id;
  insert into public.template_blocks (template_day_id, label, task, proof_type, target_duration_minutes, xp_value, sort_order)
  values
    (v_day_id, 'Focus Timer: Timed Interview Sprint', 'Solve 2 unseen medium problems back-to-back under mock interview conditions inside a live-monitored 90-minute focus timer.', 'timer', 90, 60, 1),
    (v_day_id, 'Whiteboard Snap: Retro Notes', 'Live photo of your written retro: what broke, what to drill again next week.', 'photo', null, 40, 2),
    (v_day_id, 'Peer Log: Milestone Audit', 'Honest self-audit confirming Week 1 goals were met before advancing.', 'self_check', null, 20, 3);

  insert into public.template_days (template_id, week_num, day_index, day_label, is_rest_day)
  values (v_template_id, 1, 6, 'Day 6: Review & Spaced Repetition', false) returning id into v_day_id;
  insert into public.template_blocks (template_day_id, label, task, proof_type, target_duration_minutes, xp_value, sort_order)
  values
    (v_day_id, 'Focus Timer: Spaced Repetition Set', 'Re-solve 3 of the week''s hardest problems from memory inside a live-monitored 60-minute focus timer.', 'timer', 60, 60, 1),
    (v_day_id, 'Whiteboard Snap: Pattern Map', 'Live photo of a hand-drawn map linking this week''s problems to their patterns.', 'photo', null, 40, 2),
    (v_day_id, 'Peer Log: Confidence Check', 'Honest 1-5 confidence rating logged for each pattern drilled this week.', 'self_check', null, 20, 3);

  insert into public.template_days (template_id, week_num, day_index, day_label, is_rest_day, notes)
  values (v_template_id, 1, 7, 'Day 7 · Streak Shield (Rest)', true,
    'Sundays are designated Streak Shields & reflection days — no penalty for rest.');

  -- ============================================================
  -- WEEK 2 — Trees & BFS/DFS Traversals
  -- ============================================================
  insert into public.template_weeks (template_id, week_num, phase_num, phase_label, title, subtitle, total_hours)
  values (v_template_id, 2, 1, 'Foundations', 'Trees & BFS/DFS Traversals', 'Connected components, recursion & shortest path', 15);

  insert into public.template_days (template_id, week_num, day_index, day_label, is_rest_day)
  values (v_template_id, 2, 1, 'Day 1: Binary Tree Traversals', false) returning id into v_day_id;
  insert into public.template_blocks (template_day_id, label, task, proof_type, target_duration_minutes, xp_value, sort_order)
  values
    (v_day_id, 'Focus Timer: Tree Traversals', 'Implement and time inorder, preorder, and postorder traversals (recursive + iterative) inside a live-monitored 60-minute focus timer.', 'timer', 60, 60, 1),
    (v_day_id, 'Whiteboard Snap: Traversal Diagram', 'Live photo of a hand-drawn tree showing traversal order arrows for one worked example.', 'photo', null, 40, 2),
    (v_day_id, 'Peer Log: Recursion Trace', 'Honest log tracing your recursion stack by hand for one traversal.', 'self_check', null, 20, 3);

  insert into public.template_days (template_id, week_num, day_index, day_label, is_rest_day)
  values (v_template_id, 2, 2, 'Day 2: BFS & Level-Order Processing', false) returning id into v_day_id;
  insert into public.template_blocks (template_day_id, label, task, proof_type, target_duration_minutes, xp_value, sort_order)
  values
    (v_day_id, 'Focus Timer: Level-Order BFS', 'Solve level-order traversal, zigzag traversal, and right-side-view inside a live-monitored 75-minute focus timer.', 'timer', 75, 60, 1),
    (v_day_id, 'Whiteboard Snap: Queue Trace', 'Live photo of your BFS queue state at each level for one worked example.', 'photo', null, 40, 2),
    (v_day_id, 'Peer Log: Complexity Review', 'Honest log confirming O(n) time and space bounds on today''s solutions.', 'self_check', null, 20, 3);

  insert into public.template_days (template_id, week_num, day_index, day_label, is_rest_day)
  values (v_template_id, 2, 3, 'Day 3: DFS & Path Sum Problems', false) returning id into v_day_id;
  insert into public.template_blocks (template_day_id, label, task, proof_type, target_duration_minutes, xp_value, sort_order)
  values
    (v_day_id, 'Focus Timer: DFS Path Problems', 'Solve path sum, all root-to-leaf paths, and max depth inside a live-monitored 70-minute focus timer.', 'timer', 70, 60, 1),
    (v_day_id, 'Whiteboard Snap: Path Diagram', 'Live photo of a hand-drawn tree highlighting one valid root-to-leaf path.', 'photo', null, 40, 2),
    (v_day_id, 'Peer Log: Base Case Audit', 'Honest log confirming null-node and leaf-node base cases were tested.', 'self_check', null, 20, 3);

  insert into public.template_days (template_id, week_num, day_index, day_label, is_rest_day)
  values (v_template_id, 2, 4, 'Day 4: Lowest Common Ancestor & Diameter', false) returning id into v_day_id;
  insert into public.template_blocks (template_day_id, label, task, proof_type, target_duration_minutes, xp_value, sort_order)
  values
    (v_day_id, 'Focus Timer: LCA & Diameter', 'Solve lowest common ancestor and binary tree diameter inside a live-monitored 90-minute focus timer.', 'timer', 90, 60, 1),
    (v_day_id, 'Whiteboard Snap: LCA Proof', 'Live photo proving your LCA algorithm''s correctness on a hand-drawn example tree.', 'photo', null, 40, 2),
    (v_day_id, 'Peer Log: Edge Case Review', 'Honest log confirming single-node and skewed-tree edge cases were handled.', 'self_check', null, 20, 3);

  insert into public.template_days (template_id, week_num, day_index, day_label, is_rest_day)
  values (v_template_id, 2, 5, 'Day 5: Graph Basics & Connected Components', false) returning id into v_day_id;
  insert into public.template_blocks (template_day_id, label, task, proof_type, target_duration_minutes, xp_value, sort_order)
  values
    (v_day_id, 'Focus Timer: Graph Fundamentals', 'Build adjacency list representations and solve number of connected components inside a live-monitored 75-minute focus timer.', 'timer', 75, 60, 1),
    (v_day_id, 'Whiteboard Snap: Graph Diagram', 'Live photo of a hand-drawn graph with its adjacency list written alongside.', 'photo', null, 40, 2),
    (v_day_id, 'Peer Log: Representation Review', 'Honest log comparing adjacency list vs matrix tradeoffs for today''s problems.', 'self_check', null, 20, 3);

  insert into public.template_days (template_id, week_num, day_index, day_label, is_rest_day)
  values (v_template_id, 2, 6, 'Day 6: Diagnostic Sprint & Retro', false) returning id into v_day_id;
  insert into public.template_blocks (template_day_id, label, task, proof_type, target_duration_minutes, xp_value, sort_order)
  values
    (v_day_id, 'Focus Timer: Timed Interview Sprint', 'Solve 2 unseen tree/graph problems back-to-back under mock interview conditions inside a live-monitored 90-minute focus timer.', 'timer', 90, 60, 1),
    (v_day_id, 'Whiteboard Snap: Retro Notes', 'Live photo of your written retro: what broke, what to drill again.', 'photo', null, 40, 2),
    (v_day_id, 'Peer Log: Milestone Audit', 'Honest self-audit confirming Week 2 goals were met before advancing.', 'self_check', null, 20, 3);

  insert into public.template_days (template_id, week_num, day_index, day_label, is_rest_day, notes)
  values (v_template_id, 2, 7, 'Day 7 · Streak Shield (Rest)', true,
    'Sundays are designated Streak Shields & reflection days — no penalty for rest.');

  -- ============================================================
  -- WEEK 3 — Heaps & Prefix Tries
  -- ============================================================
  insert into public.template_weeks (template_id, week_num, phase_num, phase_label, title, subtitle, total_hours)
  values (v_template_id, 3, 1, 'Foundations', 'Heaps & Prefix Tries', 'Median stream logic, autocomplete trie & intervals', 15);

  insert into public.template_days (template_id, week_num, day_index, day_label, is_rest_day)
  values (v_template_id, 3, 1, 'Day 1: Heap Fundamentals & Kth Largest', false) returning id into v_day_id;
  insert into public.template_blocks (template_day_id, label, task, proof_type, target_duration_minutes, xp_value, sort_order)
  values
    (v_day_id, 'Focus Timer: Heap Fundamentals', 'Implement a min-heap from scratch and solve Kth largest element inside a live-monitored 60-minute focus timer.', 'timer', 60, 60, 1),
    (v_day_id, 'Whiteboard Snap: Heapify Trace', 'Live photo tracing a heapify operation step-by-step on paper.', 'photo', null, 40, 2),
    (v_day_id, 'Peer Log: Complexity Review', 'Honest log confirming O(log n) insert/extract bounds.', 'self_check', null, 20, 3);

  insert into public.template_days (template_id, week_num, day_index, day_label, is_rest_day)
  values (v_template_id, 3, 2, 'Day 2: Two-Heap Median Stream', false) returning id into v_day_id;
  insert into public.template_blocks (template_day_id, label, task, proof_type, target_duration_minutes, xp_value, sort_order)
  values
    (v_day_id, 'Focus Timer: Median Stream', 'Solve find-median-from-data-stream using a two-heap approach inside a live-monitored 75-minute focus timer.', 'timer', 75, 60, 1),
    (v_day_id, 'Whiteboard Snap: Heap Balance Diagram', 'Live photo of a diagram showing your two heaps balancing as elements are added.', 'photo', null, 40, 2),
    (v_day_id, 'Peer Log: Invariant Check', 'Honest log confirming the size-balance invariant between both heaps.', 'self_check', null, 20, 3);

  insert into public.template_days (template_id, week_num, day_index, day_label, is_rest_day)
  values (v_template_id, 3, 3, 'Day 3: Trie Construction & Prefix Search', false) returning id into v_day_id;
  insert into public.template_blocks (template_day_id, label, task, proof_type, target_duration_minutes, xp_value, sort_order)
  values
    (v_day_id, 'Focus Timer: Trie Construction', 'Implement a Trie class with insert, search, and startsWith inside a live-monitored 60-minute focus timer.', 'timer', 60, 60, 1),
    (v_day_id, 'Whiteboard Snap: Trie Diagram', 'Live photo of a hand-drawn trie for 4-5 sample words.', 'photo', null, 40, 2),
    (v_day_id, 'Peer Log: Memory Review', 'Honest log estimating memory overhead of your trie implementation.', 'self_check', null, 20, 3);

  insert into public.template_days (template_id, week_num, day_index, day_label, is_rest_day)
  values (v_template_id, 3, 4, 'Day 4: Autocomplete & Word Search Tries', false) returning id into v_day_id;
  insert into public.template_blocks (template_day_id, label, task, proof_type, target_duration_minutes, xp_value, sort_order)
  values
    (v_day_id, 'Focus Timer: Autocomplete Drill', 'Solve word search II and design an autocomplete system inside a live-monitored 90-minute focus timer.', 'timer', 90, 60, 1),
    (v_day_id, 'Whiteboard Snap: Search Path', 'Live photo of a hand-drawn trie showing a DFS search path for one query.', 'photo', null, 40, 2),
    (v_day_id, 'Peer Log: Pruning Review', 'Honest log confirming your DFS pruning logic was correctly applied.', 'self_check', null, 20, 3);

  insert into public.template_days (template_id, week_num, day_index, day_label, is_rest_day)
  values (v_template_id, 3, 5, 'Day 5: Interval Scheduling & Merge Problems', false) returning id into v_day_id;
  insert into public.template_blocks (template_day_id, label, task, proof_type, target_duration_minutes, xp_value, sort_order)
  values
    (v_day_id, 'Focus Timer: Interval Problems', 'Solve merge intervals, insert interval, and non-overlapping intervals inside a live-monitored 75-minute focus timer.', 'timer', 75, 60, 1),
    (v_day_id, 'Whiteboard Snap: Interval Timeline', 'Live photo of a hand-drawn timeline showing interval overlaps and merges.', 'photo', null, 40, 2),
    (v_day_id, 'Peer Log: Sort Order Review', 'Honest log confirming the correct sort key was chosen for each problem.', 'self_check', null, 20, 3);

  insert into public.template_days (template_id, week_num, day_index, day_label, is_rest_day)
  values (v_template_id, 3, 6, 'Day 6: Diagnostic Sprint & Retro', false) returning id into v_day_id;
  insert into public.template_blocks (template_day_id, label, task, proof_type, target_duration_minutes, xp_value, sort_order)
  values
    (v_day_id, 'Focus Timer: Timed Interview Sprint', 'Solve 2 unseen heap/trie problems back-to-back under mock interview conditions inside a live-monitored 90-minute focus timer.', 'timer', 90, 60, 1),
    (v_day_id, 'Whiteboard Snap: Retro Notes', 'Live photo of your written retro: what broke, what to drill again.', 'photo', null, 40, 2),
    (v_day_id, 'Peer Log: Milestone Audit', 'Honest self-audit confirming Week 3 goals were met before advancing.', 'self_check', null, 20, 3);

  insert into public.template_days (template_id, week_num, day_index, day_label, is_rest_day, notes)
  values (v_template_id, 3, 7, 'Day 7 · Streak Shield (Rest)', true,
    'Sundays are designated Streak Shields & reflection days — no penalty for rest.');

  -- ============================================================
  -- WEEK 4 — Phase 1 Capstone & DP 1
  -- ============================================================
  insert into public.template_weeks (template_id, week_num, phase_num, phase_label, title, subtitle, total_hours)
  values (v_template_id, 4, 1, 'Foundations', 'Phase 1 Capstone & DP 1', '1D memoization, knapsack & exit examination', 15);

  insert into public.template_days (template_id, week_num, day_index, day_label, is_rest_day)
  values (v_template_id, 4, 1, 'Day 1: 1D DP — Climbing Stairs & House Robber', false) returning id into v_day_id;
  insert into public.template_blocks (template_day_id, label, task, proof_type, target_duration_minutes, xp_value, sort_order)
  values
    (v_day_id, 'Focus Timer: 1D DP Basics', 'Solve climbing stairs, house robber, and house robber II inside a live-monitored 60-minute focus timer.', 'timer', 60, 60, 1),
    (v_day_id, 'Whiteboard Snap: Recurrence Relation', 'Live photo of your hand-written recurrence relation and base cases for one problem.', 'photo', null, 40, 2),
    (v_day_id, 'Peer Log: Bottom-Up Review', 'Honest log confirming you converted your recursive solution to bottom-up DP.', 'self_check', null, 20, 3);

  insert into public.template_days (template_id, week_num, day_index, day_label, is_rest_day)
  values (v_template_id, 4, 2, 'Day 2: 1D DP — Coin Change & LIS', false) returning id into v_day_id;
  insert into public.template_blocks (template_day_id, label, task, proof_type, target_duration_minutes, xp_value, sort_order)
  values
    (v_day_id, 'Focus Timer: Coin Change & LIS', 'Solve coin change and longest increasing subsequence inside a live-monitored 75-minute focus timer.', 'timer', 75, 60, 1),
    (v_day_id, 'Whiteboard Snap: DP Table', 'Live photo of your hand-filled DP table for one worked example.', 'photo', null, 40, 2),
    (v_day_id, 'Peer Log: Complexity Review', 'Honest log confirming time complexity for both the O(n squared) and O(n log n) LIS approaches.', 'self_check', null, 20, 3);

  insert into public.template_days (template_id, week_num, day_index, day_label, is_rest_day)
  values (v_template_id, 4, 3, 'Day 3: Knapsack Fundamentals', false) returning id into v_day_id;
  insert into public.template_blocks (template_day_id, label, task, proof_type, target_duration_minutes, xp_value, sort_order)
  values
    (v_day_id, 'Focus Timer: Knapsack Drills', 'Solve 0/1 knapsack and partition equal subset sum inside a live-monitored 75-minute focus timer.', 'timer', 75, 60, 1),
    (v_day_id, 'Whiteboard Snap: Knapsack Table', 'Live photo of your hand-filled 2D knapsack DP table.', 'photo', null, 40, 2),
    (v_day_id, 'Peer Log: Space Optimization', 'Honest log confirming you reduced your solution to 1D rolling-array space.', 'self_check', null, 20, 3);

  insert into public.template_days (template_id, week_num, day_index, day_label, is_rest_day)
  values (v_template_id, 4, 4, 'Day 4: State Compression Basics', false) returning id into v_day_id;
  insert into public.template_blocks (template_day_id, label, task, proof_type, target_duration_minutes, xp_value, sort_order)
  values
    (v_day_id, 'Focus Timer: State Compression', 'Solve one bitmask-DP problem (e.g. Traveling Salesman subset) inside a live-monitored 90-minute focus timer.', 'timer', 90, 60, 1),
    (v_day_id, 'Whiteboard Snap: Bitmask Trace', 'Live photo tracing bitmask state transitions for one worked example.', 'photo', null, 40, 2),
    (v_day_id, 'Peer Log: State Space Review', 'Honest log estimating the state space size for today''s problem.', 'self_check', null, 20, 3);

  insert into public.template_days (template_id, week_num, day_index, day_label, is_rest_day)
  values (v_template_id, 4, 5, 'Day 5: Capstone Mock Interview & Peer Defense', false) returning id into v_day_id;
  insert into public.template_blocks (template_day_id, label, task, proof_type, target_duration_minutes, xp_value, sort_order)
  values
    (v_day_id, 'Focus Timer: Capstone Mock Interview', 'Complete a full mock interview covering one array/tree problem and one DP problem, recorded end-to-end, inside a live-monitored 90-minute focus timer.', 'timer', 90, 60, 1),
    (v_day_id, 'Whiteboard Snap: Solution Walkthrough', 'Live photo of your final whiteboard solution from the mock interview.', 'photo', null, 40, 2),
    (v_day_id, 'Peer Log: Defense Review', 'Honest log summarizing peer feedback from your live solution defense.', 'self_check', null, 20, 3);

  insert into public.template_days (template_id, week_num, day_index, day_label, is_rest_day)
  values (v_template_id, 4, 6, 'Day 6: Phase 1 Retro & Portfolio Commit', false) returning id into v_day_id;
  insert into public.template_blocks (template_day_id, label, task, proof_type, target_duration_minutes, xp_value, sort_order)
  values
    (v_day_id, 'Focus Timer: Portfolio Polish', 'Clean up and document your best Phase 1 solutions for your portfolio repo inside a live-monitored 60-minute focus timer.', 'timer', 60, 60, 1),
    (v_day_id, 'Whiteboard Snap: Git Commit Log', 'Live photo or screenshot of your Phase 1 commit history.', 'photo', null, 40, 2),
    (v_day_id, 'Peer Log: Phase 1 Retro', 'Honest written retro on Phase 1: strongest pattern, weakest pattern, plan for Phase 2.', 'self_check', null, 20, 3);

  insert into public.template_days (template_id, week_num, day_index, day_label, is_rest_day, notes)
  values (v_template_id, 4, 7, 'Day 7 · Streak Shield (Rest)', true,
    'Sundays are designated Streak Shields & reflection days — no penalty for rest.');

end $$;
