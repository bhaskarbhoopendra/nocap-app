import * as ImagePicker from "expo-image-picker";
import React from "react";
import { Alert, Image, Pressable, Text, View } from "react-native";
import Icon from "@/components/Icon";
import PrimaryButton from "@/components/PrimaryButton";

interface PhotoSectionProps {
  photoUri: string | null;
  onCaptured: (uri: string) => void;
}

/**
 * Section 2 of the task detail screen — required in addition to
 * TimerSection for `photo` proof blocks. Uses the device's live camera
 * capture (never the gallery, matching the app's own "no gallery uploads"
 * anti-cheat copy) — a real capture, but the resulting file stays a local
 * device URI for now. Uploading it to Supabase Storage with EXIF/liveness
 * verification is its own larger ticket (see docs/ProdroadMap.md F3.4) and
 * deliberately isn't built here.
 */
export default function PhotoSection({ photoUri, onCaptured }: PhotoSectionProps) {
  async function handleCapture() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Camera access needed", "Enable camera access to submit a snap proof.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!result.canceled && result.assets?.[0]?.uri) {
      onCaptured(result.assets[0].uri);
    }
  }

  return (
    <View className="mt-space-lg rounded-xl bg-surface-container-low p-space-lg shadow-xl">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-space-xs">
          <View className="h-2 w-2 rounded-full bg-primary" />
          <Text className="font-headline-md text-headline-md font-bold text-on-surface">
            Photo Proof Submission
          </Text>
        </View>
        {photoUri && (
          <Text className="rounded-full bg-tertiary-container/30 px-2.5 py-0.5 font-label-sm text-label-sm font-semibold uppercase tracking-wider text-tertiary">
            Captured
          </Text>
        )}
      </View>

      <View className="relative mt-space-md aspect-[4/3] w-full overflow-hidden rounded-lg bg-surface-container-lowest">
        {photoUri ? (
          <Image source={{ uri: photoUri }} className="h-full w-full" resizeMode="cover" />
        ) : (
          <View className="h-full w-full items-center justify-center gap-2">
            <Icon name="camera" size={36} color="#4a4852" />
            <Text className="font-body-sm text-body-sm text-on-surface-variant">
              No snap captured yet
            </Text>
          </View>
        )}

        {photoUri && (
          <Pressable
            onPress={handleCapture}
            className="absolute bottom-2.5 right-2.5 flex-row items-center gap-1 rounded-full bg-surface-container-highest/90 px-3 py-1 shadow-md"
          >
            <Icon name="refresh" size={15} color="#e4e1ea" />
            <Text className="font-label-sm text-label-sm text-on-surface">Retake Snap</Text>
          </Pressable>
        )}
      </View>

      {!photoUri && (
        <PrimaryButton
          label="Open Camera"
          icon="camera"
          textColor="#63003b"
          colors={["#fc49a5", "#5910c8"]}
          className="mt-space-md"
          onPress={handleCapture}
        />
      )}
    </View>
  );
}
