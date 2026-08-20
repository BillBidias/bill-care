import { afterEach, describe, expect, it, vi } from "vitest";
import {
  centsToEuros,
  fetchCatalogue,
  mapCategoryRows,
  mapProgrammeRow,
  mapProgrammeRows,
} from "@/data/catalogueRepository";
import { programs as localPrograms } from "@/data/programs";
import { programCategoryKeys } from "@/data/categories";

vi.mock("@/integrations/supabase/client", () => ({
  getSupabaseClient: vi.fn(),
}));

import { getSupabaseClient } from "@/integrations/supabase/client";
const mockedGetClient = vi.mocked(getSupabaseClient);

const dbRow = {
  id: 7,
  category_key: "knee-thigh",
  region: { fr: "Genou & cuisse", en: "Knee & thigh", de: "Knie & Oberschenkel" },
  title: { fr: "Gonarthrose", en: "Knee OA", de: "Gonarthrose" },
  price_amount: 6900,
  duration: "12 sem.",
  level: "Avancé",
  image: "🦵",
  icd10: "M17 · M22",
};

const makeClient = (categories: unknown, programmes: unknown, error: unknown = null) => ({
  from: (table: string) => ({
    select: () => ({
      order: () =>
        Promise.resolve({
          data: table === "programmes" ? programmes : categories,
          error,
        }),
    }),
  }),
});

const dbCategories = programCategoryKeys.map((key, i) => ({ key, sort_order: i, is_active: true }));
const dbProgrammes = localPrograms.map((p) => ({
  id: p.id,
  category_key: p.category,
  region: p.region,
  title: p.title,
  price_amount: Math.round(p.price * 100),
  duration: p.duration,
  level: p.level,
  image: p.image,
  icd10: p.icd10,
}));

afterEach(() => {
  vi.restoreAllMocks();
  mockedGetClient.mockReset();
});

describe("catalogue mapping", () => {
  it("converts cents to euro prices", () => {
    expect(centsToEuros(6900)).toBe(69);
    expect(centsToEuros(4499)).toBe(44.99);
  });

  it("maps a database row into the frontend Programme shape", () => {
    const mapped = mapProgrammeRow(dbRow);
    expect(mapped).toEqual({
      id: 7,
      category: "knee-thigh",
      region: dbRow.region,
      title: dbRow.title,
      price: 69,
      duration: "12 sem.",
      level: "Avancé",
      image: "🦵",
      icd10: "M17 · M22",
    });
  });

  it("preserves LocalizedText for region and title", () => {
    const mapped = mapProgrammeRow(dbRow);
    (["fr", "en", "de"] as const).forEach((l) => {
      expect(mapped.title[l]).toBe(dbRow.title[l]);
      expect(mapped.region[l]).toBe(dbRow.region[l]);
    });
  });

  it("rejects unknown category keys and invalid localized fields", () => {
    expect(() => mapProgrammeRow({ ...dbRow, category_key: "nope" })).toThrow(/category key/);
    expect(() => mapProgrammeRow({ ...dbRow, title: { fr: "x" } })).toThrow(/localized/);
  });

  it("orders categories by sort_order and keeps stable keys", () => {
    const keys = mapCategoryRows([
      { key: "knee-thigh", sort_order: 2 },
      { key: "spine-back", sort_order: 0 },
      { key: "shoulder-arm", sort_order: 1 },
    ]);
    expect(keys).toEqual(["spine-back", "shoulder-arm", "knee-thigh"]);
  });

  it("sorts programmes by id", () => {
    const mapped = mapProgrammeRows([{ ...dbRow, id: 9 }, dbRow]);
    expect(mapped.map((p) => p.id)).toEqual([7, 9]);
  });
});

describe("catalogue fetching", () => {
  it("falls back to local data when Supabase is not configured", async () => {
    mockedGetClient.mockReturnValue(null);
    const result = await fetchCatalogue();
    expect(result.source).toBe("local-fallback");
    expect(result.fallbackReason).toMatch(/not configured/);
    expect(result.programs).toHaveLength(localPrograms.length);
  });

  it("falls back and reports the reason when the query fails", async () => {
    mockedGetClient.mockReturnValue(
      makeClient(null, null, { message: "permission denied" }) as never,
    );
    const result = await fetchCatalogue();
    expect(result.source).toBe("local-fallback");
    expect(result.fallbackReason).toMatch(/permission denied/);
  });

  it("falls back when the returned catalogue is incomplete", async () => {
    mockedGetClient.mockReturnValue(makeClient(dbCategories, dbProgrammes.slice(0, 3)) as never);
    const result = await fetchCatalogue();
    expect(result.source).toBe("local-fallback");
    expect(result.fallbackReason).toMatch(/Incomplete programme parity/);
  });

  it("loads the catalogue from Supabase with full parity", async () => {
    mockedGetClient.mockReturnValue(makeClient(dbCategories, dbProgrammes) as never);
    const result = await fetchCatalogue();
    expect(result.source).toBe("supabase");
    expect(result.fallbackReason).toBeNull();
    expect(result.categoryKeys).toEqual([...programCategoryKeys]);
    expect(result.programs).toHaveLength(12);
    expect(result.programs.map((p) => p.id)).toEqual(localPrograms.map((p) => p.id));
    expect(result.programs.map((p) => p.price)).toEqual(localPrograms.map((p) => p.price));
  });
});
