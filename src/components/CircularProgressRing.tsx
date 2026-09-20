import React from "react";
import { View } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";

interface CircularProgressRingProps {
  size: number;
  strokeWidth?: number;
  progress: number; // 0 to 1
  trackColor?: string;
  gradientFrom?: string;
  gradientMid?: string;
  gradientMidOffset?: string;
  gradientTo?: string;
  glowColor?: string;
  children?: React.ReactNode;
}

export default function CircularProgressRing({
  size,
  strokeWidth = 7,
  progress,
  trackColor = "#35343b",
  gradientFrom = "#fc49a5",
  gradientMid,
  gradientMidOffset = "60%",
  gradientTo = "#d1bcff",
  glowColor = "rgba(252,73,165,0.45)",
  children,
}: CircularProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.max(0, Math.min(1, progress)));

  const stops: { offset: string; color: string }[] = [
    { offset: "0%", color: gradientFrom },
    ...(gradientMid ? [{ offset: gradientMidOffset, color: gradientMid }] : []),
    { offset: "100%", color: gradientTo },
  ];

  return (
    <View
      style={{
        width: size,
        height: size,
        shadowColor: glowColor,
        shadowOpacity: 0.9,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 0 },
      }}
    >
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: [{ rotate: "-90deg" }] }}>
        <Defs>
          <LinearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            {stops.map((stop) => (
              <Stop key={stop.offset} offset={stop.offset} stopColor={stop.color} />
            ))}
          </LinearGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#ringGradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="none"
        />
      </Svg>
      <View className="absolute inset-0 items-center justify-center">{children}</View>
    </View>
  );
}
