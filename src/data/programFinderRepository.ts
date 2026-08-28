import { getSupabaseClient } from "@/integrations/supabase/client";
import type { LocalizedText } from "@/data/programs";

export type FinderRiskLevel = "green" | "amber" | "red";
export type FinderOptionType = "symptom" | "limitation";

export type FinderBodyRegion = {
  key: string;
  label: LocalizedText;
  sortOrder: number;
};

export type FinderGoal = {
  key: string;
  label: LocalizedText;
  sortOrder: number;
};

export type FinderOption = {
  id: string;
  stableKey: string;
  optionType: FinderOptionType;
  sortOrder: number;
  label: LocalizedText;
  helpText: Partial<LocalizedText>;
  bodyRegions: string[];
  programmeScores: Array<{ programmeId: number; score: number }>;
};

export type FinderSafetyQuestion = {
  id: string;
  stableKey: string;
  riskIfYes: FinderRiskLevel;
  riskIfNo: FinderRiskLevel;
  isGlobal: boolean;
  sortOrder: number;
  question: LocalizedText;
  helpText: Partial<LocalizedText>;
  bodyRegions: string[];
};

export type FinderSafetyOutcome = {
  level: FinderRiskLevel;
  allowsRecommendations: boolean;
  requiresAcknowledgement: boolean;
  requiresProfessionalReview: boolean;
  blocksProgrammeStart: boolean;
  title: LocalizedText;
  body: LocalizedText;
};

export type FinderAcknowledgement = {
  version: string;
  title: LocalizedText;
  body: LocalizedText;
  checkboxLabel: LocalizedText;
};

export type RecommendationPolicy = {
  version: string;
  maxResults: number;
  minScore: number;
  primaryBodyRegionWeight: number;
  secondaryBodyRegionWeight: number;
  goalWeight: number;
  assessmentSignalMultiplier: number;
  icd10SignalMultiplier: number;
};

export type ProgramFinderConfig = {
  bodyRegions: FinderBodyRegion[];
  goals: FinderGoal[];
  options: FinderOption[];
  safetyQuestions: FinderSafetyQuestion[];
  safetyOutcomes: FinderSafetyOutcome[];
  acknowledgement: FinderAcknowledgement;
  recommendationPolicy: RecommendationPolicy;
  programmeBodyRegions: Array<{ programmeId: number; bodyRegionKey: string; isPrimary: boolean }>;
  programmeGoals: Array<{ programmeId: number; goalKey: string }>;
  icd10Matches: Array<{ programmeId: number; codePrefix: string; score: number }>;
};

export type FinderRecommendation = {
  programmeId: number;
  score: number;
  matchedOptionCount: number;
  matchedGoal: boolean;
  matchedIcd10: boolean;
};

type Row = Record<string, unknown>;

function requireLocalized(value: unknown, label: string): LocalizedText {
  if (!value || typeof value !== "object") throw new Error(`invalid_${label}`);
  const row = value as Record<string, unknown>;
  if (typeof row.fr !== "string" || typeof row.en !== "string" || typeof row.de !== "string") {
    throw new Error(`invalid_${label}`);
  }
  return { fr: row.fr, en: row.en, de: row.de };
}

function optionalLocalizedRows(
  rows: Row[],
  idKey: string,
  valueKey: string,
): Map<string, Partial<LocalizedText>> {
  const out = new Map<string, Partial<LocalizedText>>();
  for (const row of rows) {
    const id = String(row[idKey] ?? "");
    const language = String(row.language ?? "") as keyof LocalizedText;
    const value = row[valueKey];
    if (!id || !["fr", "en", "de"].includes(language) || typeof value !== "string") continue;
    out.set(id, { ...(out.get(id) ?? {}), [language]: value });
  }
  return out;
}

function requiredLocalizedRows(rows: Row[], idKey: string, valueKey: string): Map<string, LocalizedText> {
  const partial = optionalLocalizedRows(rows, idKey, valueKey);
  const out = new Map<string, LocalizedText>();
  for (const [id, value] of partial.entries()) {
    if (typeof value.fr === "string" && typeof value.en === "string" && typeof value.de === "string") {
      out.set(id, { fr: value.fr, en: value.en, de: value.de });
    }
  }
  return out;
}

export async function loadProgramFinderConfig(): Promise<ProgramFinderConfig> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("supabase_not_configured");

  const [
    bodyRegionsRes,
    goalsRes,
    optionsRes,
    optionTranslationsRes,
    optionRegionRes,
    optionProgrammeRes,
    programmeRegionsRes,
    programmeGoalsRes,
    icd10Res,
    safetyQuestionsRes,
    safetyTranslationsRes,
    safetyRegionRes,
    safetyOutcomesRes,
    acknowledgementRes,
    policyRes,
  ] = await Promise.all([
    supabase.from("body_regions").select("key,label,sort_order").eq("is_active", true).order("sort_order"),
    supabase.from("goals").select("key,label,sort_order").eq("is_active", true).order("sort_order"),
    supabase.from("assessment_options").select("id,stable_key,option_type,sort_order").eq("is_active", true).order("sort_order"),
    supabase.from("assessment_option_translations").select("option_id,language,label,help_text"),
    supabase.from("assessment_option_body_regions").select("option_id,body_region_key,sort_order"),
    supabase.from("assessment_option_programmes").select("option_id,programme_id,score"),
    supabase.from("programme_body_regions").select("programme_id,body_region_key,is_primary"),
    supabase.from("programme_goals").select("programme_id,goal_key"),
    supabase.from("programme_icd10_matches").select("programme_id,code_prefix,score"),
    supabase.from("safety_questions").select("id,stable_key,risk_if_yes,risk_if_no,is_global,sort_order").eq("is_active", true).order("sort_order"),
    supabase.from("safety_question_translations").select("question_id,language,question,help_text"),
    supabase.from("safety_question_body_regions").select("question_id,body_region_key"),
    supabase.from("safety_outcomes").select("level,allows_recommendations,requires_acknowledgement,requires_professional_review,blocks_programme_start,title,body"),
    supabase.from("safety_acknowledgement_versions").select("version,title,body,checkbox_label").eq("is_active", true).limit(1),
    supabase.from("recommendation_engine_versions").select("version,max_results,min_score,primary_body_region_weight,secondary_body_region_weight,goal_weight,assessment_signal_multiplier,icd10_signal_multiplier").eq("is_active", true).limit(1),
  ]);

  const responses = [
    bodyRegionsRes,
    goalsRes,
    optionsRes,
    optionTranslationsRes,
    optionRegionRes,
    optionProgrammeRes,
    programmeRegionsRes,
    programmeGoalsRes,
    icd10Res,
    safetyQuestionsRes,
    safetyTranslationsRes,
    safetyRegionRes,
    safetyOutcomesRes,
    acknowledgementRes,
    policyRes,
  ];
  const failed = responses.find((response) => response.error);
  if (failed?.error) throw failed.error;

  const optionRows = (optionsRes.data ?? []) as Row[];
  const optionTranslationRows = (optionTranslationsRes.data ?? []) as Row[];
  const optionLabels = requiredLocalizedRows(optionTranslationRows, "option_id", "label");
  const optionHelp = optionalLocalizedRows(optionTranslationRows, "option_id", "help_text");
  const optionRegions = new Map<string, string[]>();
  for (const row of (optionRegionRes.data ?? []) as Row[]) {
    const id = String(row.option_id ?? "");
    const region = String(row.body_region_key ?? "");
    if (!id || !region) continue;
    optionRegions.set(id, [...(optionRegions.get(id) ?? []), region]);
  }
  const optionProgrammeScores = new Map<string, Array<{ programmeId: number; score: number }>>();
  for (const row of (optionProgrammeRes.data ?? []) as Row[]) {
    const id = String(row.option_id ?? "");
    const programmeId = Number(row.programme_id);
    const score = Number(row.score);
    if (!id || !Number.isInteger(programmeId) || !Number.isFinite(score)) continue;
    optionProgrammeScores.set(id, [...(optionProgrammeScores.get(id) ?? []), { programmeId, score }]);
  }

  const options: FinderOption[] = optionRows.map((row) => {
    const id = String(row.id ?? "");
    const label = optionLabels.get(id);
    if (!id || !label) throw new Error("incomplete_assessment_translation");
    return {
      id,
      stableKey: String(row.stable_key ?? ""),
      optionType: String(row.option_type ?? "symptom") as FinderOptionType,
      sortOrder: Number(row.sort_order ?? 0),
      label,
      helpText: optionHelp.get(id) ?? {},
      bodyRegions: optionRegions.get(id) ?? [],
      programmeScores: optionProgrammeScores.get(id) ?? [],
    };
  });

  const safetyRows = (safetyQuestionsRes.data ?? []) as Row[];
  const safetyTranslationRows = (safetyTranslationsRes.data ?? []) as Row[];
  const safetyLabels = requiredLocalizedRows(safetyTranslationRows, "question_id", "question");
  const safetyHelp = optionalLocalizedRows(safetyTranslationRows, "question_id", "help_text");
  const safetyRegions = new Map<string, string[]>();
  for (const row of (safetyRegionRes.data ?? []) as Row[]) {
    const id = String(row.question_id ?? "");
    const region = String(row.body_region_key ?? "");
    if (!id || !region) continue;
    safetyRegions.set(id, [...(safetyRegions.get(id) ?? []), region]);
  }

  const safetyQuestions: FinderSafetyQuestion[] = safetyRows.map((row) => {
    const id = String(row.id ?? "");
    const question = safetyLabels.get(id);
    if (!id || !question) throw new Error("incomplete_safety_translation");
    return {
      id,
      stableKey: String(row.stable_key ?? ""),
      riskIfYes: String(row.risk_if_yes ?? "green") as FinderRiskLevel,
      riskIfNo: String(row.risk_if_no ?? "green") as FinderRiskLevel,
      isGlobal: Boolean(row.is_global),
      sortOrder: Number(row.sort_order ?? 0),
      question,
      helpText: safetyHelp.get(id) ?? {},
      bodyRegions: safetyRegions.get(id) ?? [],
    };
  });

  const acknowledgementRow = ((acknowledgementRes.data ?? []) as Row[])[0];
  const policyRow = ((policyRes.data ?? []) as Row[])[0];
  if (!acknowledgementRow || !policyRow) throw new Error("finder_policy_not_active");

  return {
    bodyRegions: ((bodyRegionsRes.data ?? []) as Row[]).map((row) => ({
      key: String(row.key ?? ""),
      label: requireLocalized(row.label, "body_region_label"),
      sortOrder: Number(row.sort_order ?? 0),
    })),
    goals: ((goalsRes.data ?? []) as Row[]).map((row) => ({
      key: String(row.key ?? ""),
      label: requireLocalized(row.label, "goal_label"),
      sortOrder: Number(row.sort_order ?? 0),
    })),
    options,
    safetyQuestions,
    safetyOutcomes: ((safetyOutcomesRes.data ?? []) as Row[]).map((row) => ({
      level: String(row.level ?? "green") as FinderRiskLevel,
      allowsRecommendations: Boolean(row.allows_recommendations),
      requiresAcknowledgement: Boolean(row.requires_acknowledgement),
      requiresProfessionalReview: Boolean(row.requires_professional_review),
      blocksProgrammeStart: Boolean(row.blocks_programme_start),
      title: requireLocalized(row.title, "safety_outcome_title"),
      body: requireLocalized(row.body, "safety_outcome_body"),
    })),
    acknowledgement: {
      version: String(acknowledgementRow.version ?? ""),
      title: requireLocalized(acknowledgementRow.title, "acknowledgement_title"),
      body: requireLocalized(acknowledgementRow.body, "acknowledgement_body"),
      checkboxLabel: requireLocalized(acknowledgementRow.checkbox_label, "acknowledgement_checkbox"),
    },
    recommendationPolicy: {
      version: String(policyRow.version ?? ""),
      maxResults: Number(policyRow.max_results ?? 3),
      minScore: Number(policyRow.min_score ?? 8),
      primaryBodyRegionWeight: Number(policyRow.primary_body_region_weight ?? 10),
      secondaryBodyRegionWeight: Number(policyRow.secondary_body_region_weight ?? 6),
      goalWeight: Number(policyRow.goal_weight ?? 5),
      assessmentSignalMultiplier: Number(policyRow.assessment_signal_multiplier ?? 1),
      icd10SignalMultiplier: Number(policyRow.icd10_signal_multiplier ?? 1),
    },
    programmeBodyRegions: ((programmeRegionsRes.data ?? []) as Row[]).map((row) => ({
      programmeId: Number(row.programme_id),
      bodyRegionKey: String(row.body_region_key ?? ""),
      isPrimary: Boolean(row.is_primary),
    })),
    programmeGoals: ((programmeGoalsRes.data ?? []) as Row[]).map((row) => ({
      programmeId: Number(row.programme_id),
      goalKey: String(row.goal_key ?? ""),
    })),
    icd10Matches: ((icd10Res.data ?? []) as Row[]).map((row) => ({
      programmeId: Number(row.programme_id),
      codePrefix: String(row.code_prefix ?? "").toUpperCase(),
      score: Number(row.score),
    })),
  };
}

export function getApplicableSafetyQuestions(config: ProgramFinderConfig, bodyRegionKey: string): FinderSafetyQuestion[] {
  return config.safetyQuestions.filter(
    (question) => question.isGlobal || question.bodyRegions.includes(bodyRegionKey),
  );
}

export function evaluateSafety(
  config: ProgramFinderConfig,
  bodyRegionKey: string,
  answers: Record<string, boolean>,
): FinderSafetyOutcome {
  const severity: Record<FinderRiskLevel, number> = { green: 0, amber: 1, red: 2 };
  let level: FinderRiskLevel = "green";
  const applicable = getApplicableSafetyQuestions(config, bodyRegionKey);

  for (const question of applicable) {
    if (typeof answers[question.stableKey] !== "boolean") throw new Error("missing_safety_answer");
    const answerLevel = answers[question.stableKey] ? question.riskIfYes : question.riskIfNo;
    if (severity[answerLevel] > severity[level]) level = answerLevel;
    if (level === "red") break;
  }

  const outcome = config.safetyOutcomes.find((item) => item.level === level);
  if (!outcome) throw new Error("missing_safety_outcome");
  return outcome;
}

export function normalizeIcd10(value: string): string {
  return value.trim().toUpperCase().replace(/\s+/g, "").replace(",", ".");
}

export function isPlausibleIcd10(value: string): boolean {
  if (!value.trim()) return true;
  return /^[A-Z][0-9]{2}(?:\.[0-9A-Z]{1,4})?$/.test(normalizeIcd10(value));
}

export function rankProgrammes(
  config: ProgramFinderConfig,
  input: {
    bodyRegionKey: string;
    selectedOptionIds: string[];
    goalKey: string;
    icd10?: string;
  },
): FinderRecommendation[] {
  const policy = config.recommendationPolicy;
  const scores = new Map<number, FinderRecommendation>();

  const ensure = (programmeId: number) => {
    const existing = scores.get(programmeId);
    if (existing) return existing;
    const created: FinderRecommendation = {
      programmeId,
      score: 0,
      matchedOptionCount: 0,
      matchedGoal: false,
      matchedIcd10: false,
    };
    scores.set(programmeId, created);
    return created;
  };

  for (const relation of config.programmeBodyRegions) {
    if (relation.bodyRegionKey !== input.bodyRegionKey) continue;
    const recommendation = ensure(relation.programmeId);
    recommendation.score += relation.isPrimary
      ? policy.primaryBodyRegionWeight
      : policy.secondaryBodyRegionWeight;
  }

  const selectedOptions = config.options.filter((option) => input.selectedOptionIds.includes(option.id));
  for (const option of selectedOptions) {
    for (const signal of option.programmeScores) {
      const recommendation = ensure(signal.programmeId);
      recommendation.score += signal.score * policy.assessmentSignalMultiplier;
      recommendation.matchedOptionCount += 1;
    }
  }

  if (input.goalKey) {
    for (const relation of config.programmeGoals) {
      if (relation.goalKey !== input.goalKey) continue;
      const recommendation = ensure(relation.programmeId);
      recommendation.score += policy.goalWeight;
      recommendation.matchedGoal = true;
    }
  }

  const icd10 = normalizeIcd10(input.icd10 ?? "");
  if (icd10) {
    const bestByProgramme = new Map<number, number>();
    for (const match of config.icd10Matches) {
      if (!icd10.startsWith(match.codePrefix)) continue;
      bestByProgramme.set(match.programmeId, Math.max(bestByProgramme.get(match.programmeId) ?? 0, match.score));
    }
    for (const [programmeId, score] of bestByProgramme.entries()) {
      const recommendation = ensure(programmeId);
      recommendation.score += score * policy.icd10SignalMultiplier;
      recommendation.matchedIcd10 = true;
    }
  }

  return [...scores.values()]
    .filter((item) => item.score >= policy.minScore)
    .sort((a, b) => b.score - a.score || a.programmeId - b.programmeId)
    .slice(0, policy.maxResults);
}
