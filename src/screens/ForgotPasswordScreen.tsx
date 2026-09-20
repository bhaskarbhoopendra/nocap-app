import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import { Image, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Defs, LinearGradient as SvgLinearGradient, Path, Stop } from "react-native-svg";
import GlowOrb from "@/components/GlowOrb";
import Icon from "@/components/Icon";

interface ForgotPasswordScreenProps {
  // Back arrow and the "Log in" link both return to the returning-user login
  // screen — these pre-auth screens sit in front of the navigator (see
  // App.tsx's Gate), so there's no navigation prop to fall back on.
  onBack: () => void;
}

// The shield-and-check emblem from the design. react-native-svg has no
// equivalent of the design's feDropShadow neon filter, so the glow is a
// GlowOrb sitting behind it instead — same approach as the rest of the app.
function RecoveryShield({ size = 44 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Defs>
        <SvgLinearGradient id="shieldGrad" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
          <Stop offset="0%" stopColor="#fc49a5" />
          <Stop offset="50%" stopColor="#ffb0ce" />
          <Stop offset="100%" stopColor="#d1bcff" />
        </SvgLinearGradient>
      </Defs>
      <Path
        d="M32 10L48 16V28C48 40.5 41.2 49.3 32 54C22.8 49.3 16 40.5 16 28V16L32 10Z"
        stroke="url(#shieldGrad)"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M25 31.5L30 36.5L40 25"
        stroke="#ffffff"
        strokeWidth={3.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M32 23V25M32 39V43" stroke="#00dbe9" strokeWidth={2} strokeLinecap="round" opacity={0.65} />
    </Svg>
  );
}

/**
 * "Forgot Password & Account Recovery" — reached from the returning-user
 * login screen's "Forgot?" link. Presentation only for now: the email field
 * types, but "Send Recovery Link" doesn't send anything yet (there's no
 * resetPasswordForEmail call in authService). The design's post-submit
 * "Magic Link Dispatched" toast is deliberately not rendered — it belongs
 * with that logic pass, not as dead markup here.
 */
export default function ForgotPasswordScreen({ onBack }: ForgotPasswordScreenProps) {
  const insets = useSafeAreaInsets();
  const [identifier, setIdentifier] = useState("");

  return (
    <View className="flex-1 bg-surface">
      {/* Top bar */}
      <View style={{ paddingTop: insets.top }} className="z-50 bg-surface-container-lowest/80">
        <View className="h-16 flex-row items-center gap-space-xs px-margin-mobile">
          <Pressable
            onPress={onBack}
            hitSlop={8}
            className="-ml-2 h-11 w-11 items-center justify-center rounded-full active:opacity-60"
          >
            <Icon name="arrow_back_ios_new" size={24} color="#e4e1ea" />
          </Pressable>
          <Image
            source={require("../../assets/brand/logo-mark.jpg")}
            className="h-7 w-7 rounded-lg"
            resizeMode="cover"
          />
          <Text className="ml-1 font-headline-md text-headline-md font-semibold text-on-surface">
            Log In
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-margin-mobile pb-space-3xl"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="relative">
          <GlowOrb
            size={320}
            color="#ffb0ce"
            style={{ top: -48, left: "50%", marginLeft: -160, opacity: 0.12 }}
          />
          <GlowOrb size={256} color="#5910c8" style={{ top: 288, right: -80, opacity: 0.2 }} />
          <GlowOrb size={224} color="#00dbe9" style={{ top: 480, left: -80, opacity: 0.1 }} />

          {/* Hero */}
          <View className="mb-space-xl mt-space-lg items-center">
            <View className="relative mb-space-md items-center justify-center">
              <GlowOrb size={96} color="#fc49a5" style={{ opacity: 0.35 }} />
              <View
                className="h-20 w-20 items-center justify-center rounded-2xl border bg-surface-container"
                style={{ borderColor: "rgba(255,255,255,0.12)" }}
              >
                <RecoveryShield size={44} />
              </View>
              {/* Live "protocol active" ping */}
              <View className="absolute -right-1 -top-1 h-3.5 w-3.5 items-center justify-center">
                <View className="absolute h-3.5 w-3.5 rounded-full bg-tertiary opacity-40" />
                <View className="h-3.5 w-3.5 rounded-full bg-tertiary" />
              </View>
            </View>

            <View className="mb-space-sm flex-row items-center gap-1.5 rounded-full bg-surface-container-high px-space-sm py-space-2xs">
              <View className="h-1.5 w-1.5 rounded-full bg-tertiary" />
              <Text className="font-label-sm text-label-sm uppercase tracking-wider text-tertiary">
                Encrypted Recovery Protocol
              </Text>
            </View>

            <Text className="mb-space-xs text-center font-headline-xl text-headline-xl font-bold tracking-tight text-on-surface">
              Forgot your password?
            </Text>
            <Text className="max-w-xs text-center font-body-md text-body-md leading-relaxed text-on-surface-variant">
              No worries. Enter your registered email or handle and we&rsquo;ll transmit a
              cryptographically signed magic link.
            </Text>
          </View>

          {/* Form card */}
          <View className="relative w-full overflow-hidden rounded-2xl bg-surface-container-low p-space-lg">
            <LinearGradient
              colors={["transparent", "rgba(255,176,206,0.3)", "transparent"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ position: "absolute", left: 0, right: 0, top: 0, height: 1 }}
            />

            <View className="gap-space-md">
              {/* Email or Handle */}
              <View className="gap-space-xs">
                <View className="flex-row items-center justify-between">
                  <Text className="font-label-lg text-label-lg font-semibold text-on-surface">
                    Email or Handle
                  </Text>
                  <View className="flex-row items-center gap-1 rounded-full bg-tertiary-container/20 px-2 py-0.5">
                    <Icon name="verified_user" size={12} color="#00dbe9" />
                    <Text className="font-label-sm text-label-sm text-tertiary">Vault Locked</Text>
                  </View>
                </View>
                <View className="flex-row items-center">
                  <View className="absolute left-3.5 z-10">
                    <Icon name="alternate_email" size={20} color="#dfbec9" />
                  </View>
                  <TextInput
                    className="w-full rounded-xl bg-surface-container-highest/60 py-3.5 pl-11 pr-4 font-body-md text-body-md text-on-surface"
                    placeholder="alex@nocap.proof or handle"
                    placeholderTextColor="rgba(223,190,201,0.5)"
                    value={identifier}
                    onChangeText={setIdentifier}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                  />
                </View>
              </View>

              {/* Streak Safe Guarantee */}
              <View className="relative flex-row items-start gap-3 overflow-hidden rounded-xl bg-surface-container-highest/40 p-3.5">
                <View className="absolute bottom-0 left-0 top-0 w-1.5 bg-primary-container" />
                <View className="mt-0.5 shrink-0">
                  <Icon name="local_fire_department" size={20} color="#ffb0ce" />
                </View>
                <View className="flex-1">
                  <Text className="mb-0.5 font-label-sm text-label-sm font-semibold uppercase tracking-wider text-primary">
                    Streak Safe Guarantee
                  </Text>
                  <Text className="font-body-sm text-body-sm leading-relaxed text-on-surface-variant">
                    Recovery links expire in 15 minutes. Password resets freeze your accountability
                    proof deadlines so you won&rsquo;t lose your active streak.
                  </Text>
                </View>
              </View>

              {/* Primary CTA */}
              <View
                className="overflow-hidden rounded-xl"
                style={{
                  shadowColor: "#fc49a5",
                  shadowOpacity: 0.4,
                  shadowRadius: 24,
                  shadowOffset: { width: 0, height: 6 },
                  elevation: 10,
                }}
              >
                <LinearGradient
                  colors={["#fc49a5", "#fc49a5", "#5910c8"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    paddingVertical: 14,
                    paddingHorizontal: 24,
                  }}
                >
                  <Text className="font-label-lg text-label-lg font-bold uppercase tracking-wide text-white">
                    Send Recovery Link
                  </Text>
                  <Icon name="arrow_forward" size={18} color="#ffffff" />
                </LinearGradient>
              </View>
            </View>
          </View>

          {/* Supporting pathways */}
          <View className="mt-space-xl items-center gap-space-md">
            <View className="flex-row items-center gap-1.5">
              <Text className="font-body-md text-body-md text-on-surface-variant">
                Remember your password?
              </Text>
              <Pressable
                onPress={onBack}
                hitSlop={8}
                className="flex-row items-center gap-0.5 active:opacity-70"
              >
                <Text className="font-body-md text-body-md font-semibold text-primary">Log in</Text>
                <Icon name="arrow_outward" size={16} color="#ffb0ce" />
              </Pressable>
            </View>

            <View className="my-space-2xs h-0.5 w-24 rounded-full bg-surface-container-high" />

            <View className="flex-row items-center justify-center gap-1">
              <Icon name="lock" size={14} color="rgba(223,190,201,0.6)" />
              <Text className="font-body-sm text-body-sm text-on-surface-variant/60">
                Nocap uses zero-knowledge identity tokens.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
