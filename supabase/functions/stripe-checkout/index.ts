import { createClient } from "https://esm.sh/@supabase/supabase-js@2.112.3";

const JSON_HEADERS = { "content-type": "application/json; charset=utf-8" };
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function json(status: number, body: unknown, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...JSON_HEADERS, ...extraHeaders },
  });
}

function corsHeaders(origin: string) {
  return {
    "access-control-allow-origin": origin,
    "access-control-allow-headers": "authorization, x-client-info, apikey, content-type",
    "access-control-allow-methods": "POST, OPTIONS",
    "vary": "Origin",
  };
}

async function stripeRequest(path: string, secret: string, init?: RequestInit) {
  return fetch(`https://api.stripe.com${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${secret}`,
      ...(init?.headers ?? {}),
    },
  });
}

Deno.serve(async (req: Request) => {
  const appOrigin = (Deno.env.get("APP_ORIGIN") ?? "").replace(/\/$/, "");
  const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY") ?? "";
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const origin = req.headers.get("origin") ?? "";
  const cors = corsHeaders(appOrigin || origin || "null");

  if (req.method === "OPTIONS") {
    if (!appOrigin || origin !== appOrigin) return new Response(null, { status: 403 });
    return new Response(null, { status: 204, headers: cors });
  }

  if (req.method !== "POST") return json(405, { error: "method_not_allowed" }, cors);
  if (!appOrigin || !stripeSecret || !supabaseUrl || !anonKey || !serviceRoleKey) {
    return json(503, { error: "payment_provider_not_configured" }, cors);
  }
  if (origin && origin !== appOrigin) return json(403, { error: "origin_not_allowed" }, cors);

  const authorization = req.headers.get("authorization");
  if (!authorization) return json(401, { error: "authentication_required" }, cors);

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user) return json(401, { error: "authentication_required" }, cors);

  let payload: { orderId?: string; paymentRequestId?: string };
  try {
    payload = await req.json();
  } catch {
    return json(400, { error: "invalid_json" }, cors);
  }

  const orderId = String(payload.orderId ?? "");
  const paymentRequestId = String(payload.paymentRequestId ?? "");
  if (!UUID_RE.test(orderId) || !UUID_RE.test(paymentRequestId)) {
    return json(400, { error: "invalid_payment_request" }, cors);
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: prepared, error: prepareError } = await admin.rpc("prepare_stripe_payment_attempt", {
    p_order_id: orderId,
    p_user_id: userData.user.id,
    p_payment_request_id: paymentRequestId,
  });
  if (prepareError) return json(409, { error: prepareError.message }, cors);

  const prep = Array.isArray(prepared) ? prepared[0] : prepared;
  if (!prep) return json(500, { error: "payment_attempt_not_created" }, cors);

  const attemptId = String(prep.attempt_id);
  const orderTotal = Number(prep.order_total);
  const orderCurrency = String(prep.order_currency).toUpperCase();
  const existingSessionId = prep.existing_checkout_session_id ? String(prep.existing_checkout_session_id) : null;

  if (existingSessionId) {
    const existingRes = await stripeRequest(`/v1/checkout/sessions/${encodeURIComponent(existingSessionId)}`, stripeSecret);
    if (!existingRes.ok) return json(502, { error: "stripe_session_retrieval_failed" }, cors);
    const existing = await existingRes.json();
    if (existing.status === "open" && typeof existing.url === "string" && existing.url.length > 0) {
      return json(200, {
        sessionId: existing.id,
        sessionUrl: existing.url,
        orderId,
        authoritativeTotal: orderTotal,
        currency: orderCurrency,
      }, cors);
    }
    return json(409, { error: "existing_checkout_session_not_open" }, cors);
  }

  const { data: items, error: itemError } = await admin
    .from("order_items")
    .select("programme_id, unit_amount, currency")
    .eq("order_id", orderId)
    .order("programme_id", { ascending: true });
  if (itemError || !items || items.length < 1) {
    await admin.from("payment_attempts").update({ status: "failed", failed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", attemptId);
    return json(409, { error: "order_items_not_available" }, cors);
  }

  const recomputedTotal = items.reduce((sum, item) => sum + Number(item.unit_amount), 0);
  if (!Number.isInteger(orderTotal) || recomputedTotal !== orderTotal || items.some((item) => String(item.currency).toUpperCase() !== orderCurrency)) {
    await admin.from("payment_attempts").update({ status: "failed", failed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", attemptId);
    return json(409, { error: "order_snapshot_mismatch" }, cors);
  }

  const params = new URLSearchParams();
  params.set("mode", "payment");
  params.set("success_url", `${appOrigin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`);
  params.set("cancel_url", `${appOrigin}/cart`);
  params.set("client_reference_id", orderId);
  params.set("locale", "auto");
  params.set("metadata[order_id]", orderId);
  params.set("metadata[payment_attempt_id]", attemptId);
  params.set("payment_intent_data[metadata][order_id]", orderId);
  params.set("payment_intent_data[metadata][payment_attempt_id]", attemptId);

  items.forEach((item, index) => {
    params.set(`line_items[${index}][price_data][currency]`, orderCurrency.toLowerCase());
    params.set(`line_items[${index}][price_data][unit_amount]`, String(item.unit_amount));
    params.set(`line_items[${index}][price_data][product_data][name]`, `Dein Digital-PHYSIO – Digital programme #${item.programme_id}`);
    params.set(`line_items[${index}][quantity]`, "1");
  });

  const stripeRes = await stripeRequest("/v1/checkout/sessions", stripeSecret, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      "Idempotency-Key": `bill-care-payment-attempt-${attemptId}`,
    },
    body: params,
  });
  const stripeBody = await stripeRes.json();

  if (!stripeRes.ok || !stripeBody?.id || !stripeBody?.url) {
    await admin.from("payment_attempts").update({ status: "failed", failed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", attemptId);
    return json(502, { error: "stripe_checkout_creation_failed" }, cors);
  }

  const { error: attachError } = await admin.rpc("attach_stripe_checkout_session", {
    p_attempt_id: attemptId,
    p_session_id: String(stripeBody.id),
  });
  if (attachError) return json(500, { error: "checkout_session_attach_failed" }, cors);

  return json(200, {
    sessionId: String(stripeBody.id),
    sessionUrl: String(stripeBody.url),
    orderId,
    authoritativeTotal: orderTotal,
    currency: orderCurrency,
  }, cors);
});