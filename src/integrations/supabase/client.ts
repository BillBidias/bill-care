import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { parseSupabaseConfig, type SupabaseConfigSource } from "./config";

/**
 * Canonical Supabase browser client foundation.
 *
 * No project is connected yet, so the client is created lazily: importing this module
 * never throws and never affects rendering. Future application modules should use
 * `getSupabaseClient()` rather than instantiating their own client.
 */
let cached: SupabaseClient | null = null;

export function createSupabaseClient(env: SupabaseConfigSource): SupabaseClient | null {
  const config = parseSupabaseConfig(env);
  if (!config) return null;
  return createClient(config.url, config.publishableKey, {
    auth: { persistSession: true, autoRefreshToken: true, storage: typeof window === "undefined" ? undefined : window.localStorage },
  });
}

export function getSupabaseClient(): SupabaseClient | null {
  if (cached) return cached;
  cached = createSupabaseClient(import.meta.env as unknown as SupabaseConfigSource);
  return cached;
}
