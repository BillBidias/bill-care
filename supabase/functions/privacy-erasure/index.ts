import { createClient } from "https://esm.sh/@supabase/supabase-js@2.112.3";

const JSON_HEADERS = { "content-type": "application/json; charset=utf-8" };
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function json(status: number, body: unknown, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), { status, headers: { ...JSON_HEADERS, ...headers } });
}

function corsHeaders(origin: string) {
  return {
    "access-control-allow-origin": origin,
    "access-control-allow-headers": "authorization, x-client-info, apikey, content-type",
    "access-control-allow-methods": "POST, OPTIONS",
    "vary": "Origin",
  };
}

Deno.serve(async (req: Request) => {
  const appOrigin = (Deno.env.get("APP_ORIGIN") ?? "").replace(/\/$/, "");
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
  if (!appOrigin || !supabaseUrl || !anonKey || !serviceRoleKey) {
    return json(503, { error: "erasure_service_not_configured" }, cors);
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

  let body: { requestId?: string };
  try {
    body = await req.json();
  } catch {
    return json(400, { error: "invalid_json" }, cors);
  }

  const requestId = String(body.requestId ?? "");
  if (!UUID_RE.test(requestId)) return json(400, { error: "invalid_request_id" }, cors);

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const userId = userData.user.id;

  const { error: verifyError } = await admin.rpc("verify_privacy_erasure_request", {
    p_request_id: requestId,
    p_user_id: userId,
  });
  if (verifyError) return json(409, { error: verifyError.message }, cors);

  const { data: readiness, error: readinessError } = await admin.rpc("prepare_privacy_erasure", {
    p_request_id: requestId,
    p_user_id: userId,
  });
  if (readinessError) return json(409, { error: readinessError.message }, cors);
  if (!readiness || readiness.ready !== true) {
    return json(409, { error: "privacy_erasure_blocked", details: readiness }, cors);
  }

  const { data: erased, error: eraseError } = await admin.rpc("execute_privacy_erasure_database", {
    p_request_id: requestId,
    p_user_id: userId,
  });
  if (eraseError) return json(409, { error: eraseError.message }, cors);

  const { error: deleteError } = await admin.auth.admin.deleteUser(userId, false);
  if (deleteError) {
    return json(500, {
      error: "auth_user_deletion_failed",
      requestId,
      databaseErasureCompleted: true,
    }, cors);
  }

  const { error: finalizeError } = await admin.rpc("finalize_privacy_erasure", {
    p_request_id: requestId,
  });
  if (finalizeError) {
    return json(500, {
      error: "erasure_finalize_failed",
      requestId,
      authUserDeleted: true,
    }, cors);
  }

  return json(200, {
    ok: true,
    requestId,
    database: erased,
    commerce: {
      identityDetached: true,
      retentionPolicy: "pending_legal_tax_review",
    },
  }, cors);
});
