import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import CircularProgressRing from "@/components/CircularProgressRing";
import GlowOrb from "@/components/GlowOrb";
import Icon from "@/components/Icon";
import { formatClock } from "@/services/taskLogService";

export type TimerPhase = "not_started" | "running" | "paused" | "completed" | "early_exited";

interface TimerSectionProps {
  targetSeconds: number;
  elapsedSeconds: number;
  phase: TimerPhase;
  busy: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onComplete: () => void;
  onEndEarly: () => void;
  onExtend: (extraMinutes: number) => void;
  // Photo blocks also require a captured snap — the parent passes that
  // check in here so this component stays the single source of "is the
  // timer requirement met" while still respecting the extra requirement.
  extraCompleteGate?: boolean;
}

const EXTEND_OPTIONS_MINUTES = [15, 30, 60];

/**
 * Section 1 of the task detail screen — the live-monitored focus timer.
 * Shown for both `timer` and `photo` proof types (photo blocks require
 * this same timer *plus* a snap, see PhotoSection.tsx). Complete is
 * reachable only once elapsed >= target — the one hard rule the user
 * asked for: no completing mid-timer, an early exit is a separate,
 * explicitly honest action instead.
 */
export default function TimerSection({
  targetSeconds,
  elapsedSeconds,
  phase,
  busy,
  onStart,
  onPause,
  onResume,
  onComplete,
  onEndEarly,
  onExtend,
  extraCompleteGate = true,
}: TimerSectionProps) {
  const progress = targetSeconds > 0 ? Math.min(1, elapsedSeconds / targetSeconds) : 0;
  const targetReached = phase !== "not_started" && targetSeconds > 0 && elapsedSeconds >= targetSeconds;
  const canComplete = targetReached && extraCompleteGate;
  const showExtend = targetReached && (phase === "running" || phase === "paused");

  return (
    <View
      className="relative items-center overflow-hidden rounded-xl bg-surface-container-low p-space-lg shadow-xl"
      style={styles.shadow}
    >
      <GlowOrb size={208} color="#5910c8" style={{ top: -80, left: -80 }} />
      <GlowOrb size={208} color="#fc49a5" style={{ bottom: -80, right: -80 }} />

      <View className="my-space-xs">
        <CircularProgressRing
          size={208}
          strokeWidth={7}
          progress={phase === "completed" ? 1 : progress}
          trackColor="#2a2930"
          gradientFrom="#fc49a5"
          gradientMid="#d1bcff"
          gradientTo="#00dbe9"
          glowColor="rgba(252,73,165,0.4)"
        >
          <View className="items-center justify-center">
            <Text className="font-headline-2xl text-headline-2xl font-black tracking-tight text-on-surface">
              {formatClock(elapsedSeconds)}
            </Text>
            <View className="mt-0.5 flex-row items-center gap-1.5 rounded-full bg-surface-container-highest/70 px-2.5 py-0.5">
              <View className="h-1.5 w-1.5 rounded-full bg-tertiary" />
              <Text className="font-label-md text-label-md font-medium text-on-surface-variant">
                {formatClock(targetSeconds)} Target
              </Text>
            </View>
          </View>
        </CircularProgressRing>
      </View>

      {phase === "completed" ? (
        <View className="mt-space-sm w-full flex-row items-center justify-center gap-1.5 rounded-lg bg-primary-container py-3">
          <Icon name="check_circle" size={20} color="#63003b" />
          <Text className="font-label-lg text-label-lg font-bold text-on-primary">Verified</Text>
        </View>
      ) : phase === "early_exited" ? (
        <Pressable
          disabled={busy}
          onPress={onStart}
          className="mt-space-sm w-full flex-row items-center justify-center gap-1.5 rounded-lg bg-primary-container py-3"
        >
          <Icon name="refresh" size={20} color="#63003b" />
          <Text className="font-label-lg text-label-lg font-bold text-on-primary">Restart Task</Text>
        </Pressable>
      ) : phase === "not_started" ? (
        <Pressable
          disabled={busy}
          onPress={onStart}
          className="mt-space-sm w-full flex-row items-center justify-center gap-1.5 rounded-lg bg-primary-container py-3 shadow-lg"
        >
          <Icon name="play_arrow" size={20} color="#63003b" />
          <Text className="font-label-lg text-label-lg font-bold text-on-primary">Start Task</Text>
        </Pressable>
      ) : (
        <>
          {targetReached ? (
            // Once the clock auto-stops at target (see ProofSubmission/index.tsx),
            // a bare "Resume" doesn't fit anymore — the two real choices from here
            // are Complete or Extend (below), not silently running past target
            // with no new target set.
            <Pressable
              disabled={busy || !canComplete}
              onPress={onComplete}
              className={`mt-space-sm w-full flex-row items-center justify-center gap-1.5 rounded-lg py-3 shadow-lg ${
                canComplete ? "bg-primary-container" : "bg-surface-container-high opacity-40"
              }`}
            >
              <Icon name="check_circle" size={20} color={canComplete ? "#63003b" : "#e4e1ea"} />
              <Text
                className={`font-label-lg text-label-lg font-bold ${
                  canComplete ? "text-on-primary" : "text-on-surface"
                }`}
              >
                Complete
              </Text>
            </Pressable>
          ) : (
            <View className="mt-space-sm w-full flex-row gap-space-xs">
              <Pressable
                disabled={busy}
                onPress={phase === "running" ? onPause : onResume}
                className="flex-1 flex-row items-center justify-center gap-1.5 rounded-lg bg-surface-container-high py-3"
              >
                <Icon name={phase === "running" ? "pause" : "play_arrow"} size={20} color="#e4e1ea" />
                <Text className="font-label-lg text-label-lg font-semibold tracking-wide text-on-surface">
                  {phase === "running" ? "Pause" : "Resume"}
                </Text>
              </Pressable>
              <Pressable
                disabled
                className="flex-1 flex-row items-center justify-center gap-1.5 rounded-lg bg-surface-container-high py-3 opacity-40"
              >
                <Icon name="check_circle" size={20} color="#e4e1ea" />
                <Text className="font-label-lg text-label-lg font-bold text-on-surface">Complete</Text>
              </Pressable>
            </View>
          )}

          {showExtend && (
            <View className="mt-space-sm w-full gap-1.5">
              <Text className="text-center font-label-sm text-label-sm uppercase tracking-wider text-tertiary">
                Target reached — need more time?
              </Text>
              <View className="flex-row gap-space-xs">
                {EXTEND_OPTIONS_MINUTES.map((minutes) => (
                  <Pressable
                    key={minutes}
                    disabled={busy}
                    onPress={() => onExtend(minutes)}
                    className="flex-1 flex-row items-center justify-center gap-1 rounded-lg bg-surface-container-high py-2.5"
                  >
                    <Icon name="add" size={16} color="#00dbe9" />
                    <Text className="font-label-md text-label-md font-semibold text-tertiary">
                      {minutes}m
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          <Pressable
            disabled={busy}
            onPress={onEndEarly}
            className="mt-space-sm flex-row items-center gap-1.5 rounded-full px-3 py-1.5"
          >
            <Icon name="logout" size={16} color="#dfbec9" />
            <Text className="font-label-sm text-label-sm text-on-surface-variant">
              End Early with Dignity
            </Text>
          </Pressable>

          <View className="mt-space-md w-full flex-row items-start gap-space-xs rounded-lg bg-surface-container p-space-sm">
            <Text className="shrink-0 text-lg leading-tight">💛</Text>
            <Text className="flex-1 font-body-sm text-body-sm leading-relaxed text-on-surface-variant">
              <Text className="font-semibold text-on-surface">Life happens.</Text> If you stop
              now, your time is still recorded with zero shame. No streaks are wiped here.
            </Text>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
});
