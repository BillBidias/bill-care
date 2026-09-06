import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getSupabaseClient: vi.fn() }));

vi.mock("@/integrations/supabase/client", () => ({ getSupabaseClient: mocks.getSupabaseClient }));

import {
  createPrivacyErasureRequest,
  createPrivacyExportRequest,
  executeOwnPrivacyErasure,
  generateOwnPrivacyExport,
  listOwnPrivacyRequests,
} from "@/data/privacyRepository";

const REQUEST = {
  id: "request-1",
  request_type: "export",
  status: "requested",
  requested_at: "2026-09-06T10:00:00Z",
  processing_started_at: null,
  completed_at: null,
  outcome_category: null,
  implementation_version: "p12-v1",
};

beforeEach(() => vi.clearAllMocks());

describe("privacyRepository", () => {
  it("lists through the privacy_requests query boundary", async () => {
    const order = vi.fn().mockResolvedValue({ data: [REQUEST], error: null });
    const select = vi.fn(() => ({ order }));
    const from = vi.fn(() => ({ select }));
    mocks.getSupabaseClient.mockReturnValue({ from });

    expect(await listOwnPrivacyRequests()).toEqual({ requests: [REQUEST], error: null });
    expect(from).toHaveBeenCalledWith("privacy_requests");
  });

  it("creates export and erasure requests using request_type only", async () => {
    const single = vi.fn().mockResolvedValue({ data: REQUEST, error: null });
    const select = vi.fn(() => ({ single }));
    const insert = vi.fn(() => ({ select }));
    mocks.getSupabaseClient.mockReturnValue({ from: vi.fn(() => ({ insert })) });

    await createPrivacyExportRequest();
    await createPrivacyErasureRequest();
    expect(insert).toHaveBeenNthCalledWith(1, { request_type: "export" });
    expect(insert).toHaveBeenNthCalledWith(2, { request_type: "erasure" });
  });

  it("maps open-request uniqueness separately for export and erasure", async () => {
    const single = vi.fn().mockResolvedValue({ data: null, error: { code: "23505" } });
    const select = vi.fn(() => ({ single }));
    const insert = vi.fn(() => ({ select }));
    mocks.getSupabaseClient.mockReturnValue({ from: vi.fn(() => ({ insert })) });

    expect(await createPrivacyExportRequest()).toEqual({ request: null, error: "privacy.exportAlreadyOpen" });
    expect(await createPrivacyErasureRequest()).toEqual({ request: null, error: "privacy.erasureAlreadyOpen" });
  });

  it("calls the user-bound export RPC with the request id", async () => {
    const payload = { schema_version: "p12-v1", request_id: "request-1", data: {} };
    const rpc = vi.fn().mockResolvedValue({ data: payload, error: null });
    mocks.getSupabaseClient.mockReturnValue({ rpc });

    expect(await generateOwnPrivacyExport("request-1")).toEqual({ payload, error: null });
    expect(rpc).toHaveBeenCalledWith("generate_my_privacy_export", { p_request_id: "request-1" });
  });

  it("invokes only the privacy-erasure edge function for account erasure", async () => {
    const invoke = vi.fn().mockResolvedValue({ data: { ok: true }, error: null });
    mocks.getSupabaseClient.mockReturnValue({ functions: { invoke } });

    expect(await executeOwnPrivacyErasure("request-1")).toEqual({ completed: true, error: null });
    expect(invoke).toHaveBeenCalledWith("privacy-erasure", { body: { requestId: "request-1" } });
  });

  it("fails closed when erasure is blocked or Supabase is unavailable", async () => {
    const invoke = vi.fn().mockResolvedValue({
      data: { ok: false, error: "privacy_erasure_blocked" },
      error: null,
    });
    mocks.getSupabaseClient.mockReturnValue({ functions: { invoke } });
    expect(await executeOwnPrivacyErasure("request-1")).toEqual({ completed: false, error: "privacy.erasureBlocked" });

    mocks.getSupabaseClient.mockReturnValue(null);
    expect(await createPrivacyErasureRequest()).toEqual({ request: null, error: "privacy.unavailable" });
    expect(await executeOwnPrivacyErasure("request-1")).toEqual({ completed: false, error: "privacy.unavailable" });
  });
});
