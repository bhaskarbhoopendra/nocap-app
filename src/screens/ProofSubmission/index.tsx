import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import BackHeader from "@/components/BackHeader";
import Icon from "@/components/Icon";
import { useHeaderHeight } from "@/hooks/useHeaderHeight";
import { cancelTaskTimerNotification, scheduleTaskTimerNotification } from "@/services/notificationService";
import { applyTaskCompletionRollup } from "@/services/programService";
import {
  completeSelfCheckTask,
  completeTask,
  endTaskEarly,
  extendTaskTarget,
  getTaskLog,
  liveElapsedSeconds,
  pauseTask,
  startOrResumeTask,
} from "@/services/taskLogService";
import { PROOF_TYPE_META } from "@/theme/proofTypePresentation";
import { TaskLog } from "@/types/database";
import { RootStackParamList } from "@/types/navigation";
import PhotoSection from "./PhotoSection";
import SelfCheckCard from "./SelfCheckCard";
import TimerSection, { TimerPhase } from "./TimerSection";

type Props = NativeStackScreenProps<RootStackParamList, "ProofSubmission">;

function phaseFor(taskLog: TaskLog | null): TimerPhase {
  if (!taskLog) return "not_started";
  if (taskLog.status === "completed") return "completed";
  if (taskLog.status === "incomplete_early_exit") return "early_exited";
  return taskLog.running_since ? "running" : "paused";
}

function liveElapsed(taskLog: TaskLog | null, nowMs: number): number {
  return taskLog ? liveElapsedSeconds(taskLog, nowMs) : 0;
}

/**
 * The task detail screen — what a Proof Protocol row on Today opens into.
 * One screen, three shapes depending on proof_type:
 *   - timer: TimerSection only.
 *   - photo: TimerSection *and* PhotoSection — both the timer reaching
 *     target and a captured snap are required before Complete unlocks.
 *   - self_check: SelfCheckCard only — no timer phase to start/pause.
 * Deliberately not built here (see docs/ProdroadMap.md): real Supabase
 * Storage upload for photos (F3.4), AppState-based background/tab-switch
 * detection (F3.5's "Zero tab switching" enforcement).
 */
export default function ProofSubmissionScreen({ navigation, route }: Props) {
  const { programId, templateBlockId, scheduledDate, label, task, proofType, xpValue, targetDurationMinutes, totalBlocksToday } =
    route.params;

  const headerHeight = useHeaderHeight();
  const [taskLog, setTaskLog] = useState<TaskLog | null | undefined>(undefined);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [nowMs, setNowMs] = useState(() => Date.now());

  const meta = PROOF_TYPE_META[proofType];
  // Once a task has started, the DB value is the source of truth (extending
  // persists there — see extendTaskTarget) — the route param is only a
  // fallback for the brief window before taskLog has loaded.
  const targetSeconds = taskLog?.timer_seconds_target ?? (targetDurationMinutes ?? 0) * 60;
  const phase = phaseFor(taskLog ?? null);
  const elapsedSeconds = useMemo(() => liveElapsed(taskLog ?? null, nowMs), [taskLog, nowMs]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const existing = await getTaskLog(programId, templateBlockId, scheduledDate);
      if (!cancelled) {
        setTaskLog(existing);
        if (existing?.photo_path) setPhotoUri(existing.photo_path);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [programId, templateBlockId, scheduledDate]);

  // Ticks the displayed clock once a second while the timer is actually
  // running — the source of truth is still running_since + elapsed_seconds
  // in the DB, this just forces a re-render to show the passage of time.
  useEffect(() => {
    if (phase !== "running") return;
    const id = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(id);
  }, [phase]);

  // Auto-stops the clock exactly at target instead of letting it keep
  // counting real wall-clock time — this is what used to produce a
  // "completed in 593:13" reading when a task was started, left running for
  // hours (screen off, or the app just wasn't reopened), and only completed
  // much later. Runs both while actively ticking (catches it live) and right
  // after the initial fetch on mount (catches it if target already passed
  // while the screen was closed — e.g. reopened via the timer notification).
  // The autoStopping ref guards against firing twice for the same overshoot
  // while the checkpoint write is still in flight.
  const autoStopping = useRef(false);
  useEffect(() => {
    if (!taskLog?.running_since || autoStopping.current) return;
    const effectiveTarget = taskLog.timer_seconds_target ?? targetSeconds;
    if (effectiveTarget <= 0 || elapsedSeconds < effectiveTarget) return;

    autoStopping.current = true;
    (async () => {
      try {
        const stopped = await pauseTask(taskLog.id, effectiveTarget);
        setTaskLog(stopped);
      } catch (e) {
        console.warn("auto-stop at target failed", e);
      } finally {
        autoStopping.current = false;
      }
    })();
  }, [taskLog, elapsedSeconds, targetSeconds]);

  // Schedules (or reschedules) the "time's up" notification for however
  // much target time is left right now — a no-op if the target's already
  // passed, since there's nothing left to count down to.
  async function scheduleTimerNotificationFor(currentTaskLog: TaskLog) {
    const effectiveTarget = currentTaskLog.timer_seconds_target ?? targetSeconds;
    const remainingSeconds = effectiveTarget - liveElapsed(currentTaskLog, Date.now());
    if (effectiveTarget <= 0 || remainingSeconds <= 0) return;
    try {
      await scheduleTaskTimerNotification(route.params, Date.now() + remainingSeconds * 1000);
    } catch (e) {
      console.warn("scheduleTaskTimerNotification failed", e);
    }
  }

  async function cancelTimerNotification() {
    try {
      await cancelTaskTimerNotification(programId, templateBlockId, scheduledDate);
    } catch (e) {
      console.warn("cancelTaskTimerNotification failed", e);
    }
  }

  async function handleStart() {
    setBusy(true);
    try {
      const updated = await startOrResumeTask(programId, templateBlockId, scheduledDate, proofType, targetSeconds || null);
      setTaskLog(updated);
      setNowMs(Date.now());
      await scheduleTimerNotificationFor(updated);
    } catch (e) {
      console.warn("startOrResumeTask failed", e);
      Alert.alert("Couldn't start task", "Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handlePause() {
    if (!taskLog) return;
    setBusy(true);
    try {
      const updated = await pauseTask(taskLog.id, liveElapsed(taskLog, Date.now()));
      setTaskLog(updated);
      await cancelTimerNotification();
    } catch (e) {
      console.warn("pauseTask failed", e);
      Alert.alert("Couldn't pause task", "Please try again.");
    } finally {
      setBusy(false);
    }
  }

  // The "decide once you're here" extend choice — offered once the target
  // is reached and the clock has auto-stopped (see the effect above and
  // TimerSection). Bumps the target *and* resumes the clock from wherever
  // it was frozen — "extend" means keep going, not just relabel a still-
  // paused timer — then reschedules the notification for the new remaining
  // time. Persists to the DB (extendTaskTarget) rather than local state, so
  // it survives the app being killed/backgrounded and reopened later,
  // including via that same notification's tap.
  async function handleExtend(extraMinutes: number) {
    if (!taskLog) return;
    setBusy(true);
    try {
      const newTarget = targetSeconds + extraMinutes * 60;
      await extendTaskTarget(taskLog.id, newTarget);
      const resumed = await startOrResumeTask(programId, templateBlockId, scheduledDate, proofType, newTarget);
      setTaskLog(resumed);
      setNowMs(Date.now());
      await scheduleTimerNotificationFor(resumed);
    } catch (e) {
      console.warn("extendTaskTarget failed", e);
      Alert.alert("Couldn't add time", "Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function runCompletionRollup(xp: number) {
    try {
      await applyTaskCompletionRollup(programId, xp, scheduledDate, totalBlocksToday);
    } catch (e) {
      console.warn("applyTaskCompletionRollup failed", e);
      Alert.alert(
        "Saved, but XP didn't sync",
        "Your proof was recorded — your streak/XP total will catch up next time you open the app."
      );
    }
  }

  async function handleComplete() {
    if (!taskLog) return;
    setBusy(true);
    try {
      await completeTask(taskLog.id, liveElapsed(taskLog, Date.now()), xpValue, photoUri ?? undefined);
      await cancelTimerNotification();
      await runCompletionRollup(xpValue);
      navigation.goBack();
    } catch (e) {
      console.warn("completeTask failed", e);
      Alert.alert("Couldn't complete task", "Please try again.");
      setBusy(false);
    }
  }

  async function handleEndEarly() {
    if (!taskLog) return;
    setBusy(true);
    try {
      const updated = await endTaskEarly(taskLog.id, liveElapsed(taskLog, Date.now()));
      setTaskLog(updated);
      await cancelTimerNotification();
      navigation.goBack();
    } catch (e) {
      console.warn("endTaskEarly failed", e);
      Alert.alert("Couldn't end task", "Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSelfCheckComplete() {
    setBusy(true);
    try {
      await completeSelfCheckTask(programId, templateBlockId, scheduledDate, xpValue);
      await runCompletionRollup(xpValue);
      navigation.goBack();
    } catch (e) {
      console.warn("completeSelfCheckTask failed", e);
      Alert.alert("Couldn't complete task", "Please try again.");
      setBusy(false);
    }
  }

  return (
    <View className="flex-1 bg-surface">
      <BackHeader title="Submit Proof" onBack={() => navigation.goBack()} />
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-margin-mobile pb-12"
        contentContainerStyle={{ paddingTop: headerHeight }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-shrink flex-row items-center gap-space-xs">
            <View className={`h-9 w-9 items-center justify-center rounded-full ${meta.xpWrapClass}`}>
              <Icon name={meta.icon} size={20} color={meta.iconColor} />
            </View>
            <View className="shrink">
              <Text className="font-label-sm text-label-sm uppercase tracking-wider text-primary">
                +{xpValue} XP
              </Text>
              <Text
                className="font-headline-md text-headline-md font-bold text-on-surface"
                numberOfLines={2}
              >
                {label}
              </Text>
            </View>
          </View>
        </View>

        <Text className="mt-space-sm font-body-md text-body-md text-on-surface-variant">{task}</Text>

        {taskLog === undefined ? null : (
          <View className="mt-space-lg">
            {proofType === "self_check" ? (
              <SelfCheckCard
                task={task}
                xpValue={xpValue}
                completed={phase === "completed"}
                busy={busy}
                onComplete={handleSelfCheckComplete}
              />
            ) : (
              <>
                <TimerSection
                  targetSeconds={targetSeconds}
                  elapsedSeconds={elapsedSeconds}
                  phase={phase}
                  busy={busy}
                  onStart={handleStart}
                  onPause={handlePause}
                  onResume={handleStart}
                  onComplete={handleComplete}
                  onEndEarly={handleEndEarly}
                  onExtend={handleExtend}
                  extraCompleteGate={proofType !== "photo" || !!photoUri}
                />
                {proofType === "photo" && phase !== "completed" && (
                  <PhotoSection photoUri={photoUri} onCaptured={setPhotoUri} />
                )}
              </>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
