import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import GlowOrb from "@/components/GlowOrb";
import Icon from "@/components/Icon";
import { useSession } from "@/hooks/SessionContext";
import { isUsernameAvailable, updateProfileSetup } from "@/services/authService";
import { AVATAR_LOOKS, AVATAR_PRESETS } from "@/theme/avatarPresets";

const MIN_USERNAME_LENGTH = 3;
const MAX_USERNAME_LENGTH = 20;
// Handles show up as-is on public leaderboards (@handle) — plain ASCII keeps
// them readable and typeable everywhere they're rendered.
const USERNAME_PATTERN = /^[a-zA-Z0-9_]+$/;
// How long to wait after the user stops typing before hitting the DB — keeps
// a fast typist from firing one query per keystroke.
const HANDLE_CHECK_DEBOUNCE_MS = 400;

type HandleStatus = "idle" | "invalid" | "checking" | "available" | "taken";

/** Format-only check (length + character set) — no network involved, so it
 * runs synchronously on every keystroke and gates whether the availability
 * check (which does hit the DB) even fires. Copy matches the app's voice
 * (see OnboardingScreen's other copy) instead of reading like a form-library
 * default. */
function usernameFormatError(trimmed: string): string | null {
  if (trimmed.length < MIN_USERNAME_LENGTH) return "Give it 3+ characters — don't be shy";
  if (trimmed.length > MAX_USERNAME_LENGTH) return "That's a whole essay — keep it under 20";
  if (!USERNAME_PATTERN.test(trimmed)) return "No cap, no symbols — letters, numbers & _ only";
  return null;
}

interface OnboardingScreenProps {
  onDone: () => void;
  // Opens the returning-user login screen. Onboarding renders in front of
  // the navigator (see App.tsx's Gate), so this is a callback rather than a
  // navigation.navigate call.
  onLogIn: () => void;
}

export default function OnboardingScreen({ onDone, onLogIn }: OnboardingScreenProps) {
  const insets = useSafeAreaInsets();
  const { refreshProfile } = useSession();
  const [username, setUsername] = useState("");
  const [avatarIdx, setAvatarIdx] = useState(0);
  const [saving, setSaving] = useState(false);
  const [handleStatus, setHandleStatus] = useState<HandleStatus>("idle");
  const [handleError, setHandleError] = useState<string | null>(null);

  useEffect(() => {
    const trimmed = username.trim();
    if (trimmed.length === 0) {
      setHandleStatus("idle");
      setHandleError(null);
      return;
    }

    const formatError = usernameFormatError(trimmed);
    if (formatError) {
      setHandleStatus("invalid");
      setHandleError(formatError);
      return;
    }
    setHandleError(null);

    setHandleStatus("checking");
    let cancelled = false;
    const timer = setTimeout(async () => {
      const available = await isUsernameAvailable(trimmed);
      if (!cancelled) setHandleStatus(available ? "available" : "taken");
    }, HANDLE_CHECK_DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [username]);

  const handleShuffleAvatar = () => {
    if (AVATAR_LOOKS.length <= 1) return;
    setAvatarIdx((current) => {
      let next = current;
      while (next === current) {
        next = Math.floor(Math.random() * AVATAR_LOOKS.length);
      }
      return next;
    });
  };

  const handleContinue = async () => {
    const trimmed = username.trim();
    const formatError = usernameFormatError(trimmed);
    if (formatError) {
      Alert.alert("Invalid handle", formatError);
      return;
    }
    if (handleStatus === "checking") {
      Alert.alert("Hang on", "Still checking that handle — try again in a second.");
      return;
    }
    if (handleStatus === "taken") {
      Alert.alert("Handle taken", "Pick a different username — that one's already in use.");
      return;
    }
    setSaving(true);
    try {
      // AvatarSeed has no string index signature; updateProfileSetup takes the
      // untyped jsonb shape the DB column actually stores.
      await updateProfileSetup(trimmed, AVATAR_PRESETS[avatarIdx] as any);
      await refreshProfile();
      onDone();
    } catch (e: any) {
      Alert.alert("Couldn't save that", e.message ?? "Try a different username.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="flex-1 bg-surface">
      {/* Top bar */}
      <View style={{ paddingTop: insets.top }} className="z-50 bg-surface">
        <View className="h-14 flex-row items-center justify-between px-margin-mobile">
          <View className="flex-row items-center gap-space-xs">
            <Image
              source={require("../../assets/brand/logo-mark.jpg")}
              className="h-8 w-8 rounded-lg"
              resizeMode="cover"
            />
            <Text className="font-label-lg text-label-lg font-bold uppercase tracking-wider text-on-surface">
              Nocap
            </Text>
          </View>
          {/* No back arrow here — this is the app's first screen, there's
              nothing behind it to return to. */}
          <View className="flex-row items-center gap-1.5 rounded-full bg-primary-container/15 px-space-sm py-1">
            <Icon name="bolt" size={13} color="#ffb0ce" />
            <Text className="font-label-sm text-label-sm font-bold uppercase tracking-wider text-primary">
              Day Zero
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-margin-mobile pb-space-2xl"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="relative">
          <GlowOrb size={224} color="#fc49a5" style={{ top: -48, left: -64, opacity: 0.15 }} />
          <GlowOrb size={256} color="#5910c8" style={{ top: 96, right: -64, opacity: 0.2 }} />
          <GlowOrb
            size={224}
            color="#00a0aa"
            style={{ bottom: 64, left: "50%", marginLeft: -112, opacity: 0.1 }}
          />

          {/* Hero */}
          <View className="mb-space-lg mt-space-sm items-center">
            <View className="mb-space-md flex-row items-center gap-space-2xs rounded-full bg-surface-container-high px-space-sm py-1">
              <View className="h-2 w-2 rounded-full bg-tertiary" />
              <Text className="font-label-sm text-label-sm uppercase tracking-wider text-tertiary-fixed">
                Zero Friction • Ephemeral Session
              </Text>
            </View>

            <View className="mb-space-sm items-center justify-center">
              <GlowOrb size={104} color="#e0308f" style={{ top: -16, left: -20, opacity: 0.45 }} />
              <GlowOrb size={104} color="#6a2fd9" style={{ bottom: -16, right: -20, opacity: 0.4 }} />
              <Image
                source={require("../../assets/brand/logo-mark.jpg")}
                className="h-16 w-16 rounded-xl"
                resizeMode="cover"
              />
            </View>

            <Text className="font-headline-2xl-mobile text-headline-2xl-mobile tracking-tight text-on-surface">
              nocap
            </Text>
            <Text className="mt-space-2xs max-w-xs text-center font-body-md text-body-md leading-snug text-on-surface-variant">
              No email, no password. Pick a vibe and lock your first proof — you&rsquo;re in.
            </Text>
          </View>

          {/* Avatar picker */}
          <View className="mb-space-md rounded-xl bg-surface-container-low p-space-md">
            <View className="mb-space-sm flex-row items-center justify-between">
              <View className="flex-row items-center gap-space-2xs">
                <Icon name="palette" size={18} color="#ffb0ce" />
                <Text className="font-label-md text-label-md font-semibold uppercase tracking-wider text-on-surface">
                  Pick Your Avatar
                </Text>
              </View>
              <Pressable
                onPress={handleShuffleAvatar}
                className="flex-row items-center gap-1 rounded-full bg-surface-container px-space-xs py-1 active:opacity-70"
              >
                <Icon name="casino" size={14} color="#dfbec9" />
                <Text className="font-label-sm text-label-sm text-on-surface-variant">Shuffle</Text>
              </Pressable>
            </View>

            <View className="flex-row gap-space-xs">
              {AVATAR_LOOKS.map((look, idx) => {
                const selected = idx === avatarIdx;
                return (
                  <Pressable
                    key={look.name}
                    onPress={() => setAvatarIdx(idx)}
                    style={selected ? { transform: [{ scale: 1.05 }] } : undefined}
                    className={`aspect-square flex-1 items-center justify-center rounded-xl ${
                      selected ? "bg-surface-container-high" : "bg-surface-container opacity-80"
                    }`}
                  >
                    <LinearGradient
                      colors={look.gradient}
                      start={{ x: 0, y: 1 }}
                      end={{ x: 1, y: 0 }}
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: 12,
                        padding: 2,
                      }}
                    >
                      <View
                        className="flex-1 items-center justify-center rounded-[10px]"
                        style={{ backgroundColor: "rgba(14,14,20,0.4)" }}
                      >
                        <Icon name={look.icon} size={20} color={look.iconColor} />
                      </View>
                    </LinearGradient>
                    {selected ? (
                      <View
                        className="absolute -right-1 -top-1 h-4 w-4 items-center justify-center rounded-full"
                        style={{ backgroundColor: look.badgeColor }}
                      >
                        <Icon name="check" size={11} color={look.badgeIconColor} />
                      </View>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>

            <View className="mt-space-xs flex-row items-center justify-between px-1">
              <Text className="font-body-sm text-body-sm text-on-surface-variant">Active Theme</Text>
              <Text className="font-label-sm text-label-sm uppercase tracking-wide text-primary">
                {AVATAR_LOOKS[avatarIdx].name}
              </Text>
            </View>
          </View>

          {/* Handle */}
          <View className="mb-space-md rounded-xl bg-surface-container-low p-space-md">
            <View className="mb-space-xs flex-row items-center justify-between">
              <View className="flex-row items-center gap-space-2xs">
                <Icon name="alternate_email" size={18} color="#ffb0ce" />
                <Text className="font-label-md text-label-md font-semibold uppercase tracking-wider text-on-surface">
                  Choose Handle
                </Text>
              </View>
              <View className="flex-row items-center gap-1 rounded-full bg-surface-container px-space-xs py-1">
                <Icon name="shuffle" size={14} color="#dfbec9" />
                <Text className="font-label-sm text-label-sm text-on-surface-variant">
                  Auto-Generate
                </Text>
              </View>
            </View>

            <View className="mt-1 flex-row items-center">
              <Text className="absolute left-space-sm z-10 font-label-lg text-label-lg font-bold text-primary">
                @
              </Text>
              <TextInput
                className="h-12 w-full rounded-lg bg-surface-container-high pl-8 pr-28 font-label-lg text-label-lg text-on-surface"
                placeholder="e.g. cryptopacer"
                placeholderTextColor="#a78993"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                spellCheck={false}
                // maxLength={MAX_USERNAME_LENGTH}
              />
              {handleStatus === "idle" ? null : (
                <View
                  className="absolute right-space-xs flex-row items-center gap-1 rounded-full px-2 py-1"
                  style={{ backgroundColor: "rgba(14,14,20,0.8)" }}
                >
                  {handleStatus === "invalid" ? (
                    <>
                      <Icon name="cancel" size={14} color="#ffb4ab" />
                      <Text className="font-label-sm text-label-sm font-bold uppercase tracking-wider text-error">
                        Invalid
                      </Text>
                    </>
                  ) : handleStatus === "checking" ? (
                    <>
                      <ActivityIndicator size="small" color="#dfbec9" />
                      <Text className="font-label-sm text-label-sm font-bold uppercase tracking-wider text-on-surface-variant">
                        Checking
                      </Text>
                    </>
                  ) : handleStatus === "available" ? (
                    <>
                      <Icon name="check_circle" size={14} color="#00dbe9" />
                      <Text className="font-label-sm text-label-sm font-bold uppercase tracking-wider text-tertiary">
                        Available
                      </Text>
                    </>
                  ) : (
                    <>
                      <Icon name="cancel" size={14} color="#ffb4ab" />
                      <Text className="font-label-sm text-label-sm font-bold uppercase tracking-wider text-error">
                        Not Available
                      </Text>
                    </>
                  )}
                </View>
              )}
            </View>

            <Text
              className={`mt-2 px-1 font-body-sm text-body-sm ${
                handleError ? "text-error" : "text-on-surface-variant"
              }`}
            >
              {handleError ?? "This will identify your verified proofs on public leaderboards."}
            </Text>
          </View>

          {/* Local vault reassurance */}
          <View
            className="mb-space-lg flex-row items-start gap-space-sm rounded-xl p-space-md"
            style={{ backgroundColor: "rgba(42,41,48,0.6)" }}
          >
            <View className="h-9 w-9 items-center justify-center rounded-lg bg-surface-container">
              <Icon name="shield_lock" size={20} color="#fc49a5" />
            </View>
            <View className="flex-1">
              <Text className="font-headline-md text-headline-md font-semibold leading-tight text-on-surface">
                Local-First Device Vault
              </Text>
              <Text className="mt-1 font-body-sm text-body-sm leading-relaxed text-on-surface-variant">
                Your streak proofs are signed and stored on this phone. After a{" "}
                <Text className="font-bold text-primary">3-day streak</Text>, Nocap unlocks 1-tap
                passkey backup so you never lose momentum.
              </Text>
            </View>
          </View>

          {/* Primary CTA — the only wired action on this screen */}
          <Pressable
            onPress={saving ? undefined : handleContinue}
            disabled={saving}
            style={{
              shadowColor: "#e0308f",
              shadowOpacity: 0.45,
              shadowRadius: 24,
              shadowOffset: { width: 0, height: 8 },
              elevation: 12,
            }}
            className={`overflow-hidden rounded-xl ${saving ? "opacity-90" : ""}`}
          >
            <LinearGradient
              colors={["#e0308f", "#b70070", "#6a2fd9"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                height: 56,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {saving ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Text className="font-label-lg text-label-lg font-bold uppercase tracking-wider text-white">
                    Let&rsquo;s Go
                  </Text>
                  <Icon name="arrow_forward" size={20} color="#ffffff" />
                </>
              )}
            </LinearGradient>
          </Pressable>

          {/* Returning-user entry point */}
          <View className="mt-space-sm flex-row items-center justify-center">
            <Pressable
              onPress={onLogIn}
              hitSlop={8}
              className="flex-row items-center gap-1.5 px-space-sm py-2 active:opacity-70"
            >
              <Text className="font-body-md text-body-md text-on-surface-variant">
                Already have a Nocap account?
              </Text>
              <View className="flex-row items-center gap-0.5">
                <Text className="font-body-md text-body-md font-bold text-primary">Log in</Text>
                <Icon name="chevron_right" size={16} color="#ffb0ce" />
              </View>
            </Pressable>
          </View>

          <View className="mt-space-md flex-row items-center justify-center gap-space-xs">
            <Icon name="lock" size={16} color="#dfbec9" />
            <Text className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
              No Tracking Cookies • End-to-End Integrity
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
