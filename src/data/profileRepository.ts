/**
 * P11 — Authenticated user profile data access layer.
 *
 * Single place where public.profiles is read/updated. UI components never query
 * Supabase directly. RLS remains the authoritative security boundary: every
 * query is additionally filtered on the authenticated user's id.
 *
 * Strictly no insert / upsert / delete: profile rows are created by the
 * auth.users database trigger only.
 */
import { getSupabaseClient } from "@/integrations/supabase/client";

export type PreferredLanguage = "fr" | "en" | "de";

export const PREFERRED_LANGUAGES: readonly PreferredLanguage[] = ["fr", "en", "de"] as const;

export const DISPLAY_NAME_MAX_LENGTH = 100;

export interface Profile {
  id: string;
  display_name: string | null;
  preferred_language: PreferredLanguage;
  created_at: string;
  updated_at: string;
}

export interface ProfileUpdate {
  display_name: string | null;
  preferred_language: PreferredLanguage;
}

export type ProfileResult =
  | { profile: Profile; error: null }
  | { profile: null; error: string };

const PROFILE_COLUMNS = "id, display_name, preferred_language, created_at, updated_at";

export function isPreferredLanguage(value: unknown): value is PreferredLanguage {
  return typeof value === "string" && (PREFERRED_LANGUAGES as readonly string[]).includes(value);
}

/** Maps a raw row to the typed Profile. Throws on structurally invalid data. */
export function mapProfileRow(row: unknown): Profile {
  if (typeof row !== "object" || row === null) throw new Error("invalid row");
  const r = row as Record<string, unknown>;
  if (typeof r.id !== "string" || r.id.length === 0) throw new Error("invalid id");
  if (!isPreferredLanguage(r.preferred_language)) throw new Error("invalid preferred_language");
  const displayName =
    r.display_name === null || r.display_name === undefined ? null : String(r.display_name);
  return {
    id: r.id,
    display_name: displayName,
    preferred_language: r.preferred_language,
    created_at: typeof r.created_at === "string" ? r.created_at : "",
    updated_at: typeof r.updated_at === "string" ? r.updated_at : "",
  };
}

/** Normalises a display name: trimmed, empty stored as null. */
export function normalizeDisplayName(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

/** Client-side validation only. Database constraints remain authoritative. */
export function validateProfileUpdate(input: {
  displayName: string;
  preferredLanguage: string;
}): Partial<Record<"displayName" | "preferredLanguage", string>> {
  const errors: Partial<Record<"displayName" | "preferredLanguage", string>> = {};
  if (input.displayName.trim().length > DISPLAY_NAME_MAX_LENGTH) {
    errors.displayName = "profile.displayNameTooLong";
  }
  if (!isPreferredLanguage(input.preferredLanguage)) {
    errors.preferredLanguage = "profile.invalidLanguage";
  }
  return errors;
}

/** Loads the authenticated user's own profile. Never throws. */
export async function fetchOwnProfile(userId: string): Promise<ProfileResult> {
  if (!userId) return { profile: null, error: "auth.unavailable" };

  let client: ReturnType<typeof getSupabaseClient>;
  try {
    client = getSupabaseClient();
  } catch {
    return { profile: null, error: "auth.unavailable" };
  }
  if (!client) return { profile: null, error: "auth.unavailable" };

  try {
    const { data, error } = await client
      .from("profiles")
      .select(PROFILE_COLUMNS)
      .eq("id", userId)
      .maybeSingle();

    if (error) return { profile: null, error: "profile.loadFailed" };
    if (!data) return { profile: null, error: "profile.missing" };

    return { profile: mapProfileRow(data), error: null };
  } catch {
    return { profile: null, error: "profile.loadFailed" };
  }
}

/** Updates only display_name and preferred_language of the caller's own row. */
export async function updateOwnProfile(
  userId: string,
  update: ProfileUpdate,
): Promise<ProfileResult> {
  if (!userId) return { profile: null, error: "auth.unavailable" };
  if (!isPreferredLanguage(update.preferred_language)) {
    return { profile: null, error: "profile.invalidLanguage" };
  }
  if ((update.display_name ?? "").length > DISPLAY_NAME_MAX_LENGTH) {
    return { profile: null, error: "profile.displayNameTooLong" };
  }

  let client: ReturnType<typeof getSupabaseClient>;
  try {
    client = getSupabaseClient();
  } catch {
    return { profile: null, error: "auth.unavailable" };
  }
  if (!client) return { profile: null, error: "auth.unavailable" };

  try {
    const { data, error } = await client
      .from("profiles")
      .update({
        display_name: update.display_name,
        preferred_language: update.preferred_language,
      })
      .eq("id", userId)
      .select(PROFILE_COLUMNS)
      .maybeSingle();

    if (error) return { profile: null, error: "profile.saveFailed" };
    if (!data) return { profile: null, error: "profile.missing" };

    return { profile: mapProfileRow(data), error: null };
  } catch {
    return { profile: null, error: "profile.saveFailed" };
  }
}
