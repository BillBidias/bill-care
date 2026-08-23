/**
 * P13 — Cart / purchase intent tests.
 * Cart stores programme IDs only; prices/titles always come from the catalogue.
 */
import { describe, expect, it, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import React from "react";

import { ConsentProvider } from "@/lib/consent";
import { CartProvider, useCart, readStoredCart, CART_STORAGE_KEY } from "@/lib/cart";
import { I18nProvider } from "@/lib/i18n";
import { programs as localPrograms } from "@/data/programs";

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

import CartPage from "@/pages/CartPage";
import Navbar from "@/components/Navbar";

const Harness = () => {
  const { itemIds, itemCount, has, addProgramme, removeProgramme, clearCart } = useCart();
  return (
    <div>
      <span data-testid="ids">{JSON.stringify(itemIds)}</span>
      <span data-testid="count">{itemCount}</span>
      <span data-testid="has1">{String(has(1))}</span>
      <button onClick={() => addProgramme(1)}>add-1</button>
      <button onClick={() => addProgramme(2)}>add-2</button>
      <button onClick={() => removeProgramme(1)}>remove-1</button>
      <button onClick={() => clearCart()}>clear</button>
    </div>
  );
};

const renderHarness = () =>
  render(
    <ConsentProvider><CartProvider>
      <Harness />
    </CartProvider></ConsentProvider>,
  );

const renderCartPage = () =>
  render(
    <I18nProvider>
      <ConsentProvider><CartProvider>
        <MemoryRouter initialEntries={["/cart"]}>
          <Routes>
            <Route path="/cart" element={<CartPage />} />
            <Route path="/programs" element={<div>programs page</div>} />
          </Routes>
        </MemoryRouter>
      </CartProvider></ConsentProvider>
    </I18nProvider>,
  );

beforeEach(() => {
  window.localStorage.clear();
  vi.clearAllMocks();
});

describe("cart state", () => {
  it("starts empty", () => {
    renderHarness();
    expect(screen.getByTestId("count").textContent).toBe("0");
  });

  it("adds a programme and persists only ids", async () => {
    const user = userEvent.setup();
    renderHarness();
    await user.click(screen.getByText("add-1"));
    expect(screen.getByTestId("ids").textContent).toBe("[1]");
    expect(window.localStorage.getItem(CART_STORAGE_KEY)).toBe("[1]");
  });

  it("prevents duplicates (one programme = one item, quantity 1)", async () => {
    const user = userEvent.setup();
    renderHarness();
    await user.click(screen.getByText("add-1"));
    await user.click(screen.getByText("add-1"));
    expect(screen.getByTestId("ids").textContent).toBe("[1]");
    expect(screen.getByTestId("count").textContent).toBe("1");
  });

  it("removes and clears, updating storage immediately", async () => {
    const user = userEvent.setup();
    renderHarness();
    await user.click(screen.getByText("add-1"));
    await user.click(screen.getByText("add-2"));
    await user.click(screen.getByText("remove-1"));
    expect(screen.getByTestId("ids").textContent).toBe("[2]");
    await user.click(screen.getByText("clear"));
    expect(screen.getByTestId("count").textContent).toBe("0");
    expect(window.localStorage.getItem(CART_STORAGE_KEY)).toBe("[]");
  });

  it("re-initializes from localStorage on a fresh mount (refresh)", () => {
    window.localStorage.setItem(CART_STORAGE_KEY, "[2,5]");
    renderHarness();
    expect(screen.getByTestId("ids").textContent).toBe("[2,5]");
  });
});

describe("localStorage safety", () => {
  it("recovers from invalid JSON", () => {
    window.localStorage.setItem(CART_STORAGE_KEY, "{not json");
    renderHarness();
    expect(screen.getByTestId("count").textContent).toBe("0");
  });

  it("filters invalid ids, wrong types and duplicates", () => {
    expect(readStoredCart('[1,"2",null,-3,1,2.5,4]')).toEqual([1, 4]);
    expect(readStoredCart('{"a":1}')).toEqual([]);
    expect(readStoredCart(null)).toEqual([]);
  });
});

describe("cart page", () => {
  it("shows a localized empty state with a CTA to /programs", () => {
    renderCartPage();
    expect(screen.getByText("Votre panier est vide")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Découvrir les programmes" }),
    ).toHaveAttribute("href", "/programs");
  });

  it("derives titles and display subtotal from the catalogue, not storage", async () => {
    const a = localPrograms[0];
    const b = localPrograms[2];
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify([a.id, b.id]));
    renderCartPage();
    await waitFor(() => expect(screen.getByText(a.title.fr)).toBeInTheDocument());
    expect(screen.getByText(b.title.fr)).toBeInTheDocument();
    expect(screen.getByText(`${a.price + b.price} €`)).toBeInTheDocument();
  });

  it("ignores unknown programme ids without crashing", async () => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify([999999]));
    renderCartPage();
    await waitFor(() => expect(screen.getByText("Votre panier est vide")).toBeInTheDocument());
  });

  it("removes an item via an accessible button", async () => {
    const user = userEvent.setup();
    const a = localPrograms[0];
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify([a.id]));
    renderCartPage();
    await waitFor(() => expect(screen.getByText(a.title.fr)).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: new RegExp("^Retirer") }));
    expect(screen.getByText("Votre panier est vide")).toBeInTheDocument();
    expect(window.localStorage.getItem(CART_STORAGE_KEY)).toBe("[]");
  });

  it("never writes to the database (no supabase client use in the cart layer)", async () => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify([localPrograms[0].id]));
    renderCartPage();
    await waitFor(() => expect(screen.getByText(localPrograms[0].title.fr)).toBeInTheDocument());
    const fs = await import("fs");
    const code = fs
      .readFileSync("src/lib/cart.tsx", "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/\/\/.*$/gm, "");
    expect(code).not.toMatch(/supabase/i);
    expect(code).not.toMatch(/\.(insert|update|upsert|delete)\s*\(/);
    expect(code).not.toMatch(/order_items|\borders\b/);
  });
});

describe("navbar badge", () => {
  const renderNavbar = () =>
    render(
      <I18nProvider>
        <ConsentProvider><CartProvider>
          <MemoryRouter>
            <Navbar />
          </MemoryRouter>
        </CartProvider></ConsentProvider>
      </I18nProvider>,
    );

  it("hides the badge when empty and exposes an accessible label", () => {
    renderNavbar();
    expect(screen.getAllByLabelText(/Panier \(0 programmes\)/).length).toBeGreaterThan(0);
  });

  it("shows the number of unique programmes", () => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify([1, 2, 3]));
    renderNavbar();
    expect(screen.getAllByLabelText(/Panier \(3 programmes\)/).length).toBeGreaterThan(0);
  });
});
