import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Pressable, Text, View } from "react-native";
import Icon, { IconName } from "@/components/Icon";

interface PrimaryButtonProps {
  label: string;
  icon?: IconName;
  onPress?: () => void;
  colors?: [string, string, ...string[]];
  className?: string;
  // The Stitch design uses dark `on-primary` text on some gradient CTAs and white
  // on others, and puts the icon after the label on a couple of them — so both are
  // per-button choices rather than a single house style.
  textColor?: string;
  uppercase?: boolean;
  iconPosition?: "leading" | "trailing";
  paddingVertical?: number;
  disabled?: boolean;
}

export default function PrimaryButton({
  label,
  icon,
  onPress,
  colors = ["#fc49a5", "#5910c8"],
  className = "",
  textColor = "#ffffff",
  uppercase = true,
  iconPosition = "leading",
  paddingVertical = 14,
  disabled = false,
}: PrimaryButtonProps) {
  const iconNode = icon ? <Icon name={icon} color={textColor} size={18} /> : null;

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      className={`overflow-hidden rounded-xl ${disabled ? "opacity-40" : ""} ${className}`}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          paddingVertical,
          paddingHorizontal: 16,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}
      >
        {iconPosition === "leading" ? iconNode : null}
        <View>
          <Text
            className={`font-label-md text-label-md font-bold tracking-wider ${
              uppercase ? "uppercase" : ""
            }`}
            style={{ color: textColor }}
          >
            {label}
          </Text>
        </View>
        {iconPosition === "trailing" ? iconNode : null}
      </LinearGradient>
    </Pressable>
  );
}
