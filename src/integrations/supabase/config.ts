/**
 * Browser-safe Supabase configuration.
 *
 * Only public values may be referenced here (project URL + publishable/anon key).
 * Server-only secrets (service role, payment, video, email keys) must NEVER be read
 * from browser code — they belong to server-side functions exclusively.
 */
export interface SupabasePublicConfig {
  url: string;
  publishableKey: string;
}

export type SupabaseConfigSource = Record<string, string | undefined>;

const SERVER_ONLY_HINTS = ["SERVICE_ROLE", "SECRET_KEY", "WEBHOOK_SECRET", "PRIVATE_KEY"];

/** Parses public Supabase config. Returns null when not configured (no project connected yet). */
export function parseSupabaseConfig(env: SupabaseConfigSource): SupabasePublicConfig | null {
  const url = env.VITE_SUPABASE_URL?.trim();
  const publishableKey = env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!url && !publishableKey) return null;

  if (!url || !publishableKey) {
    throw new Error(
      "Incomplete Supabase configuration: VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY must both be set.",
    );
  }

  if (!/^https?:\/\//.test(url)) {
    throw new Error("Invalid VITE_SUPABASE_URL: must be an absolute http(s) URL.");
  }

  const leaked = Object.keys(env).filter(
    (key) => key.startsWith("VITE_") && SERVER_ONLY_HINTS.some((hint) => key.toUpperCase().includes(hint)),
  );
  if (leaked.length > 0) {
    throw new Error(`Server-only secret exposed to the browser via: ${leaked.join(", ")}`);
  }

  return { url, publishableKey };
}

export function isSupabaseConfigured(env: SupabaseConfigSource): boolean {
  return parseSupabaseConfig(env) !== null;
}
