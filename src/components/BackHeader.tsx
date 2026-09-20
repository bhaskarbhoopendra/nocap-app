import { BlurView } from "expo-blur";
import React from "react";
import { Image, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "@/components/Icon";

interface BackHeaderProps {
  title: string;
  onBack?: () => void;
}

export default function BackHeader({ title, onBack }: BackHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View className="absolute left-0 right-0 top-0 z-50">
      <BlurView intensity={80} tint="dark" style={{ paddingTop: insets.top }}>
        <View
          className="h-16 flex-row items-center justify-between px-margin-mobile"
          style={{ backgroundColor: "rgba(14,14,20,0.75)" }}
        >
          <View className="flex-1 flex-row items-center gap-space-xs">
            <Pressable
              onPress={onBack}
              className="-ml-2 h-11 w-11 items-center justify-center rounded-full"
            >
              <Icon name="arrow_back_ios_new" color="#e4e1ea" size={22} />
            </Pressable>
            <Image
              source={require("../../assets/brand/logo-mark.jpg")}
              className="h-7 w-7 rounded-lg"
              resizeMode="cover"
            />
            <Text
              className="ml-1 flex-1 font-headline-md text-headline-md font-semibold text-on-surface"
              numberOfLines={1}
            >
              {title}
            </Text>
          </View>
          <View className="h-8 w-8 items-center justify-center rounded-full bg-primary">
            <Icon name="person" color="#63003b" size={18} />
          </View>
        </View>
      </BlurView>
    </View>
  );
}
