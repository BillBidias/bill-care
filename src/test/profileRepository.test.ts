import { describe, expect, it, vi, beforeEach } from "vitest";

const calls: string[] = [];
let selectResponse: { data: unknown; error: unknown } = { data: null, error: null };
let updateResponse: { data: unknown; error: unknown } = { data: null, error: null };
let clientAvailable = true;

function makeQuery(kind: "select" | "update") {
  const chain = {
    select: () => (calls.push(`${kind}:select`), chain),
    eq: () => (calls.push(`${kind}:eq`), chain),
    maybeSingle: async () => (kind === "select" ? selectResponse : updateResponse),
  };
  return chain;
}

vi.mock("@/integrations/supabase/client", () => ({
  getSupabaseClient: () =>
    clientAvailable
      ? {
          from: (table: string) => {
            calls.push(`from:${table}`);
            return {
              select: () => (calls.push("select"), makeQuery("select")),
              update: (payload: Record<string, unknown>) => {
                calls.push(`update:${Object.keys(payload).sort().join(",")}`);
                return makeQuery("update");
              },
              insert: () => {
                throw new Error("insert must never be used");
              },
              upsert: () => {
                throw new Error("upsert must never be used");
              },
              delete: () => {
                throw new Error("delete must never be used");
              },
            };
          },
        }
      : null,
}));

import {
  fetchOwnProfile,
  updateOwnProfile,
  mapProfileRow,
  normalizeDisplayName,
  validateProfileUpdate,
  isPreferredLanguage,
} from "@/data/profileRepository";

const ROW = {
  id: "11111111-1111-1111-1111-111111111111",
  display_name: "Bill",
  preferred_language: "de",
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-02T00:00:00Z",
};

describe("profileRepository", () => {
  beforeEach(() => {
    calls.length = 0;
    clientAvailable = true;
    selectResponse = { data: ROW, error: null };
    updateResponse = { data: { ...ROW, display_name: "Bill B" }, error: null };
  });

  it("maps a own-profile row to the typed Profile", () => {
    const profile = mapProfileRow(ROW);
    expect(profile).toEqual({
      id: ROW.id,
      display_name: "Bill",
      preferred_language: "de",
      created_at: ROW.created_at,
      updated_at: ROW.updated_at,
    });
  });

  it("rejects an invalid preferred_language from the database", () => {
    expect(() => mapProfileRow({ ...ROW, preferred_language: "es" })).toThrow();
    expect(isPreferredLanguage("es")).toBe(false);
    expect(isPreferredLanguage("fr")).toBe(true);
  });

  it("loads the own profile filtered by the authenticated user id", async () => {
    const result = await fetchOwnProfile(ROW.id);
    expect(result.error).toBeNull();
    expect(result.profile?.id).toBe(ROW.id);
    expect(calls).toContain("from:profiles");
    expect(calls).toContain("select:eq");
  });

  it("reports a safe error when the profile row is missing", async () => {
    selectResponse = { data: null, error: null };
    const result = await fetchOwnProfile(ROW.id);
    expect(result.profile).toBeNull();
    expect(result.error).toBe("profile.missing");
    expect(calls.some((c) => c.startsWith("update"))).toBe(false);
  });

  it("reports a safe error when the SELECT fails", async () => {
    selectResponse = { data: null, error: { message: "permission denied for relation profiles" } };
    const result = await fetchOwnProfile(ROW.id);
    expect(result.error).toBe("profile.loadFailed");
  });

  it("reports auth.unavailable when Supabase is not configured", async () => {
    clientAvailable = false;
    expect((await fetchOwnProfile(ROW.id)).error).toBe("auth.unavailable");
    expect(
      (await updateOwnProfile(ROW.id, { display_name: "x", preferred_language: "fr" })).error,
    ).toBe("auth.unavailable");
  });

  it("updates only display_name and preferred_language", async () => {
    const result = await updateOwnProfile(ROW.id, {
      display_name: "Bill B",
      preferred_language: "fr",
    });
    expect(result.error).toBeNull();
    expect(result.profile?.display_name).toBe("Bill B");
    expect(calls).toContain("update:display_name,preferred_language");
    expect(calls).toContain("update:eq");
  });

  it("never issues insert / upsert / delete operations", async () => {
    await fetchOwnProfile(ROW.id);
    await updateOwnProfile(ROW.id, { display_name: null, preferred_language: "en" });
    expect(calls.some((c) => /insert|upsert|delete/.test(c))).toBe(false);
  });

  it("returns a safe error when the update fails", async () => {
    updateResponse = { data: null, error: { message: "violates check constraint" } };
    const result = await updateOwnProfile(ROW.id, {
      display_name: "Bill",
      preferred_language: "en",
    });
    expect(result.error).toBe("profile.saveFailed");
  });

  it("rejects invalid input before hitting the network", async () => {
    const tooLong = "x".repeat(101);
    expect(
      (await updateOwnProfile(ROW.id, { display_name: tooLong, preferred_language: "fr" })).error,
    ).toBe("profile.displayNameTooLong");
    expect(
      (
        await updateOwnProfile(ROW.id, {
          display_name: "ok",
          preferred_language: "es" as never,
        })
      ).error,
    ).toBe("profile.invalidLanguage");
    expect(calls.some((c) => c.startsWith("update:"))).toBe(false);
  });

  it("validates and normalises display_name", () => {
    expect(normalizeDisplayName("   ")).toBeNull();
    expect(normalizeDisplayName("  Bill  ")).toBe("Bill");
    expect(validateProfileUpdate({ displayName: "Bill", preferredLanguage: "fr" })).toEqual({});
    expect(
      validateProfileUpdate({ displayName: "x".repeat(101), preferredLanguage: "fr" }),
    ).toEqual({ displayName: "profile.displayNameTooLong" });
    expect(validateProfileUpdate({ displayName: "", preferredLanguage: "es" })).toEqual({
      preferredLanguage: "profile.invalidLanguage",
    });
  });
});
