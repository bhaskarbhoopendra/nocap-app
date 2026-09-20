import { useEffect } from "react";
import { Linking } from "react-native";
import { supabase } from "@/lib/supabase";

const CALLBACK_PREFIX = "nocap://auth-callback";

// Supabase appends the fresh session as URL params after the email
// confirmation redirect — as a `#fragment` in most GoTrue versions, but we
// check `?query` too since that's determined by project config, not us.
function extractSessionTokens(url: string) {
  const hashIndex = url.indexOf("#");
  const queryIndex = url.indexOf("?");
  const paramsStart = hashIndex >= 0 ? hashIndex : queryIndex;
  if (paramsStart < 0) return null;

  const params = new URLSearchParams(url.slice(paramsStart + 1));
  const access_token = params.get("access_token");
  const refresh_token = params.get("refresh_token");
  return access_token && refresh_token ? { access_token, refresh_token } : null;
}

async function handleIncomingUrl(url: string) {
  if (!url.startsWith(CALLBACK_PREFIX)) return;

  const tokens = extractSessionTokens(url);
  if (!tokens) {
    console.warn("Auth callback opened with no session tokens", url);
    return;
  }

  // Installs the confirmed session (email now attached, is_anonymous now
  // false) into the client. This fires the onAuthStateChange listener in
  // SessionContext, which refreshes `session`/`profile` for the whole app.
  const { error } = await supabase.auth.setSession(tokens);
  if (error) console.warn("Failed to apply confirmed session from deep link", error);
}

/**
 * Catches the nocap://auth-callback deep link Supabase redirects to after a
 * user confirms the email from authService.upgradeToRealAccount(). Handles
 * both a cold start (app was closed, link launched it) and the app already
 * running in the background.
 */
export function useAuthDeepLink() {
  useEffect(() => {
    Linking.getInitialURL().then((url) => {
      if (url) handleIncomingUrl(url);
    });

    const subscription = Linking.addEventListener("url", (event) => {
      handleIncomingUrl(event.url);
    });

    return () => subscription.remove();
  }, []);
}
