import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { View } from "react-native";
import Icon from "@/components/Icon";
import { AvatarSeed, avatarLookForSeed } from "@/theme/avatarPresets";

interface Props {
  seed: AvatarSeed;
  size?: number;
  selected?: boolean;
}

// Renders the same gradient-tile + icon "look" the onboarding picker and
// profile hero use (see avatarLookForSeed) — the single source of truth for
// what a stored avatar_seed looks like anywhere it's shown (leaderboard rows,
// profile, wherever else it appears next), instead of each screen inlining
// its own copy of this markup.
export default function Avatar({ seed, size = 40, selected = false }: Props) {
  const look = avatarLookForSeed(seed);
  const borderRadius = size * 0.28;

  return (
    <LinearGradient
      colors={look.gradient}
      start={{ x: 0, y: 1 }}
      end={{ x: 1, y: 0 }}
      style={{
        width: size,
        height: size,
        borderRadius,
        padding: selected ? 2 : Math.max(1.5, size * 0.05),
        borderWidth: selected ? 1.5 : 0,
        borderColor: "#ffffff",
      }}
    >
      <View
        className="flex-1 items-center justify-center overflow-hidden"
        style={{ borderRadius: borderRadius * 0.85, backgroundColor: "rgba(14,14,20,0.4)" }}
      >
        <Icon name={look.icon} size={size * 0.5} color={look.iconColor} />
      </View>
    </LinearGradient>
  );
}
