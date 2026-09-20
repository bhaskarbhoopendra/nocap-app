import { useEffect } from "react";
import notifee, { EventType } from "react-native-notify-kit";
import { navigationRef } from "@/hooks/navigationRef";
import { RootStackParamList } from "@/types/navigation";

function parseRouteParams(dataValue: unknown): RootStackParamList["ProofSubmission"] | null {
  if (typeof dataValue !== "string") return null;
  try {
    return JSON.parse(dataValue) as RootStackParamList["ProofSubmission"];
  } catch {
    return null;
  }
}

// navigationRef briefly isn't ready yet right as NavigationContainer first
// commits (state restoration) — a handful of short retries covers that
// window without adding a real dependency for something this small.
function navigateWhenReady(params: RootStackParamList["ProofSubmission"], attemptsLeft = 10) {
  if (navigationRef.isReady()) {
    navigationRef.navigate("ProofSubmission", params);
    return;
  }
  if (attemptsLeft <= 0) return;
  setTimeout(() => navigateWhenReady(params, attemptsLeft - 1), 200);
}

function handlePress(dataValue: unknown) {
  const params = parseRouteParams(dataValue);
  if (params) navigateWhenReady(params);
}

/**
 * Deep-links a "time's up" task-timer notification tap (see
 * notificationService.ts) straight into ProofSubmissionScreen for that exact
 * task — covers both a cold start (app was killed, tap launched it) and the
 * app already running in foreground/background, mirroring useAuthDeepLink's
 * two-path pattern for the same reason.
 */
export function useTaskNotificationPress() {
  useEffect(() => {
    notifee.getInitialNotification().then((initial) => {
      if (initial) handlePress(initial.notification.data?.routeParams);
    });

    const unsubscribe = notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS) {
        handlePress(detail.notification?.data?.routeParams);
      }
    });

    return unsubscribe;
  }, []);
}
