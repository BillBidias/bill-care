import { getSupabaseClient } from "@/integrations/supabase/client";
import type { LocalizedText } from "@/data/programs";

export type AssessmentOptionType = "symptom" | "limitation";

export interface AssessmentOption {
  id: string;
  stableKey: string;
  type: AssessmentOptionType;
  sortOrder: number;
  labels: LocalizedText;
  help: Partial<LocalizedText>;
  bodyRegions: string[];
}

export interface ProgrammeSignal {
  optionId: string;
  programmeId: number;
  score: number;
}

export interface Icd10Signal {
  programmeId: number;
  codePrefix: string;
  score: number;
}

export interface SafetyAcknowledgement {
  version: string;
  title: LocalizedText;
  body: LocalizedText;
  checkboxLabel: LocalizedText;
}

export interface AssessmentConfig {
  options: AssessmentOption[];
  programmeSignals: ProgrammeSignal[];
  icd10Signals: Icd10Signal[];
  safetyAcknowledgement: SafetyAcknowledgement | null;
}

const toLocalized = (rows: Array<{ language: string; label: string; help_text?: string | null }>) => {
  const labels = { fr: "", en: "", de: "" } as LocalizedText;
  const help: Partial<LocalizedText> = {};
  for (const row of rows) {
    if (row.language === "fr" || row.language === "en" || row.language === "de") {
      labels[row.language] = row.label;
      if (row.help_text) help[row.language] = row.help_text;
    }
  }
  return { labels, help };
};

/**
 * Reads public M05 configuration only. Patient selections stay transient in the
 * browser and are not persisted by this repository.
 */
export async function fetchAssessmentConfig(): Promise<AssessmentConfig> {
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase is not configured.");

  const [optionsRes, translationsRes, regionsRes, signalsRes, icdRes, warningRes] = await Promise.all([
    client.from("assessment_options").select("id, stable_key, option_type, sort_order").order("sort_order"),
    client.from("assessment_option_translations").select("option_id, language, label, help_text"),
    client.from("assessment_option_body_regions").select("option_id, body_region_key, sort_order"),
    client.from("assessment_option_programmes").select("option_id, programme_id, score"),
    client.from("programme_icd10_matches").select("programme_id, code_prefix, score"),
    client.from("safety_acknowledgement_versions").select("version, title, body, checkbox_label").limit(1),
  ]);

  for (const response of [optionsRes, translationsRes, regionsRes, signalsRes, icdRes, warningRes]) {
    if (response.error) throw new Error(response.error.message);
  }

  const translations = (translationsRes.data ?? []) as Array<{
    option_id: string;
    language: string;
    label: string;
    help_text: string | null;
  }>;
  const regionRows = (regionsRes.data ?? []) as Array<{ option_id: string; body_region_key: string; sort_order: number }>;

  const options: AssessmentOption[] = ((optionsRes.data ?? []) as Array<{
    id: string;
    stable_key: string;
    option_type: AssessmentOptionType;
    sort_order: number;
  }>).map((row) => {
    const localized = toLocalized(translations.filter((t) => t.option_id === row.id));
    return {
      id: row.id,
      stableKey: row.stable_key,
      type: row.option_type,
      sortOrder: row.sort_order,
      labels: localized.labels,
      help: localized.help,
      bodyRegions: regionRows
        .filter((region) => region.option_id === row.id)
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((region) => region.body_region_key),
    };
  });

  const warningRow = (warningRes.data ?? [])[0] as
    | { version: string; title: LocalizedText; body: LocalizedText; checkbox_label: LocalizedText }
    | undefined;

  return {
    options,
    programmeSignals: ((signalsRes.data ?? []) as Array<{ option_id: string; programme_id: number; score: number }>).map(
      (row) => ({ optionId: row.option_id, programmeId: row.programme_id, score: row.score }),
    ),
    icd10Signals: ((icdRes.data ?? []) as Array<{ programme_id: number; code_prefix: string; score: number }>).map((row) => ({
      programmeId: row.programme_id,
      codePrefix: row.code_prefix,
      score: row.score,
    })),
    safetyAcknowledgement: warningRow
      ? {
          version: warningRow.version,
          title: warningRow.title,
          body: warningRow.body,
          checkboxLabel: warningRow.checkbox_label,
        }
      : null,
  };
}

export interface FinderInput {
  selectedBodyRegion: string;
  selectedOptionIds: string[];
  icd10?: string | null;
}

export interface ProgrammeRank {
  programmeId: number;
  score: number;
}

/**
 * Non-diagnostic ranking. It only compares declared region/options and an
 * optional clinician-provided ICD-10 code with preconfigured programme signals.
 */
export function rankProgrammes(input: FinderInput, config: AssessmentConfig): ProgrammeRank[] {
  const selected = new Set(input.selectedOptionIds);
  const totals = new Map<number, number>();

  for (const signal of config.programmeSignals) {
    if (!selected.has(signal.optionId)) continue;
    totals.set(signal.programmeId, (totals.get(signal.programmeId) ?? 0) + signal.score);
  }

  const normalizedIcd = input.icd10?.trim().toUpperCase().replace(/\s+/g, "") || null;
  if (normalizedIcd) {
    for (const signal of config.icd10Signals) {
      if (normalizedIcd.startsWith(signal.codePrefix)) {
        totals.set(signal.programmeId, (totals.get(signal.programmeId) ?? 0) + signal.score);
      }
    }
  }

  return [...totals.entries()]
    .map(([programmeId, score]) => ({ programmeId, score }))
    .sort((a, b) => b.score - a.score || a.programmeId - b.programmeId);
}
