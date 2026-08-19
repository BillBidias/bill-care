import { describe, expect, it } from "vitest";
import { isSupabaseConfigured, parseSupabaseConfig } from "@/integrations/supabase/config";
import { supabase } from "@/integrations/supabase/client";

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
  it("exposes a configured singleton client", () => {
    expect(supabase).toBeTruthy();
    expect(supabase.auth).toBeTruthy();
  });
});
