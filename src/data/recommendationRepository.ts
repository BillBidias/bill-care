import { getSupabaseClient } from "@/integrations/supabase/client";
import type { AssessmentConfig } from "@/data/assessmentRepository";
import type { SafetyEvaluation, SafetyLevel } from "@/data/safetyRepository";

export interface RecommendationPolicy {
  version: string;
  maxResults: number;
  minScore: number;
  primaryBodyRegionWeight: number;
  secondaryBodyRegionWeight: number;
  goalWeight: number;
  contextWeight: number;
  assessmentSignalMultiplier: number;
  icd10SignalMultiplier: number;
}

export interface DiscoveryProgramme {
  id: number;
  bodyRegions: Array<{ key: string; isPrimary: boolean }>;
  goals: Array<{ key: string }>;
  contexts: Array<{ key: string }>;
}

export interface RecommendationInput {
  selectedBodyRegions: string[];
  selectedAssessmentOptionIds: string[];
  selectedGoalKeys?: string[];
  selectedContextKeys?: string[];
  icd10?: string | null;
}

export type RecommendationReasonType =
  | "body-region"
  | "assessment"
  | "goal"
  | "context"
  | "icd10";

export interface RecommendationReason {
  type: RecommendationReasonType;
  score: number;
  key: string;
}

export interface ProgrammeRecommendation {
  programmeId: number;
  score: number;
  reasons: RecommendationReason[];
}

export interface RecommendationResult {
  safetyLevel: SafetyLevel;
  blocked: boolean;
  requiresProfessionalReview: boolean;
  recommendations: ProgrammeRecommendation[];
}

export async function fetchRecommendationPolicy(): Promise<RecommendationPolicy> {
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase is not configured.");

  const { data, error } = await client
    .from("recommendation_engine_versions")
    .select(
      "version, max_results, min_score, primary_body_region_weight, secondary_body_region_weight, goal_weight, context_weight, assessment_signal_multiplier, icd10_signal_multiplier",
    )
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("No active recommendation engine policy found.");

  return {
    version: String(data.version),
    maxResults: Number(data.max_results),
    minScore: Number(data.min_score),
    primaryBodyRegionWeight: Number(data.primary_body_region_weight),
    secondaryBodyRegionWeight: Number(data.secondary_body_region_weight),
    goalWeight: Number(data.goal_weight),
    contextWeight: Number(data.context_weight),
    assessmentSignalMultiplier: Number(data.assessment_signal_multiplier),
    icd10SignalMultiplier: Number(data.icd10_signal_multiplier),
  };
}

export async function fetchDiscoveryProgrammes(): Promise<DiscoveryProgramme[]> {
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase is not configured.");

  const { data, error } = await client
    .from("programme_discovery")
    .select("id, body_regions, goals, contexts")
    .order("id", { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: Number(row.id),
    bodyRegions: Array.isArray(row.body_regions)
      ? row.body_regions.map((item: any) => ({ key: String(item.key), isPrimary: Boolean(item.is_primary) }))
      : [],
    goals: Array.isArray(row.goals) ? row.goals.map((item: any) => ({ key: String(item.key) })) : [],
    contexts: Array.isArray(row.contexts) ? row.contexts.map((item: any) => ({ key: String(item.key) })) : [],
  }));
}

const addReason = (
  totals: Map<number, { score: number; reasons: RecommendationReason[] }>,
  programmeId: number,
  reason: RecommendationReason,
) => {
  const current = totals.get(programmeId) ?? { score: 0, reasons: [] };
  current.score += reason.score;
  current.reasons.push(reason);
  totals.set(programmeId, current);
};

/**
 * M07 non-diagnostic recommendation engine.
 * Safety is authoritative: RED returns zero recommendations. AMBER may show
 * matches but keeps programme start blocked until professional review.
 * Patient answers are inputs only and are not persisted here.
 */
export function recommendProgrammes(
  input: RecommendationInput,
  assessmentConfig: AssessmentConfig,
  safety: SafetyEvaluation,
  policy: RecommendationPolicy,
  programmes: readonly DiscoveryProgramme[],
): RecommendationResult {
  if (!safety.outcome.allowsRecommendations) {
    return {
      safetyLevel: safety.level,
      blocked: true,
      requiresProfessionalReview: safety.outcome.requiresProfessionalReview,
      recommendations: [],
    };
  }

  const selectedRegions = new Set(input.selectedBodyRegions);
  const selectedOptions = new Set(input.selectedAssessmentOptionIds);
  const selectedGoals = new Set(input.selectedGoalKeys ?? []);
  const selectedContexts = new Set(input.selectedContextKeys ?? []);
  const publishedIds = new Set(programmes.map((programme) => programme.id));
  const totals = new Map<number, { score: number; reasons: RecommendationReason[] }>();

  for (const programme of programmes) {
    for (const region of programme.bodyRegions) {
      if (!selectedRegions.has(region.key)) continue;
      addReason(totals, programme.id, {
        type: "body-region",
        key: region.key,
        score: region.isPrimary ? policy.primaryBodyRegionWeight : policy.secondaryBodyRegionWeight,
      });
    }

    for (const goal of programme.goals) {
      if (!selectedGoals.has(goal.key)) continue;
      addReason(totals, programme.id, { type: "goal", key: goal.key, score: policy.goalWeight });
    }

    for (const context of programme.contexts) {
      if (!selectedContexts.has(context.key)) continue;
      addReason(totals, programme.id, { type: "context", key: context.key, score: policy.contextWeight });
    }
  }

  for (const signal of assessmentConfig.programmeSignals) {
    if (!selectedOptions.has(signal.optionId) || !publishedIds.has(signal.programmeId)) continue;
    addReason(totals, signal.programmeId, {
      type: "assessment",
      key: signal.optionId,
      score: Math.round(signal.score * policy.assessmentSignalMultiplier),
    });
  }

  const normalizedIcd10 = input.icd10?.trim().toUpperCase().replace(/\s+/g, "") || null;
  if (normalizedIcd10) {
    for (const signal of assessmentConfig.icd10Signals) {
      if (!publishedIds.has(signal.programmeId) || !normalizedIcd10.startsWith(signal.codePrefix)) continue;
      addReason(totals, signal.programmeId, {
        type: "icd10",
        key: signal.codePrefix,
        score: Math.round(signal.score * policy.icd10SignalMultiplier),
      });
    }
  }

  const recommendations = [...totals.entries()]
    .map(([programmeId, value]) => ({ programmeId, score: value.score, reasons: value.reasons }))
    .filter((item) => item.score >= policy.minScore)
    .sort((a, b) => b.score - a.score || a.programmeId - b.programmeId)
    .slice(0, policy.maxResults);

  return {
    safetyLevel: safety.level,
    blocked: safety.outcome.blocksProgrammeStart,
    requiresProfessionalReview: safety.outcome.requiresProfessionalReview,
    recommendations,
  };
}
