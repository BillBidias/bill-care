/**
 * P08 — Catalogue data access layer (READ ONLY).
 *
 * Single place where the programme catalogue is read from Supabase and mapped
 * back to the existing frontend contracts (`Program`, `ProgramCategoryKey`).
 * UI components must never query Supabase directly.
 *
 * Safety: if Supabase is unconfigured, unreachable, returns invalid rows, or
 * returns an obviously incomplete catalogue, we fall back to the local typed
 * catalogue (src/data/programs.ts) WITHOUT hiding the reason.
 */
import { getSupabaseClient } from "@/integrations/supabase/client";
import { programs as localPrograms, type LocalizedText, type Program } from "@/data/programs";
import { isProgramCategoryKey, programCategoryKeys, type ProgramCategoryKey } from "@/data/categories";

export type CatalogueSource = "supabase" | "local-fallback";

export interface CatalogueResult {
  source: CatalogueSource;
  categoryKeys: ProgramCategoryKey[];
  programs: Program[];
  /** Non-null whenever the local fallback was used. Never silently swallowed. */
  fallbackReason: string | null;
}

/** Minimum parity expected for this DEV cutover. */
export const EXPECTED_MIN_CATEGORIES = programCategoryKeys.length;
export const EXPECTED_MIN_PROGRAMMES = localPrograms.length;

export interface CategoryRow {
  key: unknown;
  sort_order: unknown;
  is_active?: unknown;
}

export interface ProgrammeRow {
  id: unknown;
  category_key: unknown;
  region: unknown;
  title: unknown;
  price_amount: unknown;
  duration: unknown;
  level: unknown;
  image: unknown;
  icd10: unknown;
}

const isLocalizedText = (value: unknown): value is LocalizedText => {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v.fr === "string" && typeof v.en === "string" && typeof v.de === "string";
};

const toLocalizedText = (value: unknown): LocalizedText => {
  if (!isLocalizedText(value)) throw new Error("Invalid localized field: expected { fr, en, de } strings.");
  return { fr: value.fr, en: value.en, de: value.de };
};

/** Integer minor units (cents) → frontend euro number. */
export const centsToEuros = (amount: number): number => Math.round(amount) / 100;

export function mapCategoryRows(rows: readonly CategoryRow[]): ProgramCategoryKey[] {
  const sorted = [...rows].sort((a, b) => Number(a.sort_order) - Number(b.sort_order));
  return sorted.map((row) => {
    if (!isProgramCategoryKey(row.key)) throw new Error(`Unknown category key from database: ${String(row.key)}`);
    return row.key;
  });
}

export function mapProgrammeRow(row: ProgrammeRow): Program {
  const id = Number(row.id);
  if (!Number.isInteger(id) || id <= 0) throw new Error(`Invalid programme id: ${String(row.id)}`);
  if (!isProgramCategoryKey(row.category_key)) {
    throw new Error(`Unknown programme category key: ${String(row.category_key)}`);
  }
  const price = Number(row.price_amount);
  if (!Number.isFinite(price) || price < 0) throw new Error(`Invalid price_amount for programme ${id}`);
  const strings = { duration: row.duration, level: row.level, image: row.image, icd10: row.icd10 };
  for (const [field, value] of Object.entries(strings)) {
    if (typeof value !== "string" || value.length === 0) {
      throw new Error(`Invalid ${field} for programme ${id}`);
    }
  }

  return {
    id,
    category: row.category_key,
    region: toLocalizedText(row.region),
    title: toLocalizedText(row.title),
    price: centsToEuros(price),
    duration: strings.duration as string,
    level: strings.level as string,
    image: strings.image as string,
    icd10: strings.icd10 as string,
  };
}

export function mapProgrammeRows(rows: readonly ProgrammeRow[]): Program[] {
  return rows.map(mapProgrammeRow).sort((a, b) => a.id - b.id);
}

export const localCatalogue = (fallbackReason: string): CatalogueResult => ({
  source: "local-fallback",
  categoryKeys: [...programCategoryKeys],
  programs: localPrograms,
  fallbackReason,
});

/**
 * Reads the catalogue. Always resolves — never throws — but always reports why
 * the fallback was used when Supabase could not serve the catalogue.
 */
export async function fetchCatalogue(): Promise<CatalogueResult> {
  let client: ReturnType<typeof getSupabaseClient>;
  try {
    client = getSupabaseClient();
  } catch (error) {
    return localCatalogue(`Supabase client initialisation failed: ${(error as Error).message}`);
  }
  if (!client) return localCatalogue("Supabase is not configured (no public URL / publishable key).");

  try {
    const [categoriesResponse, programmesResponse] = await Promise.all([
      client.from("programme_categories").select("key, sort_order, is_active").order("sort_order", { ascending: true }),
      client
        .from("programmes")
        .select("id, category_key, region, title, price_amount, duration, level, image, icd10")
        .order("id", { ascending: true }),
    ]);

    if (categoriesResponse.error) {
      return localCatalogue(`Category query failed: ${categoriesResponse.error.message}`);
    }
    if (programmesResponse.error) {
      return localCatalogue(`Programme query failed: ${programmesResponse.error.message}`);
    }

    const categoryRows = (categoriesResponse.data ?? []) as CategoryRow[];
    const programmeRows = (programmesResponse.data ?? []) as ProgrammeRow[];

    if (categoryRows.length < EXPECTED_MIN_CATEGORIES) {
      return localCatalogue(
        `Incomplete category parity: ${categoryRows.length} rows, expected at least ${EXPECTED_MIN_CATEGORIES}.`,
      );
    }
    if (programmeRows.length < EXPECTED_MIN_PROGRAMMES) {
      return localCatalogue(
        `Incomplete programme parity: ${programmeRows.length} rows, expected at least ${EXPECTED_MIN_PROGRAMMES}.`,
      );
    }

    const categoryKeys = mapCategoryRows(categoryRows);
    const programs = mapProgrammeRows(programmeRows);

    return { source: "supabase", categoryKeys, programs, fallbackReason: null };
  } catch (error) {
    return localCatalogue(`Catalogue read failed: ${(error as Error).message}`);
  }
}
