import React from "react";
import { View } from "react-native";

interface ToggleSwitchProps {
  /** Static visual state — these screens are presentational for now. */
  on?: boolean;
}

/**
 * The app's single toggle geometry (h-6 w-11, 5x5 thumb), matching the
 * preference rows on the Profile tab. Screens should not hand-roll their own.
 */
export default function ToggleSwitch({ on = true }: ToggleSwitchProps) {
  if (!on) {
    return (
      <View className="h-6 w-11 flex-row items-center justify-start rounded-full bg-surface-container-high p-0.5">
        <View className="h-5 w-5 rounded-full bg-outline" />
      </View>
    );
  }

  return (
    <View className="h-6 w-11 flex-row items-center justify-end rounded-full bg-primary-container p-0.5">
      <View className="h-5 w-5 rounded-full bg-on-primary" />
    </View>
  );
}
