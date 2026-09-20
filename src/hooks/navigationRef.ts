import { createNavigationContainerRef } from "@react-navigation/native";
import { RootStackParamList } from "@/types/navigation";

// Lets code outside the component tree (notification taps, deep links) drive
// navigation once the container is mounted — attached via
// <NavigationContainer ref={navigationRef}> in App.tsx.
export const navigationRef = createNavigationContainerRef<RootStackParamList>();
