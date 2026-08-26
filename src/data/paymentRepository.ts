import { getSupabaseClient } from "@/integrations/supabase/client";

export interface StripeCheckoutSession {
  sessionId: string;
  sessionUrl: string;
  orderId: string;
  authoritativeTotal: number;
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

/** Redirects only to a HTTPS Stripe Checkout URL returned by the trusted server. */
export function redirectToStripeCheckout(session: StripeCheckoutSession): void {
  const url = new URL(session.sessionUrl);
  if (url.protocol !== "https:" || !url.hostname.endsWith("stripe.com")) {
    throw new PaymentStartError("unknown", "Untrusted payment redirect URL.");
  }
  window.location.assign(url.toString());
}
