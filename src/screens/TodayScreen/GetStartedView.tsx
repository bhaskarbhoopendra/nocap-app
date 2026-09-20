import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { useNavigation, CompositeNavigationProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";
import { Pressable, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import GlowOrb from "@/components/GlowOrb";
import Icon, { IconName } from "@/components/Icon";
import PrimaryButton from "@/components/PrimaryButton";
import { RootStackParamList, TabParamList } from "@/types/navigation";

type Navigation = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, "Today">,
  NativeStackNavigationProp<RootStackParamList>
>;

interface CuratedTag {
  icon: IconName;
  iconColor: string;
  label: string;
}

const CURATED_TAGS: CuratedTag[] = [
  { icon: "star", iconColor: "#ffb0ce", label: "14-Wk Job Prep Engine (4.9)" },
  { icon: "hourglass_bottom", iconColor: "#00dbe9", label: "Deep Work 75m" },
  { icon: "fitness_center", iconColor: "#d1bcff", label: "100-Day Iron" },
];

/**
 * "Get Started" state — shown when the user has no active program yet.
 * UI-only for now; none of the CTAs below do more than navigate.
 */
export default function GetStartedView() {
  const navigation = useNavigation<Navigation>();

  return (
    <>
      {/* Hero: idle calibration state, no program running yet */}
      <View className="relative overflow-hidden rounded-2xl bg-surface-container-low p-space-lg shadow-xl">
        <GlowOrb size={176} color="#fc49a5" style={{ top: -48, right: -48, opacity: 0.2 }} />
        <GlowOrb size={160} color="#5910c8" style={{ bottom: -40, left: -40, opacity: 0.25 }} />

        <View className="relative z-10 items-center gap-space-xs">
          {/* Calibration radar ring */}
          <View className="my-space-xs h-28 w-28 items-center justify-center">
            <Svg
              width="100%"
              height="100%"
              viewBox="0 0 100 100"
              style={{ transform: [{ rotate: "-90deg" }] }}
            >
              <Circle cx={50} cy={50} r={42} stroke="#35343b" strokeWidth={4} fill="none" />
              <Circle
                cx={50}
                cy={50}
                r={42}
                stroke="#00dbe9"
                strokeWidth={4.5}
                strokeDasharray={264}
                strokeDashoffset={230}
                strokeLinecap="round"
                fill="none"
              />
              <Circle
                cx={50}
                cy={50}
                r={28}
                stroke="#584049"
                strokeWidth={2}
                strokeDasharray="4 6"
                fill="none"
                opacity={0.6}
              />
            </Svg>
            <View className="absolute items-center justify-center">
              <Icon name="bolt" color="#ffb0ce" size={26} />
              <Text className="font-label-sm text-label-sm uppercase tracking-widest text-tertiary">
                Day 0
              </Text>
            </View>
          </View>

          <View className="flex-row items-center gap-1.5 rounded-full bg-surface-container-highest/60 px-3 py-1">
            <View className="h-1.5 w-1.5 rounded-full bg-tertiary" />
            <Text className="font-label-sm text-label-sm uppercase tracking-wider text-tertiary">
              Ready to Ignite
            </Text>
          </View>

          <Text className="text-center font-headline-2xl text-headline-2xl tracking-tight text-on-surface">
            Lock In Your Proof.
          </Text>
          <Text className="max-w-xs text-center font-body-md text-body-md text-on-surface-variant">
            Real proof beats good intentions. Deploy a verified blueprint, synthesize a custom
            sprint with AI, or craft your own anti-cheat protocol.
          </Text>
        </View>
      </View>

      {/* Section label */}
      <View className="flex-row items-center justify-between px-space-2xs">
        <Text className="font-label-md text-label-md uppercase tracking-wider text-on-surface">
          Choose Your Pathway
        </Text>
        <Text className="font-label-sm text-label-sm text-outline">3 Launch Modes</Text>
      </View>

      {/* Pathway 1: AI Sprint Architect */}
      <View className="relative overflow-hidden rounded-2xl bg-surface-container p-space-lg shadow-2xl">
        <GlowOrb size={144} color="#fc49a5" style={{ top: -56, right: -56, opacity: 0.2 }} />
        <View className="relative z-10 flex-col gap-space-sm">
          <View className="flex-row items-center justify-between gap-space-xs">
            <View className="flex-1 flex-row items-center gap-space-xs">
              <View className="h-9 w-9 items-center justify-center rounded-xl bg-primary-container/20">
                <Icon name="auto_fix_high" color="#ffb0ce" size={20} />
              </View>
              <Text className="flex-1 font-headline-md text-headline-md text-on-surface">
                AI Sprint Architect
              </Text>
            </View>
            <View className="rounded-full bg-primary-container px-2.5 py-0.5">
              <Text className="font-label-sm text-label-sm font-bold uppercase tracking-widest text-on-primary-container">
                Pro Feature
              </Text>
            </View>
          </View>

          <Text className="font-body-md text-body-md text-on-surface-variant">
            Input any ambitious goal. Nocap reverse-engineers daily cryptographic proof gates
            and milestone checks to guarantee execution.
          </Text>

          <View className="flex-row items-center gap-2 rounded-xl bg-surface-container-high/80 p-2.5">
            <Icon name="smart_toy" color="#00dbe9" size={18} />
            <Text
              className="flex-1 font-body-sm text-body-sm italic text-on-surface"
              numberOfLines={1}
            >
              &ldquo;Crack Senior SWE System Design in 8 Weeks&rdquo;
            </Text>
          </View>

          <PrimaryButton
            label="Draft AI Blueprint"
            icon="arrow_forward"
            iconPosition="trailing"
            colors={["#fc49a5", "#5910c8"]}
          />
        </View>
      </View>

      {/* Pathway 2: Curated Blueprints */}
      <View className="flex-col gap-space-sm rounded-2xl bg-surface-container-low p-space-lg shadow-lg">
        <View className="flex-row items-center justify-between gap-space-xs">
          <View className="flex-1 flex-row items-center gap-space-xs">
            <View className="h-9 w-9 items-center justify-center rounded-xl bg-secondary-container/30">
              <Icon name="layers" color="#d1bcff" size={20} />
            </View>
            <View className="flex-1">
              <Text className="font-headline-md text-headline-md leading-tight text-on-surface">
                Curated Blueprints
              </Text>
              <Text className="font-body-sm text-body-sm text-on-surface-variant">
                Peer-tested routines
              </Text>
            </View>
          </View>
          <View className="flex-row items-center gap-1">
            <Icon name="verified" color="#00dbe9" size={16} />
            <Text className="font-label-sm text-label-sm text-tertiary">No-Cap Verified</Text>
          </View>
        </View>

        <Text className="font-body-md text-body-md text-on-surface-variant">
          High-friction, discipline-enforced schedules tailored for dev sprints, strength
          conditioning, and deep research blocks.
        </Text>

        <View className="flex-row flex-wrap gap-1.5">
          {CURATED_TAGS.map((tag) => (
            <View
              key={tag.label}
              className="flex-row items-center gap-1 rounded-full bg-surface-container-high px-2.5 py-1"
            >
              <Icon name={tag.icon} color={tag.iconColor} size={12} />
              <Text className="font-label-sm text-label-sm text-on-surface">{tag.label}</Text>
            </View>
          ))}
        </View>

        <Pressable
          onPress={() => navigation.navigate("Programs")}
          className="w-full flex-row items-center justify-center gap-2 rounded-lg bg-surface-container-highest px-space-md py-3 active:opacity-80"
        >
          <Text className="font-label-md text-label-md font-bold uppercase tracking-wider text-on-surface">
            Browse Curated Library
          </Text>
          <Icon name="chevron_right" color="#e4e1ea" size={18} />
        </Pressable>
      </View>

      {/* Pathway 3: Custom Studio */}
      <View className="flex-col gap-space-sm rounded-2xl bg-surface-container-low p-space-lg shadow-lg">
        <View className="flex-row items-center gap-space-xs">
          <View className="h-9 w-9 items-center justify-center rounded-xl bg-surface-container-highest">
            <Icon name="tune" color="#a78993" size={20} />
          </View>
          <View className="flex-1">
            <Text className="font-headline-md text-headline-md leading-tight text-on-surface">
              Custom Studio
            </Text>
            <Text className="font-body-sm text-body-sm text-on-surface-variant">
              Zero presets, 100% yours
            </Text>
          </View>
        </View>

        <Text className="font-body-md text-body-md text-on-surface-variant">
          Assemble individual accountability gates: timestamped snapshot verification, webcam
          focus checks, or code repository commits.
        </Text>

        <Pressable
          onPress={() => navigation.navigate("CustomBuilder")}
          className="w-full flex-row items-center justify-center gap-2 rounded-lg bg-surface-container-highest px-space-md py-3 active:opacity-80"
        >
          <Text className="font-label-md text-label-md font-bold uppercase tracking-wider text-on-surface">
            Open Protocol Builder
          </Text>
          <Icon name="add_circle" color="#e4e1ea" size={18} />
        </Pressable>
      </View>

      {/* Anti-cheat integrity oath */}
      <View className="flex-row items-start gap-space-sm rounded-xl bg-surface-container-lowest/50 p-space-md">
        <Icon name="shield_lock" color="#a78993" size={20} />
        <Text className="flex-1 font-body-sm text-body-sm leading-relaxed text-outline">
          <Text className="font-medium text-on-surface-variant">Cryptographic Honesty:</Text>{" "}
          Zero fake checkmarks. No honor systems. Once your timeline begins, missed daily
          proofs forfeit your streak record publicly.
        </Text>
      </View>
    </>
  );
}
