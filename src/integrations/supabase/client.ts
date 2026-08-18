/**
 * Canonical browser Supabase client (P03 foundation).
 *
 * Lazy + cached: the client is only constructed once public configuration exists.
 * Returns null when Supabase is not configured, so the static frontend keeps working.
 * Only the public URL + publishable key are ever read here — never service-role or
 * any other server-only secret.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { parseSupabaseConfig, type SupabaseConfigSource } from "./config";

let cachedClient: SupabaseClient | null = null;
let initialized = false;

/** Returns the shared browser client, or null when Supabase is not configured yet. */
export function getSupabaseClient(env: SupabaseConfigSource = import.meta.env): SupabaseClient | null {
  if (initialized) return cachedClient;

  const config = parseSupabaseConfig(env);
  initialized = true;

  if (!config) {
    cachedClient = null;
    return null;
  }

  cachedClient = createClient(config.url, config.publishableKey, {
    auth: {
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
      persistSession: true,
      autoRefreshToken: true,
    },
  });

  return cachedClient;
}

/** Test-only helper: clears the cached singleton. */
export function resetSupabaseClient(): void {
  cachedClient = null;
  initialized = false;
}
