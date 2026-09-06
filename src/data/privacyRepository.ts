import { getSupabaseClient } from "@/integrations/supabase/client";

export type PrivacyRequestType = "access" | "export" | "rectification" | "erasure" | "restriction" | "objection";
export type PrivacyRequestStatus =
  | "requested"
  | "processing"
  | "completed"
  | "partially_fulfilled"
  | "rejected"
  | "cancelled";

export interface PrivacyRequest {
  id: string;
  request_type: PrivacyRequestType;
  status: PrivacyRequestStatus;
  requested_at: string;
  processing_started_at: string | null;
  completed_at: string | null;
  outcome_category: string | null;
  implementation_version: string;
}

export type PrivacyExportPayload = Record<string, unknown>;

export type PrivacyRequestResult =
  | { request: PrivacyRequest; error: null }
  | { request: null; error: string };

export type PrivacyRequestsResult =
  | { requests: PrivacyRequest[]; error: null }
  | { requests: []; error: string };

export type PrivacyExportResult =
  | { payload: PrivacyExportPayload; error: null }
  | { payload: null; error: string };

const REQUEST_COLUMNS =
  "id, request_type, status, requested_at, processing_started_at, completed_at, outcome_category, implementation_version";

function clientOrNull() {
  try {
    return getSupabaseClient();
  } catch {
    return null;
  }
}

export async function listOwnPrivacyRequests(): Promise<PrivacyRequestsResult> {
  const client = clientOrNull();
  if (!client) return { requests: [], error: "privacy.unavailable" };

  try {
    const { data, error } = await client
      .from("privacy_requests")
      .select(REQUEST_COLUMNS)
      .order("requested_at", { ascending: false });

    if (error) return { requests: [], error: "privacy.loadFailed" };
    return { requests: (data ?? []) as PrivacyRequest[], error: null };
  } catch {
    return { requests: [], error: "privacy.loadFailed" };
  }
}

export async function createPrivacyExportRequest(): Promise<PrivacyRequestResult> {
  const client = clientOrNull();
  if (!client) return { request: null, error: "privacy.unavailable" };

  try {
    const { data, error } = await client
      .from("privacy_requests")
      .insert({ request_type: "export" })
      .select(REQUEST_COLUMNS)
      .single();

    if (error) {
      if (error.code === "23505") return { request: null, error: "privacy.exportAlreadyOpen" };
      return { request: null, error: "privacy.requestFailed" };
    }
    return { request: data as PrivacyRequest, error: null };
  } catch {
    return { request: null, error: "privacy.requestFailed" };
  }
}

export async function generateOwnPrivacyExport(requestId: string): Promise<PrivacyExportResult> {
  if (!requestId) return { payload: null, error: "privacy.exportFailed" };
  const client = clientOrNull();
  if (!client) return { payload: null, error: "privacy.unavailable" };

  try {
    const { data, error } = await client.rpc("generate_my_privacy_export", {
      p_request_id: requestId,
    });
    if (error || !data || typeof data !== "object") {
      return { payload: null, error: "privacy.exportFailed" };
    }
    return { payload: data as PrivacyExportPayload, error: null };
  } catch {
    return { payload: null, error: "privacy.exportFailed" };
  }
}

export function downloadPrivacyExport(payload: PrivacyExportPayload): void {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `dein-digital-physio-data-export-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
