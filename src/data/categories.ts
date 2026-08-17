/**
 * Stable, language-independent programme category keys.
 * These identifiers are the authoritative category identity for programmes.
 * They must never depend on the display order of translated category arrays.
 */
export type ProgramCategoryKey =
  | "spine-back"
  | "shoulder-arm"
  | "knee-thigh"
  | "hip-pelvis"
  | "ankle-foot"
  | "posture-ergonomics"
  | "full-body-strength"
  | "mobility-flexibility"
  | "special-populations"
  | "bundles-paths";

/** Current visible display order of the categories (unchanged from before). */
export const programCategoryKeys = [
  "spine-back",
  "shoulder-arm",
  "knee-thigh",
  "hip-pelvis",
  "ankle-foot",
  "posture-ergonomics",
  "full-body-strength",
  "mobility-flexibility",
  "special-populations",
  "bundles-paths",
] as const satisfies readonly ProgramCategoryKey[];

export const isProgramCategoryKey = (v: unknown): v is ProgramCategoryKey =>
  typeof v === "string" && (programCategoryKeys as readonly string[]).includes(v);
