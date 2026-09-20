import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import { Alert, Image, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BackHeader from "@/components/BackHeader";
import GlowOrb from "@/components/GlowOrb";
import Icon, { IconName } from "@/components/Icon";
import { useSession } from "@/hooks/SessionContext";
import { useHeaderHeight } from "@/hooks/useHeaderHeight";
import { ActiveProgramExistsError, startProgram } from "@/services/programService";
import {
  getTemplateById,
  getTemplateDaysWithBlocks,
  getTemplateWeeks,
  getTemplateWorkloadCategories,
  TemplateDayWithBlocks,
} from "@/services/templateService";
import { categoryLabel } from "@/theme/categoryLabels";
import { PROOF_TYPE_META } from "@/theme/proofTypePresentation";
import { Template, TemplateWeek, TemplateWorkloadCategory, WorkloadColorRole } from "@/types/database";
import { RootStackParamList } from "@/types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "TemplateDetail">;
type MainTab = "curriculum" | "rules" | "community";

interface MetaStat {
  icon: IconName;
  iconColor: string;
  label: string;
  value: string;
}

// Matches template_workload_categories.color_role — ties the DB-driven
// category breakdown to the app's fixed 3-accent palette.
const WORKLOAD_BG_CLASS: Record<WorkloadColorRole, string> = {
  primary: "bg-primary",
  secondary: "bg-secondary",
  tertiary: "bg-tertiary",
};

interface ProofRule {
  icon: IconName;
  iconColor: string;
  title: string;
  body: string;
}

// Anti-cheat copy — not template-specific content an admin curates per
// template, stays static (same posture as Reviews & Alums below).
const PROOF_RULES: ProofRule[] = [
  {
    icon: "center_focus_strong",
    iconColor: "#ffb0ce",
    title: "Live EXIF & Camera Audit",
    body: "Camera roll uploads blocked. Live captures parse localized timestamp and whiteboard focus depth.",
  },
  {
    icon: "timer",
    iconColor: "#d1bcff",
    title: "Background Focus Guard",
    body: "Leaving app triggers 15-second grace prompt. Prevents tab switching during active problem solving.",
  },
  {
    icon: "verified_user",
    iconColor: "#00dbe9",
    title: "Peer Consensus Protocol",
    body: "Community validators cross-verify whiteboard diagrams and code logic before XP and streaks lock in.",
  },
];

interface Performer {
  handle: string;
  avatar: string;
  subtitle: string;
  subtitleClass: string;
  streak: string;
  badge: string;
  badgeClass: string;
}

// Social-proof content — tied to no real user/review data yet (that's a
// separate, later feature: real per-template leaderboards/reviews), stays
// static same as before.
const PERFORMERS: Performer[] = [
  {
    handle: "maya_swe",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDo6PglSWQZd4Gcb9IfInHNl3Oz-VbuMBghKFNgKA2hzrZbOxScmMoBoiVoYsbpbbWR2cJednjmmRAYkj9yPg3XMyZxhNK7S_aBEDtoVTKlqNCrn72SCtGfReH1GzzH6TYTCS1eCrXthw2daheuwuD2UeCiti_z0-T8sovDbRkA-7KRF_nOtD9z3QbVNi_OWxEmOtHgMy-g0QAieuwyvBzmcxJ3Dk0m3cIT66tjZ8h9obXiyaQB6FvuZQ",
    subtitle: "Staff Prep • Currently Phase 3",
    subtitleClass: "text-on-surface-variant",
    streak: "Day 39",
    badge: "99% Proof Sync",
    badgeClass: "text-on-surface-variant",
  },
  {
    handle: "alex_dev",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCm-c0HKglSDk_qQM6cuz5KEGvm4vr5qZstVD9o8YGn91KO0Guazv84y3OYk-bcmt6KX93WtNsAttFj86evp9ew5XofIHDmKwWvJHKiyXVvYKEBvteMfMk_pHOaEBtsetNKdvwfoAmpbrDrH_R-F-Ze-dk9a6T-y2NIZI9qGDRuAuqoswy64HhWFa8UtZOquearlWV96dYgm3auCpkjJzeFVzWFASjmRmK2H56K2s_bVwwTfQ6Oud7LqA",
    subtitle: "🎉 FAANG Offer Secured",
    subtitleClass: "text-primary",
    streak: "Day 48",
    badge: "Alum Success",
    badgeClass: "text-secondary",
  },
  {
    handle: "kenji_codes",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB3-b_cQiMhiVz0TtrjsSRplMmKgZdhwb_3j5zzz2AQcwF9lvn5qoQa4NkYo4Z8CoD1INIwKPiVvChkPRQJNMwEid6HQlgVFrWfEMFq1pKmeOGvWrN5N3W6F2-I3Y2YboG7vNeJAKM9-1MAlcDQS7GEG63-JEFCoI6Tu9GOHXgXBjuCQ7jJoOTtfHGzRYqt585a8vg0IVUqMSuSE39e-Bn4a3RpXw8qJfUrMzwll8m9VkPueTgbYIyGNw",
    subtitle: "Full-Stack Transition",
    subtitleClass: "text-on-surface-variant",
    streak: "Day 19",
    badge: "Phase 1",
    badgeClass: "text-on-surface-variant",
  },
];

interface PhaseGroup {
  phaseNum: number;
  label: string;
  weekStart: number;
  weekEnd: number;
  totalHours: number;
}

/** Groups template_weeks by phase_num/phase_label into the phase pill row. */
function buildPhaseGroups(weeks: TemplateWeek[]): PhaseGroup[] {
  const byPhase = new Map<number, PhaseGroup>();
  for (const week of weeks) {
    const existing = byPhase.get(week.phase_num);
    if (existing) {
      existing.weekStart = Math.min(existing.weekStart, week.week_num);
      existing.weekEnd = Math.max(existing.weekEnd, week.week_num);
      existing.totalHours += week.total_hours ?? 0;
    } else {
      byPhase.set(week.phase_num, {
        phaseNum: week.phase_num,
        label: week.phase_label,
        weekStart: week.week_num,
        weekEnd: week.week_num,
        totalHours: week.total_hours ?? 0,
      });
    }
  }
  return Array.from(byPhase.values()).sort((a, b) => a.phaseNum - b.phaseNum);
}

export default function TemplateDetailScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { session } = useSession();
  const templateId = route.params?.templateId;

  const [template, setTemplate] = useState<Template | null | undefined>(undefined);
  const [weeks, setWeeks] = useState<TemplateWeek[]>([]);
  const [days, setDays] = useState<TemplateDayWithBlocks[]>([]);
  const [workloadCategories, setWorkloadCategories] = useState<TemplateWorkloadCategory[]>([]);
  const [activeTab, setActiveTab] = useState<MainTab>("curriculum");
  const [activePhase, setActivePhase] = useState<number | null>(null);
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(() => new Set());
  const [expandedDays, setExpandedDays] = useState<Set<string>>(() => new Set());
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (!templateId) {
      setTemplate(null);
      return;
    }
    let cancelled = false;
    (async () => {
      const [fetchedTemplate, fetchedWeeks, fetchedDays, fetchedWorkload] = await Promise.all([
        getTemplateById(templateId),
        getTemplateWeeks(templateId),
        getTemplateDaysWithBlocks(templateId),
        getTemplateWorkloadCategories(templateId),
      ]);
      if (cancelled) return;
      setTemplate(fetchedTemplate);
      setWeeks(fetchedWeeks);
      setDays(fetchedDays);
      setWorkloadCategories(fetchedWorkload);

      const firstWeek = fetchedWeeks[0];
      if (firstWeek) {
        setActivePhase(firstWeek.phase_num);
        setExpandedWeeks(new Set([firstWeek.week_num]));
        const firstActiveDay = fetchedDays.find(
          (d) => d.week_num === firstWeek.week_num && !d.is_rest_day
        );
        if (firstActiveDay) setExpandedDays(new Set([firstActiveDay.id]));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [templateId]);

  function toggleWeek(weekNum: number) {
    setExpandedWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(weekNum)) next.delete(weekNum);
      else next.add(weekNum);
      return next;
    });
  }

  function toggleDay(dayId: string) {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(dayId)) next.delete(dayId);
      else next.add(dayId);
      return next;
    });
  }

  async function handleStartProgram() {
    if (!session || !template || starting) return;
    setStarting(true);
    try {
      await startProgram(template.id, session.user.id);
      navigation.navigate("Tabs", { screen: "Today" });
    } catch (e) {
      if (e instanceof ActiveProgramExistsError) {
        Alert.alert("Program already running", e.message);
      } else {
        Alert.alert("Couldn't start program", "Please try again.");
      }
    } finally {
      setStarting(false);
    }
  }

  if (template === undefined) return null; // loading

  if (template === null) {
    return (
      <View className="flex-1 bg-surface">
        <BackHeader title="Template Detail" onBack={() => navigation.goBack()} />
        <View className="flex-1 items-center justify-center gap-space-sm px-margin-mobile">
          <Icon name="search" size={32} color="#a78993" />
          <Text className="font-headline-md text-headline-md font-bold text-on-surface">
            Template unavailable
          </Text>
          <Text className="text-center font-body-sm text-body-sm text-on-surface-variant">
            This blueprint isn&apos;t live yet — check back soon or explore the Job Prep track.
          </Text>
        </View>
      </View>
    );
  }

  const durationDays = (template.duration_weeks ?? 0) * 7;
  const phaseGroups = buildPhaseGroups(weeks);

  const daysByWeek = new Map<number, TemplateDayWithBlocks[]>();
  for (const day of days) {
    const list = daysByWeek.get(day.week_num) ?? [];
    list.push(day);
    daysByWeek.set(day.week_num, list);
  }

  const metaStats: MetaStat[] = [
    {
      icon: "schedule",
      iconColor: "#00dbe9",
      label: "Duration",
      value: `${template.duration_weeks} Wks (${durationDays}d)`,
    },
    {
      icon: "bolt",
      iconColor: "#ffb0ce",
      label: "Pace",
      value: template.pace_hours_per_week != null ? `${template.pace_hours_per_week}h / wk` : "—",
    },
    {
      icon: "star",
      iconColor: "#d1bcff",
      label: "Trust",
      value: template.trust_rating != null ? `${template.trust_rating} ★ (${template.review_count})` : "—",
    },
    {
      icon: "verified_user",
      iconColor: "#00dbe9",
      label: "Integrity",
      value: template.integrity_label,
    },
  ];

  return (
    <View className="flex-1 bg-surface">
      <BackHeader title="Template Detail" onBack={() => navigation.goBack()} />

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-margin-mobile pb-40"
        contentContainerStyle={{ paddingTop: headerHeight }}
        showsVerticalScrollIndicator={false}
      >
        <GlowOrb
          size={320}
          color="#fc49a5"
          style={{ top: -20, left: "50%", marginLeft: -160, opacity: 0.15 }}
        />

        <View className="flex flex-col gap-space-md">
          {/* Hero: tags, title, description, 2x2 metric grid */}
          <View className="flex flex-col gap-space-sm">
            <View className="flex-row flex-wrap items-center gap-space-xs">
              <View className="flex-row items-center gap-1 rounded-md bg-primary-container/20 px-2 py-0.5">
                <View className="h-1.5 w-1.5 rounded-full bg-primary" />
                <Text className="font-label-sm text-[11px] font-semibold uppercase tracking-wider text-primary">
                  Roadmap
                </Text>
              </View>
              <View className="rounded-md bg-surface-container-highest px-2 py-0.5">
                <Text className="font-label-sm text-[11px] uppercase text-secondary">
                  {categoryLabel(template.category)}
                </Text>
              </View>
              <View className="ml-auto flex-row items-center gap-1">
                <Icon name="verified" size={13} color="#00dbe9" />
                <Text className="font-label-sm text-[11px] text-tertiary">Verified Blueprint</Text>
              </View>
            </View>

            <View>
              <Text className="font-headline-xl text-[24px] font-extrabold leading-tight tracking-tight text-on-surface">
                {template.name}
              </Text>
              <Text className="mt-1.5 font-body-md text-[13.5px] leading-relaxed text-on-surface-variant">
                {template.description}
              </Text>
            </View>

            <View className="flex-col gap-space-xs pt-1">
              <View className="flex-row gap-space-xs">
                {metaStats.slice(0, 2).map((stat) => (
                  <View
                    key={stat.label}
                    className="flex-1 flex-row items-center gap-2.5 rounded-xl bg-surface-container-low px-3 py-2"
                  >
                    <Icon name={stat.icon} size={19} color={stat.iconColor} />
                    <View className="flex-1">
                      <Text className="font-label-sm text-[10px] uppercase tracking-wider text-on-surface-variant">
                        {stat.label}
                      </Text>
                      <Text
                        className="font-label-md text-[13px] font-semibold text-on-surface"
                        numberOfLines={1}
                      >
                        {stat.value}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
              <View className="flex-row gap-space-xs">
                {metaStats.slice(2).map((stat) => (
                  <View
                    key={stat.label}
                    className="flex-1 flex-row items-center gap-2.5 rounded-xl bg-surface-container-low px-3 py-2"
                  >
                    <Icon name={stat.icon} size={19} color={stat.iconColor} />
                    <View className="flex-1">
                      <Text className="font-label-sm text-[10px] uppercase tracking-wider text-on-surface-variant">
                        {stat.label}
                      </Text>
                      <Text
                        className="font-label-md text-[13px] font-semibold text-on-surface"
                        numberOfLines={1}
                      >
                        {stat.value}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Workload calibration — real category breakdown */}
          {workloadCategories.length > 0 && (
            <View className="gap-2.5 rounded-xl bg-surface-container-low p-3.5">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-1.5">
                  <Icon name="pie_chart" size={17} color="#00dbe9" />
                  <Text className="font-label-sm text-[12px] font-bold uppercase tracking-wide text-on-surface">
                    Workload Calibration
                  </Text>
                </View>
                <Text className="font-label-sm text-[12px] font-bold text-tertiary">
                  {template.total_hours ?? 0} Total Hours
                </Text>
              </View>
              <View className="h-2 w-full flex-row overflow-hidden rounded-full bg-surface-container-highest">
                {workloadCategories.map((cat) => (
                  <View
                    key={cat.id}
                    className={`h-full ${WORKLOAD_BG_CLASS[cat.color_role]}`}
                    style={{ width: `${cat.percentage}%` }}
                  />
                ))}
              </View>
              <View className="flex-row flex-wrap items-center justify-between gap-1.5">
                {workloadCategories.map((cat) => (
                  <View key={cat.id} className="flex-row items-center gap-1.5">
                    <View className={`h-2 w-2 rounded-full ${WORKLOAD_BG_CLASS[cat.color_role]}`} />
                    <Text className="font-label-sm text-[11px] text-on-surface-variant">
                      {cat.percentage}% {cat.label}
                      {cat.hours != null ? ` (${cat.hours}h)` : ""}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Tab switcher */}
          <View className="flex-row gap-1 rounded-xl bg-surface-container-lowest p-1">
            {(
              [
                { key: "curriculum", label: "Curriculum" },
                { key: "rules", label: "Proof Rules" },
                { key: "community", label: "Reviews & Alums" },
              ] as { key: MainTab; label: string }[]
            ).map((tab) => (
              <Pressable
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                className={`flex-1 items-center rounded-lg py-2 ${
                  activeTab === tab.key ? "bg-primary-container" : ""
                }`}
              >
                <Text
                  className={`font-label-sm text-[12px] font-bold ${
                    activeTab === tab.key ? "text-on-primary-container" : "text-on-surface-variant"
                  }`}
                >
                  {tab.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* TAB 1: Curriculum — fully real, driven by template_weeks/template_days */}
          {activeTab === "curriculum" && (
            <View className="gap-space-sm">
              {phaseGroups.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerClassName="gap-2 pb-1"
                >
                  {phaseGroups.map((p) => (
                    <Pressable
                      key={p.phaseNum}
                      onPress={() => setActivePhase(p.phaseNum)}
                      className={`rounded-xl px-3 py-2 ${
                        activePhase === p.phaseNum
                          ? "bg-surface-container-highest"
                          : "bg-surface-container-low"
                      }`}
                    >
                      <Text
                        className={`font-label-sm text-[10px] font-bold uppercase tracking-wider ${
                          activePhase === p.phaseNum ? "text-primary" : "text-on-surface-variant"
                        }`}
                      >
                        {`Phase ${p.phaseNum} (Wks ${p.weekStart}-${p.weekEnd})`}
                      </Text>
                      <Text className="font-label-sm text-[12px] font-semibold text-on-surface">
                        {`${p.label} • ${p.totalHours}h`}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              )}

              {weeks.map((week, weekIdx) => {
                const weekDays = daysByWeek.get(week.week_num) ?? [];
                const activeDays = weekDays.filter((d) => !d.is_rest_day);
                const restDay = weekDays.find((d) => d.is_rest_day);
                const isWeekExpanded = expandedWeeks.has(week.week_num);
                const isFirstWeek = weekIdx === 0;

                return (
                  <View key={week.id} className="overflow-hidden rounded-xl bg-surface-container-low">
                    <Pressable
                      onPress={() => toggleWeek(week.week_num)}
                      className="flex-row items-center justify-between p-3.5"
                    >
                      <View className="flex-1 flex-row items-center gap-2.5">
                        <View
                          className={`h-7 w-7 items-center justify-center rounded-lg ${
                            isFirstWeek ? "bg-primary-container/20" : "bg-surface-container-highest"
                          }`}
                        >
                          <Text
                            className={`font-label-sm text-[12px] font-bold ${
                              isFirstWeek ? "text-primary" : "text-on-surface-variant"
                            }`}
                          >
                            W{week.week_num}
                          </Text>
                        </View>
                        <View className="flex-1">
                          <View className="flex-row items-center gap-2">
                            <Text
                              className="font-label-md text-label-md font-bold text-on-surface"
                              numberOfLines={1}
                            >
                              Week {week.week_num}: {week.title}
                            </Text>
                            {isFirstWeek && (
                              <View className="rounded bg-primary/20 px-1.5 py-0.5">
                                <Text className="font-label-sm text-[9px] font-bold text-primary">
                                  ACTIVE
                                </Text>
                              </View>
                            )}
                          </View>
                          {week.subtitle ? (
                            <Text
                              className="font-body-sm text-[11px] text-on-surface-variant"
                              numberOfLines={1}
                            >
                              {week.subtitle}
                            </Text>
                          ) : null}
                        </View>
                      </View>
                      <View className="ml-2 flex-row items-center gap-2">
                        <Text
                          className={`font-label-sm text-label-sm ${
                            isFirstWeek ? "text-tertiary" : "text-on-surface-variant"
                          }`}
                        >
                          {weekDays.length} Days
                        </Text>
                        <View
                          style={{ transform: [{ rotate: isWeekExpanded ? "180deg" : "0deg" }] }}
                        >
                          <Icon name="expand_more" size={18} color="#dfbec9" />
                        </View>
                      </View>
                    </Pressable>

                    {isWeekExpanded && (
                      <View className="gap-1.5 border-t border-white/5 px-3 pb-3 pt-2">
                        {activeDays.map((day, idx) => {
                          const isDayExpanded = expandedDays.has(day.id);
                          const dayNumInWeek = idx + 1;
                          const isHighlighted = isFirstWeek && dayNumInWeek === 1;
                          return (
                            <View
                              key={day.id}
                              className="overflow-hidden rounded-lg bg-surface-container"
                            >
                              <Pressable
                                onPress={() => toggleDay(day.id)}
                                className="flex-row items-center justify-between px-3 py-2"
                              >
                                <View className="flex-1 flex-row items-center gap-2">
                                  <View
                                    className={`rounded px-1.5 py-0.5 ${
                                      isHighlighted ? "bg-primary-container" : "bg-surface-container-highest"
                                    }`}
                                  >
                                    <Text
                                      className={`font-label-sm text-[10px] font-bold ${
                                        isHighlighted ? "text-on-primary-container" : "text-on-surface-variant"
                                      }`}
                                    >
                                      DAY {dayNumInWeek}
                                    </Text>
                                  </View>
                                  <Text
                                    className="flex-1 font-label-sm text-[12px] font-semibold text-on-surface"
                                    numberOfLines={1}
                                  >
                                    {day.day_label}
                                  </Text>
                                </View>
                                <View className="ml-2 flex-row items-center gap-2">
                                  <Text className="font-label-sm text-[11px] text-on-surface-variant">
                                    {day.blocks.length} Blocks
                                  </Text>
                                  <View
                                    style={{
                                      transform: [{ rotate: isDayExpanded ? "180deg" : "0deg" }],
                                    }}
                                  >
                                    <Icon name="expand_more" size={16} color="#dfbec9" />
                                  </View>
                                </View>
                              </Pressable>

                              {isDayExpanded && (
                                <View className="gap-1.5 border-t border-white/5 px-2.5 pb-2.5 pt-2">
                                  {day.blocks.map((block) => {
                                    const meta = PROOF_TYPE_META[block.proof_type];
                                    return (
                                      <View
                                        key={block.id}
                                        className="flex-row items-center justify-between gap-2 rounded-lg bg-surface-container-lowest/80 p-2"
                                      >
                                        <View className="flex-1 flex-row items-center gap-2">
                                          <Icon name={meta.icon} size={17} color={meta.iconColor} />
                                          <View className="flex-1">
                                            <Text
                                              className="font-label-sm text-[11.5px] font-semibold text-on-surface"
                                              numberOfLines={1}
                                            >
                                              {block.label}
                                            </Text>
                                            <Text
                                              className="font-body-sm text-[10px] text-on-surface-variant"
                                              numberOfLines={1}
                                            >
                                              {block.task}
                                            </Text>
                                          </View>
                                        </View>
                                        <View className={`rounded px-1.5 py-0.5 ${meta.xpWrapClass}`}>
                                          <Text
                                            className={`font-label-sm text-[10px] font-bold ${meta.xpClass}`}
                                          >
                                            +{block.xp_value} XP
                                          </Text>
                                        </View>
                                      </View>
                                    );
                                  })}
                                </View>
                              )}
                            </View>
                          );
                        })}

                        {restDay && (
                          <View className="flex-row items-center justify-between rounded-lg bg-surface-container-lowest/60 px-3 py-2">
                            <View className="flex-1 flex-row items-center gap-2">
                              <Icon name="shield" size={15} color="#d1bcff" />
                              <Text
                                className="flex-1 font-label-sm text-[11px] text-on-surface-variant"
                                numberOfLines={1}
                              >
                                {restDay.day_label}
                              </Text>
                            </View>
                            <Text className="font-label-sm text-[11px] font-semibold text-secondary">
                              0h Required
                            </Text>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                );
              })}

              <Pressable className="w-full flex-row items-center justify-center gap-1.5 rounded-xl bg-surface-container-high px-3 py-2.5 active:opacity-80">
                <Icon name="picture_as_pdf" size={16} color="#dfbec9" />
                <Text className="font-label-sm text-label-sm text-on-surface-variant">
                  View Full {template.duration_weeks}-Week Syllabus (.pdf)
                </Text>
              </Pressable>
            </View>
          )}

          {/* TAB 2: Proof Rules */}
          {activeTab === "rules" && (
            <View className="gap-space-sm rounded-xl bg-surface-container-low p-space-md">
              <View className="flex-row items-center justify-between border-b border-white/5 pb-2">
                <View className="flex-row items-center gap-1.5">
                  <Icon name="gavel" size={18} color="#ffb0ce" />
                  <Text className="font-label-md text-label-md font-bold text-on-surface">
                    Zero-Cheat Verification Standard
                  </Text>
                </View>
                <View className="rounded bg-tertiary/10 px-2 py-0.5">
                  <Text className="font-label-sm text-[10px] text-tertiary">STRICT_SYNC</Text>
                </View>
              </View>
              <View className="gap-space-xs">
                {PROOF_RULES.map((rule) => (
                  <View
                    key={rule.title}
                    className="flex-row items-start gap-2.5 rounded-lg bg-surface-container p-2.5"
                  >
                    <Icon name={rule.icon} size={19} color={rule.iconColor} />
                    <View className="flex-1">
                      <Text className="font-label-sm text-label-sm font-bold text-on-surface">
                        {rule.title}
                      </Text>
                      <Text className="mt-0.5 font-body-sm text-body-sm text-on-surface-variant">
                        {rule.body}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* TAB 3: Reviews & Alums */}
          {activeTab === "community" && (
            <View className="gap-space-sm">
              <View className="flex-row items-center justify-between rounded-xl bg-surface-container-low p-space-md">
                <View className="flex-1 flex-row items-center gap-2.5">
                  <View className="h-9 w-9 items-center justify-center rounded-full bg-primary/15">
                    <Icon name="groups" size={20} color="#ffb0ce" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-label-sm text-label-sm font-bold text-on-surface">
                      1.2k Engineers Enrolled
                    </Text>
                    <Text className="font-body-sm text-[11px] text-on-surface-variant">
                      92% verified blueprint completion rate
                    </Text>
                  </View>
                </View>
                <View className="rounded bg-tertiary/10 px-2 py-0.5">
                  <Text className="font-label-sm text-[11px] text-tertiary">FAANG Alums</Text>
                </View>
              </View>

              {PERFORMERS.map((performer) => (
                <View
                  key={performer.handle}
                  className="flex-row items-center justify-between rounded-xl bg-surface-container-low p-space-sm"
                >
                  <View className="flex-1 flex-row items-center gap-2.5">
                    <Image
                      source={{ uri: performer.avatar }}
                      className="h-10 w-10 rounded-full"
                      resizeMode="cover"
                    />
                    <View className="flex-1">
                      <View className="flex-row items-center gap-1.5">
                        <Text
                          className="font-label-sm text-label-sm font-bold text-on-surface"
                          numberOfLines={1}
                        >
                          {performer.handle}
                        </Text>
                        <Icon name="verified" size={13} color="#00dbe9" />
                      </View>
                      <Text
                        className={`font-body-sm text-[11px] ${performer.subtitleClass}`}
                        numberOfLines={1}
                      >
                        {performer.subtitle}
                      </Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <View className="flex-row items-center gap-0.5">
                      <Icon name="local_fire_department" size={13} color="#ffb0ce" />
                      <Text className="font-label-sm text-[11px] font-bold text-primary">
                        {performer.streak}
                      </Text>
                    </View>
                    <Text className={`font-label-sm text-[10px] ${performer.badgeClass}`}>
                      {performer.badge}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Sticky bottom action bar */}
      <View className="absolute bottom-0 left-0 right-0 z-40">
        <BlurView intensity={80} tint="dark">
          <View
            className="gap-2 bg-surface/90 px-margin-mobile pt-2.5"
            style={{ paddingBottom: insets.bottom + 8 }}
          >
            <Pressable
              onPress={handleStartProgram}
              disabled={starting}
              className="overflow-hidden rounded-xl active:opacity-90"
            >
              <LinearGradient
                colors={["#fc49a5", "#5910c8"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  paddingVertical: 13,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  opacity: starting ? 0.7 : 1,
                }}
              >
                <Icon name="bolt" size={18} color="#ffffff" />
                <Text className="font-label-md text-[13px] font-bold uppercase tracking-wider text-white">
                  {starting ? "Starting…" : "Start Program (Day 1)"}
                </Text>
              </LinearGradient>
            </Pressable>
            <Pressable className="w-full flex-row items-center justify-center gap-1.5 rounded-xl bg-surface-container-high py-2.5 active:opacity-80">
              <Icon name="alt_route" size={16} color="#d1bcff" />
              <Text className="font-label-sm text-[12px] uppercase tracking-wider text-on-surface">
                Customize / Fork
              </Text>
            </Pressable>
          </View>
        </BlurView>
      </View>
    </View>
  );
}
