import React, { useState } from "react";
import { Switch, Text, View } from "react-native";
import Icon from "@/components/Icon";
import PrimaryButton from "@/components/PrimaryButton";

interface SelfCheckCardProps {
  task: string;
  xpValue: number;
  completed: boolean;
  busy: boolean;
  onComplete: () => void;
}

/**
 * The "normal" proof type — no timer, no camera. Just an honest,
 * explicit confirmation before it counts (no pre-existing Stitch mockup
 * for this case, so this is styled to match the app's existing card/toggle
 * language rather than reusing TimerSection/PhotoSection's chrome).
 */
export default function SelfCheckCard({ task, xpValue, completed, busy, onComplete }: SelfCheckCardProps) {
  const [confirmed, setConfirmed] = useState(completed);

  return (
    <View className="rounded-xl bg-surface-container-low p-space-lg shadow-xl">
      <View className="flex-row items-center gap-space-xs">
        <View className="h-2 w-2 rounded-full bg-tertiary" />
        <Text className="font-headline-md text-headline-md font-bold text-on-surface">
          Honesty Check
        </Text>
      </View>
      <Text className="mt-space-sm font-body-md text-body-md text-on-surface-variant">{task}</Text>

      <View className="mt-space-md flex-row items-center justify-between rounded-lg bg-surface-container p-space-sm">
        <View className="min-w-0 flex-1 flex-row items-center gap-space-xs pr-2">
          <Icon name="fact_check" size={22} color="#00dbe9" />
          <View className="min-w-0 shrink">
            <Text className="font-label-md text-label-md font-semibold text-on-surface">
              I confirm this is honest
            </Text>
            <Text className="font-body-sm text-body-sm text-on-surface-variant">
              No proof to verify here — just your word, logged.
            </Text>
          </View>
        </View>
        <Switch
          value={confirmed}
          onValueChange={setConfirmed}
          disabled={completed}
          trackColor={{ false: "#35343b", true: "#5910c8" }}
          thumbColor="#e9ddff"
          ios_backgroundColor="#35343b"
        />
      </View>

      {completed ? (
        <View className="mt-space-md w-full flex-row items-center justify-center gap-1.5 rounded-lg bg-primary-container py-3">
          <Icon name="check_circle" size={20} color="#63003b" />
          <Text className="font-label-lg text-label-lg font-bold text-on-primary">Verified</Text>
        </View>
      ) : (
        <PrimaryButton
          label={`Mark Complete (+${xpValue} XP)`}
          icon="check_circle"
          textColor="#63003b"
          colors={["#fc49a5", "#5910c8"]}
          className="mt-space-md"
          disabled={!confirmed || busy}
          onPress={onComplete}
        />
      )}
    </View>
  );
}
