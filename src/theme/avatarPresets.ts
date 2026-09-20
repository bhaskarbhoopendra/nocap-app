import { IconName } from "@/components/Icon";

// A lightweight "generated avatar" system: instead of uploading a photo,
// users pick a color combo + shape seed, and we render it consistently
// anywhere their avatar appears (leaderboard, profile, etc.)

export interface AvatarSeed {
  colorA: string;
  colorB: string;
  shape: "circle" | "square" | "hex";
}

export const AVATAR_PRESETS: AvatarSeed[] = [
  { colorA: "#ff2ea6", colorB: "#7b2fff", shape: "circle" },
  { colorA: "#3ecfd6", colorB: "#2b6fd6", shape: "hex" },
  { colorA: "#4fd6a3", colorB: "#1f8f6b", shape: "square" },
  { colorA: "#e0a44d", colorB: "#c1552c", shape: "circle" },
  { colorA: "#7b7de0", colorB: "#3a3a9c", shape: "hex" },
  { colorA: "#ff6a3d", colorB: "#ff3d94", shape: "square" },
];

export const DEFAULT_AVATAR_SEED: AvatarSeed = AVATAR_PRESETS[0];

export interface AvatarLook {
  name: string;
  gradient: [string, string, string];
  icon: IconName;
  iconColor: string;
  badgeColor: string;
  badgeIconColor: string;
}

// How each preset above is presented in the onboarding picker: a gradient-bordered
// tile with a glyph, per the Stitch design. Index-aligned with AVATAR_PRESETS —
// the seed is still what gets stored; this is only how the choice is rendered.
export const AVATAR_LOOKS: AvatarLook[] = [
  {
    name: "Magenta Pulse",
    gradient: ["#9d174d", "#e0308f", "#8b5cf6"],
    icon: "local_fire_department",
    iconColor: "#ffffff",
    badgeColor: "#ffb0ce",
    badgeIconColor: "#63003b",
  },
  {
    name: "Cyber Cyan",
    gradient: ["#005f73", "#00a896", "#00f0ff"],
    icon: "bolt",
    iconColor: "#7df4ff",
    badgeColor: "#00dbe9",
    badgeIconColor: "#00363a",
  },
  {
    name: "Matrix Jade",
    gradient: ["#064e3b", "#059669", "#34d399"],
    icon: "verified_user",
    iconColor: "#34d399",
    badgeColor: "#34d399",
    badgeIconColor: "#131319",
  },
  {
    name: "Solar Flare",
    gradient: ["#9a3412", "#ea580c", "#fbbf24"],
    icon: "whatshot",
    iconColor: "#fbbf24",
    badgeColor: "#fbbf24",
    badgeIconColor: "#131319",
  },
  {
    name: "Cosmic Violet",
    gradient: ["#312e81", "#6366f1", "#c4abff"],
    icon: "psychology",
    iconColor: "#e9ddff",
    badgeColor: "#d1bcff",
    badgeIconColor: "#3c0090",
  },
  {
    name: "Neon Sunset",
    gradient: ["#831843", "#db2777", "#fb7185"],
    icon: "flare",
    iconColor: "#fb7185",
    badgeColor: "#fb7185",
    badgeIconColor: "#131319",
  },
];

/**
 * profiles.avatar_seed (and the leaderboard views' copy of it) is a jsonb
 * column with no DB-level shape guarantee — onboarding always writes a real
 * AvatarSeed before a user reaches any screen that renders one, but this
 * guards against a malformed/empty value rather than trusting it blindly.
 */
export function isAvatarSeed(v: unknown): v is AvatarSeed {
  return !!v && typeof v === "object" && "colorA" in v && "colorB" in v && "shape" in v;
}

/**
 * The DB only stores the seed (colorA/colorB/shape), not which "look" the
 * user picked it from — this reverses that by matching against
 * AVATAR_PRESETS so screens can show the same name/icon/gradient the
 * onboarding picker showed. Falls back to look 0 for a seed that doesn't
 * match any current preset (e.g. presets changed after the user picked).
 */
export function avatarLookForSeed(seed: AvatarSeed): AvatarLook {
  const idx = AVATAR_PRESETS.findIndex(
    (preset) =>
      preset.colorA === seed.colorA && preset.colorB === seed.colorB && preset.shape === seed.shape
  );
  return AVATAR_LOOKS[idx === -1 ? 0 : idx];
}
