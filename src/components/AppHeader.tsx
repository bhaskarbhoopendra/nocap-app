import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BlurView } from "expo-blur";
import React from "react";
import { Image, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "@/components/Icon";
import { useSession } from "@/hooks/SessionContext";
import { RootStackParamList } from "@/types/navigation";

interface AppHeaderProps {
  // Overrides the real profile streak — only meaningful for a screen that
  // genuinely has a more specific number to show; every current call site
  // just omits this and gets the real profiles.current_streak.
  streakDays?: number;
}

export default function AppHeader({ streakDays }: AppHeaderProps) {
  const insets = useSafeAreaInsets();
  const { profile } = useSession();
  const displayStreak = streakDays ?? profile?.current_streak ?? 0;
  // The header sits inside the tab navigator, so reach the parent stack to
  // push the full account screen over the tabs.
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View className="absolute left-0 right-0 top-0 z-50">
      <BlurView intensity={80} tint="dark" style={{ paddingTop: insets.top }}>
        <View
          className="h-16 flex-row items-center justify-between px-margin-mobile"
          style={{ backgroundColor: "rgba(14,14,20,0.75)" }}
        >
          <View className="flex-row items-center gap-space-xs">
            <Image
              source={require("../../assets/brand/logo-mark.jpg")}
              className="h-8 w-8 rounded-lg"
              resizeMode="cover"
            />
            <Text className="font-headline-md text-headline-md font-bold text-on-surface">
              Nocap
            </Text>
          </View>
          <View className="flex-row items-center gap-space-xs">
            <View className="flex-row items-center gap-1.5 rounded-full bg-primary-container/15 px-3 py-1">
              <Icon name="local_fire_department" color="#ffb0ce" size={16} />
              <Text className="font-label-sm text-label-sm uppercase text-primary">
                {displayStreak} Days
              </Text>
            </View>
            <Pressable
              onPress={() => navigation.navigate("AccountProfile")}
              hitSlop={8}
              className="h-8 w-8 items-center justify-center rounded-full bg-primary active:opacity-80"
            >
              <Icon name="person" color="#63003b" size={18} />
            </Pressable>
          </View>
        </View>
      </BlurView>
    </View>
  );
}
