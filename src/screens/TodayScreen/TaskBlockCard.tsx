import React, { useEffect, useRef } from "react";
import { Animated, Easing, Pressable, Text, View } from "react-native";
import Icon from "@/components/Icon";
import { BlockWithProgress } from "@/services/programService";
import { formatClock, liveElapsedSeconds } from "@/services/taskLogService";
import { PROOF_TYPE_META } from "@/theme/proofTypePresentation";

type TimerPhase = "not_started" | "running" | "paused" | "completed" | "early_exited";

function phaseOf(block: BlockWithProgress): TimerPhase {
  const taskLog = block.taskLog;
  if (!taskLog) return "not_started";
  if (taskLog.status === "completed") return "completed";
  if (taskLog.status === "incomplete_early_exit") return "early_exited";
  return taskLog.running_since ? "running" : "paused";
}

// Escalating nudges — the whole point is to make the in-progress state feel
// alive enough that finishing feels closer than quitting. Distinct copy for
// paused/early-exited keeps the "no shame" tone consistent with the detail
// screen instead of just going quiet.
function motivationLine(phase: TimerPhase, progressFraction: number): string {
  if (phase === "paused") return "Paused — resume when you're ready. No shame, no rush.";
  if (phase === "early_exited") return "Ended early, logged with zero shame — tap to give it another go.";
  if (progressFraction >= 1) return "Target reached — tap in and hit Complete!";
  if (progressFraction >= 0.75) return "So close. Finish strong!";
  if (progressFraction >= 0.5) return "Halfway there — keep the momentum.";
  if (progressFraction >= 0.25) return "Good pace. Stay locked in.";
  return "You started — that's the hardest part. Keep going.";
}

const PHASE_PILL: Record<TimerPhase, { label: string; className: string; textClassName: string }> = {
  not_started: { label: "Not Started", className: "bg-surface-container-highest", textClassName: "text-on-surface-variant" },
  running: { label: "In Progress", className: "bg-tertiary/15", textClassName: "text-tertiary" },
  paused: { label: "In Progress", className: "bg-tertiary/15", textClassName: "text-tertiary" },
  early_exited: { label: "In Progress", className: "bg-tertiary/15", textClassName: "text-tertiary" },
  completed: { label: "Verified", className: "bg-primary/15", textClassName: "text-primary" },
};

interface TaskBlockCardProps {
  block: BlockWithProgress;
  nowMs: number;
  onPress: () => void;
}

/**
 * One Proof Protocol row on Today. Beyond the status pill, a block with a
 * timer (timer/photo proof types) shows its live clock + progress bar +
 * motivational copy right here — so the user doesn't have to open the
 * detail screen just to see it's still running, and a completed one shows
 * how long it actually took.
 */
export default function TaskBlockCard({ block, nowMs, onPress }: TaskBlockCardProps) {
  const meta = PROOF_TYPE_META[block.proof_type];
  const hasTimer = block.proof_type !== "self_check";
  const phase = phaseOf(block);
  const pill = PHASE_PILL[phase];

  const targetSeconds = (block.target_duration_minutes ?? 0) * 60;
  const elapsedSeconds = block.taskLog ? liveElapsedSeconds(block.taskLog, nowMs) : 0;
  const progressFraction = targetSeconds > 0 ? Math.min(1, elapsedSeconds / targetSeconds) : 0;

  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (phase !== "running") return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.35, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [phase, pulse]);

  return (
    <Pressable
      disabled={phase === "completed"}
      onPress={onPress}
      className="relative overflow-hidden rounded-xl bg-surface-container-low p-space-md active:opacity-80"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
      }}
    >
      <View className="flex-row items-start gap-space-sm">
        <View className={`h-10 w-10 shrink-0 items-center justify-center rounded-lg ${meta.xpWrapClass}`}>
          <Icon name={meta.icon} color={meta.iconColor} size={22} />
        </View>
        <View className="flex-1 flex-col">
          <View className="flex-row items-center justify-between gap-2">
            <Text className="flex-1 font-headline-md text-headline-md text-on-surface" numberOfLines={1}>
              {block.label}
            </Text>
            <View className={`rounded-full px-2 py-0.5 ${pill.className}`}>
              <Text className={`font-label-sm text-[10px] font-bold uppercase ${pill.textClassName}`}>
                {pill.label}
              </Text>
            </View>
          </View>
          <Text className="mt-0.5 font-body-sm text-body-sm text-on-surface-variant" numberOfLines={2}>
            {block.task}
          </Text>

          {phase === "completed" && hasTimer ? (
            <View className="mt-2.5 flex-row items-center gap-3">
              <Text className={`font-label-sm text-label-sm font-bold ${meta.xpClass}`}>+{block.xp_value} XP</Text>
              <View className="flex-row items-center gap-1">
                <Icon name="check_circle" size={13} color="#00dbe9" />
                <Text className="font-label-sm text-[11px] text-tertiary">
                  Completed in {formatClock(block.taskLog?.timer_seconds_actual ?? elapsedSeconds)}
                </Text>
              </View>
            </View>
          ) : (
            <View className="mt-2.5 flex-row items-center gap-2">
              <Text className={`font-label-sm text-label-sm font-bold ${meta.xpClass}`}>+{block.xp_value} XP</Text>
            </View>
          )}
        </View>
      </View>

      {hasTimer && phase !== "not_started" && phase !== "completed" && (
        <View className="mt-space-sm gap-1.5 rounded-lg bg-surface-container-lowest/80 p-2.5">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-1.5">
              <Animated.View
                style={{ opacity: phase === "running" ? pulse : 1 }}
                className={`h-1.5 w-1.5 rounded-full ${phase === "running" ? "bg-tertiary" : "bg-on-surface-variant"}`}
              />
              <Text className="font-label-md text-label-md font-bold text-on-surface">
                {formatClock(elapsedSeconds)}
                <Text className="font-normal text-on-surface-variant"> / {formatClock(targetSeconds)}</Text>
              </Text>
            </View>
            <Text className="font-label-sm text-[10px] uppercase tracking-wide text-tertiary">
              {phase === "running" ? "Live" : phase === "paused" ? "Paused" : "Ended Early"}
            </Text>
          </View>
          <View className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container-highest">
            <View
              className={`h-full rounded-full ${phase === "running" ? "bg-tertiary" : "bg-outline"}`}
              style={{ width: `${progressFraction * 100}%` }}
            />
          </View>
          <Text className="font-body-sm text-[11px] text-on-surface-variant">
            {motivationLine(phase, progressFraction)}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
