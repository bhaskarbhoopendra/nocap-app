import { supabase } from "@/lib/supabase";
import { Profile } from "@/types/database";

/**
 * Signs a brand-new user in anonymously. Supabase creates the auth.users
 * row, and our DB trigger (handle_new_user) auto-creates a matching
 * profiles row with a generated placeholder username.
 */
export async function signInAnonymously() {
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  return data;
}

/**
 * Restores an existing session if one is persisted on-device, otherwise
 * creates a fresh anonymous session. Call this once on app boot.
 */
export async function ensureSession() {
  const { data: sessionData } = await supabase.auth.getSession();
  if (sessionData.session) return sessionData.session;
  const { session } = await signInAnonymously();
  return session;
}

export async function getMyProfile(): Promise<Profile | null> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userData.user.id)
    .single();

  if (error) {
    console.warn("getMyProfile failed", error);
    return null;
  }
  return data as Profile;
}

/**
 * Live availability check for the onboarding handle field — profiles.username
 * has a real unique constraint (0001_init.sql), so this is a UX hint, not the
 * actual enforcement; updateProfileSetup below still throws on a race. Read
 * fallback is "available" so a transient network hiccup never falsely blocks
 * someone from continuing — the unique constraint remains the real gate.
 */
export async function isUsernameAvailable(username: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (error) {
    console.warn("isUsernameAvailable failed", error);
    return true;
  }
  return data === null;
}

/**
 * Lets a first-time user pick their username + avatar seed after the
 * anonymous session is created (onboarding step 2).
 */
export async function updateProfileSetup(username: string, avatarSeed: Record<string, unknown>) {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("No active session");

  const { error } = await supabase
    .from("profiles")
    .update({ username, avatar_seed: avatarSeed })
    .eq("id", userData.user.id);

  if (error) throw error;
}

/**
 * profiles.is_anonymous is written once by the handle_new_user trigger at
 * signup (0001_init.sql) and never touched again by the schema — nothing
 * updates it when a guest later upgrades to a real account, so it silently
 * goes stale at `true` forever while the live auth.users/session flag moves
 * on. Called from SessionContext on every session change; the `neq` filter
 * makes it a no-op write whenever the two are already in sync (the common
 * case — every token refresh, not just the moment of upgrade).
 */
export async function syncAnonymousFlag(userId: string, isAnonymous: boolean) {
  const { error } = await supabase
    .from("profiles")
    .update({ is_anonymous: isAnonymous })
    .eq("id", userId)
    .neq("is_anonymous", isAnonymous);

  if (error) console.warn("syncAnonymousFlag failed", error);
}

export interface UpgradeAccountResult {
  // Supabase sends a confirmation email before the address actually attaches
  // to the account — the user stays anonymous until they click it. Callers
  // must not treat the upgrade as complete just because this call succeeded.
  requiresEmailConfirmation: boolean;
}

/**
 * Upgrades an anonymous session to a real account with email/password.
 * Registration is open to every anonymous user for now (no streak/XP gate —
 * that's a deliberately deferred product decision, see docs/ProdroadMap.md
 * F1.3). Supabase keeps the same user id, so all existing programs/task_logs
 * carry over automatically; it does not become a "real" account client-side
 * until the confirmation email is clicked.
 */
export async function upgradeToRealAccount(
  email: string,
  password: string
): Promise<UpgradeAccountResult> {
  const { data, error } = await supabase.auth.updateUser(
    { email, password },
    { emailRedirectTo: "nocap://auth-callback" }
  );
  if (error) throw error;
  return { requiresEmailConfirmation: data.user?.email !== email };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
