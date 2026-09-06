import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import React from "react";

const mocks = vi.hoisted(() => ({
  fetchOwnProfile: vi.fn(),
  updateOwnProfile: vi.fn(),
  listOwnPrivacyRequests: vi.fn(),
  createPrivacyExportRequest: vi.fn(),
  generateOwnPrivacyExport: vi.fn(),
  downloadPrivacyExport: vi.fn(),
  createPrivacyErasureRequest: vi.fn(),
  executeOwnPrivacyErasure: vi.fn(),
  signOut: vi.fn(),
}));
const { fetchOwnProfile, updateOwnProfile } = mocks;

vi.mock("@/data/profileRepository", async () => {
  const actual = await vi.importActual<typeof import("@/data/profileRepository")>("@/data/profileRepository");
  return { ...actual, fetchOwnProfile: mocks.fetchOwnProfile, updateOwnProfile: mocks.updateOwnProfile };
});

vi.mock("@/data/privacyRepository", () => ({
  listOwnPrivacyRequests: mocks.listOwnPrivacyRequests,
  createPrivacyExportRequest: mocks.createPrivacyExportRequest,
  generateOwnPrivacyExport: mocks.generateOwnPrivacyExport,
  downloadPrivacyExport: mocks.downloadPrivacyExport,
  createPrivacyErasureRequest: mocks.createPrivacyErasureRequest,
  executeOwnPrivacyErasure: mocks.executeOwnPrivacyErasure,
}));

let currentUser: { id: string; email: string } | null = null;
let authLoading = false;

vi.mock("@/auth/useAuth", () => ({
  useAuth: () => ({
    user: currentUser,
    session: null,
    loading: authLoading,
    isAuthAvailable: true,
    signUp: vi.fn(),
    signIn: vi.fn(),
    signOut: mocks.signOut,
  }),
}));

import AccountPage from "@/pages/AccountPage";
import RequireAuth, { safeReturnPath } from "@/auth/RequireAuth";
import { I18nProvider } from "@/lib/i18n";
import { CartProvider } from "@/lib/cart";
import { ConsentProvider } from "@/lib/consent";

const PROFILE = {
  id: "user-1",
  display_name: "Bill",
  preferred_language: "de" as const,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

const PRIVACY_REQUEST = {
  id: "request-1",
  request_type: "export" as const,
  status: "requested" as const,
  requested_at: "2026-09-06T10:00:00Z",
  processing_started_at: null,
  completed_at: null,
  outcome_category: null,
  implementation_version: "p12-v1",
};

const ERASURE_REQUEST = { ...PRIVACY_REQUEST, id: "erasure-1", request_type: "erasure" as const };

const renderAccount = () =>
  render(
    <I18nProvider>
      <ConsentProvider><CartProvider>
        <MemoryRouter initialEntries={["/account"]}>
          <Routes>
            <Route path="/" element={<div>home page</div>} />
            <Route path="/login" element={<div>login page</div>} />
            <Route path="/account" element={<RequireAuth><AccountPage /></RequireAuth>} />
          </Routes>
        </MemoryRouter>
      </CartProvider></ConsentProvider>
    </I18nProvider>,
  );

describe("/account", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authLoading = false;
    currentUser = { id: "user-1", email: "user@example.test" };
    fetchOwnProfile.mockResolvedValue({ profile: PROFILE, error: null });
    updateOwnProfile.mockResolvedValue({ profile: { ...PROFILE, display_name: "Bill B", preferred_language: "fr" }, error: null });
    mocks.listOwnPrivacyRequests.mockResolvedValue({ requests: [], error: null });
    mocks.createPrivacyExportRequest.mockResolvedValue({ request: PRIVACY_REQUEST, error: null });
    mocks.generateOwnPrivacyExport.mockResolvedValue({ payload: { schema_version: "p12-v1", request_id: "request-1", data: {} }, error: null });
    mocks.createPrivacyErasureRequest.mockResolvedValue({ request: ERASURE_REQUEST, error: null });
    mocks.executeOwnPrivacyErasure.mockResolvedValue({ completed: true, error: null });
    mocks.signOut.mockResolvedValue({ error: null });
  });

  it("redirects an unauthenticated visitor to /login", async () => {
    currentUser = null;
    renderAccount();
    await waitFor(() => expect(screen.getByText("login page")).toBeInTheDocument());
  });

  it("only allows known internal return paths", () => {
    expect(safeReturnPath("/account")).toBe("/account");
    expect(safeReturnPath("https://evil.example")).toBeNull();
    expect(safeReturnPath("//evil.example")).toBeNull();
  });

  it("loads and shows the authenticated user's own profile", async () => {
    renderAccount();
    await waitFor(() => expect(fetchOwnProfile).toHaveBeenCalledWith("user-1"));
    expect(await screen.findByDisplayValue("Bill")).toBeInTheDocument();
    expect(screen.getByLabelText(/^E-mail$/i)).toHaveValue("user@example.test");
    await waitFor(() => expect((screen.getByLabelText(/Langue préférée/i) as HTMLSelectElement).value).toBe("de"));
  });

  it("saves display_name and preferred_language", async () => {
    const user = userEvent.setup();
    renderAccount();
    const input = await screen.findByDisplayValue("Bill");
    await user.clear(input);
    await user.type(input, "  Bill B  ");
    await user.selectOptions(screen.getByLabelText(/Langue préférée/i), "fr");
    await user.click(screen.getByRole("button", { name: /Enregistrer/i }));
    await waitFor(() => expect(updateOwnProfile).toHaveBeenCalledWith("user-1", { display_name: "Bill B", preferred_language: "fr" }));
    expect(await screen.findByRole("status")).toHaveTextContent(/enregistré/i);
  });

  it("blocks a display name longer than 100 characters", async () => {
    const user = userEvent.setup();
    renderAccount();
    const input = await screen.findByDisplayValue("Bill");
    await user.clear(input);
    await user.paste("x".repeat(101));
    await user.click(screen.getByRole("button", { name: /Enregistrer/i }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(updateOwnProfile).not.toHaveBeenCalled();
  });

  it("generates and downloads the authenticated user's privacy export", async () => {
    const user = userEvent.setup();
    renderAccount();
    await screen.findByDisplayValue("Bill");
    await user.click(screen.getByRole("button", { name: /Télécharger mes données/i }));
    await waitFor(() => expect(mocks.createPrivacyExportRequest).toHaveBeenCalledTimes(1));
    expect(mocks.generateOwnPrivacyExport).toHaveBeenCalledWith("request-1");
    expect(mocks.downloadPrivacyExport).toHaveBeenCalled();
  });

  it("shows the privacy request history", async () => {
    mocks.listOwnPrivacyRequests.mockResolvedValue({ requests: [{ ...PRIVACY_REQUEST, status: "completed" }], error: null });
    renderAccount();
    expect(await screen.findByText("export")).toBeInTheDocument();
    expect(screen.getByText("completed")).toBeInTheDocument();
  });

  it("does not start erasure when the confirmation email is wrong", async () => {
    const user = userEvent.setup();
    renderAccount();
    await screen.findByDisplayValue("Bill");
    await user.type(screen.getByLabelText(/E-mail de confirmation/i), "wrong@example.test");
    await user.click(screen.getByRole("button", { name: /Supprimer définitivement mon compte/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/ne correspond pas/i);
    expect(mocks.createPrivacyErasureRequest).not.toHaveBeenCalled();
    expect(mocks.executeOwnPrivacyErasure).not.toHaveBeenCalled();
  });

  it("executes erasure only after exact email confirmation and signs out on success", async () => {
    const user = userEvent.setup();
    renderAccount();
    await screen.findByDisplayValue("Bill");
    await user.type(screen.getByLabelText(/E-mail de confirmation/i), "user@example.test");
    await user.click(screen.getByRole("button", { name: /Supprimer définitivement mon compte/i }));
    await waitFor(() => expect(mocks.createPrivacyErasureRequest).toHaveBeenCalledTimes(1));
    expect(mocks.executeOwnPrivacyErasure).toHaveBeenCalledWith("erasure-1");
    await waitFor(() => expect(mocks.signOut).toHaveBeenCalledTimes(1));
    expect(await screen.findByText("home page")).toBeInTheDocument();
  });

  it("keeps the account page open when automated erasure is blocked", async () => {
    mocks.executeOwnPrivacyErasure.mockResolvedValue({ completed: false, error: "privacy.erasureBlocked" });
    const user = userEvent.setup();
    renderAccount();
    await screen.findByDisplayValue("Bill");
    await user.type(screen.getByLabelText(/E-mail de confirmation/i), "user@example.test");
    await user.click(screen.getByRole("button", { name: /Supprimer définitivement mon compte/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/vérification manuelle/i);
    expect(mocks.signOut).not.toHaveBeenCalled();
    expect(screen.getByRole("heading", { name: /Mon compte/i })).toBeInTheDocument();
  });

  it("shows success then navigates to / after a successful profile update", async () => {
    const user = userEvent.setup();
    renderAccount();
    const input = await screen.findByDisplayValue("Bill");
    await user.clear(input);
    await user.type(input, "  Bill B  ");
    await user.selectOptions(screen.getByLabelText(/Langue préférée/i), "fr");
    await user.click(screen.getByRole("button", { name: /Enregistrer/i }));
    await waitFor(() => expect(updateOwnProfile).toHaveBeenCalled());
    expect(await screen.findByRole("status")).toHaveTextContent(/enregistré/i);
    await waitFor(() => expect(screen.getByText("home page")).toBeInTheDocument(), { timeout: 3000 });
  }, 6000);

  it("stays on /account when the profile update fails", async () => {
    updateOwnProfile.mockResolvedValue({ profile: null, error: "profile.saveFailed" });
    const user = userEvent.setup();
    renderAccount();
    await screen.findByDisplayValue("Bill");
    await user.click(screen.getByRole("button", { name: /Enregistrer/i }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.queryByText("home page")).not.toBeInTheDocument();
  });

  it("does not redirect before the successful profile update is confirmed", async () => {
    updateOwnProfile.mockReturnValue(new Promise(() => {}));
    const user = userEvent.setup();
    renderAccount();
    await screen.findByDisplayValue("Bill");
    await user.click(screen.getByRole("button", { name: /Enregistrer/i }));
    await new Promise((r) => setTimeout(r, 1200));
    expect(screen.queryByText("home page")).not.toBeInTheDocument();
  }, 6000);
});
