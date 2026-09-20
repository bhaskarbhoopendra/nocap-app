import { supabase } from "@/lib/supabase";
import { ProofType, TaskLog } from "@/types/database";

/**
 * Live elapsed seconds for a task_log "right now" — elapsed_seconds is only
 * a checkpoint (as of the last pause/resume boundary); while running_since
 * is set, the real elapsed time keeps advancing until the next checkpoint.
 * Shared by the Today card list (live ticking clock) and the Proof
 * Submission screen (gating Complete), so both read this the same way.
 */
export function liveElapsedSeconds(taskLog: TaskLog, nowMs: number): number {
  if (!taskLog.running_since) return taskLog.elapsed_seconds;
  const runningSinceMs = new Date(taskLog.running_since).getTime();
  return taskLog.elapsed_seconds + Math.max(0, (nowMs - runningSinceMs) / 1000);
}

/** "MM:SS" — the one clock format the whole proof-submission flow shares. */
export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const mm = Math.floor(s / 60)
    .toString()
    .padStart(2, "0");
  const ss = (s % 60).toString().padStart(2, "0");
  return `${mm}:${ss}`;
}

/**
 * All today's task_logs for a program (whatever state each is in — not
 * started rows simply don't exist yet). Drives the Today screen's per-task
 * status pills. Read-fallback: [] on error.
 */
export async function getTaskLogsForDate(programId: string, scheduledDate: string): Promise<TaskLog[]> {
  const { data, error } = await supabase
    .from("task_logs")
    .select("*")
    .eq("program_id", programId)
    .eq("scheduled_date", scheduledDate);

  if (error) {
    console.warn("getTaskLogsForDate failed", error);
    return [];
  }
  return data as TaskLog[];
}

/**
 * Single task_log for one block on one day, for the Proof Submission
 * screen's initial state. Read-fallback: null on error or not-found.
 */
export async function getTaskLog(
  programId: string,
  templateBlockId: string,
  scheduledDate: string
): Promise<TaskLog | null> {
  const { data, error } = await supabase
    .from("task_logs")
    .select("*")
    .eq("program_id", programId)
    .eq("template_block_id", templateBlockId)
    .eq("scheduled_date", scheduledDate)
    .maybeSingle();

  if (error) {
    console.warn("getTaskLog failed", error);
    return null;
  }
  return data as TaskLog | null;
}

/**
 * Starts a task for the first time, or resumes it (a plain pause, or a
 * restart after an honest early exit — "no streaks are wiped" means a
 * prior incomplete_early_exit isn't a dead end). Throws on failure — the
 * caller's try/catch decides the UX.
 */
export async function startOrResumeTask(
  programId: string,
  templateBlockId: string,
  scheduledDate: string,
  proofTypeUsed: ProofType,
  timerSecondsTarget: number | null
): Promise<TaskLog> {
  const existing = await getTaskLog(programId, templateBlockId, scheduledDate);
  const now = new Date().toISOString();

  if (!existing) {
    const { data, error } = await supabase
      .from("task_logs")
      .insert({
        program_id: programId,
        template_block_id: templateBlockId,
        scheduled_date: scheduledDate,
        proof_type_used: proofTypeUsed,
        timer_seconds_target: timerSecondsTarget,
        started_at: now,
        running_since: now,
        elapsed_seconds: 0,
      })
      .select()
      .single();
    if (error) throw error;
    return data as TaskLog;
  }

  if (existing.status === "completed") return existing; // nothing to resume

  const wasEarlyExit = existing.status === "incomplete_early_exit";
  const { data, error } = await supabase
    .from("task_logs")
    .update(
      wasEarlyExit
        ? { status: null, completed_at: null, elapsed_seconds: 0, started_at: now, running_since: now }
        : { running_since: now }
    )
    .eq("id", existing.id)
    .select()
    .single();
  if (error) throw error;
  return data as TaskLog;
}

/**
 * Adds more time to a running task's target — the "extend" choice offered
 * once the original target is reached (see ProofSubmission/index.tsx). Persists
 * to timer_seconds_target rather than staying client-only state, so the new
 * target survives the exact scenario this feature exists for: the app gets
 * killed/backgrounded and reopened later (e.g. via the "time's up" notification
 * tap) and must still show the extended target, not the original one.
 */
export async function extendTaskTarget(taskLogId: string, newTargetSeconds: number): Promise<TaskLog> {
  const { data, error } = await supabase
    .from("task_logs")
    .update({ timer_seconds_target: Math.round(newTargetSeconds) })
    .eq("id", taskLogId)
    .select()
    .single();
  if (error) throw error;
  return data as TaskLog;
}

/** Checkpoints elapsed time and stops the timer. Throws on failure. */
export async function pauseTask(taskLogId: string, elapsedSeconds: number): Promise<TaskLog> {
  const { data, error } = await supabase
    .from("task_logs")
    // elapsed_seconds is an integer column — the caller's live-ticking
    // clock computes a fractional value (elapsed ms / 1000), so this must
    // round before writing or Postgres rejects it (22P02).
    .update({ elapsed_seconds: Math.round(elapsedSeconds), running_since: null })
    .eq("id", taskLogId)
    .select()
    .single();
  if (error) throw error;
  return data as TaskLog;
}

/**
 * Marks a task genuinely done — only meaningful once the caller has
 * already verified the timer requirement (if any) was met; this function
 * doesn't re-check that itself. `photoPath` is a local device file URI for
 * now (no Supabase Storage upload yet — see ProofSubmission/PhotoSection.tsx).
 */
export async function completeTask(
  taskLogId: string,
  elapsedSeconds: number,
  xpEarned: number,
  photoPath?: string
): Promise<TaskLog> {
  const roundedElapsed = Math.round(elapsedSeconds);
  const { data, error } = await supabase
    .from("task_logs")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
      elapsed_seconds: roundedElapsed,
      timer_seconds_actual: roundedElapsed,
      xp_earned: xpEarned,
      running_since: null,
      ...(photoPath ? { photo_path: photoPath } : {}),
    })
    .eq("id", taskLogId)
    .select()
    .single();
  if (error) throw error;
  return data as TaskLog;
}

/**
 * Honest early exit from a timer/photo task — "Life happens. If you stop
 * now, your time is still recorded with zero shame." No XP, and the day's
 * streak (which requires every block completed) simply doesn't include
 * this one. The block can still be restarted later the same day via
 * startOrResumeTask.
 */
export async function endTaskEarly(taskLogId: string, elapsedSeconds: number): Promise<TaskLog> {
  const roundedElapsed = Math.round(elapsedSeconds);
  const { data, error } = await supabase
    .from("task_logs")
    .update({
      status: "incomplete_early_exit",
      completed_at: new Date().toISOString(),
      elapsed_seconds: roundedElapsed,
      timer_seconds_actual: roundedElapsed,
      xp_earned: 0,
      running_since: null,
    })
    .eq("id", taskLogId)
    .select()
    .single();
  if (error) throw error;
  return data as TaskLog;
}

/**
 * Self-check blocks have no timer phase to start/resume — completing one
 * is a single direct write (insert if this is the first attempt today,
 * update if e.g. retrying isn't otherwise reachable but kept idempotent).
 */
export async function completeSelfCheckTask(
  programId: string,
  templateBlockId: string,
  scheduledDate: string,
  xpEarned: number
): Promise<TaskLog> {
  const { data, error } = await supabase
    .from("task_logs")
    .upsert(
      {
        program_id: programId,
        template_block_id: templateBlockId,
        scheduled_date: scheduledDate,
        proof_type_used: "self_check",
        status: "completed",
        completed_at: new Date().toISOString(),
        xp_earned: xpEarned,
      },
      { onConflict: "program_id,template_block_id,scheduled_date" }
    )
    .select()
    .single();
  if (error) throw error;
  return data as TaskLog;
}

/**
 * Lifetime verified-proof count for the Profile screen's stat grid — across
 * every program the user has ever run, not just the active one. Filters
 * through the programs table (task_logs has no user_id column of its own)
 * via PostgREST's embedded-resource filter syntax. Read-fallback: 0.
 */
export async function getCompletedTaskLogCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from("task_logs")
    .select("id, programs!inner(user_id)", { count: "exact", head: true })
    .eq("programs.user_id", userId)
    .eq("status", "completed");

  if (error) {
    console.warn("getCompletedTaskLogCount failed", error);
    return 0;
  }
  return count ?? 0;
}

/** Same idea, scoped to one program — used by the "Enrolled Blueprint" card. */
export async function getCompletedTaskLogCountForProgram(programId: string): Promise<number> {
  const { count, error } = await supabase
    .from("task_logs")
    .select("id", { count: "exact", head: true })
    .eq("program_id", programId)
    .eq("status", "completed");

  if (error) {
    console.warn("getCompletedTaskLogCountForProgram failed", error);
    return 0;
  }
  return count ?? 0;
}

// Composed read shape for "Recent Proof Showcase" — a completed task_log
// plus the block label it was submitted against (task_logs.proof_type_used
// already carries the proof type itself, so only the label needs a join).
export interface RecentProof extends TaskLog {
  blockLabel: string;
}

/**
 * Most recently completed proofs across every program, newest first — the
 * Profile screen's "Recent Proof Showcase". Read-fallback: [].
 */
export async function getRecentCompletedTaskLogs(userId: string, limit = 4): Promise<RecentProof[]> {
  const { data, error } = await supabase
    .from("task_logs")
    .select("*, template_blocks(label), programs!inner(user_id)")
    .eq("programs.user_id", userId)
    .eq("status", "completed")
    .order("completed_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.warn("getRecentCompletedTaskLogs failed", error);
    return [];
  }
  return (data ?? []).map((row) => {
    const { template_blocks, ...taskLog } = row as TaskLog & {
      template_blocks: { label: string } | null;
      programs: { user_id: string };
    };
    return { ...taskLog, blockLabel: template_blocks?.label ?? "Proof" };
  });
}
