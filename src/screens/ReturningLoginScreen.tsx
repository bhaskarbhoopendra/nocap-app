import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import { Image, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import GlowOrb from "@/components/GlowOrb";
import Icon from "@/components/Icon";

interface ReturningLoginScreenProps {
  // Back arrow and the "Quick anonymous start" link both return to the
  // welcome/onboarding screen — this screen sits in front of the navigator
  // (see App.tsx's Gate), so there's no navigation prop to fall back on.
  onBack: () => void;
}

// Google's brand mark, drawn rather than bundled as an asset. Its four
// colors are Google's, not ours — the one legitimate place raw hex isn't a
// theme token, since a third party's logo can't be restyled.
function GoogleMark({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <Path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <Path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <Path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </Svg>
  );
}

/**
 * "Returning User Login (Quick Access)" — where the welcome screen's
 * "Already have a Nocap account?" link lands. Presentation only for now:
 * the fields and the password eye toggle work, but nothing authenticates
 * yet (no sign-in-with-existing-credentials flow exists — authService only
 * upgrades an anonymous session, see LoginScreen.tsx). The inert controls
 * are plain Views rather than no-op Pressables so they don't advertise a
 * tap that does nothing.
 */
export default function ReturningLoginScreen({ onBack }: ReturningLoginScreenProps) {
  const insets = useSafeAreaInsets();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
        contentContainerClassName="px-margin-mobile pb-space-2xl"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="relative">
          <GlowOrb
            size={340}
            color="#e0308f"
            style={{ top: -64, left: "50%", marginLeft: -170, opacity: 0.22 }}
          />
          <GlowOrb size={260} color="#00dbe9" style={{ top: 380, right: -80, opacity: 0.12 }} />

          {/* Hero */}
          <View className="mb-space-lg items-center pt-space-xs">
            <View
              className="mb-space-md flex-row items-center gap-1.5 rounded-full border px-3 py-1"
              style={{
                backgroundColor: "rgba(27,27,38,0.9)",
                borderColor: "rgba(224,48,143,0.3)",
              }}
            >
              <View className="h-1.5 w-1.5 rounded-full bg-tertiary" />
              <Text className="font-label-sm text-label-sm font-bold uppercase tracking-wider text-secondary">
                Verified Vault Access
              </Text>
            </View>

            <View className="mb-space-md items-center justify-center">
              <GlowOrb size={104} color="#e0308f" style={{ opacity: 0.4 }} />
              <LinearGradient
                colors={["#222130", "#12111b"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 16,
                  padding: 12,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.15)",
                }}
              >
                <Image
                  source={require("../../assets/brand/logo-mark.jpg")}
                  className="h-full w-full rounded"
                  resizeMode="contain"
                />
              </LinearGradient>
            </View>

            <Text className="font-headline-xl text-headline-xl font-extrabold tracking-tight text-white">
              Welcome back
            </Text>
            <Text
              className="mt-1 text-center font-body-md text-body-md leading-relaxed text-on-surface-variant"
              style={{ maxWidth: 290 }}
            >
              Sync your proof streaks and continue where you left off.
            </Text>
          </View>

          {/* Frosted form card */}
          <View
            className="relative mb-space-lg overflow-hidden rounded-3xl border p-5"
            style={{
              backgroundColor: "rgba(22,22,34,0.85)",
              borderColor: "rgba(255,255,255,0.1)",
            }}
          >
            <LinearGradient
              colors={["transparent", "rgba(255,176,206,0.4)", "transparent"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ position: "absolute", left: 32, right: 32, top: 0, height: 1 }}
            />

            <View className="gap-space-md">
              {/* Email or Handle */}
              <View className="gap-1.5">
                <View className="flex-row items-center justify-between">
                  <Text className="font-label-md text-label-md font-semibold tracking-wide text-on-surface">
                    Email or Handle
                  </Text>
                  <View className="flex-row items-center gap-1">
                    <Icon name="lock" size={13} color="#00dbe9" />
                    <Text className="font-label-sm text-label-sm font-semibold tracking-wide text-tertiary">
                      E2EE Protected
                    </Text>
                  </View>
                </View>
                <View
                  className="flex-row items-center rounded-xl border bg-surface-container-lowest"
                  style={{ borderColor: "rgba(255,255,255,0.1)" }}
                >
                  <View className="pl-3.5">
                    <Icon name="alternate_email" size={19} color="rgba(255,176,206,0.7)" />
                  </View>
                  <TextInput
                    className="h-12 flex-1 px-2.5 font-body-md text-body-md text-white"
                    placeholder="Enter email or @handle"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    value={identifier}
                    onChangeText={setIdentifier}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                  />
                  <View className="pr-3.5">
                    <Icon name="verified" size={18} color="#00dbe9" />
                  </View>
                </View>
              </View>

              {/* Master Password */}
              <View className="gap-1.5">
                <View className="flex-row items-center justify-between">
                  <Text className="font-label-md text-label-md font-semibold tracking-wide text-on-surface">
                    Master Password
                  </Text>
                  <Text className="font-label-md text-label-md font-semibold tracking-wide text-primary">
                    Forgot?
                  </Text>
                </View>
                <View
                  className="flex-row items-center rounded-xl border bg-surface-container-lowest"
                  style={{ borderColor: "rgba(255,255,255,0.1)" }}
                >
                  <View className="pl-3.5">
                    <Icon name="key" size={19} color="rgba(209,188,255,0.7)" />
                  </View>
                  <TextInput
                    className="h-12 flex-1 px-2.5 font-body-md text-body-md tracking-widest text-white"
                    placeholder="Enter master password"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <Pressable
                    onPress={() => setShowPassword((v) => !v)}
                    hitSlop={8}
                    className="pr-3.5 active:opacity-60"
                  >
                    <Icon
                      name={showPassword ? "visibility_off" : "visibility"}
                      size={20}
                      color="rgba(223,190,201,0.7)"
                    />
                  </Pressable>
                </View>
              </View>

              {/* Remember this device */}
              <View className="flex-row items-center gap-3 pt-1">
                <LinearGradient
                  colors={["#e0308f", "#7928ca"]}
                  start={{ x: 0, y: 1 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 6,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.2)",
                  }}
                >
                  <Icon name="check" size={15} color="#ffffff" />
                </LinearGradient>
                <View>
                  <Text className="font-label-md text-label-md font-semibold text-white">
                    Remember this device
                  </Text>
                  <Text className="font-body-sm text-body-sm text-on-surface-variant">
                    Stay synced across sessions
                  </Text>
                </View>
              </View>

              {/* Primary CTA */}
              <View
                className="mt-2 overflow-hidden rounded-xl"
                style={{
                  shadowColor: "#e0308f",
                  shadowOpacity: 0.45,
                  shadowRadius: 24,
                  shadowOffset: { width: 0, height: 4 },
                  elevation: 10,
                }}
              >
                <LinearGradient
                  colors={["#e0308f", "#b70070", "#7928ca"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    height: 48,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.2)",
                    borderRadius: 12,
                  }}
                >
                  <Text className="font-label-lg text-label-lg font-bold tracking-wide text-white">
                    Log In to Nocap
                  </Text>
                  <Icon name="arrow_forward" size={19} color="#ffffff" />
                </LinearGradient>
              </View>

              {/* Divider */}
              <View className="my-1 flex-row items-center gap-3">
                <View className="h-px flex-1" style={{ backgroundColor: "rgba(255,255,255,0.1)" }} />
                <Text className="font-label-sm text-label-sm font-semibold uppercase tracking-widest text-on-surface-variant">
                  Or continue with
                </Text>
                <View className="h-px flex-1" style={{ backgroundColor: "rgba(255,255,255,0.1)" }} />
              </View>

              {/* Google */}
              <View
                className="h-12 flex-row items-center justify-center gap-3 rounded-xl border bg-surface-container-lowest"
                style={{ borderColor: "rgba(255,255,255,0.1)" }}
              >
                <GoogleMark size={20} />
                <Text className="font-label-lg text-label-lg font-semibold tracking-wide text-white">
                  Continue with Google
                </Text>
              </View>
            </View>
          </View>

          {/* Bottom alternate action */}
          <View className="flex-row items-center justify-center gap-1.5">
            <Text className="font-body-md text-body-md text-on-surface-variant">New to Nocap?</Text>
            <Pressable
              onPress={onBack}
              hitSlop={8}
              className="flex-row items-center gap-0.5 active:opacity-70"
            >
              <Text className="font-label-md text-label-md font-bold text-primary">
                Quick anonymous start
              </Text>
              <Icon name="arrow_forward" size={14} color="#ffb0ce" />
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
