import { describe, expect, it } from "vitest";
import { recommendProgrammes, type DiscoveryProgramme, type RecommendationPolicy } from "./recommendationRepository";
import type { AssessmentConfig } from "./assessmentRepository";
import type { SafetyEvaluation, SafetyOutcome } from "./safetyRepository";

const policy: RecommendationPolicy = {
  version: "1.0.0",
  maxResults: 3,
  minScore: 8,
  primaryBodyRegionWeight: 10,
  secondaryBodyRegionWeight: 6,
  goalWeight: 5,
  contextWeight: 3,
  assessmentSignalMultiplier: 1,
  icd10SignalMultiplier: 1,
};

const programmes: DiscoveryProgramme[] = [
  { id: 7, bodyRegions: [{ key: "knee-thigh", isPrimary: true }], goals: [{ key: "improve-function" }], contexts: [{ key: "sport" }] },
  { id: 10, bodyRegions: [{ key: "full-body", isPrimary: true }], goals: [{ key: "improve-balance" }], contexts: [{ key: "seniors" }] },
];

const assessmentConfig = {
  options: [],
  programmeSignals: [{ optionId: "stairs", programmeId: 7, score: 9 }],
  icd10Signals: [{ programmeId: 7, codePrefix: "M17", score: 10 }],
  safetyAcknowledgement: null,
} as AssessmentConfig;

const outcome = (level: "green" | "amber" | "red"): SafetyOutcome => ({
  level,
  allowsRecommendations: level !== "red",
  requiresAcknowledgement: level !== "red",
  requiresProfessionalReview: level !== "green",
  blocksProgrammeStart: level !== "green",
  title: { fr: "", en: "", de: "" },
  body: { fr: "", en: "", de: "" },
});

const safety = (level: "green" | "amber" | "red"): SafetyEvaluation => ({
  level,
  triggeredQuestionIds: [],
  outcome: outcome(level),
});

describe("M07 recommendation engine", () => {
  it("blocks every recommendation when safety is RED", () => {
    const result = recommendProgrammes(
      { selectedBodyRegions: ["knee-thigh"], selectedAssessmentOptionIds: ["stairs"], icd10: "M17" },
      assessmentConfig,
      safety("red"),
      policy,
      programmes,
    );
    expect(result.blocked).toBe(true);
    expect(result.recommendations).toEqual([]);
  });

  it("shows relevant programmes on AMBER but keeps programme start blocked", () => {
    const result = recommendProgrammes(
      { selectedBodyRegions: ["knee-thigh"], selectedAssessmentOptionIds: ["stairs"] },
      assessmentConfig,
      safety("amber"),
      policy,
      programmes,
    );
    expect(result.blocked).toBe(true);
    expect(result.requiresProfessionalReview).toBe(true);
    expect(result.recommendations[0]?.programmeId).toBe(7);
  });

  it("ranks matching body region, declared limitation and clinician ICD-10 together", () => {
    const result = recommendProgrammes(
      {
        selectedBodyRegions: ["knee-thigh"],
        selectedAssessmentOptionIds: ["stairs"],
        selectedGoalKeys: ["improve-function"],
        selectedContextKeys: ["sport"],
        icd10: "m17.9",
      },
      assessmentConfig,
      safety("green"),
      policy,
      programmes,
    );
    expect(result.blocked).toBe(false);
    expect(result.recommendations[0]?.programmeId).toBe(7);
    expect(result.recommendations[0]?.score).toBe(37);
    expect(result.recommendations[0]?.reasons.map((reason) => reason.type)).toEqual(
      expect.arrayContaining(["body-region", "assessment", "goal", "context", "icd10"]),
    );
  });
});
