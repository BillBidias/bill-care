import { getSupabaseClient } from "@/integrations/supabase/client";
import type { SafetyAnswer, SafetyQuestion } from "@/data/safetyRepository";

export interface TrustedCheckoutInput {
  programmeIds: number[];
  checkoutRequestId: string;
  safetyAnswers: SafetyAnswer[];
  applicableSafetyQuestions: SafetyQuestion[];
  acknowledgementVersion: string;
}

export interface TrustedCheckoutOrder {
  orderId: string;
  totalAmount: number;
  currency: string;
  orderStatus: "pending";
}

export type TrustedCheckoutErrorCode =
  | "authentication_required"
  | "invalid_checkout_item_count"
  | "programme_not_available"
  | "programme_not_available_for_checkout"
  | "checkout_blocked_red_safety"
  | "checkout_requires_professional_review"
  | "active_safety_acknowledgement_required"
  | "missing_safety_answer"
  | "invalid_safety_answer"
  | "unknown";

export class TrustedCheckoutError extends Error {
  constructor(
    public readonly code: TrustedCheckoutErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "TrustedCheckoutError";
  }
}

const classifyCheckoutError = (message: string): TrustedCheckoutErrorCode => {
  if (message.includes("authentication_required")) return "authentication_required";
  if (message.includes("invalid_checkout_item_count")) return "invalid_checkout_item_count";
  if (message.includes("programme_not_available_for_checkout")) return "programme_not_available_for_checkout";
  if (message.includes("programme_not_available")) return "programme_not_available";
  if (message.includes("checkout_blocked_red_safety")) return "checkout_blocked_red_safety";
  if (message.includes("checkout_requires_professional_review")) return "checkout_requires_professional_review";
  if (message.includes("active_safety_acknowledgement_required")) return "active_safety_acknowledgement_required";
  if (message.includes("missing_safety_answer")) return "missing_safety_answer";
  if (message.includes("invalid_safety_answer")) return "invalid_safety_answer";
  return "unknown";
};

export function buildSafetyAnswerPayload(
  answers: readonly SafetyAnswer[],
  applicableQuestions: readonly SafetyQuestion[],
): Record<string, boolean> {
  const byId = new Map(answers.map((answer) => [answer.questionId, answer.answer]));
  const payload: Record<string, boolean> = {};
  for (const question of applicableQuestions) {
    const answer = byId.get(question.id);
    if (typeof answer !== "boolean") {
      throw new TrustedCheckoutError("missing_safety_answer", `Missing safety answer for ${question.stableKey}.`);
    }
    payload[question.stableKey] = answer;
  }
  return payload;
}

export async function createTrustedCheckoutOrder(input: TrustedCheckoutInput): Promise<TrustedCheckoutOrder> {
  const client = getSupabaseClient();
  if (!client) throw new TrustedCheckoutError("unknown", "Supabase is not configured.");

  const programmeIds = [...new Set(input.programmeIds)].filter((id) => Number.isInteger(id) && id > 0);
  if (programmeIds.length !== input.programmeIds.length || programmeIds.length < 1) {
    throw new TrustedCheckoutError("invalid_checkout_item_count", "Invalid checkout programme selection.");
  }

  const safetyPayload = buildSafetyAnswerPayload(input.safetyAnswers, input.applicableSafetyQuestions);
  const { data, error } = await client.rpc("create_trusted_checkout_order", {
    p_programme_ids: programmeIds,
    p_checkout_request_id: input.checkoutRequestId,
    p_safety_answers: safetyPayload,
    p_acknowledgement_version: input.acknowledgementVersion,
  });

  if (error) throw new TrustedCheckoutError(classifyCheckoutError(error.message), error.message);
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) throw new TrustedCheckoutError("unknown", "Trusted checkout returned no order.");
  if (String(row.order_status) !== "pending") throw new TrustedCheckoutError("unknown", "Trusted checkout returned an invalid order state.");

  const totalAmount = Number(row.total_amount);
  if (!Number.isInteger(totalAmount) || totalAmount < 0) throw new TrustedCheckoutError("unknown", "Trusted checkout returned an invalid total.");

  return {
    orderId: String(row.order_id),
    totalAmount,
    currency: String(row.currency),
    orderStatus: "pending",
  };
}

export function createCheckoutRequestId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  throw new Error("Secure UUID generation is unavailable in this browser.");
}
