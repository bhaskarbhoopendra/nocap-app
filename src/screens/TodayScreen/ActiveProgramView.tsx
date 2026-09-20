import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { useNavigation, CompositeNavigationProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import CircularProgressRing from "@/components/CircularProgressRing";
import GlowOrb from "@/components/GlowOrb";
import Icon from "@/components/Icon";
import { BlockWithProgress } from "@/services/programService";
import { RootStackParamList, TabParamList } from "@/types/navigation";
import TaskBlockCard from "./TaskBlockCard";

type Navigation = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, "Today">,
  NativeStackNavigationProp<RootStackParamList>
>;

interface ActiveProgramViewProps {
  templateName: string;
  absDay: number;
  durationDays: number;
  currentStreak: number;
  dayLabel: string;
  scheduledDate: string;
  programId: string;
  blocks: BlockWithProgress[];
  isRestDay: boolean;
}

// Used only for the hero's completed-count/progress ring — the per-card
// pill styling itself now lives in TaskBlockCard.tsx, which also
// distinguishes paused/early-exited under the hood.
function statusOf(block: BlockWithProgress): "not_started" | "in_progress" | "completed" {
  if (block.taskLog?.status === "completed") return "completed";
  if (block.taskLog) return "in_progress";
  return "not_started";
}

/**
 * The daily protocol view — shown once the user has an active program
 * running. Hero + task list are real (program/template/today's blocks from
 * getTodaysStateForActiveProgram, F3.1); the Live Proof Stream feed and the
 * philosophy card below stay static — they're unrelated marketing content,
 * not program state.
 */
export default function ActiveProgramView({
  templateName,
  absDay,
  durationDays,
  currentStreak,
  dayLabel,
  scheduledDate,
  programId,
  blocks,
  isRestDay,
}: ActiveProgramViewProps) {
  const navigation = useNavigation<Navigation>();
  const todaysXp = blocks.reduce((sum, block) => sum + block.xp_value, 0);
  const completedCount = blocks.filter((b) => statusOf(b) === "completed").length;
  const progress = blocks.length > 0 ? completedCount / blocks.length : 0;

  // Live clock for any block currently running — only ticks while at least
  // one exists, so this screen isn't re-rendering every second for no reason.
  const [nowMs, setNowMs] = useState(() => Date.now());
  const anyRunning = blocks.some((b) => b.taskLog?.running_since);
  useEffect(() => {
    if (!anyRunning) return;
    const id = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(id);
  }, [anyRunning]);

  return (
    <>
      {/* Hero card, with ambient glow decor anchored behind it */}
      <View className="relative">
        <GlowOrb
          size={320}
          color="#fc49a5"
          style={{ top: -60, left: "50%", marginLeft: -160, opacity: 0.2 }}
        />
        <GlowOrb size={192} color="#5910c8" style={{ top: -70, right: -20, opacity: 0.25 }} />

        <View
          className="relative w-full overflow-hidden rounded-xl bg-surface-container p-space-lg"
          style={styles.heroShadow}
        >
          <View className="absolute inset-x-0 top-0 h-px bg-primary/30" />
          <View className="relative z-10 flex flex-col gap-space-md">
            {/* Roadmap tag & XP pill */}
            <View className="flex-row items-center justify-between gap-space-xs">
              <View className="flex-1 flex-row items-center gap-1.5">
                <Icon name="verified" color="#ffb0ce" size={18} />
                <Text
                  className="font-label-sm text-label-sm uppercase tracking-wider text-primary"
                  numberOfLines={1}
                >
                  Day {absDay} of {durationDays} • {templateName}
                </Text>
              </View>
              {todaysXp > 0 && (
                <View className="flex-row items-center gap-1 rounded-full bg-surface-container-highest/80 px-2.5 py-0.5">
                  <Icon name="bolt" color="#00dbe9" size={14} />
                  <Text className="font-label-sm text-label-sm tracking-wide text-tertiary">
                    +{todaysXp} XP
                  </Text>
                </View>
              )}
            </View>

            {/* Ring & metric overview */}
            <View className="flex-row items-center justify-between gap-space-md pt-space-xs">
              <View className="flex-1 flex-col gap-1">
                <Text className="font-headline-xl text-headline-xl leading-tight tracking-tight text-on-surface">
                  Daily Lock-in
                </Text>
                <Text className="font-body-md text-body-md text-on-surface-variant">
                  {isRestDay
                    ? "Streak Shield — no proof required today"
                    : `${completedCount} of ${blocks.length} tasks verified today`}
                </Text>
                <View className="mt-2 flex-row items-center gap-2 self-start rounded-full bg-primary-container/15 px-3 py-1.5">
                  <Icon name="shield" color="#ffb0ce" size={16} />
                  <Text className="font-label-md text-label-md font-bold text-primary">
                    {currentStreak} Day Streak
                  </Text>
                </View>
              </View>

              <CircularProgressRing
                size={96}
                strokeWidth={7}
                progress={isRestDay ? 1 : progress}
                gradientFrom="#fc49a5"
                gradientMid="#d1bcff"
                gradientTo="#00dbe9"
                trackColor="#35343b"
                glowColor="rgba(252,73,165,0.45)"
              >
                <Text className="font-headline-md text-headline-md font-bold text-on-surface">
                  {isRestDay ? 100 : Math.round(progress * 100)}
                  <Text className="text-[12px] font-normal text-primary">%</Text>
                </Text>
                <Text className="font-label-sm text-[9px] uppercase text-on-surface-variant">
                  Status
                </Text>
              </CircularProgressRing>
            </View>
          </View>
        </View>
      </View>

      {/* Section label */}
      <View className="-mb-1 flex-row items-center justify-between px-space-2xs">
        <View className="flex-row items-center gap-1.5">
          <Text className="font-label-md text-label-md uppercase tracking-wider text-on-surface">
            Proof Protocol
          </Text>
          <View className="h-1.5 w-1.5 rounded-full bg-primary" />
        </View>
        <Text className="font-label-sm text-label-sm text-on-surface-variant">{dayLabel}</Text>
      </View>

      {/* Task Proof List — real today's blocks, or a rest/empty state */}
      {isRestDay ? (
        <View
          className="flex-row items-center gap-space-sm rounded-xl bg-surface-container-low p-space-md"
          style={styles.taskShadowSoft}
        >
          <View className="h-10 w-10 items-center justify-center rounded-lg bg-secondary-container/40">
            <Icon name="shield" color="#d1bcff" size={22} />
          </View>
          <Text className="flex-1 font-body-md text-body-md text-on-surface-variant">
            {dayLabel} — your Streak Shield covers today, no proof required.
          </Text>
        </View>
      ) : blocks.length === 0 ? (
        <View
          className="flex-row items-center gap-space-sm rounded-xl bg-surface-container-low p-space-md"
          style={styles.taskShadowSoft}
        >
          <View className="h-10 w-10 items-center justify-center rounded-lg bg-surface-container-high">
            <Icon name="schedule" color="#dfbec9" size={22} />
          </View>
          <Text className="flex-1 font-body-md text-body-md text-on-surface-variant">
            Nothing scheduled for {dayLabel} yet — this template's content doesn't reach this far.
          </Text>
        </View>
      ) : (
        <View className="flex flex-col gap-space-sm">
          {blocks.map((block) => (
            <TaskBlockCard
              key={block.id}
              block={block}
              nowMs={nowMs}
              onPress={() =>
                navigation.navigate("ProofSubmission", {
                  programId,
                  templateBlockId: block.id,
                  scheduledDate,
                  label: block.label,
                  task: block.task,
                  proofType: block.proof_type,
                  xpValue: block.xp_value,
                  targetDurationMinutes: block.target_duration_minutes,
                  totalBlocksToday: blocks.length,
                })
              }
            />
          ))}
        </View>
      )}

      {/* Live Proof Stream — static, unrelated to this user's program state */}
      <View className="flex flex-col gap-space-xs pt-space-xs">
        <View className="flex-row items-center justify-between px-space-2xs">
          <Text className="font-label-md text-label-md uppercase tracking-wider text-on-surface">
            Live Proof Stream
          </Text>
          <View className="flex-row items-center gap-1">
            <View className="h-1.5 w-1.5 rounded-full bg-tertiary" />
            <Text className="font-label-sm text-label-sm text-tertiary">Live</Text>
          </View>
        </View>

        <View className="w-full flex-row gap-space-xs">
          <View className="flex-1 flex-col gap-2 overflow-hidden rounded-lg bg-surface-container p-2.5">
            <View className="relative h-24 w-full overflow-hidden rounded bg-surface-container-highest">
              <Image
                source={{
                  uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuC-5JDY6xBk3biLEUvKV7uwwIknFHL96z8c2kSQlKb2JBrKlTwnVPC8PEovfU3sd27E-Ivsp7qPM_GCc0RQEEIGip4IVhEpvMJNfKpxrKl4a0eS30vtWi0RqzBkqjBkAi-aRVmLKvbKJF_D2DE8TJ3oxrI_zUobVyFZ-tsfiFaMUzJRRUV4JnIybrx8o94NbsVXzwYltEwLZnUW0wHe2pN2Lt8Azu8f-R8LqOUqtGuhrn0OjBvZrVTt8w",
                }}
                className="h-full w-full"
                resizeMode="cover"
              />
              <View className="absolute right-1 top-1 flex-row items-center gap-0.5 rounded bg-surface-container-lowest/80 px-1.5 py-0.5">
                <Icon name="check" color="#00dbe9" size={10} />
                <Text className="text-[9px] font-label-sm text-tertiary">Validated</Text>
              </View>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="font-label-sm text-label-sm text-on-surface" numberOfLines={1}>
                @alex_dev
              </Text>
              <Text className="font-label-sm text-label-sm text-on-surface-variant">4m ago</Text>
            </View>
          </View>

          <View className="flex-1 flex-col gap-2 overflow-hidden rounded-lg bg-surface-container p-2.5">
            <View className="relative h-24 w-full overflow-hidden rounded bg-surface-container-highest">
              <Image
                source={{
                  uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuBtJcHjeXMSe6G3QmrqyB6BIIjbLuFrMSaON3-3SBNQ5eCZCQYOOlmFsQPFnPgkzCOGN1wKtZmC6vtLMT-Nif2GUG4nUbt2bc9iHYNoho4hY5tAuEoCztPhwq2BOYGnGK378bduLIlFCuxvSe4O0PM3oqgXtsK8UOcbRAZaLjvLVLcm5lbxKdR-scYUW-g_tR2RUfdVDfwDZmmbFn4ArPVjsHVSkaa3YthGatvmDoHhBPc8mhHfz8zK1g",
                }}
                className="h-full w-full"
                resizeMode="cover"
              />
              <View className="absolute right-1 top-1 flex-row items-center gap-0.5 rounded bg-surface-container-lowest/80 px-1.5 py-0.5">
                <Icon name="check" color="#d1bcff" size={10} />
                <Text className="text-[9px] font-label-sm text-secondary">Validated</Text>
              </View>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="font-label-sm text-label-sm text-on-surface" numberOfLines={1}>
                @maya_swe
              </Text>
              <Text className="font-label-sm text-label-sm text-on-surface-variant">12m ago</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Proof Over Perfection philosophy card — static */}
      <View
        className="relative overflow-hidden rounded-xl bg-surface-container-lowest/90 p-space-md"
        style={styles.philosophyShadow}
      >
        <GlowOrb size={128} color="#ffb0ce" style={{ top: -20, right: -20, opacity: 0.1 }} />
        <View className="relative z-10 flex-row items-start gap-space-sm">
          <LinearGradient
            colors={["#ffb0ce", "#d1bcff"]}
            start={{ x: 0, y: 1 }}
            end={{ x: 1, y: 0 }}
            style={styles.philosophyIcon}
          >
            <Icon name="verified_user" color="#63003b" size={18} />
          </LinearGradient>
          <View className="flex-1 flex-col gap-1">
            <View className="flex-row items-center gap-2">
              <Text className="font-label-md text-label-md tracking-wide text-primary">
                Proof Over Perfection
              </Text>
              <Text className="rounded bg-surface-container-high px-1.5 py-0.5 text-[10px] font-label-sm text-on-surface-variant">
                Philosophy
              </Text>
            </View>
            <Text className="font-body-sm text-body-sm leading-relaxed text-on-surface-variant">
              Real proof over fake streaks. Showing up today is what actually locks in a streak
              — not a perfect one.
            </Text>
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  heroShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  taskShadowSoft: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  philosophyShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 22,
    elevation: 8,
  },
  philosophyIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
});
