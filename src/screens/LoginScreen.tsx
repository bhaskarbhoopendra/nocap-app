import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import { Image, ScrollView, Text, TextInput, View } from "react-native";
import BackHeader from "@/components/BackHeader";
import GlowOrb from "@/components/GlowOrb";
import Icon from "@/components/Icon";
import PrimaryButton from "@/components/PrimaryButton";
import { useSession } from "@/hooks/SessionContext";
import { useHeaderHeight } from "@/hooks/useHeaderHeight";
import { upgradeToRealAccount } from "@/services/authService";
import { RootStackParamList } from "@/types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const headerHeight = useHeaderHeight();
  const { session } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);

  // The confirmation email's deep link (useAuthDeepLink.ts) lands back in
  // this same running app instance and applies the confirmed session, but
  // it has no way to navigate — if this screen is still sitting on the
  // "check your inbox" card when that happens, nothing would otherwise ever
  // take the user off of it. Once the session flips from anonymous to real
  // while we're waiting, the upgrade is done — go back to Profile, which
  // reactively re-renders off the now-updated session/profile.
  useEffect(() => {
    if (confirmationSent && session?.user && !session.user.is_anonymous) {
      navigation.goBack();
    }
  }, [confirmationSent, session, navigation]);

  const handleSubmit = async () => {
    if (!email.trim() || !password) {
      setError("Enter an email and password to secure your streak.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const result = await upgradeToRealAccount(email.trim(), password);
      if (result.requiresEmailConfirmation) {
        setConfirmationSent(true);
      } else {
        navigation.goBack();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-surface">
      <BackHeader title="Secure Your Account" onBack={() => navigation.goBack()} />

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-margin-mobile pb-8"
        contentContainerStyle={{ paddingTop: headerHeight }}
        showsVerticalScrollIndicator={false}
      >
        <GlowOrb
          size={288}
          color="#fc49a5"
          style={{ top: -64, left: "50%", marginLeft: -144, opacity: 0.15 }}
        />
        <GlowOrb size={240} color="#5910c8" style={{ top: 320, right: 0, opacity: 0.2 }} />

        <View className="flex-col gap-space-lg">
          {/* Hero & Brand Mark */}
          <View className="flex-col items-center gap-space-xs pt-space-xs">
            <View className="relative mb-space-sm items-center justify-center">
              <LinearGradient
                colors={["#fc49a5", "#5910c8"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ width: 80, height: 80, borderRadius: 16, padding: 4 }}
              >
                <View className="flex-1 items-center justify-center overflow-hidden rounded-xl bg-surface-container-high">
                  <Image
                    source={require("../../assets/brand/logo-mark.jpg")}
                    className="h-full w-full"
                    resizeMode="cover"
                  />
                </View>
              </LinearGradient>
              <View className="absolute -bottom-1 -right-1 flex-row items-center gap-0.5 rounded-full bg-primary-container px-space-xs py-0.5">
                <Icon name="bolt" size={12} color="#570033" />
                <Text className="font-label-sm text-label-sm uppercase tracking-wider text-on-primary-container">
                  Sync
                </Text>
              </View>
            </View>

            <View className="mb-space-xs flex-row items-center gap-1.5 rounded-full bg-surface-container-high/80 px-space-sm py-1">
              <View className="h-1.5 w-1.5 rounded-full bg-tertiary" />
              <Text className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                Account Sync & Access
              </Text>
            </View>

            <Text className="text-center font-headline-xl text-headline-xl font-bold tracking-tight text-on-surface">
              Secure Your <Text className="text-primary">Nocap</Text> Streak
            </Text>
            <Text className="max-w-xs text-center font-body-md text-body-md text-on-surface-variant">
              Sync your streaks, verified proof history, and leaderboard standing across any device.
            </Text>
          </View>

          {/* Form / success card — the design wraps it in a faint pink→purple edge glow */}
          <LinearGradient
            colors={["rgba(252,73,165,0.25)", "transparent", "rgba(89,16,200,0.2)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{ borderRadius: 14, padding: 2 }}
          >
            <View className="rounded-xl bg-surface-container-low/90 p-space-lg shadow-2xl">
              {confirmationSent ? (
                <View className="items-center gap-space-sm py-space-md">
                  <View className="h-12 w-12 items-center justify-center rounded-full bg-tertiary-container/30">
                    <Icon name="mail" size={24} color="#00dbe9" />
                  </View>
                  <Text className="text-center font-headline-md text-headline-md font-bold text-on-surface">
                    Check your inbox
                  </Text>
                  <Text className="text-center font-body-sm text-body-sm text-on-surface-variant">
                    We sent a confirmation link to {email.trim()}. Tap it to finish securing your
                    streak — your progress stays exactly as it is until then.
                  </Text>
                </View>
              ) : (
                <View className="flex-col gap-space-md">
                  {/* Email Input */}
                  <View className="flex-col gap-1.5">
                    <View className="flex-row items-center justify-between">
                      <Text className="font-label-md text-label-md text-on-surface-variant">
                        EMAIL ADDRESS
                      </Text>
                      <Text className="font-label-sm text-label-sm text-tertiary">ENCRYPTED</Text>
                    </View>
                    <View className="w-full flex-row items-center rounded-lg bg-surface-container-lowest pl-3.5 pr-4">
                      <Icon name="mail" size={20} color="#a78993" />
                      <TextInput
                        className="flex-1 py-3 pl-2.5 font-body-md text-body-md text-on-surface"
                        placeholder="alex@example.com"
                        placeholderTextColor="#584049"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                        value={email}
                        onChangeText={setEmail}
                        editable={!submitting}
                      />
                    </View>
                  </View>

                  {/* Password Input */}
                  <View className="flex-col gap-1.5">
                    <Text className="font-label-md text-label-md text-on-surface-variant">
                      SET PASSWORD
                    </Text>
                    <View className="w-full flex-row items-center rounded-lg bg-surface-container-lowest pl-3.5 pr-3.5">
                      <Icon name="lock" size={20} color="#a78993" />
                      <TextInput
                        className="flex-1 py-3 pl-2.5 pr-2.5 font-body-md text-body-md text-on-surface"
                        placeholder="••••••••••••"
                        placeholderTextColor="#584049"
                        secureTextEntry
                        autoComplete="password-new"
                        value={password}
                        onChangeText={setPassword}
                        editable={!submitting}
                      />
                    </View>
                  </View>

                  {error ? (
                    <Text className="font-body-sm text-body-sm text-error">{error}</Text>
                  ) : null}

                  {/* Submit CTA */}
                  <PrimaryButton
                    label={submitting ? "Securing..." : "Secure My Streak"}
                    icon="shield"
                    colors={["#fc49a5", "#5910c8"]}
                    onPress={submitting ? undefined : handleSubmit}
                    className="mt-space-xs"
                  />
                </View>
              )}

              {!confirmationSent && (
                <>
                  {/* Alternative Sign-In Separator */}
                  <View className="my-space-md flex-row items-center gap-space-sm">
                    <View className="h-px flex-1 bg-surface-container-highest" />
                    <Text className="font-label-sm text-label-sm uppercase tracking-wider text-outline">
                      OR CONTINUE WITH
                    </Text>
                    <View className="h-px flex-1 bg-surface-container-highest" />
                  </View>

                  {/* Social Providers — not wired yet, see docs/ProdroadMap.md F1.4 */}
                  <View className="flex-row gap-space-sm">
                    <View className="flex-1 flex-row items-center justify-center gap-2.5 rounded-lg bg-surface-container px-3 py-3 opacity-50">
                      <Text className="font-label-md text-label-md font-semibold text-on-surface">
                        Apple
                      </Text>
                    </View>
                    <View className="flex-1 flex-row items-center justify-center gap-2.5 rounded-lg bg-surface-container px-3 py-3 opacity-50">
                      <Text className="font-label-md text-label-md font-semibold text-on-surface">
                        Google
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </View>
          </LinearGradient>

          {/* Anonymous Session Continuity Card */}
          <View className="relative flex-col gap-space-xs overflow-hidden rounded-xl bg-surface-container-low p-space-md shadow-lg">
            <GlowOrb size={96} color="#00dbe9" style={{ right: -24, bottom: -24, opacity: 0.1 }} />
            <View className="flex-row items-start gap-space-sm">
              <View className="mt-0.5 h-9 w-9 items-center justify-center rounded-lg bg-tertiary-container/30">
                <Icon name="verified_user" size={20} color="#00dbe9" />
              </View>
              <View className="flex-1 flex-col">
                <View className="flex-row items-center gap-2">
                  <Text className="font-headline-md text-headline-md font-semibold text-on-surface">
                    Active Guest Progress
                  </Text>
                  <View className="rounded-full bg-tertiary/15 px-2 py-0.5">
                    <Text className="font-label-sm text-label-sm font-bold text-tertiary">
                      MERGE READY
                    </Text>
                  </View>
                </View>
                <Text className="mt-1 font-body-sm text-body-sm leading-relaxed text-on-surface-variant">
                  Securing your account safely links your current streak, XP, and proof history
                  into your synced profile with zero data loss — same identity, just backed up.
                </Text>
              </View>
            </View>
          </View>

          <View className="mt-1 flex-row items-center justify-center gap-1.5">
            <Icon name="lock" size={13} color="#00dbe9" />
            <Text className="text-[11px] text-outline">
              Zero-knowledge client proof encryption • Nocap v1.4
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
