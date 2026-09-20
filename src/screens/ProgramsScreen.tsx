import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { CompositeNavigationProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import AppHeader from "@/components/AppHeader";
import GlowOrb from "@/components/GlowOrb";
import Icon from "@/components/Icon";
import PrimaryButton from "@/components/PrimaryButton";
import TemplateCard from "@/components/TemplateCard";
import { useHeaderHeight } from "@/hooks/useHeaderHeight";
import { getBuiltInTemplatesWithTags, TemplateWithTags } from "@/services/templateService";
import { RootStackParamList, TabParamList } from "@/types/navigation";

type Navigation = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, "Programs">,
  NativeStackNavigationProp<RootStackParamList>
>;

const CATEGORY_PILLS: { label: string; icon?: "terminal" | "hourglass_top" | "fitness_center" | "refresh"; active?: boolean }[] = [
  { label: "All Tracks", active: true },
  { label: "Career & Job Prep", icon: "terminal" },
  { label: "Deep Work & Study", icon: "hourglass_top" },
  { label: "Fitness & Calisthenics", icon: "fitness_center" },
  { label: "Habit Reset", icon: "refresh" },
];

export default function ProgramsScreen() {
  const navigation = useNavigation<Navigation>();
  const headerHeight = useHeaderHeight();
  const [templates, setTemplates] = useState<TemplateWithTags[]>([]);

  useEffect(() => {
    (async () => setTemplates(await getBuiltInTemplatesWithTags()))();
  }, []);

  return (
    <View className="flex-1 bg-surface">
      <AppHeader />
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-24"
        showsVerticalScrollIndicator={false}
      >
        {/* Ambient top glow + header + search + filters */}
        <View className="px-margin-mobile pb-space-md" style={{ paddingTop: headerHeight }}>
          <GlowOrb
            size={260}
            color="#fc49a5"
            style={{ top: -40, left: "50%", marginLeft: -130, opacity: 0.16 }}
          />

          <View className="mb-space-sm flex-row items-center justify-between gap-space-xs">
            <View>
              <View className="flex-row items-center gap-1">
                <Icon name="bolt" size={14} color="#ffb0ce" />
                <Text className="font-label-sm text-label-sm uppercase tracking-widest text-primary">
                  Accountability Blueprints
                </Text>
              </View>
              <Text className="mt-0.5 font-headline-xl text-headline-xl font-extrabold tracking-tight text-on-surface">
                Program Library
              </Text>
            </View>
            <Pressable className="flex-row items-center gap-1.5 rounded-full bg-surface-container-high px-3 py-2 active:opacity-80">
              <Icon name="bookmark_border" size={18} color="#ffb0ce" />
              <Text className="font-label-sm text-label-sm uppercase text-primary">
                Saved (3)
              </Text>
            </Pressable>
          </View>

          {/* Search bar */}
          <View className="mb-space-sm w-full flex-row items-center rounded-xl bg-surface-container-low px-3.5">
            <Icon name="search" size={20} color="#dfbec9" />
            <TextInput
              className="flex-1 py-3 pl-2.5 pr-2.5 font-body-md text-body-md text-on-surface"
              placeholder="Search sprints, interview tracks, fitness..."
              placeholderTextColor="#a78993"
            />
            <Pressable className="active:opacity-70">
              <Icon name="tune" size={18} color="#a78993" />
            </Pressable>
          </View>

          {/* Category filter pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-2 py-1"
          >
            {CATEGORY_PILLS.map((pill) => (
              <View
                key={pill.label}
                className={`flex-row items-center gap-1.5 rounded-full px-3.5 py-1.5 ${
                  pill.active ? "bg-primary" : "bg-surface-container-high"
                }`}
              >
                {pill.icon ? (
                  <Icon name={pill.icon} size={15} color={pill.active ? "#63003b" : "#dfbec9"} />
                ) : null}
                <Text
                  className={`font-label-md text-label-md ${
                    pill.active ? "text-on-primary" : "text-on-surface-variant"
                  }`}
                >
                  {pill.label}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <View className="flex flex-col gap-space-lg px-margin-mobile pb-space-xl">
          {/* AI Plan Generator Banner */}
          <View className="relative overflow-hidden rounded-2xl shadow-xl">
            <LinearGradient
              colors={["rgba(89,16,200,0.5)", "#2a2930", "#1b1b21"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ padding: 16 }}
            >
              <GlowOrb
                size={144}
                color="#00a0aa"
                style={{ right: -32, bottom: -32, opacity: 0.2 }}
              />
              <View className="mb-2 flex-row items-start justify-between gap-space-xs">
                <View className="flex-row items-center gap-2">
                  <View className="h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
                    <Icon name="auto_awesome" size={20} color="#ffb0ce" />
                  </View>
                  <View>
                    <View className="flex-row items-center gap-2">
                      <Text className="font-headline-md text-headline-md font-bold text-on-surface">
                        AI Plan Generator
                      </Text>
                      <View className="rounded-full bg-secondary px-2 py-0.5">
                        <Text className="font-label-sm text-label-sm font-bold uppercase text-on-secondary">
                          Pro Tier
                        </Text>
                      </View>
                    </View>
                    <Text className="font-body-sm text-body-sm text-on-surface-variant">
                      Synthesize automated syllabus & milestones
                    </Text>
                  </View>
                </View>
              </View>
              <Text className="mb-space-sm font-body-md text-body-md text-on-surface-variant">
                Input your target goal (e.g., &quot;Crack FAANG System Design in 60 Days&quot; or
                &quot;5AM Club Sprint&quot;) and Nocap formats daily anti-cheat proof routines
                automatically.
              </Text>
              <View className="flex-row gap-2">
                <TextInput
                  className="flex-1 rounded-lg bg-surface-container-lowest px-3.5 py-2.5 font-body-sm text-body-sm text-on-surface"
                  placeholder="e.g., Run a half marathon + pass AWS exam..."
                  placeholderTextColor="#a78993"
                />
                <PrimaryButton
                  label="Draft"
                  icon="arrow_forward"
                  iconPosition="trailing"
                  uppercase={false}
                  textColor="#63003b"
                  colors={["#fc49a5", "#5910c8"]}
                  paddingVertical={15}
                />
              </View>
            </LinearGradient>
          </View>

          {/* Featured Templates section */}
          <View className="flex flex-col gap-space-sm">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Icon name="verified" size={20} color="#ffb0ce" />
                <Text className="font-headline-md text-headline-md font-bold text-on-surface">
                  Featured Templates
                </Text>
              </View>
              <Text className="font-label-sm text-label-sm uppercase text-on-surface-variant">
                {templates.length} Curated
              </Text>
            </View>

            {/* Featured Templates — one TemplateCard per built-in template,
                fully DB-driven (see TemplateCard.tsx / templateService.ts) */}
            {templates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onPress={() => navigation.navigate("TemplateDetail", { templateId: template.id })}
              />
            ))}
          </View>

          {/* Custom Routine Builder */}
          <Pressable
            onPress={() => navigation.navigate("CustomBuilder")}
            className="relative flex flex-col gap-space-md overflow-hidden rounded-2xl bg-surface-container-high p-space-md shadow-2xl active:opacity-90"
          >
            <GlowOrb
              size={160}
              color="#fc49a5"
              style={{ top: -48, right: -48, opacity: 0.2 }}
            />
            <View className="flex-row items-start justify-between gap-2">
              <View className="flex-1">
                <View className="flex-row items-center gap-2">
                  <Icon name="bolt" size={22} color="#ffb0ce" />
                  <Text className="font-headline-lg text-headline-lg font-black tracking-tight text-on-surface">
                    Build Your Custom Routine
                  </Text>
                </View>
                <Text className="mt-1 font-body-md text-body-md text-on-surface-variant">
                  Assemble multi-block commitments with cryptographic proof types.
                </Text>
              </View>
              <View className="rounded-full bg-primary/10 px-2.5 py-1">
                <Text className="font-label-sm text-label-sm font-bold uppercase text-primary">
                  Studio
                </Text>
              </View>
            </View>

            <View className="flex flex-col gap-space-sm rounded-xl bg-surface-container p-space-sm">
              {/* Step 1: Add Custom Block */}
              <View className="flex flex-col gap-1.5">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-1.5">
                    <View className="h-4 w-4 items-center justify-center rounded-full bg-primary">
                      <Text className="text-[10px] font-bold text-on-primary">1</Text>
                    </View>
                    <Text className="font-label-sm text-label-sm font-bold uppercase text-primary">
                      Add Custom Block
                    </Text>
                  </View>
                  <Text className="font-label-sm text-label-sm text-outline">Protocol Unit</Text>
                </View>
                <View className="relative justify-center">
                  <TextInput
                    className="rounded-lg bg-surface-container-low py-2.5 pl-3.5 pr-9 font-headline-md text-headline-md text-on-surface"
                    defaultValue="Leetcode Practice"
                  />
                  <View className="absolute right-3">
                    <Icon name="edit" size={18} color="#dfbec9" />
                  </View>
                </View>
              </View>

              {/* Step 2: Choose Proof Type */}
              <View className="flex flex-col gap-1.5">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-1.5">
                    <View className="h-4 w-4 items-center justify-center rounded-full bg-secondary">
                      <Text className="text-[10px] font-bold text-on-secondary">2</Text>
                    </View>
                    <Text className="font-label-sm text-label-sm font-bold uppercase text-secondary">
                      Choose Proof Type
                    </Text>
                  </View>
                  <Text className="font-label-sm text-label-sm text-outline">
                    Verification Method
                  </Text>
                </View>
                <View className="flex-row gap-2">
                  <View className="flex-1 flex-col items-center justify-center gap-1 rounded-xl bg-primary-container/20 px-2 py-2.5">
                    <Icon name="photo_camera" size={22} color="#ffb0ce" />
                    <Text className="font-label-sm text-label-sm font-bold uppercase text-primary">
                      📸 Photo
                    </Text>
                  </View>
                  <View className="flex-1 flex-col items-center justify-center gap-1 rounded-xl bg-surface-container-low px-2 py-2.5">
                    <Icon name="timer" size={22} color="#dfbec9" />
                    <Text className="font-label-sm text-label-sm font-bold uppercase text-on-surface-variant">
                      ⏱️ Focus Timer
                    </Text>
                  </View>
                  <View className="flex-1 flex-col items-center justify-center gap-1 rounded-xl bg-surface-container-low px-2 py-2.5">
                    <Icon name="how_to_reg" size={22} color="#dfbec9" />
                    <Text className="font-label-sm text-label-sm font-bold uppercase text-on-surface-variant">
                      🤝 Self-Check
                    </Text>
                  </View>
                </View>
              </View>

              {/* Step 3: Duration & Frequency */}
              <View className="flex-row gap-2 pt-1">
                <View className="flex-1 flex-col gap-1">
                  <Text className="font-label-sm text-label-sm uppercase text-outline">
                    Target Duration
                  </Text>
                  <View className="flex-row items-center justify-between rounded-lg bg-surface-container-low px-3 py-2">
                    <View className="h-6 w-6 items-center justify-center rounded-md bg-surface-container-high">
                      <Text className="text-[14px] text-on-surface">-</Text>
                    </View>
                    <Text className="font-label-lg text-label-lg font-bold text-on-surface">
                      45 min
                    </Text>
                    <View className="h-6 w-6 items-center justify-center rounded-md bg-surface-container-high">
                      <Text className="text-[14px] text-on-surface">+</Text>
                    </View>
                  </View>
                </View>
                <View className="flex-1 flex-col gap-1">
                  <Text className="font-label-sm text-label-sm uppercase text-outline">
                    Frequency
                  </Text>
                  <View className="flex-row items-center justify-between rounded-lg bg-surface-container-low px-3 py-2">
                    <Text className="font-label-lg text-label-lg font-bold text-on-surface">
                      5 Days / Wk
                    </Text>
                    <Icon name="tune" size={16} color="#00dbe9" />
                  </View>
                </View>
              </View>

              {/* Rule Summary Pill */}
              <View className="flex-row items-center justify-between rounded-lg bg-surface-container-lowest p-3">
                <View className="flex-1 flex-row items-center gap-2">
                  <View className="h-2.5 w-2.5 rounded-full bg-primary" />
                  <Text className="flex-1 font-body-sm text-body-sm text-on-surface">
                    Rule: Requires camera capture upon timer completion
                  </Text>
                </View>
                <Text className="font-label-sm text-label-sm font-bold text-primary">
                  Anti-Spoof ON
                </Text>
              </View>

              {/* CTA */}
              <PrimaryButton
                label="Append Block to Program"
                icon="add_circle"
                textColor="#63003b"
                colors={["#fc49a5", "#5910c8"]}
                onPress={() => navigation.navigate("CustomBuilder")}
              />
            </View>
          </Pressable>

          {/* Live Nocap Submissions feed */}
          <View className="flex flex-col gap-space-sm rounded-2xl bg-surface-container p-space-md">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Icon name="dynamic_feed" size={20} color="#d1bcff" />
                <Text className="font-headline-md text-headline-md font-bold text-on-surface">
                  Live Nocap Submissions
                </Text>
              </View>
              <View className="flex-row items-center gap-1">
                <View className="h-1.5 w-1.5 rounded-full bg-tertiary" />
                <Text className="font-label-sm text-label-sm uppercase text-tertiary">
                  Streaming Proofs
                </Text>
              </View>
            </View>

            <View className="flex-row gap-2">
              {/* Feed Card 1 */}
              <View className="flex-1 flex-col gap-2 rounded-xl bg-surface-container-low p-2.5">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-1.5">
                    <View className="h-6 w-6 items-center justify-center rounded-full bg-secondary-container">
                      <Text className="text-[10px] font-label-sm text-on-secondary">MK</Text>
                    </View>
                    <Text className="font-label-sm text-label-sm text-on-surface" numberOfLines={1}>
                      Marcus K.
                    </Text>
                  </View>
                  <View className="rounded-full bg-tertiary/10 px-1.5 py-0.5">
                    <Text className="text-[10px] font-label-sm text-tertiary">Photo</Text>
                  </View>
                </View>
                <View className="relative h-24 w-full overflow-hidden rounded-lg bg-surface-container-highest">
                  <Image
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="cover"
                    source={{
                      uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuDyk-gQ6GeKhDuWgaMxCeF7PCvS0iJl0k-hK84Vpt3zktkkrJzF4msQy3i-dIyNe9btvU-MRtUFc9PpisjsKDheHInRnmBG1V6joHLl8p_hrnAfQFm_ep-aGsSSyX7Jh_aB5c7sLK15h5x66Alahop0Ga19V7di_AdqbeDDXcDjsWtQy7DzymKr5ljZLlLOD-VZdDwvWKjQa7YSDiJfBWV0IZCVnvLTZN1bR-rV0OvsXGbAaml8VxcYRw",
                    }}
                  />
                  <View className="absolute bottom-1 right-1 rounded bg-surface-container-lowest/80 px-1.5 py-0.5">
                    <Text className="text-[9px] font-label-sm text-on-surface">14m ago</Text>
                  </View>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text
                    className="text-[11px] font-body-sm text-on-surface-variant"
                    numberOfLines={1}
                  >
                    Day 41: Job Prep
                  </Text>
                  <Icon name="favorite" size={14} color="#ffb0ce" />
                </View>
              </View>

              {/* Feed Card 2 */}
              <View className="flex-1 flex-col gap-2 rounded-xl bg-surface-container-low p-2.5">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-1.5">
                    <View className="h-6 w-6 items-center justify-center rounded-full bg-primary-container">
                      <Text className="text-[10px] font-label-sm text-on-primary">AR</Text>
                    </View>
                    <Text className="font-label-sm text-label-sm text-on-surface" numberOfLines={1}>
                      Aria R.
                    </Text>
                  </View>
                  <View className="rounded-full bg-primary/10 px-1.5 py-0.5">
                    <Text className="text-[10px] font-label-sm text-primary">Timer</Text>
                  </View>
                </View>
                <View className="relative h-24 w-full overflow-hidden rounded-lg bg-surface-container-highest">
                  <Image
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="cover"
                    source={{
                      uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuBEdJtq3x62ZXD1zHJJmCOCMha22St38lSifF7BBXanDd64r_wsg_l-ifcRFm3mCIKgnEtxSoeZtXNWFSKQdCXYiNMdXwd-h3HDTb5qe_wxeaYMedAwssbl5y-dt05IhVWOijiPO2eOi9NUh9svDojVcHYwPtEsZ4SWonmeLIiPnupq23dKlp0qxPwHbLZPtxtf73blg1EbWk62m9j4HYIPNKT4olTI5pI5xgeffpHg6JriuCQf8IBRwg",
                    }}
                  />
                  <View className="absolute bottom-1 right-1 rounded bg-surface-container-lowest/80 px-1.5 py-0.5">
                    <Text className="text-[9px] font-label-sm text-on-surface">22m ago</Text>
                  </View>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text
                    className="text-[11px] font-body-sm text-on-surface-variant"
                    numberOfLines={1}
                  >
                    Day 78: Calisthenics
                  </Text>
                  <Icon name="favorite" size={14} color="#ffb0ce" />
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
