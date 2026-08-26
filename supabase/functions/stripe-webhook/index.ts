import { createClient } from "https://esm.sh/@supabase/supabase-js@2.112.3";

const JSON_HEADERS = { "content-type": "application/json; charset=utf-8" };
const TOLERANCE_SECONDS = 300;
const HANDLED_EVENTS = new Set([
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "checkout.session.async_payment_failed",
  "checkout.session.expired",
]);

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

function hexToBytes(hex: string): Uint8Array | null {
  if (!/^[0-9a-f]+$/i.test(hex) || hex.length % 2 !== 0) return null;
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i += 1) out[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}

async function verifyStripeSignature(rawBody: string, signatureHeader: string, secret: string): Promise<boolean> {
  const parts = signatureHeader.split(",").map((part) => part.trim());
  let timestamp: number | null = null;
  const signatures: Uint8Array[] = [];

  for (const part of parts) {
    const [key, value] = part.split("=", 2);
    if (key === "t") timestamp = Number(value);
    if (key === "v1") {
      const bytes = hexToBytes(value);
      if (bytes) signatures.push(bytes);
    }
  }

  if (!timestamp || signatures.length === 0) return false;
  if (Math.abs(Math.floor(Date.now() / 1000) - timestamp) > TOLERANCE_SECONDS) return false;

  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
  const signedPayload = encoder.encode(`${timestamp}.${rawBody}`);

  for (const signature of signatures) {
    if (await crypto.subtle.verify("HMAC", cryptoKey, signature, signedPayload)) return true;
  }
  return false;
}

async function stripeGetSession(sessionId: string, secret: string) {
  const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, {
    headers: { authorization: `Bearer ${secret}` },
  });
  if (!response.ok) throw new Error("stripe_session_retrieval_failed");
  return response.json();
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });

  const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY") ?? "";
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? "";
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!stripeSecret || !webhookSecret || !supabaseUrl || !serviceRoleKey) {
    return json(503, { error: "payment_provider_not_configured" });
  }

  const signature = req.headers.get("stripe-signature") ?? "";
  const rawBody = await req.text();
  if (!signature || !(await verifyStripeSignature(rawBody, signature, webhookSecret))) {
    return json(400, { error: "invalid_stripe_signature" });
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return json(400, { error: "invalid_json" });
  }

  const eventId = typeof event?.id === "string" ? event.id : "";
  const eventType = typeof event?.type === "string" ? event.type : "";
  const sessionId = typeof event?.data?.object?.id === "string" ? event.data.object.id : "";
  if (!eventId || !eventType) return json(400, { error: "invalid_stripe_event" });
  if (!HANDLED_EVENTS.has(eventType)) return json(200, { received: true, ignored: true });
  if (!sessionId) return json(400, { error: "missing_checkout_session" });

  let session: any;
  try {
    session = await stripeGetSession(sessionId, stripeSecret);
  } catch {
    return json(500, { error: "stripe_session_retrieval_failed" });
  }

  const paymentIntentId = typeof session.payment_intent === "string"
    ? session.payment_intent
    : typeof session.payment_intent?.id === "string"
      ? session.payment_intent.id
      : null;
  const paymentStatus = typeof session.payment_status === "string" ? session.payment_status : "";
  const amountTotal = Number(session.amount_total);
  const currency = typeof session.currency === "string" ? session.currency.toUpperCase() : "";

  if (!Number.isInteger(amountTotal) || amountTotal < 0 || !currency) {
    return json(500, { error: "invalid_stripe_session_snapshot" });
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await admin.rpc("process_stripe_checkout_event", {
    p_event_id: eventId,
    p_event_type: eventType,
    p_session_id: sessionId,
    p_payment_intent_id: paymentIntentId,
    p_payment_status: paymentStatus,
    p_amount_total: amountTotal,
    p_currency: currency,
  });

  if (error) return json(500, { error: "payment_event_processing_failed" });
  return json(200, { received: true, result: data });
});