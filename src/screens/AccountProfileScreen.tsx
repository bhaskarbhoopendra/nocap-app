import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import AppHeader from "@/components/AppHeader";
import BackHeader from "@/components/BackHeader";
import GlowOrb from "@/components/GlowOrb";
import Icon, { IconName } from "@/components/Icon";
import PrimaryButton from "@/components/PrimaryButton";
import ToggleSwitch from "@/components/ToggleSwitch";
import { useSession } from "@/hooks/SessionContext";
import { useHeaderHeight } from "@/hooks/useHeaderHeight";
import { ActiveProgramSummary, getActiveProgramSummary } from "@/services/programService";
import {
  getCompletedTaskLogCount,
  getCompletedTaskLogCountForProgram,
  getRecentCompletedTaskLogs,
  RecentProof,
} from "@/services/taskLogService";
import { avatarLookForSeed, DEFAULT_AVATAR_SEED, isAvatarSeed } from "@/theme/avatarPresets";
import { PROOF_TYPE_META } from "@/theme/proofTypePresentation";
import { RootStackParamList } from "@/types/navigation";

// Level/tier titles + XP thresholds are a client-side presentation scheme
// derived from the real profiles.total_xp — not their own DB table yet.
// Same "make it admin-editable later" posture as template content
// (0005_dynamic_template_content.sql), just not built out that far yet.
const TIERS: { title: string; floor: number }[] = [
  { title: "Rookie", floor: 0 },
  { title: "Apprentice", floor: 200 },
  { title: "Operative", floor: 500 },
  { title: "Architect", floor: 1000 },
  { title: "Master Architect", floor: 2000 },
  { title: "Diamond Sentinel", floor: 3500 },
];

function tierFor(totalXp: number) {
  let idx = 0;
  for (let i = 0; i < TIERS.length; i++) if (totalXp >= TIERS[i].floor) idx = i;
  const next = TIERS[idx + 1] ?? null;
  const floor = TIERS[idx].floor;
  const progress = next ? (totalXp - floor) / (next.floor - floor) : 1;
  return { level: idx + 1, title: TIERS[idx].title, next, progress: Math.max(0, Math.min(1, progress)) };
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

interface StatCardProps {
  label: string;
  icon: IconName;
  iconColor: string;
  iconBgClassName: string;
  value: string;
  valueClassName: string;
  unit?: string;
  unitClassName?: string;
  caption: React.ReactNode;
}

function StatCard({
  label,
  icon,
  iconColor,
  iconBgClassName,
  value,
  valueClassName,
  unit,
  unitClassName,
  caption,
}: StatCardProps) {
  return (
    <View className="relative flex-1 justify-between overflow-hidden rounded-xl bg-surface-container-low p-space-md">
      <View className="flex-row items-center justify-between">
        <Text className="font-label-sm text-label-sm uppercase text-on-surface-variant">
          {label}
        </Text>
        <View className={`h-7 w-7 items-center justify-center rounded-lg ${iconBgClassName}`}>
          <Icon name={icon} size={18} color={iconColor} />
        </View>
      </View>
      <View className="mt-3">
        <View className="flex-row items-baseline gap-1">
          <Text className={`font-headline-lg text-headline-lg font-bold ${valueClassName}`}>
            {value}
          </Text>
          {unit ? (
            <Text className={`font-label-md text-label-md ${unitClassName ?? ""}`}>{unit}</Text>
          ) : null}
        </View>
        {caption}
      </View>
    </View>
  );
}

interface SectionHeadingProps {
  icon: IconName;
  iconColor: string;
  title: string;
  tag: string;
}

function SectionHeading({ icon, iconColor, title, tag }: SectionHeadingProps) {
  return (
    <View className="mb-space-xs flex-row items-center justify-between gap-space-xs">
      <View className="min-w-0 flex-1 flex-row items-center gap-2">
        <Icon name={icon} size={20} color={iconColor} />
        <Text
          className="font-headline-md text-headline-md font-bold text-on-surface"
          numberOfLines={1}
        >
          {title}
        </Text>
      </View>
      <Text className="font-label-sm text-label-sm uppercase text-on-surface-variant">{tag}</Text>
    </View>
  );
}

interface AccountRowProps {
  icon: IconName;
  label: string;
  value: string;
  right: React.ReactNode;
}

function AccountRow({ icon, label, value, right }: AccountRowProps) {
  return (
    <View className="flex-row items-center justify-between py-1">
      <View className="min-w-0 flex-1 flex-row items-center gap-space-xs">
        <View className="h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-container-high">
          <Icon name={icon} size={18} color="#dfbec9" />
        </View>
        <View className="min-w-0 flex-1">
          <Text className="font-label-sm text-label-sm uppercase text-on-surface-variant">
            {label}
          </Text>
          <Text className="font-body-md text-body-md font-medium text-on-surface" numberOfLines={1}>
            {value}
          </Text>
        </View>
      </View>
      {right}
    </View>
  );
}

interface PreferenceRowProps {
  icon: IconName;
  title: string;
  subtitle: string;
}

// Preferences below have no backing storage yet (no user_preferences table,
// no wiring to the DB-driven `themes` table — see CLAUDE.md's "known open
// question" on reconciling that with NativeWind) — every row here stays a
// static display for now, same as before this pass.
function PreferenceRow({ icon, title, subtitle }: PreferenceRowProps) {
  return (
    <View className="flex-row items-center justify-between py-1">
      <View className="min-w-0 flex-1 flex-row items-center gap-space-xs">
        <View className="h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-container-high">
          <Icon name={icon} size={18} color="#dfbec9" />
        </View>
        <View className="min-w-0 flex-1">
          <Text className="font-label-md text-label-md font-semibold text-on-surface">{title}</Text>
          <Text className="font-body-sm text-body-sm text-outline">{subtitle}</Text>
        </View>
      </View>
      <View className="ml-2 shrink-0">
        <ToggleSwitch on />
      </View>
    </View>
  );
}

/**
 * The one real Profile screen — reachable both as the Profile tab (its own
 * root, shows AppHeader like every other tab) and pushed on top of any tab
 * via the header's person icon (shows a BackHeader instead). Same
 * component either way — only the header differs (see isTabRoot below).
 */
interface AccountProfileScreenProps {
  // Which header to show. Can't derive this from navigation.canGoBack() —
  // the bottom tab navigator's default backBehavior="history" makes that
  // return true the moment you've ever switched tabs, regardless of
  // whether anything was actually pushed on top. App.tsx sets this
  // explicitly per mount site instead: true for the Profile tab (its own
  // root, shows AppHeader), false when pushed via the header's person icon
  // (shows BackHeader).
  isTabRoot?: boolean;
}

export default function AccountProfileScreen({ isTabRoot = false }: AccountProfileScreenProps) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { session, profile } = useSession();
  const isAnonymous = session?.user?.is_anonymous ?? true;
  const headerHeight = useHeaderHeight();

  const [activeProgram, setActiveProgram] = useState<ActiveProgramSummary | null | undefined>(
    undefined
  );
  const [programProofCount, setProgramProofCount] = useState<number | undefined>(undefined);
  const [verifiedCount, setVerifiedCount] = useState<number | undefined>(undefined);
  const [recentProofs, setRecentProofs] = useState<RecentProof[] | undefined>(undefined);

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    (async () => {
      const [programSummary, totalVerified, recent] = await Promise.all([
        getActiveProgramSummary(session.user.id),
        getCompletedTaskLogCount(session.user.id),
        getRecentCompletedTaskLogs(session.user.id, 2),
      ]);
      if (cancelled) return;
      setActiveProgram(programSummary);
      setVerifiedCount(totalVerified);
      setRecentProofs(recent);

      const programCount = programSummary
        ? await getCompletedTaskLogCountForProgram(programSummary.program.id)
        : 0;
      if (!cancelled) setProgramProofCount(programCount);
    })();
    return () => {
      cancelled = true;
    };
  }, [session]);

  if (!profile) return null; // loading guard — the established early-return convention (see CLAUDE.md)

  const avatarSeed = isAvatarSeed(profile.avatar_seed) ? profile.avatar_seed : DEFAULT_AVATAR_SEED;
  const avatarLook = avatarLookForSeed(avatarSeed);
  const tier = tierFor(profile.total_xp);
  const emailVerified = !!session?.user?.email_confirmed_at;

  return (
    <View className="flex-1 bg-surface">
      {isTabRoot ? (
        <AppHeader />
      ) : (
        <BackHeader title="Profile" onBack={() => navigation.goBack()} />
      )}
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-space-2xl"
        contentContainerStyle={{ paddingTop: headerHeight }}
        showsVerticalScrollIndicator={false}
      >
        <GlowOrb
          size={320}
          color="#fc49a5"
          style={{ top: -60, left: "50%", marginLeft: -160, opacity: 0.18 }}
        />

        <View className="flex flex-col gap-space-lg px-margin-mobile">
          {/* Page title */}
          <View>
            <View className="flex-row items-center gap-1">
              <Icon name="badge" size={14} color="#ffb0ce" />
              <Text className="font-label-sm text-label-sm uppercase tracking-widest text-primary">
                Account
              </Text>
            </View>
            <Text className="mt-0.5 font-headline-xl text-headline-xl font-extrabold tracking-tight text-on-surface">
              Profile &amp; Account
            </Text>
          </View>

          {/* Profile Header & Identity Hero */}
          <View className="relative overflow-hidden rounded-xl bg-surface-container p-space-md shadow-xl">
            <View className="flex-row items-start gap-space-md">
              <View className="relative shrink-0">
                <GlowOrb size={128} color="#fc49a5" style={{ top: -24, left: -24, opacity: 0.2 }} />
                <LinearGradient
                  colors={avatarLook.gradient}
                  start={{ x: 0, y: 1 }}
                  end={{ x: 1, y: 0 }}
                  style={{ width: 80, height: 80, borderRadius: 16, padding: 3 }}
                >
                  <View
                    className="flex-1 items-center justify-center rounded-xl"
                    style={{ backgroundColor: "rgba(14,14,20,0.4)" }}
                  >
                    <Icon name={avatarLook.icon} size={34} color={avatarLook.iconColor} />
                  </View>
                </LinearGradient>
                <View className="absolute -bottom-1 -right-1 h-5 w-5 items-center justify-center rounded-full bg-surface-container p-0.5">
                  <View
                    className={`h-full w-full items-center justify-center rounded-full ${
                      isAnonymous ? "bg-surface-container-highest" : "bg-tertiary"
                    }`}
                  >
                    <Icon
                      name={isAnonymous ? "shield" : "verified"}
                      size={12}
                      color={isAnonymous ? "#dfbec9" : "#00363a"}
                    />
                  </View>
                </View>
              </View>

              <View className="min-w-0 flex-1">
                <View className="flex-row flex-wrap items-center gap-space-2xs">
                  <Text
                    className="font-headline-md text-headline-md font-bold text-on-surface"
                    numberOfLines={1}
                  >
                    {profile.username}
                  </Text>
                  <View
                    className="flex-row items-center gap-1 rounded-full px-2 py-0.5"
                    style={{ backgroundColor: `${avatarLook.badgeColor}26` }}
                  >
                    <Icon name={avatarLook.icon} size={12} color={avatarLook.badgeColor} />
                    <Text
                      className="font-label-sm text-label-sm uppercase"
                      style={{ color: avatarLook.badgeColor }}
                    >
                      {avatarLook.name}
                    </Text>
                  </View>
                </View>
                <Text className="font-body-sm text-body-sm text-on-surface-variant" numberOfLines={1}>
                  {isAnonymous ? "No email linked yet" : session?.user?.email ?? ""}
                </Text>
                <View className="mt-2 flex-row items-center gap-1.5">
                  <View className="h-2 w-2 items-center justify-center">
                    <View
                      className={`absolute h-2 w-2 rounded-full opacity-40 ${
                        isAnonymous ? "bg-on-surface-variant" : "bg-tertiary"
                      }`}
                    />
                    <View
                      className={`h-2 w-2 rounded-full ${
                        isAnonymous ? "bg-on-surface-variant" : "bg-tertiary"
                      }`}
                    />
                  </View>
                  <Text
                    className={`font-label-sm text-label-sm uppercase tracking-wider ${
                      isAnonymous ? "text-on-surface-variant" : "text-tertiary"
                    }`}
                  >
                    {isAnonymous ? "Guest Session • This Device Only" : "Synced • Cloud Backed Up"}
                  </Text>
                </View>
              </View>
            </View>

            {/* Level & XP progress — real total_xp, tier scheme is client-derived (see TIERS above) */}
            <View className="mt-space-md rounded-lg bg-surface-container-lowest p-space-sm">
              <View className="mb-1.5 flex-row items-center justify-between gap-space-xs">
                <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
                  <Icon name="military_tech" size={18} color="#ffb0ce" />
                  <Text className="font-label-md text-label-md text-on-surface" numberOfLines={1}>
                    Level {tier.level} {tier.title}
                  </Text>
                </View>
                <Text className="shrink-0 font-label-sm text-label-sm text-primary">
                  {profile.total_xp}
                  {tier.next ? ` / ${tier.next.floor}` : ""} XP
                </Text>
              </View>
              <View className="h-2 w-full overflow-hidden rounded-full bg-surface-container-highest">
                <LinearGradient
                  colors={["#fc49a5", "#ffb0ce", "#e9ddff"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ width: `${tier.progress * 100}%`, height: "100%", borderRadius: 999 }}
                />
              </View>
              <View className="mt-1.5 flex-row items-center justify-between">
                <Text className="font-label-sm text-label-sm text-on-surface-variant">
                  {tier.next
                    ? `+${tier.next.floor - profile.total_xp} XP to Next Tier`
                    : "Max tier reached"}
                </Text>
                {tier.next && (
                  <Text className="font-label-sm text-label-sm text-secondary">
                    Next: {tier.next.title}
                  </Text>
                )}
              </View>
            </View>

            {/* Action buttons — no edit-profile UI or share-card generation built yet; static */}
            <View className="mt-space-md flex-row gap-space-xs">
              <View className="flex-1 flex-row items-center justify-center gap-1.5 rounded-lg bg-surface-container-highest px-space-md py-3 opacity-60">
                <Icon name="edit" size={16} color="#dfbec9" />
                <Text className="font-label-md text-label-md font-bold text-on-surface">
                  Edit Profile
                </Text>
              </View>
              <View className="flex-1 flex-row items-center justify-center gap-1.5 rounded-lg bg-surface-container-highest px-space-md py-3 opacity-60">
                <Icon name="ios_share" size={16} color="#dfbec9" />
                <Text className="font-label-md text-label-md font-bold text-on-surface">
                  Share Card
                </Text>
              </View>
            </View>
          </View>

          {/* Protect Your Streak — the guest→real-account upgrade entry point.
              Open to every anonymous user for now (no streak/XP gate yet, see
              docs/ProdroadMap.md F1.3); hidden once already secured. Supabase
              keeps the same user id through the upgrade (auth.updateUser on
              the anonymous session, see authService.upgradeToRealAccount), so
              every program/task_log/streak/XP already earned carries over
              automatically — nothing to migrate, nothing lost. */}
          {isAnonymous && (
            <LinearGradient
              colors={["#1f1f25", "#1b1b21"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={{ borderRadius: 12, overflow: "hidden" }}
            >
              <View className="relative gap-space-md p-space-lg">
                <GlowOrb size={192} color="#fc49a5" style={{ top: -64, left: -48 }} />
                <GlowOrb size={144} color="#5910c8" style={{ bottom: 0, right: 0 }} />
                <View className="z-10 flex-row items-start gap-space-sm">
                  <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary-container/20">
                    <Icon name="verified_user" size={22} color="#ffb0ce" />
                  </View>
                  <View className="min-w-0 flex-1">
                    <Text className="font-label-sm text-label-sm font-bold uppercase tracking-wider text-primary">
                      Account Security
                    </Text>
                    <Text className="mt-0.5 font-headline-md text-headline-md font-bold text-on-surface">
                      Protect Your Streak
                    </Text>
                  </View>
                </View>
                <Text className="z-10 font-body-md text-body-md leading-relaxed text-on-surface-variant">
                  Link an email to secure your streak permanently across devices so you never lose
                  hard-earned proof history.
                </Text>
                <View className="z-10 flex-row items-center gap-2">
                  <Icon name="check_circle" size={15} color="#00dbe9" />
                  <Text className="font-label-sm text-label-sm text-outline">
                    Keep your XP, seed identity &amp; verified proofs
                  </Text>
                </View>
                <PrimaryButton
                  label="Secure My Streak"
                  icon="shield"
                  textColor="#63003b"
                  colors={["#fc49a5", "#5910c8"]}
                  onPress={() => navigation.navigate("Login")}
                  className="z-10 mt-space-xs"
                />
              </View>
            </LinearGradient>
          )}

          {/* Proof & Consistency Vault — 4 real stats (replaces the earlier
              mock's invented "Streak Shields"/"Global Standing" cards, which
              had no backing feature — leaderboard standing is real work,
              F4.1, not built yet). */}
          <View>
            <SectionHeading
              icon="workspace_premium"
              iconColor="#ffb0ce"
              title="Proof & Consistency Vault"
              tag="Proof-of-Work"
            />
            <View className="gap-space-xs">
              <View className="flex-row gap-space-xs">
                <StatCard
                  label="Current Streak"
                  icon="local_fire_department"
                  iconColor="#ffb0ce"
                  iconBgClassName="bg-primary-container/20"
                  value={String(profile.current_streak)}
                  valueClassName="text-on-surface"
                  unit="DAYS"
                  unitClassName="text-primary"
                  caption={
                    <Text className="mt-0.5 font-body-sm text-body-sm text-outline">
                      {profile.current_streak > 0 ? "Keep it alive" : "Start one today"}
                    </Text>
                  }
                />
                <StatCard
                  label="Longest Streak"
                  icon="bolt"
                  iconColor="#d1bcff"
                  iconBgClassName="bg-secondary/15"
                  value={String(profile.longest_streak)}
                  valueClassName="text-on-surface"
                  unit="DAYS"
                  unitClassName="text-secondary"
                  caption={
                    <Text className="mt-0.5 font-body-sm text-body-sm text-outline">
                      Personal best
                    </Text>
                  }
                />
              </View>
              <View className="flex-row gap-space-xs">
                <StatCard
                  label="Total XP"
                  icon="diamond"
                  iconColor="#00dbe9"
                  iconBgClassName="bg-tertiary/15"
                  value={String(profile.total_xp)}
                  valueClassName="text-tertiary"
                  unit="XP"
                  caption={
                    <Text className="mt-0.5 font-body-sm text-body-sm text-outline">
                      Lifetime total
                    </Text>
                  }
                />
                <StatCard
                  label="Verified Proofs"
                  icon="verified"
                  iconColor="#d1bcff"
                  iconBgClassName="bg-secondary/15"
                  value={verifiedCount === undefined ? "—" : String(verifiedCount)}
                  valueClassName="text-on-surface"
                  unit="LOGS"
                  caption={
                    <Text className="mt-0.5 font-body-sm text-body-sm text-outline">
                      Across every program
                    </Text>
                  }
                />
              </View>
            </View>
          </View>

          {/* Enrolled Blueprint — real active program, or a real empty state */}
          <View>
            <SectionHeading
              icon="view_timeline"
              iconColor="#d1bcff"
              title="Enrolled Blueprint"
              tag="Active Track"
            />
            {activeProgram === undefined ? null : activeProgram === null ? (
              <View className="items-center gap-space-sm rounded-xl bg-surface-container-low p-space-lg">
                <Icon name="schedule" size={26} color="#dfbec9" />
                <Text className="text-center font-body-sm text-body-sm text-on-surface-variant">
                  No active program yet — browse the library to start one.
                </Text>
                <PrimaryButton
                  label="Browse Programs"
                  icon="alt_route"
                  colors={["#fc49a5", "#5910c8"]}
                  onPress={() => navigation.navigate("Tabs", { screen: "Programs" })}
                />
              </View>
            ) : (
              <Pressable
                onPress={() =>
                  navigation.navigate("TemplateDetail", { templateId: activeProgram.template.id })
                }
                className="relative overflow-hidden rounded-xl bg-surface-container-low p-space-md shadow-md active:opacity-90"
              >
                <View className="mb-2 flex-row items-center justify-between gap-space-xs">
                  <View className="flex-row items-center gap-1 rounded-full bg-secondary-container/40 px-2.5 py-1">
                    <Icon name="code_blocks" size={13} color="#d1bcff" />
                    <Text className="font-label-sm text-label-sm font-semibold text-secondary">
                      {activeProgram.template.category.toUpperCase()}
                    </Text>
                  </View>
                  <Text className="font-label-sm text-label-sm text-tertiary">
                    Day {activeProgram.absDay} of {activeProgram.durationDays}
                  </Text>
                </View>
                <Text className="font-headline-md text-headline-md font-bold text-on-surface">
                  {activeProgram.template.name}
                </Text>
                <Text className="mt-1 font-body-sm text-body-sm text-outline" numberOfLines={2}>
                  {activeProgram.template.description}
                </Text>
                <View className="mt-space-sm flex-row items-center justify-between pt-space-xs">
                  <View className="flex-row items-center gap-space-xs">
                    <View className="flex-row items-center gap-1">
                      <Icon name="stars" size={16} color="#ffb0ce" />
                      <Text className="font-label-md text-label-md font-bold text-primary">
                        {activeProgram.program.total_xp} XP
                      </Text>
                    </View>
                    <Text className="font-body-sm text-body-sm text-on-surface-variant">•</Text>
                    <Text className="font-body-sm text-body-sm text-on-surface-variant">
                      {programProofCount === undefined ? "…" : programProofCount} Proof
                      {programProofCount === 1 ? "" : "s"}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-1">
                    <Text className="font-label-md text-label-md font-semibold text-tertiary">
                      Inspect
                    </Text>
                    <Icon name="arrow_forward" size={16} color="#00dbe9" />
                  </View>
                </View>
              </Pressable>
            )}
          </View>

          {/* Recent Proof Showcase — real completed task_logs. Photo entries
              only render an image when photo_path is a local URI from this
              same device/session (no Supabase Storage upload pipeline yet —
              see docs/ProdroadMap.md F3.4), otherwise falls back to an icon
              tile like the timer/self_check entries always do. */}
          <View>
            <View className="mb-space-xs flex-row items-center justify-between gap-space-xs">
              <View className="min-w-0 flex-1 flex-row items-center gap-2">
                <Icon name="photo_camera" size={20} color="#00dbe9" />
                <Text
                  className="font-headline-md text-headline-md font-bold text-on-surface"
                  numberOfLines={1}
                >
                  Recent Proof Showcase
                </Text>
              </View>
              {/* No dedicated proof-history screen exists yet — real count,
                  static (non-navigating) label. */}
              <Text className="font-label-sm text-label-sm font-bold uppercase text-on-surface-variant">
                {verifiedCount === undefined ? "…" : `${verifiedCount} total`}
              </Text>
            </View>
            {recentProofs === undefined ? null : recentProofs.length === 0 ? (
              <View className="items-center gap-1.5 rounded-xl bg-surface-container-low p-space-lg">
                <Icon name="fact_check" size={24} color="#dfbec9" />
                <Text className="text-center font-body-sm text-body-sm text-on-surface-variant">
                  No verified proofs yet — complete a task on Today to start your history.
                </Text>
              </View>
            ) : (
              <View className="flex-row gap-space-xs">
                {recentProofs.map((proof) => {
                  const meta = PROOF_TYPE_META[proof.proof_type_used];
                  const hasPhoto = proof.proof_type_used === "photo" && !!proof.photo_path;
                  return (
                    <View
                      key={proof.id}
                      className="flex-1 overflow-hidden rounded-xl bg-surface-container-low"
                    >
                      <View className="relative h-28 w-full items-center justify-center bg-surface-container">
                        {hasPhoto ? (
                          <Image
                            source={{ uri: proof.photo_path! }}
                            className="h-full w-full"
                            resizeMode="cover"
                          />
                        ) : (
                          <Icon name={meta.icon} size={30} color={meta.iconColor} />
                        )}
                        <View className="absolute left-2 top-2 flex-row items-center gap-1 rounded-full bg-surface-container-lowest/80 px-1.5 py-0.5">
                          <Icon name={meta.icon} size={12} color={meta.iconColor} />
                          <Text className={`font-label-sm text-label-sm ${meta.xpClass}`}>
                            {proof.proof_type_used.replace("_", " ").toUpperCase()}
                          </Text>
                        </View>
                      </View>
                      <View className="flex-1 justify-between p-2.5">
                        <View>
                          <Text
                            className="font-label-md text-label-md font-semibold text-on-surface"
                            numberOfLines={1}
                          >
                            {proof.blockLabel}
                          </Text>
                          <Text className="mt-0.5 font-body-sm text-body-sm text-outline">
                            {proof.completed_at ? timeAgo(proof.completed_at) : ""}
                          </Text>
                        </View>
                        <View className="mt-2 flex-row items-center justify-between pt-1.5">
                          <Text className="font-label-sm text-label-sm font-bold text-primary">
                            +{proof.xp_earned} XP
                          </Text>
                          <Icon name="lock" size={16} color="#00dbe9" />
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          {/* Account & Security */}
          <View>
            <SectionHeading
              icon="shield"
              iconColor="#00dbe9"
              title="Account & Security"
              tag="Secured Vault"
            />
            <View className="gap-space-sm rounded-xl bg-surface-container-low p-space-md shadow-md">
              <AccountRow
                icon="mail"
                label="Email Address"
                value={isAnonymous ? "Not linked yet" : session?.user?.email ?? "—"}
                right={
                  isAnonymous ? (
                    <Pressable
                      onPress={() => navigation.navigate("Login")}
                      className="ml-2 shrink-0 rounded-full bg-primary/15 px-2.5 py-1"
                    >
                      <Text className="font-label-sm text-label-sm font-bold text-primary">
                        Secure Now
                      </Text>
                    </Pressable>
                  ) : (
                    <View
                      className={`ml-2 shrink-0 flex-row items-center gap-1 rounded-full px-2 py-0.5 ${
                        emailVerified ? "bg-tertiary/10" : "bg-secondary/10"
                      }`}
                    >
                      <Icon
                        name={emailVerified ? "check" : "schedule"}
                        size={12}
                        color={emailVerified ? "#00dbe9" : "#d1bcff"}
                      />
                      <Text
                        className={`font-label-sm text-label-sm ${
                          emailVerified ? "text-tertiary" : "text-secondary"
                        }`}
                      >
                        {emailVerified ? "Verified" : "Pending confirmation"}
                      </Text>
                    </View>
                  )
                }
              />
              {/* Password/passkey management has no real flow built yet
                  (only the initial secure-account form) — static rows. */}
              <AccountRow
                icon="key"
                label="Password"
                value={isAnonymous ? "Not set" : "Set during account setup"}
                right={<Text className="ml-2 shrink-0 font-label-md text-label-md text-outline">—</Text>}
              />
              <AccountRow
                icon="fingerprint"
                label="Passkey / 2FA"
                value="Not available yet"
                right={<Text className="ml-2 shrink-0 font-label-md text-label-md text-outline">—</Text>}
              />
              <AccountRow
                icon="cloud_sync"
                label="Cloud Backup & Sync"
                value="Always on — every proof lives in Supabase"
                right={<Icon name="check_circle" size={18} color="#00dbe9" />}
              />
            </View>
          </View>

          {/* Preferences — static, see PreferenceRow's comment above */}
          <View>
            <SectionHeading icon="tune" iconColor="#d1bcff" title="Preferences" tag="Device Settings" />
            <View className="gap-space-sm rounded-xl bg-surface-container-low p-space-md shadow-md">
              <PreferenceRow
                icon="notifications_active"
                title="Streak Alerts & Reminders"
                subtitle="Gentle nudges 2h before streak expiration"
              />
              <PreferenceRow
                icon="vibration"
                title="Focus Audio & Haptics"
                subtitle="Tactile click when recording verified proofs"
              />
              <PreferenceRow
                icon="lock"
                title="Private Proof Mode"
                subtitle="Zero-knowledge proof storage by default"
              />
            </View>
          </View>

          {/* Account Management — "Log Out" deliberately not wired: the only
              auth flow built so far upgrades an anonymous session in place
              (authService.upgradeToRealAccount); there's no
              sign-in-with-existing-credentials screen yet, so signing out
              would strand a real account with no way back in, and would
              permanently abandon a guest's progress (a fresh anonymous
              session next launch is a different user row, not a resume).
              Export/Delete are Phase 7 compliance items, not built yet. */}
          <View className="gap-space-sm">
            <View className="w-full flex-row items-center justify-center gap-2 rounded-xl bg-surface-container-low px-4 py-3 opacity-50">
              <Icon name="logout" size={18} color="#dfbec9" />
              <Text className="font-label-md text-label-md text-on-surface">
                Log Out of This Device
              </Text>
            </View>
            <View className="flex-row items-center justify-center gap-space-md pt-2 opacity-50">
              <View className="flex-row items-center gap-1">
                <Icon name="download" size={14} color="#dfbec9" />
                <Text className="font-label-sm text-label-sm text-on-surface-variant">
                  Export Proof Archive (.zip)
                </Text>
              </View>
              <Text className="font-label-sm text-label-sm text-outline">•</Text>
              <Text className="font-label-sm text-label-sm text-error/80">Delete Account</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
