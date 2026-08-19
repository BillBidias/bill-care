import { beforeEach, describe, expect, it, vi } from "vitest";
import { isSupabaseConfigured, parseSupabaseConfig } from "@/integrations/supabase/config";
import { getSupabaseClient, resetSupabaseClient } from "@/integrations/supabase/client";

const valid = {
  VITE_SUPABASE_URL: "https://example.supabase.co",
  VITE_SUPABASE_PUBLISHABLE_KEY: "public-anon-key",
};

describe("supabase public configuration", () => {
  it("returns null when nothing is configured", () => {
    expect(parseSupabaseConfig({})).toBeNull();
    expect(isSupabaseConfigured({})).toBe(false);
  });

  it("parses valid public configuration", () => {
    expect(parseSupabaseConfig(valid)).toEqual({ url: valid.VITE_SUPABASE_URL, publishableKey: "public-anon-key" });
  });

  it("fails clearly on partial configuration", () => {
    expect(() => parseSupabaseConfig({ VITE_SUPABASE_URL: valid.VITE_SUPABASE_URL })).toThrow(/Incomplete/);
  });

  it("rejects an invalid url", () => {
    expect(() => parseSupabaseConfig({ ...valid, VITE_SUPABASE_URL: "example.supabase.co" })).toThrow(/Invalid/);
  });

  it("rejects server-only secrets exposed to the browser", () => {
    expect(() => parseSupabaseConfig({ ...valid, VITE_SUPABASE_SERVICE_ROLE_KEY: "nope" })).toThrow(/Server-only/);
  });
});

describe("supabase browser client", () => {
  beforeEach(() => {
    resetSupabaseClient();
  });

  it("returns null when not configured", () => {
    vi.stubEnv("VITE_SUPABASE_URL", "");
    vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", "");
    expect(getSupabaseClient()).toBeNull();
  });

  it("exposes a configured client when env is set", () => {
    vi.stubEnv("VITE_SUPABASE_URL", valid.VITE_SUPABASE_URL);
    vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", valid.VITE_SUPABASE_PUBLISHABLE_KEY);
    const client = getSupabaseClient();
    expect(client).not.toBeNull();
    expect(client?.auth).toBeTruthy();
  });

  it("caches the client across calls", () => {
    vi.stubEnv("VITE_SUPABASE_URL", valid.VITE_SUPABASE_URL);
    vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", valid.VITE_SUPABASE_PUBLISHABLE_KEY);
    const first = getSupabaseClient();
    const second = getSupabaseClient();
    expect(first).toBe(second);
  });
});
