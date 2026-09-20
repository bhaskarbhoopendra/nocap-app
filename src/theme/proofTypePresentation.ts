import { IconName } from "@/components/Icon";
import { ProofType } from "@/types/database";

export interface ProofTypeMeta {
  icon: IconName;
  iconColor: string;
  xpClass: string;
  xpWrapClass: string;
}

// template_blocks has no icon/color column — proof_type is a fixed 3-value
// enum, so this presentation mapping is shared wherever a block gets
// rendered (TemplateDetailScreen, Today's ActiveProgramView). XP itself is
// a real per-block column (template_blocks.xp_value), not derived here.
export const PROOF_TYPE_META: Record<ProofType, ProofTypeMeta> = {
  timer: {
    icon: "timer",
    iconColor: "#ffb0ce",
    xpClass: "text-primary",
    xpWrapClass: "bg-primary/15",
  },
  photo: {
    icon: "photo_camera",
    iconColor: "#d1bcff",
    xpClass: "text-secondary",
    xpWrapClass: "bg-secondary-container/30",
  },
  self_check: {
    icon: "fact_check",
    iconColor: "#00dbe9",
    xpClass: "text-tertiary",
    xpWrapClass: "bg-tertiary-container/30",
  },
};
