import "./global.css";
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from "@expo-google-fonts/plus-jakarta-sans";
import { SpaceGrotesk_600SemiBold, SpaceGrotesk_700Bold } from "@expo-google-fonts/space-grotesk";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import BottomTabBar from "@/components/BottomTabBar";
import { navigationRef } from "@/hooks/navigationRef";
import { SessionProvider, useSession } from "@/hooks/SessionContext";
import { useTaskNotificationPress } from "@/hooks/useTaskNotificationPress";
import { isSupabaseConfigured } from "@/lib/supabase";
import AccountProfileScreen from "@/screens/AccountProfileScreen";
import CustomBuilderScreen from "@/screens/CustomBuilderScreen";
import LoginScreen from "@/screens/LoginScreen";
import OnboardingScreen from "@/screens/OnboardingScreen";
import ProgramsScreen from "@/screens/ProgramsScreen";
import ProofSubmissionScreen from "@/screens/ProofSubmission";
import RanksScreen from "@/screens/RanksScreen";
import ReturningLoginScreen from "@/screens/ReturningLoginScreen";
import TemplateDetailScreen from "@/screens/TemplateDetailScreen";
import TodayScreen from "@/screens/TodayScreen";
import { ThemeProvider, useTheme } from "@/theme/ThemeContext";
import { RootStackParamList, TabParamList } from "@/types/navigation";

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <BottomTabBar {...props} />}
    >
      <Tab.Screen name="Today" component={TodayScreen} />
      <Tab.Screen name="Programs" component={ProgramsScreen} />
      <Tab.Screen name="Ranks" component={RanksScreen} />
      <Tab.Screen name="Profile">{() => <AccountProfileScreen isTabRoot />}</Tab.Screen>
    </Tab.Navigator>
  );
}

function RootNavigator() {
  useTaskNotificationPress();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={Tabs} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="ProofSubmission" component={ProofSubmissionScreen} />
      <Stack.Screen name="AccountProfile" component={AccountProfileScreen} />
      <Stack.Screen name="TemplateDetail" component={TemplateDetailScreen} />
      <Stack.Screen name="CustomBuilder" component={CustomBuilderScreen} />
    </Stack.Navigator>
  );
}

function Gate() {
  const { theme, loading: themeLoading } = useTheme();
  const { profile, loading: sessionLoading } = useSession();
  const [onboarded, setOnboarded] = useState<boolean | null>(null);
  // Both of these screens render in front of the navigator (a user this far
  // in has no session-backed routes yet), so this pair swaps between them.
  const [showReturningLogin, setShowReturningLogin] = useState(false);

  const loading = themeLoading || sessionLoading || !theme;

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0f",
        }}
      >
        <ActivityIndicator color="#e0308f" size="large" />
      </View>
    );
  }

  if (!isSupabaseConfigured || !profile) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0f",
          padding: 24,
        }}
      >
        <Text style={{ color: "#f0eef5", fontSize: 16, textAlign: "center" }}>
          {isSupabaseConfigured
            ? "Couldn't reach Supabase. Check your project URL/anon key and that the migration has been run."
            : "Supabase isn't configured yet. Copy .env.example to .env and fill in your project's URL/anon key."}
        </Text>
      </View>
    );
  }

  // A username starting with "nocapper_" is our auto-generated placeholder —
  // treat that as "hasn't finished onboarding yet."
  const needsOnboarding = onboarded === false ? false : profile.username.startsWith("nocapper_");

  if (needsOnboarding) {
    return showReturningLogin ? (
      <ReturningLoginScreen onBack={() => setShowReturningLogin(false)} />
    ) : (
      <OnboardingScreen
        onDone={() => setOnboarded(false)}
        onLogIn={() => setShowReturningLogin(true)}
      />
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0f",
        }}
      >
        <ActivityIndicator color="#e0308f" size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <SessionProvider>
        <ThemeProvider>
          <StatusBar style="light" />
          <Gate />
        </ThemeProvider>
      </SessionProvider>
    </SafeAreaProvider>
  );
}
