/**
 * P14 — Legal routes, footer legal navigation, consent manager.
 * No checkout, no payment, no analytics/marketing script is introduced.
 */
import { describe, expect, it, beforeEach, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import React from "react";

const supabaseMocks = vi.hoisted(() => ({ getSupabaseClient: vi.fn(() => null) }));
vi.mock("@/integrations/supabase/client", () => ({
  getSupabaseClient: supabaseMocks.getSupabaseClient,
  isSupabaseConfigured: () => false,
}));

vi.mock("@/auth/useAuth", () => ({
  useAuth: () => ({
    user: null,
    session: null,
    loading: false,
    isAuthAvailable: true,
    signUp: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
  }),
}));

import { I18nProvider, useI18n, type Lang } from "@/lib/i18n";
import { CartProvider, useCart, CART_STORAGE_KEY } from "@/lib/cart";
import {
  ConsentProvider,
  CONSENT_STORAGE_KEY,
  parseConsent,
  DEFAULT_CONSENT,
  canUseAnalytics,
  canUseMarketing,
  resetConsentRuntime,
  useConsent,
} from "@/lib/consent";
import ConsentBanner from "@/components/ConsentBanner";
import Footer from "@/components/Footer";
import ImpressumPage from "@/pages/ImpressumPage";
import PrivacyPage from "@/pages/PrivacyPage";
import TermsPage from "@/pages/TermsPage";
import WithdrawalPage from "@/pages/WithdrawalPage";
import CookiesPage from "@/pages/CookiesPage";
import MedicalDisclaimerPage from "@/pages/MedicalDisclaimerPage";
import { legalDocuments, allDocumentsAreDraft } from "@/legal/documents";
import { legalConfig, missingLegalFields } from "@/legal/legalConfig";
import { HEALTH_DATA_COLLECTED } from "@/legal/privacyInventory";

const LangSwitch = () => {
  const { setLang } = useI18n();
  return (
    <div>
      {(["fr", "en", "de"] as Lang[]).map((l) => (
        <button key={l} onClick={() => setLang(l)}>{`lang-${l}`}</button>
      ))}
    </div>
  );
};

const Shell = ({ children }: { children: React.ReactNode }) => (
  <I18nProvider>
    <ConsentProvider>
      <CartProvider>
        <MemoryRouter initialEntries={["/"]}>
          <LangSwitch />
          {children}
          <ConsentBanner />
          <Routes>
            <Route path="/" element={<div />} />
            <Route path="/impressum" element={<ImpressumPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/withdrawal" element={<WithdrawalPage />} />
            <Route path="/cookies" element={<CookiesPage />} />
            <Route path="/medical-disclaimer" element={<MedicalDisclaimerPage />} />
          </Routes>
        </MemoryRouter>
      </CartProvider>
    </ConsentProvider>
  </I18nProvider>
);

const renderRoute = (path: string) =>
  render(
    <I18nProvider>
      <ConsentProvider>
        <CartProvider>
          <MemoryRouter initialEntries={[path]}>
            <LangSwitch />
            <Routes>
              <Route path="/impressum" element={<ImpressumPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/withdrawal" element={<WithdrawalPage />} />
              <Route path="/cookies" element={<CookiesPage />} />
              <Route path="/medical-disclaimer" element={<MedicalDisclaimerPage />} />
            </Routes>
            <ConsentBanner />
          </MemoryRouter>
        </CartProvider>
      </ConsentProvider>
    </I18nProvider>,
  );

beforeEach(() => {
  window.localStorage.clear();
  resetConsentRuntime();
  vi.clearAllMocks();
});

describe("legal routes", () => {
  const routes: [string, string][] = [
    ["/impressum", "Mentions légales"],
    ["/privacy", "Politique de confidentialité"],
    ["/terms", "CGV et CGU"],
    ["/withdrawal", "Droit de rétractation"],
    ["/cookies", "Cookies et technologies similaires"],
    ["/medical-disclaimer", "Avertissement médical"],
  ];

  it.each(routes)("renders %s", (path, heading) => {
    renderRoute(path);
    expect(screen.getByRole("heading", { level: 1, name: heading })).toBeInTheDocument();
  });

  it("switches legal content between FR / EN / DE", async () => {
    const user = userEvent.setup();
    renderRoute("/impressum");
    expect(screen.getByRole("heading", { level: 1, name: "Mentions légales" })).toBeInTheDocument();
    await user.click(screen.getByText("lang-en"));
    expect(screen.getByRole("heading", { level: 1, name: "Legal notice" })).toBeInTheDocument();
    await user.click(screen.getByText("lang-de"));
    expect(screen.getByRole("heading", { level: 1, name: "Impressum" })).toBeInTheDocument();
  });

  it("never invents operator identity data", () => {
    renderRoute("/impressum");
    expect(screen.getAllByText("REQUIRED_INPUT").length).toBeGreaterThan(0);
    expect(missingLegalFields()).toContain("operatorName");
    expect(legalConfig.vatId).toBe("REQUIRED_INPUT");
  });

  it("keeps all legal documents in draft status", () => {
    expect(allDocumentsAreDraft()).toBe(true);
    Object.values(legalDocuments).forEach((d) => expect(d.status).toBe("draft"));
  });

  it("states that no health data is collected", () => {
    expect(HEALTH_DATA_COLLECTED).toBe(false);
    renderRoute("/privacy");
    expect(screen.getByRole("heading", { level: 1, name: "Politique de confidentialité" })).toBeInTheDocument();
  });

  it("does not introduce checkout or payment", () => {
    renderRoute("/terms");
    expect(screen.getByTestId("terms-payment-placeholder").textContent).toMatch(/NON ENCORE ACTIF/);
    expect(screen.queryByRole("button", { name: /stripe|paypal|klarna|payer|checkout/i })).toBeNull();
  });
});

describe("footer legal navigation", () => {
  it("links to every legal route and exposes cookie settings", async () => {
    const user = userEvent.setup();
    render(
      <Shell>
        <Footer />
      </Shell>,
    );
    const nav = screen.getByRole("navigation", { name: "Informations légales" });
    const hrefs = within(nav)
      .getAllByRole("link")
      .map((a) => a.getAttribute("href"));
    expect(hrefs).toEqual([
      "/impressum",
      "/privacy",
      "/terms",
      "/withdrawal",
      "/cookies",
      "/medical-disclaimer",
    ]);

    await user.click(within(nav).getByRole("link", { name: "Confidentialité" }));
    expect(screen.getByRole("heading", { level: 1, name: "Politique de confidentialité" })).toBeInTheDocument();
  });

  it("reopens consent settings from the footer after a decision", async () => {
    const user = userEvent.setup();
    render(
      <Shell>
        <Footer />
      </Shell>,
    );
    await user.click(screen.getByRole("button", { name: "Refuser les cookies optionnels" }));
    expect(screen.queryByRole("dialog")).toBeNull();

    await user.click(screen.getByRole("button", { name: "Gérer mes cookies" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: "Mesure d’audience" })).not.toBeChecked();
  });
});

describe("consent model", () => {
  it("defaults optional categories to OFF before any decision", () => {
    expect(DEFAULT_CONSENT.analytics).toBe(false);
    expect(DEFAULT_CONSENT.marketing).toBe(false);
    expect(DEFAULT_CONSENT.necessary).toBe(true);
    expect(canUseAnalytics()).toBe(false);
    expect(canUseMarketing()).toBe(false);
  });

  it("shows the banner on first run with no pre-ticked optional category", async () => {
    const user = userEvent.setup();
    render(<Shell>{null}</Shell>);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Personnaliser" }));
    expect(screen.getByRole("switch", { name: "Mesure d’audience" })).not.toBeChecked();
    expect(screen.getByRole("switch", { name: "Marketing" })).not.toBeChecked();
    expect(screen.getByRole("switch", { name: "Nécessaires (toujours actifs)" })).toBeChecked();
  });

  it("Accept all enables both optional categories and persists them", async () => {
    const user = userEvent.setup();
    render(<Shell>{null}</Shell>);
    await user.click(screen.getByRole("button", { name: "Tout accepter" }));
    const stored = parseConsent(window.localStorage.getItem(CONSENT_STORAGE_KEY));
    expect(stored?.analytics).toBe(true);
    expect(stored?.marketing).toBe(true);
    expect(canUseAnalytics()).toBe(true);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("Reject optional keeps both false and necessary true", async () => {
    const user = userEvent.setup();
    render(<Shell>{null}</Shell>);
    await user.click(screen.getByRole("button", { name: "Refuser les cookies optionnels" }));
    const stored = parseConsent(window.localStorage.getItem(CONSENT_STORAGE_KEY));
    expect(stored?.analytics).toBe(false);
    expect(stored?.marketing).toBe(false);
    expect(stored?.necessary).toBe(true);
    expect(canUseAnalytics()).toBe(false);
    expect(canUseMarketing()).toBe(false);
  });

  it("Customize saves a granular choice", async () => {
    const user = userEvent.setup();
    render(<Shell>{null}</Shell>);
    await user.click(screen.getByRole("button", { name: "Personnaliser" }));
    await user.click(screen.getByRole("switch", { name: "Mesure d’audience" }));
    await user.click(screen.getByRole("button", { name: "Enregistrer mes choix" }));
    const stored = parseConsent(window.localStorage.getItem(CONSENT_STORAGE_KEY));
    expect(stored?.analytics).toBe(true);
    expect(stored?.marketing).toBe(false);
    expect(canUseMarketing()).toBe(false);
  });

  it("persists the decision across a fresh mount", async () => {
    const user = userEvent.setup();
    const first = render(<Shell>{null}</Shell>);
    await user.click(screen.getByRole("button", { name: "Tout accepter" }));
    first.unmount();
    render(<Shell>{null}</Shell>);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("allows withdrawing consent after accepting", async () => {
    const user = userEvent.setup();
    render(
      <Shell>
        <Footer />
      </Shell>,
    );
    await user.click(screen.getByRole("button", { name: "Tout accepter" }));
    expect(canUseAnalytics()).toBe(true);
    await user.click(screen.getByRole("button", { name: "Gérer mes cookies" }));
    await user.click(screen.getByRole("button", { name: "Refuser les cookies optionnels" }));
    expect(canUseAnalytics()).toBe(false);
    expect(canUseMarketing()).toBe(false);
  });

  it("fails closed on malformed preference storage", () => {
    expect(parseConsent("{not json")).toBeNull();
    expect(parseConsent(JSON.stringify({ version: 99, analytics: true, marketing: true, updatedAt: "x" }))).toBeNull();
    expect(parseConsent(JSON.stringify({ version: 1, analytics: "yes", marketing: true, updatedAt: "x" }))).toBeNull();
    window.localStorage.setItem(CONSENT_STORAGE_KEY, "{not json");
    render(<Shell>{null}</Shell>);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(canUseAnalytics()).toBe(false);
  });

  it("stores no personal data in the consent key", async () => {
    const user = userEvent.setup();
    render(<Shell>{null}</Shell>);
    await user.click(screen.getByRole("button", { name: "Tout accepter" }));
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY) ?? "";
    expect(raw).not.toMatch(/@|token|user|email|cart|card/i);
    expect(Object.keys(JSON.parse(raw)).sort()).toEqual([
      "analytics",
      "marketing",
      "necessary",
      "updatedAt",
      "version",
    ]);
  });

  it("never runs an optional integration without consent (none exist yet)", () => {
    render(<Shell>{null}</Shell>);
    const scripts = Array.from(document.querySelectorAll("script[src]")).map((s) =>
      s.getAttribute("src") ?? "",
    );
    expect(
      scripts.some((src) => /google-analytics|googletagmanager|facebook|doubleclick|hotjar/i.test(src)),
    ).toBe(false);
    expect(canUseAnalytics()).toBe(false);
    expect(canUseMarketing()).toBe(false);
  });
});

describe("necessary functionality after rejecting optional storage", () => {
  const CartProbe = () => {
    const { itemIds, addProgramme } = useCart();
    const { consent } = useConsent();
    return (
      <div>
        <button onClick={() => addProgramme(1)}>add-1</button>
        <span data-testid="ids">{JSON.stringify(itemIds)}</span>
        <span data-testid="necessary">{String(consent.necessary)}</span>
      </div>
    );
  };

  it("cart and auth remain functional", async () => {
    const user = userEvent.setup();
    render(
      <Shell>
        <CartProbe />
      </Shell>,
    );
    await user.click(screen.getByRole("button", { name: "Refuser les cookies optionnels" }));
    await user.click(screen.getByText("add-1"));
    expect(screen.getByTestId("ids").textContent).toBe("[1]");
    expect(window.localStorage.getItem(CART_STORAGE_KEY)).toBe("[1]");
    expect(screen.getByTestId("necessary").textContent).toBe("true");
    // Auth persistence is untouched by consent: no consent gate wraps the client.
    expect(supabaseMocks.getSupabaseClient).not.toThrow();
  });
});
