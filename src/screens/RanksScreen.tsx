import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { CompositeNavigationProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import AppHeader from "@/components/AppHeader";
import Avatar from "@/components/Avatar";
import GlowOrb from "@/components/GlowOrb";
import Icon from "@/components/Icon";
import PrimaryButton from "@/components/PrimaryButton";
import { useSession } from "@/hooks/SessionContext";
import { useHeaderHeight } from "@/hooks/useHeaderHeight";
import {
  getCategoryLeaderboard,
  getGlobalLeaderboard,
  getMyCategoryRank,
  getMyGlobalRank,
} from "@/services/leaderboardService";
import {
  ActiveProgramSummary,
  getActiveProgramSummary,
  LEADERBOARD_UNLOCK_STREAK_DAYS,
  LEADERBOARD_UNLOCK_XP,
} from "@/services/programService";
import { DEFAULT_AVATAR_SEED, isAvatarSeed } from "@/theme/avatarPresets";
import { categoryLabel } from "@/theme/categoryLabels";
import { LeaderboardGlobalRow, LeaderboardTemplateRow } from "@/types/database";
import { RootStackParamList, TabParamList } from "@/types/navigation";

type Navigation = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, "Ranks">,
  NativeStackNavigationProp<RootStackParamList>
>;

// Either kind of row has the same shape this screen actually renders.
type Row = LeaderboardGlobalRow | (LeaderboardTemplateRow & { user_id: string });

export default function RanksScreen() {
  const navigation = useNavigation<Navigation>();
  const { session, profile } = useSession();
  const headerHeight = useHeaderHeight();

  const [tab, setTab] = useState<"global" | "track">("global");
  const [activeProgram, setActiveProgram] = useState<ActiveProgramSummary | null | undefined>(
    undefined
  );
  const [globalRows, setGlobalRows] = useState<LeaderboardGlobalRow[] | undefined>(undefined);
  const [myGlobalRank, setMyGlobalRank] = useState<LeaderboardGlobalRow | null | undefined>(
    undefined
  );
  const [trackRows, setTrackRows] = useState<LeaderboardTemplateRow[] | undefined>(undefined);
  const [myTrackRank, setMyTrackRank] = useState<LeaderboardTemplateRow | null | undefined>(
    undefined
  );

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    (async () => {
      const [program, rows, myRank] = await Promise.all([
        getActiveProgramSummary(session.user.id),
        getGlobalLeaderboard(20),
        getMyGlobalRank(session.user.id),
      ]);
      if (cancelled) return;
      setActiveProgram(program);
      setGlobalRows(rows);
      setMyGlobalRank(myRank);

      if (program) {
        const [catRows, myCatRank] = await Promise.all([
          getCategoryLeaderboard(program.template.category, 20),
          getMyCategoryRank(session.user.id, program.template.category),
        ]);
        if (!cancelled) {
          setTrackRows(catRows);
          setMyTrackRank(myCatRank);
        }
      } else {
        setTrackRows([]);
        setMyTrackRank(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [session]);

  if (!profile) return null;

  const unlocked = profile.leaderboard_unlocked;
  const streakProgress = Math.min(1, profile.current_streak / LEADERBOARD_UNLOCK_STREAK_DAYS);
  const xpProgress = Math.min(1, profile.total_xp / LEADERBOARD_UNLOCK_XP);
  const eligibilityProgress = Math.max(streakProgress, xpProgress);
  const streakIsCloser = streakProgress >= xpProgress;

  const trackLabel = activeProgram ? categoryLabel(activeProgram.template.category) : "Your Track";
  const rows: Row[] | undefined = tab === "global" ? globalRows : trackRows;
  const myRank = tab === "global" ? myGlobalRank : myTrackRank;

  return (
    <View className="flex-1 bg-surface">
      <AppHeader />
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-margin-mobile pb-28"
        contentContainerStyle={{ paddingTop: headerHeight }}
        showsVerticalScrollIndicator={false}
      >
        <View className="relative">
          <GlowOrb
            size={280}
            color="#fc49a5"
            style={{ top: -48, left: "50%", marginLeft: -140, opacity: 0.18 }}
          />

          <View className="flex flex-col gap-space-md">
            {/* Eyebrow row + reset countdown — the countdown is decorative
                (no daily-reset mechanic exists for this leaderboard yet). */}
            <View className="flex flex-col gap-space-xs">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <Icon name="verified" size={20} color="#ffb0ce" />
                  <Text className="font-label-sm text-label-sm font-bold uppercase tracking-widest text-primary">
                    Proof of Grind
                  </Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <Icon name="schedule" size={15} color="#dfbec9" />
                  <Text className="font-label-sm text-label-sm text-on-surface-variant">
                    Resets in 7h 14m
                  </Text>
                </View>
              </View>

              {/* Global / Track segmented toggle — now real */}
              <View className="flex-row items-center rounded-xl bg-surface-container-lowest p-1">
                <Pressable
                  onPress={() => setTab("global")}
                  className={`w-1/2 items-center justify-center rounded-lg py-2.5 ${
                    tab === "global" ? "" : ""
                  }`}
                >
                  {tab === "global" ? (
                    <LinearGradient
                      colors={["#fc49a5", "#5910c8", "#5910c8"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{
                        position: "absolute",
                        left: 4,
                        right: 4,
                        top: 4,
                        bottom: 4,
                        borderRadius: 8,
                      }}
                    />
                  ) : null}
                  <View className="flex-row items-center gap-1.5">
                    <Icon name="public" size={16} color={tab === "global" ? "#ffffff" : "#dfbec9"} />
                    <Text
                      className={`font-label-md text-label-md ${
                        tab === "global" ? "font-bold text-white" : "text-on-surface-variant"
                      }`}
                    >
                      Global Standings
                    </Text>
                  </View>
                </Pressable>
                <Pressable
                  disabled={!activeProgram}
                  onPress={() => setTab("track")}
                  className="w-1/2 items-center justify-center rounded-lg py-2.5"
                >
                  {tab === "track" ? (
                    <LinearGradient
                      colors={["#fc49a5", "#5910c8", "#5910c8"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{
                        position: "absolute",
                        left: 4,
                        right: 4,
                        top: 4,
                        bottom: 4,
                        borderRadius: 8,
                      }}
                    />
                  ) : null}
                  <View className="flex-row items-center gap-1.5">
                    <Icon name="terminal" size={16} color={tab === "track" ? "#ffffff" : "#dfbec9"} />
                    <Text
                      numberOfLines={1}
                      className={`font-label-md text-label-md ${
                        tab === "track"
                          ? "font-bold text-white"
                          : activeProgram
                            ? "text-on-surface-variant"
                            : "text-outline"
                      }`}
                    >
                      {trackLabel}
                    </Text>
                  </View>
                </Pressable>
              </View>
            </View>

            {/* Leaderboard Eligibility — real progress, disappears once unlocked */}
            {!unlocked && (
              <View className="rounded-xl bg-surface-container-low p-space-md">
                <View className="flex-row items-start gap-space-sm">
                  <LinearGradient
                    colors={["#fc49a5", "#5910c8"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon name="workspace_premium" size={24} color="#ffffff" />
                  </LinearGradient>
                  <View className="flex-1 gap-0.5">
                    <View className="flex-row items-center justify-between">
                      <Text className="font-headline-md text-headline-md font-bold text-on-surface">
                        Leaderboard Eligibility
                      </Text>
                      <View className="rounded-full bg-primary/15 px-2 py-0.5">
                        <Text className="font-label-sm text-label-sm font-bold text-primary">
                          {Math.round(eligibilityProgress * 100)}%
                        </Text>
                      </View>
                    </View>
                    <Text className="font-body-sm text-body-sm text-on-surface-variant">
                      <Text className="font-semibold text-primary">
                        {profile.current_streak} / {LEADERBOARD_UNLOCK_STREAK_DAYS} Days
                      </Text>{" "}
                      Streak or{" "}
                      <Text className="font-semibold text-secondary">
                        {profile.total_xp} / {LEADERBOARD_UNLOCK_XP} XP
                      </Text>
                    </Text>
                  </View>
                </View>

                <View className="mt-space-sm gap-1.5">
                  <View className="h-2.5 w-full overflow-hidden rounded-full bg-surface-container-highest p-0.5">
                    <LinearGradient
                      colors={["#fc49a5", "#ffb0ce", "#d1bcff"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{
                        height: "100%",
                        width: `${eligibilityProgress * 100}%`,
                        borderRadius: 999,
                      }}
                    />
                  </View>
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-1">
                      <Icon name="bolt" size={13} color="#ffb0ce" />
                      <Text className="font-label-sm text-label-sm text-primary">
                        {streakIsCloser
                          ? `${Math.max(0, LEADERBOARD_UNLOCK_STREAK_DAYS - profile.current_streak)} day${
                              LEADERBOARD_UNLOCK_STREAK_DAYS - profile.current_streak === 1 ? "" : "s"
                            } to unlock verified rank!`
                          : "Keep logging to unlock verified rank!"}
                      </Text>
                    </View>
                    <Text className="font-label-sm text-label-sm font-semibold text-secondary">
                      {Math.max(0, LEADERBOARD_UNLOCK_XP - profile.total_xp)} XP to go
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Top Verified Nocappers — real leaderboard_global / leaderboard_by_template rows */}
            <View className="flex flex-col gap-space-xs">
              <View className="flex-row items-center justify-between px-1">
                <View className="flex-row items-center gap-2">
                  <Text className="font-label-lg text-label-lg font-bold uppercase tracking-wider text-on-surface-variant">
                    Top Verified Nocappers
                  </Text>
                  <View className="h-2 w-2 rounded-full bg-tertiary" />
                </View>
                <View className="flex-row items-center gap-1">
                  <Icon name="shield" size={14} color="#dfbec9" />
                  <Text className="font-label-sm text-label-sm text-on-surface-variant">
                    Proof Protected
                  </Text>
                </View>
              </View>

              {rows === undefined ? null : rows.length === 0 ? (
                <View className="items-center gap-1.5 rounded-xl bg-surface-container-low p-space-lg">
                  <Icon name="emoji_events" size={24} color="#dfbec9" />
                  <Text className="text-center font-body-sm text-body-sm text-on-surface-variant">
                    No verified leaderboard entries yet — be the first to unlock it.
                  </Text>
                </View>
              ) : (
                <View className="flex flex-col gap-2">
                  {rows.map((row) => {
                    const seed = isAvatarSeed(row.avatar_seed) ? row.avatar_seed : DEFAULT_AVATAR_SEED;
                    const isMe = row.user_id === session?.user?.id;
                    const medal = row.rank === 1 ? "🥇" : row.rank === 2 ? "🥈" : row.rank === 3 ? "🥉" : null;

                    if (medal) {
                      const stripeColor =
                        row.rank === 1 ? "#fc49a5" : row.rank === 2 ? "#d1bcff" : "#00dbe9";
                      return (
                        <View
                          key={row.user_id}
                          className="relative flex-row items-center justify-between overflow-hidden rounded-xl bg-surface-container p-space-sm"
                        >
                          <View
                            className="absolute bottom-0 left-0 top-0 w-1"
                            style={{ backgroundColor: stripeColor }}
                          />
                          <View className="flex-1 flex-row items-center gap-space-sm">
                            <View className="h-8 w-8 items-center justify-center rounded-lg bg-surface-container-highest">
                              <Text className="text-lg">{medal}</Text>
                            </View>
                            <Avatar seed={seed} size={40} />
                            <View className="flex-1 gap-0.5">
                              <View className="flex-row items-center gap-1.5">
                                <Text
                                  numberOfLines={1}
                                  className="font-headline-md text-headline-md font-bold text-on-surface"
                                >
                                  {row.username}
                                  {isMe ? " (You)" : ""}
                                </Text>
                                <View className="flex-row items-center gap-0.5 rounded-full bg-tertiary/15 px-2 py-0.5">
                                  <Icon name="check" size={11} color="#00dbe9" />
                                  <Text className="font-label-sm text-label-sm text-tertiary">
                                    Verified
                                  </Text>
                                </View>
                              </View>
                              <View className="mt-0.5 flex-row items-center gap-2">
                                <View className="flex-row items-center gap-0.5">
                                  <Icon name="local_fire_department" size={13} color="#ffb0ce" />
                                  <Text className="font-label-sm text-label-sm text-primary">
                                    {row.current_streak} Day{row.current_streak === 1 ? "" : "s"}{" "}
                                    Streak
                                  </Text>
                                </View>
                                <Text className="font-label-sm text-label-sm text-on-surface-variant">
                                  •
                                </Text>
                                <Text className="font-label-sm text-label-sm text-on-surface">
                                  {row.total_xp} XP
                                </Text>
                              </View>
                            </View>
                          </View>
                        </View>
                      );
                    }

                    return (
                      <View
                        key={row.user_id}
                        className="flex-row items-center justify-between rounded-xl bg-surface-container-low p-space-sm"
                      >
                        <View className="flex-1 flex-row items-center gap-space-sm">
                          <View className="h-8 w-8 items-center justify-center rounded-lg bg-surface-container-lowest">
                            <Text className="font-label-md text-label-md font-bold text-on-surface-variant">
                              #{row.rank}
                            </Text>
                          </View>
                          <Avatar seed={seed} size={36} />
                          <View className="flex-1 gap-0.5">
                            <Text
                              numberOfLines={1}
                              className="font-headline-md text-headline-md font-semibold text-on-surface"
                            >
                              {row.username}
                              {isMe ? " (You)" : ""}
                            </Text>
                            <View className="mt-0.5 flex-row items-center gap-2">
                              <View className="flex-row items-center gap-0.5">
                                <Icon name="local_fire_department" size={13} color="#ffb0ce" />
                                <Text className="font-label-sm text-label-sm text-primary">
                                  {row.current_streak} Day{row.current_streak === 1 ? "" : "s"} Streak
                                </Text>
                              </View>
                              <Text className="font-label-sm text-label-sm text-on-surface-variant">
                                •
                              </Text>
                              <Text className="font-label-sm text-label-sm text-on-surface">
                                {row.total_xp} XP
                              </Text>
                            </View>
                          </View>
                        </View>
                        <View className="flex-row items-center gap-1 rounded bg-surface-container px-2 py-1">
                          <Icon name="check_circle" size={12} color="#00dbe9" />
                          <Text className="font-label-sm text-label-sm text-on-surface-variant">
                            Verified
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>

            {/* Sticky "you" card — real identity, real unlock state/rank */}
            <LinearGradient
              colors={["#fc49a5", "#5910c8", "#00dbe9"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ borderRadius: 16, padding: 2, marginTop: 4 }}
            >
              <View className="flex-row items-center justify-between rounded-[14px] bg-surface-container-lowest p-space-sm">
                <View className="flex-1 flex-row items-center gap-space-sm">
                  <View className="h-9 w-9 items-center justify-center rounded-xl bg-surface-container-high">
                    <Icon name={unlocked ? "verified" : "lock"} size={18} color="#ffb0ce" />
                  </View>
                  <View className="flex-1 gap-0.5">
                    <View className="flex-row items-center gap-1.5">
                      <Text
                        numberOfLines={1}
                        className="font-headline-md text-headline-md font-bold text-on-surface"
                      >
                        {profile.username} (You)
                      </Text>
                      <View
                        className={`rounded px-1.5 py-0.5 ${unlocked ? "bg-tertiary/15" : "bg-primary/20"}`}
                      >
                        <Text
                          className={`font-label-sm text-label-sm font-bold ${
                            unlocked ? "text-tertiary" : "text-primary"
                          }`}
                        >
                          {unlocked ? `Rank #${myRank?.rank ?? "—"}` : "Pending"}
                        </Text>
                      </View>
                    </View>
                    <View className="mt-0.5 flex-row items-center gap-2">
                      <View className="flex-row items-center gap-0.5">
                        <Icon name="local_fire_department" size={13} color="#ffb0ce" />
                        <Text className="font-label-sm text-label-sm font-semibold text-primary">
                          {profile.current_streak} Day{profile.current_streak === 1 ? "" : "s"} Streak
                        </Text>
                      </View>
                      <Text className="font-label-sm text-label-sm text-on-surface-variant">•</Text>
                      <Text className="font-label-sm text-label-sm font-semibold text-on-surface">
                        {profile.total_xp} XP
                      </Text>
                      {!unlocked && (
                        <>
                          <Text className="font-label-sm text-label-sm text-on-surface-variant">
                            •
                          </Text>
                          <Text numberOfLines={1} className="font-label-sm text-label-sm text-secondary">
                            Not verified yet
                          </Text>
                        </>
                      )}
                    </View>
                  </View>
                </View>
                {!unlocked && (
                  <PrimaryButton
                    label="Submit"
                    icon="add_a_photo"
                    colors={["#fc49a5", "#5910c8"]}
                    onPress={() => navigation.navigate("Tabs", { screen: "Today" })}
                  />
                )}
              </View>
            </LinearGradient>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
