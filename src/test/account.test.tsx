import { describe, expect, it, vi, beforeEach } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import React from "react";

const mocks = vi.hoisted(() => ({
  fetchOwnProfile: vi.fn(),
  updateOwnProfile: vi.fn(),
}));
const { fetchOwnProfile, updateOwnProfile } = mocks;

vi.mock("@/data/profileRepository", async () => {
  const actual = await vi.importActual<typeof import("@/data/profileRepository")>(
    "@/data/profileRepository",
  );
  return {
    ...actual,
    fetchOwnProfile: mocks.fetchOwnProfile,
    updateOwnProfile: mocks.updateOwnProfile,
  };
});


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
    signOut: vi.fn(),
  }),
}));

import AccountPage from "@/pages/AccountPage";
import RequireAuth, { safeReturnPath } from "@/auth/RequireAuth";
import { I18nProvider } from "@/lib/i18n";
import { CartProvider } from "@/lib/cart";

const PROFILE = {
  id: "user-1",
  display_name: "Bill",
  preferred_language: "de" as const,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

const renderAccount = () =>
  render(
    <I18nProvider>
      <CartProvider>
        <MemoryRouter initialEntries={["/account"]}>
          <Routes>
            <Route path="/" element={<div>home page</div>} />
            <Route path="/login" element={<div>login page</div>} />
            <Route
              path="/account"
              element={
                <RequireAuth>
                  <AccountPage />
                </RequireAuth>
              }
            />
          </Routes>
        </MemoryRouter>
      </CartProvider>
    </I18nProvider>,
  );

describe("/account", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authLoading = false;
    currentUser = { id: "user-1", email: "user@example.test" };
    fetchOwnProfile.mockResolvedValue({ profile: PROFILE, error: null });
    updateOwnProfile.mockResolvedValue({
      profile: { ...PROFILE, display_name: "Bill B", preferred_language: "fr" },
      error: null,
    });
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
    expect(screen.getByLabelText(/E-mail/i)).toHaveValue("user@example.test");
    await waitFor(() =>
      expect((screen.getByLabelText(/Langue préférée/i) as HTMLSelectElement).value).toBe("de"),
    );
  });

  it("saves display_name and preferred_language", async () => {
    const user = userEvent.setup();
    renderAccount();
    const input = await screen.findByDisplayValue("Bill");
    await user.clear(input);
    await user.type(input, "  Bill B  ");
    await user.selectOptions(screen.getByLabelText(/Langue préférée/i), "fr");
    await user.click(screen.getByRole("button", { name: /Enregistrer/i }));

    await waitFor(() =>
      expect(updateOwnProfile).toHaveBeenCalledWith("user-1", {
        display_name: "Bill B",
        preferred_language: "fr",
      }),
    );
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

  it("shows a safe error when the update fails", async () => {
    updateOwnProfile.mockResolvedValue({ profile: null, error: "profile.saveFailed" });
    const user = userEvent.setup();
    renderAccount();
    await screen.findByDisplayValue("Bill");
    await user.click(screen.getByRole("button", { name: /Enregistrer/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/enregistrer/i);
  });

  it("shows a safe error when the profile row is missing", async () => {
    fetchOwnProfile.mockResolvedValue({ profile: null, error: "profile.missing" });
    renderAccount();
    expect(await screen.findByRole("alert")).toHaveTextContent(/introuvable/i);
  });

  it("shows a safe error when Supabase is unavailable", async () => {
    fetchOwnProfile.mockResolvedValue({ profile: null, error: "auth.unavailable" });
    renderAccount();
    expect(await screen.findByRole("alert")).toHaveTextContent(/indisponible/i);
  });

  it("shows success then navigates to / after a successful update", async () => {
    const user = userEvent.setup();
    renderAccount();
    const input = await screen.findByDisplayValue("Bill");
    await user.clear(input);
    await user.type(input, "  Bill B  ");
    await user.selectOptions(screen.getByLabelText(/Langue préférée/i), "fr");
    await user.click(screen.getByRole("button", { name: /Enregistrer/i }));

    await waitFor(() =>
      expect(updateOwnProfile).toHaveBeenCalledWith("user-1", {
        display_name: "Bill B",
        preferred_language: "fr",
      }),
    );
    // Success message shown immediately; still on /account (no home text yet).
    expect(await screen.findByRole("status")).toHaveTextContent(/enregistré/i);
    expect(screen.queryByText("home page")).not.toBeInTheDocument();

    // After ~1s delay, internal React Router navigation to / occurs.
    await waitFor(() => expect(screen.getByText("home page")).toBeInTheDocument(), {
      timeout: 3000,
    });
  }, 6000);

  it("stays on /account when the update fails", async () => {
    updateOwnProfile.mockResolvedValue({ profile: null, error: "profile.saveFailed" });
    const user = userEvent.setup();
    renderAccount();
    await screen.findByDisplayValue("Bill");
    await user.click(screen.getByRole("button", { name: /Enregistrer/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/enregistrer/i);
    expect(screen.queryByText("home page")).not.toBeInTheDocument();
  });

  it("does not redirect before the successful update is confirmed", async () => {
    // Keep the update promise pending forever so the DB never "confirms".
    updateOwnProfile.mockReturnValue(new Promise(() => {}));
    const user = userEvent.setup();
    renderAccount();
    await screen.findByDisplayValue("Bill");
    await user.click(screen.getByRole("button", { name: /Enregistrer/i }));

    // While the update promise is still pending (not yet confirmed),
    // the 1s redirect timer is never scheduled, so navigation never occurs.
    // Give it more than the redirect delay to prove no early navigation happens.
    await new Promise((r) => setTimeout(r, 1200));
    expect(screen.queryByText("home page")).not.toBeInTheDocument();
    // Still on the account page: the form button is present.
    expect(screen.getByRole("button", { name: /Enregistrer/i })).toBeInTheDocument();
  }, 6000);
});
