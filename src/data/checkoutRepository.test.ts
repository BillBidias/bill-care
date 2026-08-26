import { describe, expect, it } from "vitest";
import { buildSafetyAnswerPayload, TrustedCheckoutError } from "@/data/checkoutRepository";
import type { SafetyQuestion } from "@/data/safetyRepository";

const question = (id: string, stableKey: string): SafetyQuestion => ({
  id,
  stableKey,
  riskIfYes: "red",
  riskIfNo: "green",
  isGlobal: true,
  sortOrder: 0,
  question: { fr: stableKey, en: stableKey, de: stableKey },
  help: {},
  bodyRegions: [],
});

describe("M08 trusted checkout helpers", () => {
  it("converts transient safety answers to stable-key payload", () => {
    const questions = [question("q1", "red-flag-one"), question("q2", "red-flag-two")];
    expect(
      buildSafetyAnswerPayload(
        [
          { questionId: "q1", answer: false },
          { questionId: "q2", answer: true },
        ],
        questions,
      ),
    ).toEqual({ "red-flag-one": false, "red-flag-two": true });
  });

  it("fails closed when an applicable safety answer is missing", () => {
    const questions = [question("q1", "red-flag-one"), question("q2", "red-flag-two")];
    expect(() =>
      buildSafetyAnswerPayload([{ questionId: "q1", answer: false }], questions),
    ).toThrow(TrustedCheckoutError);
  });
});
