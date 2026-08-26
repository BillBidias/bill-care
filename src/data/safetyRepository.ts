import { getSupabaseClient } from "@/integrations/supabase/client";
import type { LocalizedText } from "@/data/programs";

export type SafetyLevel = "green" | "amber" | "red";

export interface SafetyQuestion {
  id: string;
  stableKey: string;
  riskIfYes: SafetyLevel;
  riskIfNo: SafetyLevel;
  isGlobal: boolean;
  sortOrder: number;
  question: LocalizedText;
  help: Partial<LocalizedText>;
  bodyRegions: string[];
}

export interface SafetyOutcome {
  level: SafetyLevel;
  allowsRecommendations: boolean;
  requiresAcknowledgement: boolean;
  requiresProfessionalReview: boolean;
  blocksProgrammeStart: boolean;
  title: LocalizedText;
  body: LocalizedText;
}

export interface SafetyConfig {
  questions: SafetyQuestion[];
  outcomes: Record<SafetyLevel, SafetyOutcome>;
}

export interface SafetyAnswer {
  questionId: string;
  answer: boolean;
}

export interface SafetyEvaluation {
  level: SafetyLevel;
  triggeredQuestionIds: string[];
  outcome: SafetyOutcome;
}

const LEVEL_WEIGHT: Record<SafetyLevel, number> = {
  green: 0,
  amber: 1,
  red: 2,
};

const toLocalizedQuestion = (
  rows: Array<{ language: string; question: string; help_text?: string | null }>,
): { question: LocalizedText; help: Partial<LocalizedText> } => {
  const question = { fr: "", en: "", de: "" } as LocalizedText;
  const help: Partial<LocalizedText> = {};

  for (const row of rows) {
    if (row.language === "fr" || row.language === "en" || row.language === "de") {
      question[row.language] = row.question;
      if (row.help_text) help[row.language] = row.help_text;
    }
  }

  return { question, help };
};

/**
 * Reads only public M06 configuration. Patient safety answers remain transient
 * and are never persisted by this repository.
 */
export async function fetchSafetyConfig(): Promise<SafetyConfig> {
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase is not configured.");

  const [questionsRes, translationsRes, regionsRes, outcomesRes] = await Promise.all([
    client
      .from("safety_questions")
      .select("id, stable_key, risk_if_yes, risk_if_no, is_global, sort_order")
      .order("sort_order", { ascending: true }),
    client.from("safety_question_translations").select("question_id, language, question, help_text"),
    client.from("safety_question_body_regions").select("question_id, body_region_key"),
    client
      .from("safety_outcomes")
      .select(
        "level, allows_recommendations, requires_acknowledgement, requires_professional_review, blocks_programme_start, title, body",
      ),
  ]);

  for (const response of [questionsRes, translationsRes, regionsRes, outcomesRes]) {
    if (response.error) throw new Error(response.error.message);
  }

  const translations = (translationsRes.data ?? []) as Array<{
    question_id: string;
    language: string;
    question: string;
    help_text: string | null;
  }>;
  const regions = (regionsRes.data ?? []) as Array<{ question_id: string; body_region_key: string }>;

  const questions: SafetyQuestion[] = ((questionsRes.data ?? []) as Array<{
    id: string;
    stable_key: string;
    risk_if_yes: SafetyLevel;
    risk_if_no: SafetyLevel;
    is_global: boolean;
    sort_order: number;
  }>).map((row) => {
    const localized = toLocalizedQuestion(translations.filter((item) => item.question_id === row.id));
    return {
      id: row.id,
      stableKey: row.stable_key,
      riskIfYes: row.risk_if_yes,
      riskIfNo: row.risk_if_no,
      isGlobal: row.is_global,
      sortOrder: row.sort_order,
      question: localized.question,
      help: localized.help,
      bodyRegions: regions.filter((item) => item.question_id === row.id).map((item) => item.body_region_key),
    };
  });

  const outcomes = {} as Record<SafetyLevel, SafetyOutcome>;
  for (const row of (outcomesRes.data ?? []) as Array<{
    level: SafetyLevel;
    allows_recommendations: boolean;
    requires_acknowledgement: boolean;
    requires_professional_review: boolean;
    blocks_programme_start: boolean;
    title: LocalizedText;
    body: LocalizedText;
  }>) {
    outcomes[row.level] = {
      level: row.level,
      allowsRecommendations: row.allows_recommendations,
      requiresAcknowledgement: row.requires_acknowledgement,
      requiresProfessionalReview: row.requires_professional_review,
      blocksProgrammeStart: row.blocks_programme_start,
      title: row.title,
      body: row.body,
    };
  }

  if (!outcomes.green || !outcomes.amber || !outcomes.red) {
    throw new Error("Incomplete safety outcome configuration.");
  }

  return { questions, outcomes };
}

export function getApplicableSafetyQuestions(
  config: SafetyConfig,
  selectedBodyRegions: readonly string[],
): SafetyQuestion[] {
  const selected = new Set(selectedBodyRegions);
  return config.questions.filter(
    (question) => question.isGlobal || question.bodyRegions.some((region) => selected.has(region)),
  );
}

/**
 * Strict highest-risk-wins evaluation: any RED answer makes the whole screen RED;
 * otherwise any AMBER makes it AMBER; otherwise it is GREEN.
 */
export function evaluateSafety(
  config: SafetyConfig,
  answers: readonly SafetyAnswer[],
  applicableQuestions: readonly SafetyQuestion[],
): SafetyEvaluation {
  const answersById = new Map(answers.map((item) => [item.questionId, item.answer]));
  let level: SafetyLevel = "green";
  const triggeredQuestionIds: string[] = [];

  for (const question of applicableQuestions) {
    const answer = answersById.get(question.id);
    if (typeof answer !== "boolean") {
      throw new Error(`Missing safety answer for question ${question.stableKey}.`);
    }

    const questionLevel = answer ? question.riskIfYes : question.riskIfNo;
    if (LEVEL_WEIGHT[questionLevel] > LEVEL_WEIGHT.green) triggeredQuestionIds.push(question.id);
    if (LEVEL_WEIGHT[questionLevel] > LEVEL_WEIGHT[level]) level = questionLevel;
  }

  return {
    level,
    triggeredQuestionIds,
    outcome: config.outcomes[level],
  };
}
