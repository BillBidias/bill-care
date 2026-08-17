import { describe, it, expect } from "vitest";
import { programs, type Program } from "@/data/programs";

describe("programme catalogue data source", () => {
  it("contains exactly 12 programmes", () => {
    expect(programs).toHaveLength(12);
  });

  it("has unique ids", () => {
    const ids = programs.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("keeps numeric prices and ICD-10 values", () => {
    programs.forEach((p: Program) => {
      expect(typeof p.price).toBe("number");
      expect(Number.isFinite(p.price)).toBe(true);
      expect(p.icd10.trim().length).toBeGreaterThan(0);
    });
  });

  it("keeps all required localized fields", () => {
    programs.forEach((p) => {
      expect(typeof p.category).toBe("string");
      expect(p.duration).toBeTruthy();
      expect(p.level).toBeTruthy();
      expect(p.image).toBeTruthy();
      (["fr", "en", "de"] as const).forEach((l) => {
        expect(p.title[l]).toBeTruthy();
        expect(p.region[l]).toBeTruthy();
      });
    });
  });

  it("retains known programme values", () => {
    const knee = programs.find((p) => p.id === 7)!;
    expect(knee.price).toBe(69);
    expect(knee.category).toBe("knee-thigh");
    expect(knee.icd10).toBe("M17 · M22 · M23 · M71 · M76");
    expect(knee.image).toBe("🦵");
    expect(knee.duration).toBe("12 sem.");
    expect(knee.level).toBe("Avancé");
    const first = programs[0];
    expect(first.id).toBe(1);
    expect(first.region.de).toBe("Kopf & Hals");
  });
});
