import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { ScrollView, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BackHeader from "@/components/BackHeader";
import GlowOrb from "@/components/GlowOrb";
import Icon, { IconName } from "@/components/Icon";
import PrimaryButton from "@/components/PrimaryButton";
import ToggleSwitch from "@/components/ToggleSwitch";
import { useHeaderHeight } from "@/hooks/useHeaderHeight";
import { RootStackParamList } from "@/types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "CustomBuilder">;

const CATEGORY_CHIPS: { label: string; active?: boolean }[] = [
  { label: "Career & Code", active: true },
  { label: "Fitness & Health" },
  { label: "Deep Study" },
  { label: "Habit Reset" },
];

const DURATION_OPTIONS: { label: string; active?: boolean }[] = [
  { label: "4 Wks" },
  { label: "8 Wks", active: true },
  { label: "12 Wks" },
  { label: "Ongoing" },
];

const DAY_PILLS: { label: string; active?: boolean; rest?: boolean }[] = [
  { label: "Day 1: Mon", active: true },
  { label: "Day 2: Tue" },
  { label: "Day 3: Wed" },
  { label: "Day 4: Thu" },
  { label: "Day 5: Fri" },
  { label: "Weekend (Rest)", rest: true },
];

interface ProtocolBlock {
  title: string;
  tagIcon: IconName;
  tagLabel: string;
  tagContainerClassName: string;
  tagTextClassName: string;
  tagIconColor: string;
  noteLabel: string;
  noteIcon?: IconName;
  noteTextClassName: string;
  noteIconColor: string;
  xpLabel: string;
  xpContainerClassName: string;
  xpTextClassName: string;
}

const PROTOCOL_BLOCKS: ProtocolBlock[] = [
  {
    title: "1. LeetCode / Algo Session",
    tagIcon: "timer",
    tagLabel: "Focus Timer (45 Min)",
    tagContainerClassName: "bg-tertiary-container/20",
    tagTextClassName: "text-tertiary",
    tagIconColor: "#00dbe9",
    noteLabel: "No Tab Swapping",
    noteTextClassName: "text-on-surface-variant",
    noteIconColor: "#dfbec9",
    xpLabel: "+50 XP",
    xpContainerClassName: "bg-primary-container/15",
    xpTextClassName: "text-primary",
  },
  {
    title: "2. GitHub Commit & PR Review",
    tagIcon: "photo_camera",
    tagLabel: "Photo Proof",
    tagContainerClassName: "bg-primary-container/20",
    tagTextClassName: "text-primary",
    tagIconColor: "#ffb0ce",
    noteLabel: "Anti-Spoof",
    noteIcon: "verified_user",
    noteTextClassName: "text-tertiary",
    noteIconColor: "#00dbe9",
    xpLabel: "+40 XP",
    xpContainerClassName: "bg-primary-container/15",
    xpTextClassName: "text-primary",
  },
  {
    title: "3. Hydration & Mobility Check",
    tagIcon: "check_circle",
    tagLabel: "Self-Check",
    tagContainerClassName: "bg-secondary-container/40",
    tagTextClassName: "text-secondary",
    tagIconColor: "#d1bcff",
    noteLabel: "Honor System",
    noteTextClassName: "text-on-surface-variant",
    noteIconColor: "#dfbec9",
    xpLabel: "+15 XP",
    xpContainerClassName: "bg-secondary-container/20",
    xpTextClassName: "text-secondary",
  },
];

interface ProofMechanism {
  icon: IconName;
  title: string;
  subtitle: string;
  active?: boolean;
  cardClassName: string;
  iconWrapClassName: string;
  iconColor: string;
  titleClassName: string;
  subtitleClassName: string;
}

const PROOF_MECHANISMS: ProofMechanism[] = [
  {
    icon: "photo_camera",
    title: "Photo Snap",
    subtitle: "Live Camera",
    cardClassName: "bg-surface-container-low",
    iconWrapClassName: "bg-primary-container/20",
    iconColor: "#ffb0ce",
    titleClassName: "text-on-surface",
    subtitleClassName: "text-outline",
  },
  {
    icon: "timer",
    title: "Focus Timer",
    subtitle: "Live Session",
    active: true,
    cardClassName: "bg-secondary-container",
    iconWrapClassName: "bg-surface-container-lowest",
    iconColor: "#00dbe9",
    titleClassName: "text-on-secondary-container",
    subtitleClassName: "text-secondary",
  },
  {
    icon: "checklist",
    title: "Self-Check",
    subtitle: "Honor System",
    cardClassName: "bg-surface-container-low",
    iconWrapClassName: "bg-surface-container-highest",
    iconColor: "#dfbec9",
    titleClassName: "text-on-surface",
    subtitleClassName: "text-outline",
  },
];

export default function CustomBuilderScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  return (
    <View className="flex-1 bg-surface">
      <BackHeader title="Custom Routine Builder" onBack={() => navigation.goBack()} />

      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-48"
        contentContainerStyle={{ paddingTop: headerHeight }}
        showsVerticalScrollIndicator={false}
      >
        <GlowOrb
          size={280}
          color="#fc49a5"
          style={{ top: -48, left: "50%", marginLeft: -140, opacity: 0.18 }}
        />

        {/* Routine Studio header context banner */}
        <View className="flex-row items-center justify-between px-margin-mobile pb-space-sm pt-space-md">
          <View className="flex-row items-center gap-space-xs">
            <View className="h-2 w-2 rounded-full bg-primary-container" />
            <Text className="font-label-sm text-label-sm uppercase tracking-widest text-primary">
              Protocol Architect Mode
            </Text>
          </View>
          <View className="flex-row items-center gap-1.5 rounded-full bg-surface-container-high px-3 py-1">
            <Icon name="visibility" size={16} color="#00dbe9" />
            <Text className="font-label-md text-label-md text-on-surface-variant">Preview</Text>
          </View>
        </View>

        <View className="flex flex-col gap-space-lg px-margin-mobile">
          {/* Section 1: Routine Identity */}
          <View className="relative flex flex-col gap-space-md overflow-hidden rounded-2xl bg-surface-container p-space-md shadow-xl">
            <GlowOrb size={128} color="#5910c8" style={{ right: -48, top: -48, opacity: 0.2 }} />
            <GlowOrb size={128} color="#fc49a5" style={{ left: -48, bottom: -48, opacity: 0.15 }} />

            {/* Routine name input with neon focus halo */}
            <View className="flex flex-col gap-space-2xs">
              <Text className="font-label-sm text-label-sm uppercase text-on-surface-variant">
                Routine Codex Title
              </Text>
              <View className="relative justify-center">
                <TextInput
                  className="w-full rounded-lg bg-surface-container-lowest py-2.5 pl-3.5 pr-9 font-headline-md text-headline-md text-on-surface"
                  placeholder="e.g. My 60-Day Consistency Engine"
                  placeholderTextColor="#a78993"
                  defaultValue="Full-Stack Portfolio Sprint"
                />
                <View className="absolute right-3" pointerEvents="none">
                  <Icon name="edit_note" size={20} color="#ffb0ce" />
                </View>
              </View>
            </View>

            {/* Category selector chips */}
            <View className="flex flex-col gap-space-2xs">
              <Text className="font-label-sm text-label-sm uppercase text-on-surface-variant">
                Domain Track
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerClassName="items-center gap-space-xs pb-1"
              >
                {CATEGORY_CHIPS.map((chip) => (
                  <View
                    key={chip.label}
                    className={`rounded-full px-3.5 py-1.5 ${
                      chip.active ? "bg-primary" : "bg-surface-container-high"
                    }`}
                  >
                    <Text
                      className={`font-label-md text-label-md ${
                        chip.active ? "text-on-primary" : "text-on-surface-variant"
                      }`}
                    >
                      {chip.label}
                    </Text>
                  </View>
                ))}
                <View className="flex-row items-center gap-1 rounded-full bg-surface-container-highest px-3 py-1.5">
                  <Icon name="add" size={14} color="#d1bcff" />
                  <Text className="font-label-md text-label-md text-secondary">Custom</Text>
                </View>
              </ScrollView>
            </View>

            {/* Duration segmented selector */}
            <View className="flex flex-col gap-space-2xs">
              <View className="flex-row items-center justify-between">
                <Text className="font-label-sm text-label-sm uppercase text-on-surface-variant">
                  Target Duration
                </Text>
                <Text className="font-label-sm text-label-sm text-tertiary">Selected: 56 Days</Text>
              </View>
              <View className="flex-row gap-1 rounded-full bg-surface-container-lowest p-1">
                {DURATION_OPTIONS.map((option) => (
                  <View
                    key={option.label}
                    className={`flex-1 items-center rounded-full px-3.5 py-1.5 ${
                      option.active ? "bg-primary" : "bg-surface-container-high"
                    }`}
                  >
                    <Text
                      className={`font-label-md text-label-md ${
                        option.active ? "text-on-primary" : "text-on-surface-variant"
                      }`}
                    >
                      {option.label}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Program cadence / rest days */}
            <View className="flex-row items-center justify-between rounded-lg bg-surface-container-lowest p-space-sm">
              <View className="flex-1 flex-row items-center gap-space-xs">
                <View className="h-8 w-8 items-center justify-center rounded-full bg-tertiary-container/20">
                  <Icon name="event_repeat" size={18} color="#00dbe9" />
                </View>
                <View className="flex-1">
                  <Text className="font-label-md text-label-md text-on-surface">
                    Weekly Cadence
                  </Text>
                  <Text className="font-body-sm text-body-sm text-on-surface-variant">
                    5 Days On • Weekends Shielded
                  </Text>
                </View>
              </View>
              <View className="rounded-full bg-surface-container-highest px-2.5 py-1">
                <Text className="font-label-sm text-label-sm text-tertiary">Adjust</Text>
              </View>
            </View>
          </View>

          {/* AI Blueprint Assist banner */}
          <View className="overflow-hidden rounded-2xl shadow-xl">
            <LinearGradient
              colors={["rgba(89,16,200,0.5)", "#2a2930", "#1b1b21"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ padding: 16 }}
            >
              <View className="flex-row items-start gap-space-xs">
                <View className="mt-0.5">
                  <Icon name="auto_awesome" size={24} color="#00dbe9" />
                </View>
                <View className="flex-1">
                  <Text className="font-headline-md text-headline-md text-on-surface">
                    AI Planner Blueprint
                  </Text>
                  <Text className="mt-0.5 font-body-sm text-body-sm text-on-surface-variant">
                    Need rest days balanced? Auto-populate Day 2 through Day 5 based on your sprint
                    goal.
                  </Text>
                </View>
              </View>
              <View className="mt-space-sm flex-row justify-end">
                <View className="flex-row items-center gap-1.5 rounded-lg bg-surface-container-highest px-3.5 py-1.5">
                  <Icon name="bolt" size={16} color="#dfbec9" />
                  <Text className="font-label-md text-label-md font-bold text-on-surface">
                    Auto-Fill Schedule
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Section 2: Daily Protocol Blocks */}
          <View className="flex flex-col gap-space-sm">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-space-xs">
                <Icon name="view_timeline" size={20} color="#ffb0ce" />
                <Text className="font-headline-md text-headline-md font-bold text-on-surface">
                  Daily Protocol Blocks
                </Text>
              </View>
              <View className="rounded-full bg-primary-container/20 px-2 py-0.5">
                <Text className="font-label-sm text-label-sm text-primary">3 Active Blocks</Text>
              </View>
            </View>

            {/* Day selector pills */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="items-center gap-space-xs py-1"
            >
              {DAY_PILLS.map((pill) => (
                <View
                  key={pill.label}
                  className={`flex-row items-center gap-1 rounded-full px-3.5 py-1.5 ${
                    pill.active ? "bg-primary" : "bg-surface-container-high"
                  }`}
                >
                  <Text
                    className={`font-label-md text-label-md ${
                      pill.active
                        ? "text-on-primary"
                        : pill.rest
                          ? "text-outline"
                          : "text-on-surface-variant"
                    }`}
                  >
                    {pill.label}
                  </Text>
                  {pill.active ? <View className="h-1.5 w-1.5 rounded-full bg-surface" /> : null}
                </View>
              ))}
            </ScrollView>

            {/* Protocol block cards */}
            <View className="mt-space-xs flex flex-col gap-space-xs">
              {PROTOCOL_BLOCKS.map((block) => (
                <View
                  key={block.title}
                  className="flex flex-col gap-space-xs rounded-xl bg-surface-container-low p-space-md shadow-md"
                >
                  <View className="flex-row items-start justify-between gap-space-xs">
                    <View className="flex-1 flex-row items-start gap-space-xs">
                      <View className="mt-0.5">
                        <Icon name="drag_indicator" size={20} color="#a78993" />
                      </View>
                      <View className="flex-1">
                        <Text
                          className="font-headline-md text-headline-md font-semibold text-on-surface"
                          numberOfLines={1}
                        >
                          {block.title}
                        </Text>
                        <View className="mt-1 flex-row flex-wrap items-center gap-space-xs">
                          <View
                            className={`flex-row items-center gap-1 rounded-full px-2.5 py-1 ${block.tagContainerClassName}`}
                          >
                            <Icon name={block.tagIcon} size={13} color={block.tagIconColor} />
                            <Text
                              className={`font-label-sm text-label-sm ${block.tagTextClassName}`}
                            >
                              {block.tagLabel}
                            </Text>
                          </View>
                          <View className="flex-row items-center gap-0.5">
                            {block.noteIcon ? (
                              <Icon name={block.noteIcon} size={13} color={block.noteIconColor} />
                            ) : null}
                            <Text
                              className={`font-label-sm text-label-sm ${block.noteTextClassName}`}
                            >
                              {block.noteLabel}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <View className={`rounded-full px-2 py-0.5 ${block.xpContainerClassName}`}>
                        <Text
                          className={`font-label-md text-label-md font-bold ${block.xpTextClassName}`}
                        >
                          {block.xpLabel}
                        </Text>
                      </View>
                      <View className="h-8 w-8 items-center justify-center rounded-full">
                        <Icon name="edit" size={18} color="#a78993" />
                      </View>
                      <View className="h-8 w-8 items-center justify-center rounded-full">
                        <Icon name="delete" size={18} color="#a78993" />
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Section 3: Add New Protocol Block */}
          <View className="flex flex-col gap-space-md rounded-2xl bg-surface-container p-space-md shadow-2xl">
            <View className="flex-row items-center justify-between pb-space-xs">
              <View className="flex-row items-center gap-space-xs">
                <View className="h-7 w-7 items-center justify-center rounded-lg bg-primary-container">
                  <Icon name="add_task" size={18} color="#63003b" />
                </View>
                <Text className="font-headline-md text-headline-md font-bold text-on-surface">
                  Add Protocol Block
                </Text>
              </View>
              <Text className="font-label-sm text-label-sm uppercase text-on-surface-variant">
                Step 1 to 4
              </Text>
            </View>

            {/* Step A: Objective name */}
            <View className="flex flex-col gap-space-2xs">
              <Text className="font-label-sm text-label-sm uppercase text-on-surface-variant">
                Objective / Activity Name
              </Text>
              <TextInput
                className="w-full rounded-lg bg-surface-container-lowest px-space-md py-3 font-body-md text-body-md text-on-surface"
                placeholder="e.g. 45-min Deep Work or Core Strength"
                placeholderTextColor="#a78993"
              />
            </View>

            {/* Step B: Proof mechanism selector */}
            <View className="flex flex-col gap-space-2xs">
              <Text className="font-label-sm text-label-sm uppercase text-on-surface-variant">
                Verification Standard (Proof Type)
              </Text>
              <View className="flex-row gap-space-xs">
                {PROOF_MECHANISMS.map((mechanism) => (
                  <View
                    key={mechanism.title}
                    className={`flex-1 items-center justify-center rounded-lg p-3 ${mechanism.cardClassName}`}
                  >
                    <View
                      className={`mb-1.5 h-9 w-9 items-center justify-center rounded-full ${mechanism.iconWrapClassName}`}
                    >
                      <Icon name={mechanism.icon} size={20} color={mechanism.iconColor} />
                    </View>
                    <Text
                      className={`font-label-sm text-label-sm font-bold ${mechanism.titleClassName}`}
                    >
                      {mechanism.title}
                    </Text>
                    <Text
                      className={`mt-0.5 font-body-sm text-body-sm ${mechanism.subtitleClassName}`}
                    >
                      {mechanism.subtitle}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Step C: Target duration stepper */}
            <View className="flex-row items-center justify-between rounded-lg bg-surface-container-lowest p-space-sm">
              <View className="flex-1">
                <Text className="font-label-md text-label-md font-semibold text-on-surface">
                  Target Timer Duration
                </Text>
                <Text className="font-body-sm text-body-sm text-on-surface-variant">
                  Locks device in focus mode
                </Text>
              </View>
              <View className="flex-row items-center gap-space-xs">
                <View className="h-8 w-8 items-center justify-center rounded bg-surface-container-high">
                  <Icon name="remove" size={16} color="#dfbec9" />
                </View>
                <Text className="min-w-[64px] px-2 text-center font-label-md text-label-md font-bold text-tertiary">
                  30 min
                </Text>
                <View className="h-8 w-8 items-center justify-center rounded bg-surface-container-high">
                  <Icon name="add" size={16} color="#dfbec9" />
                </View>
              </View>
            </View>

            {/* Step D: Anti-cheat & privacy controls */}
            <View className="flex flex-col gap-space-xs">
              <View className="flex-row items-center justify-between rounded-lg bg-surface-container-low p-space-sm">
                <View className="flex-1 flex-row items-center gap-space-xs">
                  <Icon name="no_photography" size={18} color="#00dbe9" />
                  <View className="flex-1">
                    <Text className="font-body-md text-body-md font-semibold text-on-surface">
                      Enforce Live Camera
                    </Text>
                    <Text className="font-body-sm text-body-sm text-on-surface-variant">
                      Blocks gallery uploads
                    </Text>
                  </View>
                </View>
                <ToggleSwitch on />
              </View>

              <View className="flex-row items-center justify-between rounded-lg bg-surface-container-low p-space-sm">
                <View className="flex-1 flex-row items-center gap-space-xs">
                  <Icon name="lock" size={18} color="#d1bcff" />
                  <View className="flex-1">
                    <Text className="font-body-md text-body-md font-semibold text-on-surface">
                      Private Verification
                    </Text>
                    <Text className="font-body-sm text-body-sm text-on-surface-variant">
                      Only you & accountability buddy view proofs
                    </Text>
                  </View>
                </View>
                <ToggleSwitch on />
              </View>
            </View>

            {/* Add block action */}
            <View className="w-full flex-row items-center justify-center gap-2 rounded-lg bg-surface-container-highest px-space-md py-3 shadow-md">
              <Icon name="library_add" size={18} color="#ffb0ce" />
              <Text className="font-label-md text-label-md text-primary">
                + Add Block to Schedule
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Section 4: Fixed bottom launch & metrics action bar */}
      <View className="absolute bottom-0 left-0 right-0 z-40">
        <BlurView intensity={80} tint="dark">
          <View
            className="flex flex-col gap-2 bg-surface-container-lowest/90 px-margin-mobile pt-3"
            style={{ paddingBottom: insets.bottom + 12 }}
          >
            <View className="flex-row items-center justify-between px-1">
              <View className="flex-row items-center gap-1.5">
                <Icon name="local_fire_department" size={16} color="#ffb0ce" />
                <Text className="font-label-md text-label-md text-on-surface">Daily Yield</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <View className="rounded-full bg-primary-container/20 px-2.5 py-1">
                  <Text className="font-label-sm text-label-sm font-bold text-primary">
                    105 XP / Day
                  </Text>
                </View>
                <Text className="font-label-sm text-label-sm text-on-surface-variant">•</Text>
                <View className="rounded-full bg-tertiary-container/20 px-2.5 py-1">
                  <Text className="font-label-sm text-label-sm font-bold text-tertiary">
                    735 XP / Wk
                  </Text>
                </View>
              </View>
            </View>

            <PrimaryButton
              label="Launch & Start Routine"
              icon="rocket_launch"
              uppercase={false}
              textColor="#63003b"
              colors={["#fc49a5", "#5910c8"]}
            />
          </View>
        </BlurView>
      </View>
    </View>
  );
}
