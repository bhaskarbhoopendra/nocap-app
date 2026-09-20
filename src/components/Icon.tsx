import { MaterialIcons } from "@expo/vector-icons";
import React from "react";

// Maps this app's icon names (Material Symbols snake_case, matching the Stitch
// designs verbatim) to the MaterialIcons glyph set bundled with Expo, which
// uses kebab-case. Keeping the snake_case names in screen code lets them read
// 1:1 against the Stitch HTML they were translated from.
const ICON_MAP = {
  add: "add",
  add_a_photo: "add-a-photo",
  add_circle: "add-circle",
  add_task: "add-task",
  alt_route: "alt-route",
  alternate_email: "alternate-email",
  arrow_back: "arrow-back",
  arrow_back_ios_new: "arrow-back-ios-new",
  arrow_forward: "arrow-forward",
  // Material Symbols' `arrow_outward` has no MaterialIcons counterpart;
  // `north-east` is the same diagonal out-arrow glyph in the bundled set.
  arrow_outward: "north-east",
  auto_awesome: "auto-awesome",
  auto_fix_high: "auto-fix-high",
  badge: "badge",
  bolt: "bolt",
  bookmark: "bookmark",
  bookmark_add: "bookmark-add",
  bookmark_border: "bookmark-border",
  calendar_month: "calendar-month",
  calendar_today: "calendar-today",
  camera: "camera-alt",
  cancel: "cancel",
  casino: "casino",
  center_focus_strong: "center-focus-strong",
  check: "check",
  check_circle: "check-circle",
  checklist: "checklist",
  chevron_right: "chevron-right",
  cloud_sync: "cloud-sync",
  code: "code",
  // Material Symbols' `code_blocks` has no MaterialIcons counterpart; `code` is
  // the closest glyph in the bundled set.
  code_blocks: "code",
  delete: "delete",
  diamond: "diamond",
  done_all: "done-all",
  download: "download",
  drag_indicator: "drag-indicator",
  dynamic_feed: "dynamic-feed",
  edit: "edit",
  edit_note: "edit-note",
  emoji_events: "emoji-events",
  event_repeat: "event-repeat",
  expand_more: "expand-more",
  fact_check: "fact-check",
  favorite: "favorite",
  fingerprint: "fingerprint",
  fitness_center: "fitness-center",
  flare: "flare",
  format_list_bulleted: "format-list-bulleted",
  gavel: "gavel",
  group: "group",
  groups: "groups",
  hourglass_bottom: "hourglass-bottom",
  hourglass_empty: "hourglass-empty",
  hourglass_top: "hourglass-top",
  how_to_reg: "how-to-reg",
  ios_share: "ios-share",
  key: "key",
  layers: "layers",
  leaderboard: "leaderboard",
  library_add: "library-add",
  local_fire_department: "local-fire-department",
  lock: "lock",
  lock_clock: "lock-clock",
  logout: "logout",
  mail: "mail",
  military_tech: "military-tech",
  more_vert: "more-vert",
  no_photography: "no-photography",
  notifications_active: "notifications-active",
  palette: "palette",
  pause: "pause",
  person: "person",
  photo_camera: "photo-camera",
  picture_as_pdf: "picture-as-pdf",
  pie_chart: "pie-chart",
  public: "public",
  refresh: "refresh",
  remove: "remove",
  rocket_launch: "rocket-launch",
  rule: "rule",
  schedule: "schedule",
  schema: "schema",
  search: "search",
  send: "send",
  shield: "shield",
  // Material Symbols' `shield_lock` has no MaterialIcons counterpart; `security`
  // is the same shield-with-lock glyph in the bundled set.
  shield_lock: "security",
  shuffle: "shuffle",
  smart_toy: "smart-toy",
  sports_gymnastics: "sports-gymnastics",
  star: "star",
  stars: "stars",
  sync: "sync",
  terminal: "terminal",
  timer: "timer",
  today: "today",
  track_changes: "track-changes",
  trending_up: "trending-up",
  tune: "tune",
  verified: "verified",
  verified_user: "verified-user",
  vibration: "vibration",
  view_timeline: "view-timeline",
  visibility: "visibility",
  visibility_off: "visibility-off",
  volume_up: "volume-up",
  workspace_premium: "workspace-premium",
  play_arrow: "play-arrow",
  psychology: "psychology",
  whatshot: "whatshot",
} as const;

export type IconName = keyof typeof ICON_MAP;

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
}

export default function Icon({ name, size = 20, color = "#e4e1ea" }: IconProps) {
  return <MaterialIcons name={ICON_MAP[name]} size={size} color={color} />;
}
