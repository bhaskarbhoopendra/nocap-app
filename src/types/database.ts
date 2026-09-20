// Mirrors the Postgres schema in supabase/migrations/*.sql (0001 through
// 0010 as of the last update — keep this comment and the migrations in sync).

export type ProofType = "photo" | "timer" | "self_check";
export type TemplateSource = "builtin" | "user_created" | "ai_generated";
export type ScheduleType = "fixed_days" | "frequency";
export type ProgramStatus = "active" | "paused" | "completed" | "abandoned";
export type TaskStatus = "completed" | "incomplete_early_exit" | "skipped";
export type AiRequestStatus = "pending" | "completed" | "failed";
// Drives which Tailwind accent classes a badge/tag renders with — a DB-stored
// role rather than a raw className, so NativeWind's static class scan still
// sees every literal class string it needs to compile (see the
// ACCENT_*_CLASS maps in TemplateCard.tsx).
export type TemplateAccentRole = "primary" | "secondary" | "tertiary" | "neutral";

export interface Profile {
  id: string;
  username: string;
  avatar_seed: Record<string, unknown>;
  is_anonymous: boolean;
  total_xp: number;
  current_streak: number;
  longest_streak: number;
  leaderboard_unlocked: boolean;
  unlocked_at: string | null;
  created_at: string;
}

export interface ThemeTokens {
  bg: string;
  panel: string;
  panelRaised: string;
  border: string;
  text: string;
  textDim: string;
  gradientStart: string;
  gradientEnd: string;
  success: string;
  warning: string;
}

export interface Theme {
  id: string;
  name: string;
  is_active: boolean;
  tokens: ThemeTokens;
}

export interface Template {
  id: string;
  owner_id: string | null;
  name: string;
  description: string | null;
  category: string;
  duration_weeks: number | null;
  source: TemplateSource;
  schedule_type: ScheduleType;
  is_public: boolean;
  created_at: string;
  // Hero/workload stats — real columns so a future admin dashboard can set
  // these per template instead of them being screen-hardcoded (see
  // supabase/migrations/0005_dynamic_template_content.sql).
  pace_hours_per_week: number | null;
  trust_rating: number | null;
  review_count: number;
  integrity_label: string;
  total_hours: number | null;
  // Program Library card presentation — real columns (see
  // 0008_template_card_presentation.sql) so the card list can be a plain
  // map over `templates` instead of one hardcoded JSX block per template.
  icon: string;
  icon_color: string;
  badge_label: string;
  badge_accent: TemplateAccentRole;
  review_label_suffix: string;
  cta_label: string;
  cta_is_primary: boolean;
  footer_icon: string;
  footer_icon_color: string;
  footer_label: string;
  footer_subtitle: string | null;
}

// One row per Program Library card pill (e.g. "98 Days Duration",
// "Photo-proof Verified") — a variable number per template instead of a
// hardcoded fixed 3, same shape decision as template_workload_categories.
export interface TemplateTag {
  id: string;
  template_id: string;
  icon: string;
  icon_color: string;
  accent: TemplateAccentRole;
  label: string;
  sort_order: number;
}

// One row per week — the week-level metadata template_days doesn't carry
// (title/subtitle/phase grouping/total hours). Phases themselves aren't a
// separate table; they're derived by grouping weeks with the same
// phase_num/phase_label.
export interface TemplateWeek {
  id: string;
  template_id: string;
  week_num: number;
  phase_num: number;
  phase_label: string;
  title: string;
  subtitle: string | null;
  total_hours: number | null;
}

export type WorkloadColorRole = "primary" | "secondary" | "tertiary";

export interface TemplateWorkloadCategory {
  id: string;
  template_id: string;
  label: string;
  percentage: number;
  hours: number | null;
  color_role: WorkloadColorRole;
  sort_order: number;
}

export interface TemplateDay {
  id: string;
  template_id: string;
  week_num: number;
  day_index: number;
  day_label: string;
  is_rest_day: boolean;
  notes: string | null;
}

export interface TemplateBlock {
  id: string;
  // Exactly one of these two is set — fixed_days templates attach via
  // template_day_id, frequency templates attach directly via template_id
  // (see migration 0002_dual_scheduling_model).
  template_day_id: string | null;
  template_id: string | null;
  label: string;
  task: string;
  proof_type: ProofType;
  target_duration_minutes: number | null;
  // Only meaningful when template_id is set (frequency-based blocks).
  frequency_days_per_week: number | null;
  xp_value: number;
  sort_order: number;
}

export interface Program {
  id: string;
  user_id: string;
  template_id: string;
  start_date: string;
  status: ProgramStatus;
  current_streak: number;
  longest_streak: number;
  total_xp: number;
  created_at: string;
}

export interface TaskLog {
  id: string;
  program_id: string;
  template_block_id: string;
  scheduled_date: string;
  // null = not yet finished (either never started, or in progress/paused —
  // see started_at/running_since below). Only set once the user completes
  // or ends early (see migration 0010_task_progress.sql).
  status: TaskStatus | null;
  proof_type_used: ProofType;
  photo_path: string | null;
  photo_shared: boolean;
  timer_seconds_target: number | null;
  timer_seconds_actual: number | null;
  xp_earned: number;
  completed_at: string | null;
  // Set the first time the user taps Start; unchanged by later pauses/resumes.
  started_at: string | null;
  // Checkpointed elapsed seconds as of the last pause/resume boundary —
  // current elapsed while running is elapsed_seconds + (now - running_since).
  elapsed_seconds: number;
  // Non-null while the timer is actively ticking; null while paused or
  // before the first start.
  running_since: string | null;
}

export interface AiPlanRequest {
  id: string;
  user_id: string;
  goal_description: string;
  intake_answers: Record<string, unknown>;
  generated_template_id: string | null;
  status: AiRequestStatus;
  created_at: string;
}

export interface LeaderboardGlobalRow {
  user_id: string;
  username: string;
  avatar_seed: Record<string, unknown>;
  current_streak: number;
  total_xp: number;
  rank: number;
}

export interface LeaderboardTemplateRow {
  program_id: string;
  user_id: string;
  username: string;
  avatar_seed: Record<string, unknown>;
  template_id: string;
  category: string;
  current_streak: number;
  total_xp: number;
  rank: number;
}
