import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getSupabaseClient: vi.fn(),
}));

vi.mock("@/integrations/supabase/client", () => ({
  getSupabaseClient: mocks.getSupabaseClient,
}));

import {
  createPrivacyExportRequest,
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

beforeEach(() => {
  vi.clearAllMocks();
});

describe("privacyRepository", () => {
  it("lists only through the privacy_requests query boundary", async () => {
    const order = vi.fn().mockResolvedValue({ data: [REQUEST], error: null });
    const select = vi.fn(() => ({ order }));
    const from = vi.fn(() => ({ select }));
    mocks.getSupabaseClient.mockReturnValue({ from });

    const result = await listOwnPrivacyRequests();
    expect(from).toHaveBeenCalledWith("privacy_requests");
    expect(result).toEqual({ requests: [REQUEST], error: null });
  });

  it("creates an export request using request_type only", async () => {
    const single = vi.fn().mockResolvedValue({ data: REQUEST, error: null });
    const select = vi.fn(() => ({ single }));
    const insert = vi.fn(() => ({ select }));
    const from = vi.fn(() => ({ insert }));
    mocks.getSupabaseClient.mockReturnValue({ from });

    const result = await createPrivacyExportRequest();
    expect(insert).toHaveBeenCalledWith({ request_type: "export" });
    expect(result).toEqual({ request: REQUEST, error: null });
  });

  it("maps the one-open-request uniqueness error safely", async () => {
    const single = vi.fn().mockResolvedValue({ data: null, error: { code: "23505" } });
    const select = vi.fn(() => ({ single }));
    const insert = vi.fn(() => ({ select }));
    mocks.getSupabaseClient.mockReturnValue({ from: vi.fn(() => ({ insert })) });

    expect(await createPrivacyExportRequest()).toEqual({
      request: null,
      error: "privacy.exportAlreadyOpen",
    });
  });

  it("calls the user-bound export RPC with the request id", async () => {
    const payload = { schema_version: "p12-v1", request_id: "request-1", data: {} };
    const rpc = vi.fn().mockResolvedValue({ data: payload, error: null });
    mocks.getSupabaseClient.mockReturnValue({ rpc });

    const result = await generateOwnPrivacyExport("request-1");
    expect(rpc).toHaveBeenCalledWith("generate_my_privacy_export", {
      p_request_id: "request-1",
    });
    expect(result).toEqual({ payload, error: null });
  });

  it("fails closed when Supabase is unavailable", async () => {
    mocks.getSupabaseClient.mockReturnValue(null);
    expect(await listOwnPrivacyRequests()).toEqual({ requests: [], error: "privacy.unavailable" });
    expect(await createPrivacyExportRequest()).toEqual({ request: null, error: "privacy.unavailable" });
    expect(await generateOwnPrivacyExport("request-1")).toEqual({ payload: null, error: "privacy.unavailable" });
  });
});
