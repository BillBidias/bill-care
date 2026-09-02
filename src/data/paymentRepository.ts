import { getSupabaseClient } from "@/integrations/supabase/client";

export interface StripeCheckoutSession {
  sessionId: string;
  sessionUrl: string;
  orderId: string;
  authoritativeTotal: number;
  currency: string;
}

export interface CheckoutOrderStatus {
  id: string;
  status: "pending" | "paid" | "cancelled" | "refunded";
  totalAmount: number;
  currency: string;
}

export type PaymentStartErrorCode =
  | "authentication_required"
  | "payment_provider_not_configured"
  | "order_not_found"
  | "order_already_paid"
  | "order_not_payable"
  | "trusted_checkout_not_completed"
  | "order_snapshot_mismatch"
  | "existing_checkout_session_not_open"
  | "unknown";

export class PaymentStartError extends Error {
  constructor(
    public readonly code: PaymentStartErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "PaymentStartError";
  }
}

const classifyPaymentStartError = (message: string): PaymentStartErrorCode => {
  if (message.includes("authentication_required")) return "authentication_required";
  if (message.includes("payment_provider_not_configured")) return "payment_provider_not_configured";
  if (message.includes("order_not_found")) return "order_not_found";
  if (message.includes("order_already_paid")) return "order_already_paid";
  if (message.includes("order_not_payable")) return "order_not_payable";
  if (message.includes("trusted_checkout_not_completed")) return "trusted_checkout_not_completed";
  if (message.includes("order_snapshot_mismatch")) return "order_snapshot_mismatch";
  if (message.includes("existing_checkout_session_not_open")) return "existing_checkout_session_not_open";
  return "unknown";
};

export function createPaymentRequestId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  throw new PaymentStartError("unknown", "Secure UUID generation is unavailable in this browser.");
}

/**
 * M09 payment start.
 * The browser sends only the trusted order id and an idempotency id. It never
 * sends price, currency, payment success, entitlement, or programme content.
 */
export async function createStripeCheckoutSession(
  orderId: string,
  paymentRequestId = createPaymentRequestId(),
): Promise<StripeCheckoutSession> {
  const client = getSupabaseClient();
  if (!client) throw new PaymentStartError("unknown", "Supabase is not configured.");

  const { data, error } = await client.functions.invoke("stripe-checkout", {
    body: { orderId, paymentRequestId },
  });

  if (error) {
    const message = error.message || "Stripe checkout could not be created.";
    throw new PaymentStartError(classifyPaymentStartError(message), message);
  }

  const sessionId = String(data?.sessionId ?? "");
  const sessionUrl = String(data?.sessionUrl ?? "");
  const returnedOrderId = String(data?.orderId ?? "");
  const authoritativeTotal = Number(data?.authoritativeTotal);
  const currency = String(data?.currency ?? "");

  if (!sessionId || !sessionUrl || returnedOrderId !== orderId) {
    throw new PaymentStartError("unknown", "Invalid Stripe checkout response.");
  }
  if (!Number.isInteger(authoritativeTotal) || authoritativeTotal < 0 || !/^[A-Z]{3}$/.test(currency)) {
    throw new PaymentStartError("unknown", "Invalid authoritative payment amount.");
  }

  return {
    sessionId,
    sessionUrl,
    orderId: returnedOrderId,
    authoritativeTotal,
    currency,
  };
}

export function isTrustedStripeCheckoutUrl(sessionUrl: string): boolean {
  try {
    const url = new URL(sessionUrl);
    return (
      url.protocol === "https:" &&
      url.hostname === "checkout.stripe.com" &&
      url.port === "" &&
      url.username === "" &&
      url.password === ""
    );
  } catch {
    return false;
  }
}

/** Redirects only to the canonical HTTPS Stripe-hosted Checkout domain. */
export function redirectToStripeCheckout(session: StripeCheckoutSession): void {
  if (!isTrustedStripeCheckoutUrl(session.sessionUrl)) {
    throw new PaymentStartError("unknown", "Untrusted payment redirect URL.");
  }
  window.location.assign(session.sessionUrl);
}

/** Reads only the authenticated user's own order through existing RLS. */
export async function fetchOwnOrderStatus(orderId: string): Promise<CheckoutOrderStatus | null> {
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase is not configured.");

  const { data, error } = await client
    .from("orders")
    .select("id,status,total_amount,currency")
    .eq("id", orderId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  const status = String(data.status) as CheckoutOrderStatus["status"];
  if (!["pending", "paid", "cancelled", "refunded"].includes(status)) {
    throw new Error("Invalid order status.");
  }

  return {
    id: String(data.id),
    status,
    totalAmount: Number(data.total_amount),
    currency: String(data.currency),
  };
}

/** Resolves a Stripe session to the authenticated user's own order via payment_attempt RLS. */
export async function findOwnOrderByStripeSession(sessionId: string): Promise<CheckoutOrderStatus | null> {
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase is not configured.");

  const { data: attempt, error: attemptError } = await client
    .from("payment_attempts")
    .select("order_id")
    .eq("provider_checkout_session_id", sessionId)
    .maybeSingle();

  if (attemptError) throw new Error(attemptError.message);
  if (!attempt?.order_id) return null;
  return fetchOwnOrderStatus(String(attempt.order_id));
}
