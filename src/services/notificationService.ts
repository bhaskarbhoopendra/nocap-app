import notifee, { AlarmType, AndroidImportance, TriggerType } from "react-native-notify-kit";
import { RootStackParamList } from "@/types/navigation";

const CHANNEL_ID = "task-timers";

// One stable id per task-log slot (program + block + day) — scheduling a new
// trigger under the same id (pause/resume, extend) replaces the pending one
// instead of stacking duplicate notifications for the same task.
function notificationIdFor(programId: string, templateBlockId: string, scheduledDate: string) {
  return `task-timer:${programId}:${templateBlockId}:${scheduledDate}`;
}

let channelReady = false;

/**
 * Permission + channel are both idempotent to (re)request, so this is safe
 * to call before every schedule rather than needing a separate app-boot
 * step — the first real call does the one-time setup, everything after is
 * a cheap no-op check.
 */
async function ensureNotificationSetup() {
  await notifee.requestPermission();
  if (channelReady) return;
  await notifee.createChannel({
    id: CHANNEL_ID,
    name: "Task Timers",
    importance: AndroidImportance.HIGH,
  });
  channelReady = true;
}

/**
 * Schedules the "time's up" local notification for one running task timer,
 * to fire the moment its target duration is reached — even if the phone is
 * locked or the app is killed. Uses SET_ALARM_CLOCK, this fork's strongest
 * delivery guarantee (survives aggressive OEM battery managers the same way
 * the stock Clock app does) — the right choice for a one-shot "timer done"
 * alert with no live-updating UI, per the library's own guidance.
 *
 * Tapping it deep-links back into ProofSubmissionScreen via the `data`
 * payload — see useTaskNotificationPress.ts — landing the user exactly
 * where they can complete the task or extend it with more time.
 */
export async function scheduleTaskTimerNotification(
  routeParams: RootStackParamList["ProofSubmission"],
  fireAtMs: number
) {
  await ensureNotificationSetup();
  const { programId, templateBlockId, scheduledDate, label } = routeParams;

  await notifee.createTriggerNotification(
    {
      id: notificationIdFor(programId, templateBlockId, scheduledDate),
      title: "Time's up! ⏱️",
      body: `${label} has hit its target time. Tap to wrap it up or add more time.`,
      data: { routeParams: JSON.stringify(routeParams) },
      android: { channelId: CHANNEL_ID },
    },
    {
      type: TriggerType.TIMESTAMP,
      timestamp: fireAtMs,
      alarmManager: { type: AlarmType.SET_ALARM_CLOCK },
    }
  );
}

/** Cancels a pending "time's up" notification — call on pause, complete, or
 * early exit, so a stale alert never fires for a task that's no longer
 * actively running toward that target. */
export async function cancelTaskTimerNotification(
  programId: string,
  templateBlockId: string,
  scheduledDate: string
) {
  await notifee.cancelNotification(notificationIdFor(programId, templateBlockId, scheduledDate));
}
