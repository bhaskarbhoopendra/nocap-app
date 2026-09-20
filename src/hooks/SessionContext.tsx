import { Session } from "@supabase/supabase-js";
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuthDeepLink } from "@/hooks/useAuthDeepLink";
import { supabase } from "@/lib/supabase";
import { ensureSession, getMyProfile, syncAnonymousFlag } from "@/services/authService";
import { Profile } from "@/types/database";

interface SessionState {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const SessionContext = createContext<SessionState>({
  session: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Installs the confirmed session when the user returns via the email
  // confirmation deep link — this triggers the onAuthStateChange listener
  // below, which is what actually refreshes `session`/`profile` here.
  useAuthDeepLink();

  const refreshProfile = useCallback(async () => {
    try {
      const p = await getMyProfile();
      setProfile(p);
    } catch (error) {
      console.warn("refreshProfile failed", error);
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const s = await ensureSession();
        setSession(s ?? null);
        if (s?.user) await syncAnonymousFlag(s.user.id, s.user.is_anonymous ?? true);
        await refreshProfile();
      } catch (error) {
        console.warn("ensureSession failed", error);
        setSession(null);
      } finally {
        setLoading(false);
      }
    })();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession?.user) {
        syncAnonymousFlag(newSession.user.id, newSession.user.is_anonymous ?? true);
      }
      refreshProfile();
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [refreshProfile]);

  return (
    <SessionContext.Provider value={{ session, profile, loading, refreshProfile }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
