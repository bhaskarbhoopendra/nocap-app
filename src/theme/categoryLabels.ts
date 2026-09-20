// templates.category is a free-text column (no enum/lookup table — an admin
// dashboard could add new categories any time), so this is a presentation
// lookup, not a schema mirror: known categories get a friendly label,
// anything else falls back to a capitalized version of the raw value.
export const CATEGORY_LABELS: Record<string, string> = {
  career: "Career & Tech",
  deep_work: "Deep Work & Study",
  fitness: "Fitness & Calisthenics",
};

export function categoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? category.charAt(0).toUpperCase() + category.slice(1);
}
