import { supabase } from "@/lib/supabase";
import { getTaskLogsForDate } from "@/services/taskLogService";
import { getTemplateById, getTemplateDayByPosition } from "@/services/templateService";
import { Program, Template, TemplateBlock, TaskLog } from "@/types/database";

// F4.2 leaderboard-unlock thresholds — the same numbers the Ranks screen's
// eligibility card displays ("6/7 Days Streak or 420/500 XP"), exported so
// that copy is computed from these, not hardcoded separately.
export const LEADERBOARD_UNLOCK_STREAK_DAYS = 7;
export const LEADERBOARD_UNLOCK_XP = 500;

/** Thrown by startProgram when the user already has an active program. */
export class ActiveProgramExistsError extends Error {
  constructor(public existingProgramId?: string) {
    super(
      "You already have an active program running. Finish or abandon it before starting a new one."
    );
    this.name = "ActiveProgramExistsError";
  }
}

/**
 * Starts a new program from a template for the given user (F2.3). Product
 * rule: a user may have at most one active program at a time — enforced by
 * a pre-check here for a friendly error message, and by a partial unique
 * index (one_active_program_per_user, see migration 0004) as the real
 * guarantee if a pre-check races with another insert. Throws on any
 * failure — the caller's try/catch decides the UX.
 */
export async function startProgram(templateId: string, userId: string): Promise<Program> {
  const { data: existing, error: existingError } = await supabase
    .from("programs")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();
  if (existingError) throw existingError;
  if (existing) throw new ActiveProgramExistsError(existing.id);

  const { data, error } = await supabase
    .from("programs")
    .insert({ user_id: userId, template_id: templateId })
    .select()
    .single();

  if (error) {
    if ((error as { code?: string }).code === "23505") {
      throw new ActiveProgramExistsError();
    }
    throw error;
  }
  return data as Program;
}

/** 1-based day count since start_date, local-midnight-safe (no time-of-day drift). */
export function absoluteDayNumber(startDateISO: string): number {
  const start = new Date(`${startDateISO}T00:00:00`);
  const now = new Date();
  const startMidnight = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const MS_PER_DAY = 86_400_000;
  const diff = Math.round((nowMidnight.getTime() - startMidnight.getTime()) / MS_PER_DAY);
  return Math.max(1, diff + 1); // clamp: a future start_date still reads as Day 1
}

/** Maps a 1-based absolute day number onto the 7-day (week_num, day_index) grid. */
export function dayPositionFor(absDay: number): { weekNum: number; dayIndex: number } {
  return { weekNum: Math.floor((absDay - 1) / 7) + 1, dayIndex: ((absDay - 1) % 7) + 1 };
}

/** Today's date as a local-midnight-safe YYYY-MM-DD string (task_logs.scheduled_date). */
export function todayISODate(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// A day's block joined with today's task_log, if one exists yet (F3.2/F3.5)
// — not started (no row), in progress/paused (row, no completed_at), or a
// terminal state (completed / incomplete_early_exit).
export interface BlockWithProgress extends TemplateBlock {
  taskLog: TaskLog | null;
}

function withProgress(blocks: TemplateBlock[], taskLogs: TaskLog[]): BlockWithProgress[] {
  const byBlockId = new Map(taskLogs.map((t) => [t.template_block_id, t]));
  return blocks.map((block) => ({ ...block, taskLog: byBlockId.get(block.id) ?? null }));
}

export type TodayState =
  | { kind: "no_active_program" }
  | { kind: "unsupported_schedule"; program: Program; template: Template }
  | { kind: "day_not_seeded"; program: Program; template: Template; absDay: number }
  | { kind: "rest_day"; program: Program; template: Template; absDay: number; dayLabel: string }
  | {
      kind: "day";
      program: Program;
      template: Template;
      absDay: number;
      dayLabel: string;
      scheduledDate: string;
      blocks: BlockWithProgress[];
    };

/**
 * Resolves what the Today screen shows for the user's active program
 * (F3.1, fixed_days schedules only — frequency-based resolution is out of
 * scope until Custom Builder is wired, see docs/ProdroadMap.md F3.1).
 * Read-fallback: any failure collapses to `no_active_program` — the Today
 * screen treats that the same as "nothing running yet," not a hard error.
 */
export async function getTodaysStateForActiveProgram(userId: string): Promise<TodayState> {
  const { data, error } = await supabase
    .from("programs")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();

  if (error) console.warn("getTodaysStateForActiveProgram failed", error);
  if (error || !data) return { kind: "no_active_program" };

  const program = data as Program;
  const template = await getTemplateById(program.template_id);
  if (!template) return { kind: "no_active_program" };
  if (template.schedule_type !== "fixed_days") {
    return { kind: "unsupported_schedule", program, template };
  }

  const absDay = absoluteDayNumber(program.start_date);
  const { weekNum, dayIndex } = dayPositionFor(absDay);
  const day = await getTemplateDayByPosition(template.id, weekNum, dayIndex);

  if (!day) return { kind: "day_not_seeded", program, template, absDay };
  if (day.is_rest_day) {
    return { kind: "rest_day", program, template, absDay, dayLabel: day.day_label };
  }

  const scheduledDate = todayISODate();
  const taskLogs = await getTaskLogsForDate(program.id, scheduledDate);
  return {
    kind: "day",
    program,
    template,
    absDay,
    dayLabel: day.day_label,
    scheduledDate,
    blocks: withProgress(day.blocks, taskLogs),
  };
}

/**
 * Minimal real XP/streak engine (F3.3's core rule, decided here: a day's
 * streak requires *every* block for that day completed, matching the
 * "Daily Lock-in" / "N of M tasks verified" copy already in the UI — not
 * just one). Called after a task_log is written with status='completed'.
 * `totalBlocksToday` excludes rest days (callers only reach this on an
 * active, non-rest day). Throws on failure — the caller already recorded
 * the task's own completion, so a rollup failure here is a distinct,
 * separately-surfaced error, not a reason to hide that the task itself
 * succeeded.
 */
export async function applyTaskCompletionRollup(
  programId: string,
  xpEarned: number,
  scheduledDate: string,
  totalBlocksToday: number
): Promise<void> {
  const { data: program, error: fetchError } = await supabase
    .from("programs")
    .select("total_xp, current_streak, longest_streak, user_id")
    .eq("id", programId)
    .single();
  if (fetchError) throw fetchError;

  const { count, error: countError } = await supabase
    .from("task_logs")
    .select("id", { count: "exact", head: true })
    .eq("program_id", programId)
    .eq("scheduled_date", scheduledDate)
    .eq("status", "completed");
  if (countError) throw countError;

  // `count` reaches totalBlocksToday exactly once — task_logs' unique
  // (program_id, template_block_id, scheduled_date) constraint means a
  // block can't be completed twice, so this transition fires on the day's
  // final block only, never on an already-complete day.
  const justCompletedTheDay = totalBlocksToday > 0 && (count ?? 0) >= totalBlocksToday;
  const newStreak = justCompletedTheDay ? program.current_streak + 1 : program.current_streak;
  const newLongestStreak = Math.max(program.longest_streak, newStreak);
  const newTotalXp = program.total_xp + xpEarned;

  const { error: updateError } = await supabase
    .from("programs")
    .update({ total_xp: newTotalXp, current_streak: newStreak, longest_streak: newLongestStreak })
    .eq("id", programId);
  if (updateError) throw updateError;

  // Roll the same XP up to the profile total — profiles.total_xp is the
  // cross-program lifetime figure shown on the header/leaderboard.
  const { data: profile, error: profileFetchError } = await supabase
    .from("profiles")
    .select("total_xp, current_streak, longest_streak, leaderboard_unlocked")
    .eq("id", program.user_id)
    .single();
  if (profileFetchError) throw profileFetchError;

  const newProfileTotalXp = profile.total_xp + xpEarned;

  // F4.2 unlock rule — the thresholds already shown as copy on the Ranks
  // screen's eligibility card ("6/7 Days Streak or 420/500 XP") are the
  // real rule, not just flavor text: reach either one, once, and stay
  // unlocked (never re-locked by a later streak break).
  const justUnlocked =
    !profile.leaderboard_unlocked &&
    (newStreak >= LEADERBOARD_UNLOCK_STREAK_DAYS || newProfileTotalXp >= LEADERBOARD_UNLOCK_XP);

  const { error: profileUpdateError } = await supabase
    .from("profiles")
    .update({
      total_xp: newProfileTotalXp,
      current_streak: newStreak,
      longest_streak: Math.max(profile.longest_streak, newStreak),
      ...(justUnlocked ? { leaderboard_unlocked: true, unlocked_at: new Date().toISOString() } : {}),
    })
    .eq("id", program.user_id);
  if (profileUpdateError) throw profileUpdateError;
}

export interface ActiveProgramSummary {
  program: Program;
  template: Template;
  absDay: number;
  durationDays: number;
}

/**
 * Lightweight active-program summary for the Profile screen's "Enrolled
 * Blueprint" card — just enough to show what's running without resolving
 * today's actual blocks (that's getTodaysStateForActiveProgram's job, F3.1).
 * Read-fallback: null on error or no active program.
 */
export async function getActiveProgramSummary(userId: string): Promise<ActiveProgramSummary | null> {
  const { data, error } = await supabase
    .from("programs")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();

  if (error) console.warn("getActiveProgramSummary failed", error);
  if (error || !data) return null;

  const program = data as Program;
  const template = await getTemplateById(program.template_id);
  if (!template) return null;

  return {
    program,
    template,
    absDay: absoluteDayNumber(program.start_date),
    durationDays: (template.duration_weeks ?? 0) * 7,
  };
}
