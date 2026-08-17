import { describe, it, expect } from "vitest";
import { programs } from "@/data/programs";
import { programCategoryKeys, isProgramCategoryKey, type ProgramCategoryKey } from "@/data/categories";
import { getCategoryLabel, translations } from "@/lib/i18n";

describe("stable programme category keys", () => {
  it("keeps 12 programmes with unique ids", () => {
    expect(programs).toHaveLength(12);
    expect(new Set(programs.map((p) => p.id)).size).toBe(12);
  });

  it("uses only stable semantic category keys (no numeric positions)", () => {
    programs.forEach((p) => {
      expect(typeof p.category).toBe("string");
      expect(isProgramCategoryKey(p.category)).toBe(true);
      expect("cat" in p).toBe(false);
    });
  });

  it("resolves every used category key in FR / EN / DE", () => {
    const used = new Set(programs.map((p) => p.category));
    used.forEach((key) => {
      const label = getCategoryLabel(key);
      (["fr", "en", "de"] as const).forEach((l) => expect(label[l]).toBeTruthy());
    });
  });

  it("keeps the category display order unchanged", () => {
    expect(translations.categories.items.map((c) => c.key)).toEqual([...programCategoryKeys]);
  });

  it("keeps category identity independent from display ordering", () => {
    const reordered = [...translations.categories.items].reverse();
    programs.forEach((p) => {
      const viaReordered = reordered.find((c) => c.key === p.category)!;
      expect(viaReordered.name).toEqual(getCategoryLabel(p.category));
    });
  });

  it("filters by stable key like the UI does", () => {
    const filter = (k: ProgramCategoryKey) => programs.filter((p) => p.category === k).map((p) => p.id);
    expect(filter("spine-back")).toEqual([1, 2, 9]);
    expect(filter("shoulder-arm")).toEqual([3, 4, 5]);
    expect(filter("knee-thigh")).toEqual([7]);
    expect(filter("hip-pelvis")).toEqual([6]);
    expect(filter("ankle-foot")).toEqual([8]);
    expect(filter("mobility-flexibility")).toEqual([10, 11]);
    expect(filter("special-populations")).toEqual([12]);
    expect(filter("posture-ergonomics")).toEqual([]);
    expect(filter("full-body-strength")).toEqual([]);
    expect(filter("bundles-paths")).toEqual([]);
  });

  it("preserves prices and ICD-10 values", () => {
    const knee = programs.find((p) => p.id === 7)!;
    expect(knee.price).toBe(69);
    expect(knee.icd10).toBe("M17 · M22 · M23 · M71 · M76");
    expect(knee.category).toBe("knee-thigh");
  });
});
