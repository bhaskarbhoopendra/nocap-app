import { supabase } from "@/lib/supabase";
import { Theme, ThemeTokens } from "@/types/database";

const FALLBACK_TOKENS: ThemeTokens = {
  bg: "#0a0a0f",
  panel: "#13121a",
  panelRaised: "#191826",
  border: "#26243a",
  text: "#f0eef5",
  textDim: "#8f8ba3",
  gradientStart: "#e0308f",
  gradientEnd: "#6a2fd9",
  success: "#4fd6a3",
  warning: "#e0a44d",
};

/**
 * Fetches whichever theme is currently marked active in the DB.
 * This is the whole point of dynamic theming: changing the palette
 * later is just an UPDATE statement, no app rebuild required.
 */
export async function getActiveTheme(): Promise<ThemeTokens> {
  const { data, error } = await supabase.from("themes").select("*").eq("is_active", true).single();

  if (error || !data) {
    console.warn("getActiveTheme falling back to defaults", error);
    return FALLBACK_TOKENS;
  }
  return (data as Theme).tokens;
}
