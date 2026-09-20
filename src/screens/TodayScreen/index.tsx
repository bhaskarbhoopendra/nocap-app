import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import { ScrollView, View } from "react-native";
import AppHeader from "@/components/AppHeader";
import { useSession } from "@/hooks/SessionContext";
import { useHeaderHeight } from "@/hooks/useHeaderHeight";
import { getTodaysStateForActiveProgram, todayISODate, TodayState } from "@/services/programService";
import ActiveProgramView from "./ActiveProgramView";
import GetStartedView from "./GetStartedView";

/**
 * Today tab — routes between two states for the same screen, driven by the
 * user's real active-program state (F2.3/F3.1):
 *   - GetStartedView: no active program yet (new users, anyone between
 *     programs, or a schedule_type this screen doesn't resolve yet) — pick
 *     a template, draft an AI plan, or build a custom one.
 *   - ActiveProgramView: an active program is running — today's real daily
 *     protocol, proof list, and streak.
 */
export default function TodayScreen() {
  const { session } = useSession();
  const headerHeight = useHeaderHeight();
  const [todayState, setTodayState] = useState<TodayState | undefined>(undefined);

  // Tab screens stay mounted when you navigate away and back (React
  // Navigation doesn't unmount them), so a plain useEffect would only ever
  // fetch once — it'd miss a program that got started while this screen was
  // sitting in the background. useFocusEffect re-runs every time this tab
  // actually becomes focused, including right after Start Program navigates
  // back here.
  useFocusEffect(
    useCallback(() => {
      if (!session) {
        setTodayState({ kind: "no_active_program" });
        return;
      }
      let cancelled = false;
      (async () => {
        const state = await getTodaysStateForActiveProgram(session.user.id);
        if (!cancelled) setTodayState(state);
      })();
      return () => {
        cancelled = true;
      };
    }, [session])
  );

  return (
    <View className="flex-1 bg-surface">
      <AppHeader />

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-space-lg px-margin-mobile pb-24"
        contentContainerStyle={{ paddingTop: headerHeight }}
        showsVerticalScrollIndicator={false}
      >
        {todayState === undefined ? null : (() => {
          switch (todayState.kind) {
            case "no_active_program":
            case "unsupported_schedule":
              return <GetStartedView />;
            case "day":
              return (
                <ActiveProgramView
                  templateName={todayState.template.name}
                  absDay={todayState.absDay}
                  durationDays={(todayState.template.duration_weeks ?? 0) * 7}
                  currentStreak={todayState.program.current_streak}
                  dayLabel={todayState.dayLabel}
                  scheduledDate={todayState.scheduledDate}
                  programId={todayState.program.id}
                  blocks={todayState.blocks}
                  isRestDay={false}
                />
              );
            case "rest_day":
              return (
                <ActiveProgramView
                  templateName={todayState.template.name}
                  absDay={todayState.absDay}
                  durationDays={(todayState.template.duration_weeks ?? 0) * 7}
                  currentStreak={todayState.program.current_streak}
                  dayLabel={todayState.dayLabel}
                  scheduledDate={todayISODate()}
                  programId={todayState.program.id}
                  blocks={[]}
                  isRestDay
                />
              );
            case "day_not_seeded":
              return (
                <ActiveProgramView
                  templateName={todayState.template.name}
                  absDay={todayState.absDay}
                  durationDays={(todayState.template.duration_weeks ?? 0) * 7}
                  currentStreak={todayState.program.current_streak}
                  dayLabel={`Day ${todayState.absDay}`}
                  scheduledDate={todayISODate()}
                  programId={todayState.program.id}
                  blocks={[]}
                  isRestDay={false}
                />
              );
            default:
              return <GetStartedView />;
          }
        })()}
      </ScrollView>
    </View>
  );
}
