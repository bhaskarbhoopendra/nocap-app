import React from "react";
import { Pressable, Text, View } from "react-native";
import Icon, { IconName } from "@/components/Icon";
import { TemplateWithTags } from "@/services/templateService";
import { TemplateAccentRole } from "@/types/database";

// template_tags.accent / templates.badge_accent are a DB-stored role, not a
// raw className — NativeWind's compiler needs every literal class string
// present in source, so the DB only ever picks a key into these static maps
// (same pattern as WORKLOAD_BG_CLASS in TemplateDetailScreen.tsx).
const ACCENT_BG_CLASS: Record<TemplateAccentRole, string> = {
  primary: "bg-primary-container/15",
  secondary: "bg-secondary-container/20",
  tertiary: "bg-tertiary-container/20",
  neutral: "bg-surface-container-highest",
};

const ACCENT_TEXT_CLASS: Record<TemplateAccentRole, string> = {
  primary: "text-primary",
  secondary: "text-secondary",
  tertiary: "text-tertiary",
  neutral: "text-on-surface-variant",
};

interface TemplateCardProps {
  template: TemplateWithTags;
  onPress: () => void;
}

/**
 * One Program Library "Featured Templates" card — fully driven by a
 * template row + its template_tags, so ProgramsScreen renders these with a
 * plain `.map()` instead of one hardcoded JSX block per template (see
 * 0008_template_card_presentation.sql / 0009_seed_program_cards.sql).
 */
export default function TemplateCard({ template, onPress }: TemplateCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="relative flex flex-col gap-space-sm overflow-hidden rounded-2xl bg-surface-container p-space-md shadow-md active:opacity-90"
    >
      <View className="flex-row items-start justify-between gap-space-xs">
        <View className="flex-1 flex-row items-center gap-3">
          <View className="h-12 w-12 items-center justify-center rounded-xl bg-surface-container-high">
            {/* icon/icon_color come from the DB as plain text/hex — a leaf
                Icon prop, not a className, so no NativeWind static-scan
                concern (see ACCENT_*_CLASS above for the className case). */}
            <Icon name={template.icon as IconName} size={26} color={template.icon_color} />
          </View>
          <View className="flex-1">
            <View className="flex-row flex-wrap items-center gap-2">
              <View className="rounded-full bg-surface-container-highest px-2 py-0.5">
                <Text
                  className={`font-label-sm text-label-sm uppercase ${ACCENT_TEXT_CLASS[template.badge_accent]}`}
                >
                  {template.badge_label}
                </Text>
              </View>
              {template.trust_rating != null && (
                <View className="flex-row items-center gap-1">
                  <Icon name="star" size={14} color="#00dbe9" />
                  <Text className="font-label-sm text-label-sm text-on-surface">
                    {template.trust_rating} ({template.review_count} {template.review_label_suffix})
                  </Text>
                </View>
              )}
            </View>
            <Text className="mt-0.5 font-headline-md text-headline-md font-bold text-on-surface">
              {template.name}
            </Text>
          </View>
        </View>
        <Pressable className="h-8 w-8 items-center justify-center rounded-full bg-surface-container-high active:opacity-80">
          <Icon name="bookmark_add" size={18} color="#dfbec9" />
        </Pressable>
      </View>

      <Text className="font-body-md text-body-md text-on-surface-variant">
        {template.description}
      </Text>

      {template.tags.length > 0 && (
        <View className="flex-row flex-wrap items-center gap-2 pt-1">
          {template.tags.map((tag) => (
            <View
              key={tag.id}
              className={`flex-row items-center gap-1 rounded-full px-2.5 py-1 ${ACCENT_BG_CLASS[tag.accent]}`}
            >
              <Icon name={tag.icon as IconName} size={14} color={tag.icon_color} />
              <Text className={`font-label-sm text-label-sm ${ACCENT_TEXT_CLASS[tag.accent]}`}>
                {tag.label}
              </Text>
            </View>
          ))}
        </View>
      )}

      <View className="mt-1 flex-row items-center justify-between gap-2 rounded-xl bg-surface-container-low p-3">
        <View className="flex-1 flex-row items-center gap-2.5">
          <View className="h-8 w-8 items-center justify-center rounded-lg bg-surface-container">
            <Icon name={template.footer_icon as IconName} size={18} color={template.footer_icon_color} />
          </View>
          <View className="flex-1">
            <Text className="font-label-sm text-label-sm uppercase text-on-surface">
              {template.footer_label}
            </Text>
            {template.footer_subtitle ? (
              <Text className="font-body-sm text-body-sm text-on-surface-variant">
                {template.footer_subtitle}
              </Text>
            ) : null}
          </View>
        </View>
        <Pressable
          onPress={onPress}
          className={`rounded-lg px-3.5 py-1.5 active:opacity-80 ${
            template.cta_is_primary ? "bg-primary" : "bg-surface-container-highest"
          }`}
        >
          <Text
            className={`font-label-md text-label-md font-bold ${
              template.cta_is_primary ? "text-on-primary" : "text-on-surface"
            }`}
          >
            {template.cta_label}
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
}
