/**
 * Lazy, cached Supabase browser client.
 *
 * Uses parseSupabaseConfig() to read PUBLIC values only (URL + publishable/anon key).
 * Returns null when Supabase is not configured, so the app stays a safe static
 * prototype until a project is linked. No URL or key is hardcoded here, and no
 * server-only (service role) secret is ever referenced from the browser.
 *
 * Import like this:
 *   import { getSupabaseClient } from "@/integrations/supabase/client";
 */
import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { parseSupabaseConfig, type SupabaseConfigSource } from "./config";

let cachedClient: SupabaseClient | null = null;

function getEnv(): SupabaseConfigSource {
  return import.meta.env as unknown as SupabaseConfigSource;
}

/**
 * Returns the cached Supabase client, creating it on first use from the public
 * environment config. Returns null when Supabase is not configured.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (cachedClient) return cachedClient;

  const config = parseSupabaseConfig(getEnv());
  if (!config) return null;

  cachedClient = createClient(config.url, config.publishableKey, {
    auth: {
      storage: typeof window !== "undefined" ? localStorage : undefined,
      persistSession: true,
      autoRefreshToken: true,
    },
  });

  return cachedClient;
}

/**
 * Resets the cached client. Intended for tests that need to re-evaluate the
 * client against a stubbed environment.
 */
export function resetSupabaseClient(): void {
  cachedClient = null;
}
