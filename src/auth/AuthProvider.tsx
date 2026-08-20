/**
 * P09 — Supabase Auth foundation.
 *
 * Single place where Supabase Auth is touched. UI components consume useAuth()
 * and never call supabase.auth directly. Uses the existing lazy
 * getSupabaseClient() architecture (public browser credentials only).
 */
import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/integrations/supabase/client";

export type AuthResult = {
  error: string | null;
  /** True when Supabase requires an email confirmation before sign-in. */
  needsEmailConfirmation?: boolean;
};

export type AuthContextValue = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  /** False when Supabase is not configured in this environment. */
  isAuthAvailable: boolean;
  signUp: (email: string, password: string) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<AuthResult>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const UNAVAILABLE = "auth.unavailable";

/** Maps backend errors to safe, non-leaking message keys. */
export function toSafeAuthError(raw: unknown): string {
  const message =
    typeof raw === "string"
      ? raw
      : raw instanceof Error
        ? raw.message
        : typeof raw === "object" && raw !== null && "message" in raw
          ? String((raw as { message: unknown }).message)
          : "";

  const lower = message.toLowerCase();
  if (lower.includes("invalid login") || lower.includes("invalid credentials")) {
    return "auth.invalidCredentials";
  }
  if (lower.includes("already registered") || lower.includes("already exists") || lower.includes("user already")) {
    return "auth.emailTaken";
  }
  if (lower.includes("password")) return "auth.weakPassword";
  if (lower.includes("email") && lower.includes("confirm")) return "auth.emailNotConfirmed";
  if (lower.includes("rate") || lower.includes("too many")) return "auth.rateLimited";
  if (lower.includes("fetch") || lower.includes("network") || lower.includes("timeout")) {
    return "auth.network";
  }
  return "auth.generic";
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const client = useMemo(() => getSupabaseClient(), []);
  const isAuthAvailable = client !== null;

  useEffect(() => {
    if (!client) {
      setLoading(false);
      return;
    }

    let active = true;

    // Subscribe first so no auth event is missed during initialization.
    const { data } = client.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setLoading(false);
    });

    client.auth
      .getSession()
      .then(({ data: sessionData }) => {
        if (!active) return;
        setSession(sessionData.session ?? null);
        setUser(sessionData.session?.user ?? null);
      })
      .catch(() => {
        /* Supabase unreachable: stay signed out, app remains usable. */
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [client]);

  const signUp = useCallback<AuthContextValue["signUp"]>(
    async (email, password) => {
      if (!client) return { error: UNAVAILABLE };
      try {
        const { data, error } = await client.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/` },
        });
        if (error) return { error: toSafeAuthError(error) };
        return { error: null, needsEmailConfirmation: !data.session };
      } catch (err) {
        return { error: toSafeAuthError(err) };
      }
    },
    [client],
  );

  const signIn = useCallback<AuthContextValue["signIn"]>(
    async (email, password) => {
      if (!client) return { error: UNAVAILABLE };
      try {
        const { error } = await client.auth.signInWithPassword({ email, password });
        if (error) return { error: toSafeAuthError(error) };
        return { error: null };
      } catch (err) {
        return { error: toSafeAuthError(err) };
      }
    },
    [client],
  );

  const signOut = useCallback<AuthContextValue["signOut"]>(async () => {
    if (!client) return { error: UNAVAILABLE };
    try {
      const { error } = await client.auth.signOut();
      if (error) return { error: toSafeAuthError(error) };
      setSession(null);
      setUser(null);
      return { error: null };
    } catch (err) {
      return { error: toSafeAuthError(err) };
    }
  }, [client]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, session, loading, isAuthAvailable, signUp, signIn, signOut }),
    [user, session, loading, isAuthAvailable, signUp, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
