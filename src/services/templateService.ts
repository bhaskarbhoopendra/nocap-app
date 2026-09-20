import { supabase } from "@/lib/supabase";
import {
  Template,
  TemplateDay,
  TemplateBlock,
  TemplateWeek,
  TemplateWorkloadCategory,
  TemplateTag,
} from "@/types/database";

// Composed read shape — not a DB table, just a template_day joined with its
// blocks for direct rendering. Lives here (not in database.ts) since it's the
// return shape of a specific query, not a schema mirror.
export interface TemplateDayWithBlocks extends TemplateDay {
  blocks: TemplateBlock[];
}

// Composed read shape for the Program Library card list — a template joined
// with its presentation tags, so ProgramsScreen can render one TemplateCard
// per row instead of one hardcoded JSX block per template.
export interface TemplateWithTags extends Template {
  tags: TemplateTag[];
}

/** Built-in templates for the Program Library grid. Read-fallback: [] on error. */
export async function getBuiltInTemplates(): Promise<Template[]> {
  const { data, error } = await supabase
    .from("templates")
    .select("*")
    .eq("source", "builtin")
    .order("created_at", { ascending: true });

  if (error) {
    console.warn("getBuiltInTemplates failed", error);
    return [];
  }
  return data as Template[];
}

/**
 * Built-in templates + their card tags in one call — what ProgramsScreen's
 * "Featured Templates" list actually renders. Read-fallback: [] on error.
 */
export async function getBuiltInTemplatesWithTags(): Promise<TemplateWithTags[]> {
  const { data, error } = await supabase
    .from("templates")
    .select("*, template_tags(*)")
    .eq("source", "builtin")
    .order("created_at", { ascending: true });

  if (error) {
    console.warn("getBuiltInTemplatesWithTags failed", error);
    return [];
  }
  return (data ?? []).map((row) => {
    const { template_tags, ...template } = row as Template & { template_tags: TemplateTag[] };
    return { ...template, tags: [...template_tags].sort((a, b) => a.sort_order - b.sort_order) };
  });
}

/** Single template by id, for TemplateDetailScreen. Null on error or not-found. */
export async function getTemplateById(templateId: string): Promise<Template | null> {
  const { data, error } = await supabase.from("templates").select("*").eq("id", templateId).maybeSingle();

  if (error) {
    console.warn("getTemplateById failed", error);
    return null;
  }
  return data as Template | null;
}

function sortedBlocks(row: TemplateDay & { template_blocks: TemplateBlock[] }): TemplateDayWithBlocks {
  const { template_blocks, ...day } = row;
  return { ...day, blocks: [...template_blocks].sort((a, b) => a.sort_order - b.sort_order) };
}

/**
 * Full fixed_days syllabus for a template — every template_day plus its
 * blocks, ordered for TemplateDetailScreen's "Syllabus Breakdown". Only
 * meaningful for schedule_type='fixed_days' templates. Read-fallback: [].
 */
export async function getTemplateDaysWithBlocks(templateId: string): Promise<TemplateDayWithBlocks[]> {
  const { data, error } = await supabase
    .from("template_days")
    .select("*, template_blocks(*)")
    .eq("template_id", templateId)
    .order("week_num", { ascending: true })
    .order("day_index", { ascending: true });

  if (error) {
    console.warn("getTemplateDaysWithBlocks failed", error);
    return [];
  }
  return (data ?? []).map((row) => sortedBlocks(row as TemplateDay & { template_blocks: TemplateBlock[] }));
}

/**
 * Single template_day + blocks at a specific (week_num, day_index) — used by
 * the Today screen's daily resolution (F3.1). Read-fallback: null.
 */
export async function getTemplateDayByPosition(
  templateId: string,
  weekNum: number,
  dayIndex: number
): Promise<TemplateDayWithBlocks | null> {
  const { data, error } = await supabase
    .from("template_days")
    .select("*, template_blocks(*)")
    .eq("template_id", templateId)
    .eq("week_num", weekNum)
    .eq("day_index", dayIndex)
    .maybeSingle();

  if (error) {
    console.warn("getTemplateDayByPosition failed", error);
    return null;
  }
  if (!data) return null;
  return sortedBlocks(data as TemplateDay & { template_blocks: TemplateBlock[] });
}

/**
 * Week-level metadata (title/subtitle/phase grouping/hours) for a template's
 * "Syllabus Breakdown" — the phase pill row and week cards are both derived
 * from this client-side (grouping by phase_num/phase_label). Read-fallback: [].
 */
export async function getTemplateWeeks(templateId: string): Promise<TemplateWeek[]> {
  const { data, error } = await supabase
    .from("template_weeks")
    .select("*")
    .eq("template_id", templateId)
    .order("week_num", { ascending: true });

  if (error) {
    console.warn("getTemplateWeeks failed", error);
    return [];
  }
  return data as TemplateWeek[];
}

/**
 * "Workload Calibration" category breakdown for a template. Read-fallback: [].
 */
export async function getTemplateWorkloadCategories(
  templateId: string
): Promise<TemplateWorkloadCategory[]> {
  const { data, error } = await supabase
    .from("template_workload_categories")
    .select("*")
    .eq("template_id", templateId)
    .order("sort_order", { ascending: true });

  if (error) {
    console.warn("getTemplateWorkloadCategories failed", error);
    return [];
  }
  return data as TemplateWorkloadCategory[];
}
