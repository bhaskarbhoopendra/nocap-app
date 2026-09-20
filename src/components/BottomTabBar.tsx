import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon, { IconName } from "@/components/Icon";

const TAB_ICONS: Record<string, IconName> = {
  Today: "local_fire_department",
  Programs: "track_changes",
  Ranks: "emoji_events",
  Profile: "badge",
};

export default function BottomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View className="absolute bottom-0 left-0 right-0 z-50">
      <BlurView intensity={85} tint="dark" style={{ paddingBottom: insets.bottom }}>
        <View
          className="h-16 flex-row items-center justify-around px-space-xs"
          style={{ backgroundColor: "rgba(14,14,20,0.8)" }}
        >
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const label = (options.tabBarLabel ?? options.title ?? route.name) as string;
            const isFocused = state.index === index;
            const iconName = TAB_ICONS[route.name] ?? "person";

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <Pressable
                key={route.key}
                onPress={onPress}
                className="h-14 w-16 items-center justify-center gap-1"
              >
                <Icon name={iconName} size={22} color={isFocused ? "#ffb0ce" : "#dfbec9"} />
                <Text
                  className={`font-label-sm text-label-sm ${isFocused ? "text-primary" : "text-on-surface-variant"}`}
                >
                  {label}
                </Text>
                <View
                  className={`absolute bottom-1 h-1.5 w-1.5 rounded-full bg-primary ${
                    isFocused ? "opacity-100" : "opacity-0"
                  }`}
                />
              </Pressable>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}
