import { supabase } from "@/lib/supabase";
import { LeaderboardGlobalRow, LeaderboardTemplateRow } from "@/types/database";

/**
 * Top N globally-ranked, leaderboard-unlocked users (leaderboard_global —
 * 0001_init.sql). Only ever includes profiles.leaderboard_unlocked = true
 * rows (F4.2's gate) — an empty result honestly means nobody's unlocked it
 * yet, not a fetch failure. Read-fallback: [].
 */
export async function getGlobalLeaderboard(limit = 20): Promise<LeaderboardGlobalRow[]> {
  const { data, error } = await supabase
    .from("leaderboard_global")
    .select("*")
    .order("rank", { ascending: true })
    .limit(limit);

  if (error) {
    console.warn("getGlobalLeaderboard failed", error);
    return [];
  }
  return data as LeaderboardGlobalRow[];
}

/**
 * One user's own global rank/row, even if they're outside the top N (or
 * null if they're not unlocked yet). Used by the Ranks screen's sticky
 * "you" card once fetched separately from the top-N list above.
 */
export async function getMyGlobalRank(userId: string): Promise<LeaderboardGlobalRow | null> {
  const { data, error } = await supabase
    .from("leaderboard_global")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.warn("getMyGlobalRank failed", error);
    return null;
  }
  return data as LeaderboardGlobalRow | null;
}

/**
 * Top N ranked within one template category (leaderboard_by_template is
 * partitioned by templates.category, not by individual template — see
 * migration 0001_init.sql; category is the real grouping this view
 * supports today). Read-fallback: [].
 */
export async function getCategoryLeaderboard(
  category: string,
  limit = 20
): Promise<LeaderboardTemplateRow[]> {
  const { data, error } = await supabase
    .from("leaderboard_by_template")
    .select("*")
    .eq("category", category)
    .order("rank", { ascending: true })
    .limit(limit);

  if (error) {
    console.warn("getCategoryLeaderboard failed", error);
    return [];
  }
  return data as LeaderboardTemplateRow[];
}

/** Same idea as getMyGlobalRank, scoped to one category. */
export async function getMyCategoryRank(
  userId: string,
  category: string
): Promise<LeaderboardTemplateRow | null> {
  const { data, error } = await supabase
    .from("leaderboard_by_template")
    .select("*")
    .eq("user_id", userId)
    .eq("category", category)
    .maybeSingle();

  if (error) {
    console.warn("getMyCategoryRank failed", error);
    return null;
  }
  return data as LeaderboardTemplateRow | null;
}
