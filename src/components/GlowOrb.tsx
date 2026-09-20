import React from "react";
import { View, ViewStyle } from "react-native";

interface GlowOrbProps {
  size: number;
  color: string;
  style?: ViewStyle;
  intensity?: number;
}

// Decorative ambient glow approximating the Stitch designs' `blur-3xl` background
// circles. React Native has no CSS blur() for arbitrary views, so the soft radial
// falloff is faked by stacking concentric circles at low opacity — a single flat
// circle reads as a hard-edged blob instead of a diffuse glow.
const LAYERS = [1, 0.86, 0.72, 0.58, 0.44, 0.3];

export default function GlowOrb({ size, color, style, intensity = 0.32 }: GlowOrbProps) {
  return (
    <View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          width: size,
          height: size,
          alignItems: "center",
          justifyContent: "center",
        },
        style,
      ]}
    >
      {LAYERS.map((factor) => (
        <View
          key={factor}
          style={{
            position: "absolute",
            width: size * factor,
            height: size * factor,
            borderRadius: (size * factor) / 2,
            backgroundColor: color,
            opacity: intensity / LAYERS.length,
          }}
        />
      ))}
    </View>
  );
}
