/**
 * P03 — Catalogue deep-link regression tests.
 * A valid recommendation target opens the exact programme, while invalid IDs fail safely.
 */
import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";

import { I18nProvider } from "@/lib/i18n";

vi.mock("@/components/Navbar", () => ({ default: () => <div data-testid="navbar" /> }));
vi.mock("@/components/Footer", () => ({ default: () => <div data-testid="footer" /> }));

const programme = {
  id: 7,
  category: "knee-thigh",
  region: { fr: "Genou & cuisse", en: "Knee & thigh", de: "Knie & Oberschenkel" },
  title: { fr: "Programme genou recommandé", en: "Recommended knee programme", de: "Empfohlenes Knieprogramm" },
  price: 69,
  duration: "12 sem.",
  level: "Avancé",
  image: "🦵",
  icd10: "M17",
};

vi.mock("@/hooks/useCatalogue", () => ({
  useCatalogue: () => ({
    programs: [programme],
    categoryKeys: ["knee-thigh"],
    source: "supabase",
    fallbackReason: null,
    loading: false,
  }),
}));

vi.mock("@/lib/cart", () => ({
  useCart: () => ({
    addProgramme: vi.fn(),
    has: vi.fn(() => false),
  }),
}));

import ProgramsPage from "@/pages/ProgramsPage";

const LocationProbe = () => {
  const location = useLocation();
  return <output data-testid="location-search">{location.search}</output>;
};

const renderCatalogue = (entry: string) =>
  render(
    <I18nProvider>
      <MemoryRouter initialEntries={[entry]}>
        <Routes>
          <Route
            path="/programs"
            element={
              <>
                <ProgramsPage />
                <LocationProbe />
              </>
            }
          />
        </Routes>
      </MemoryRouter>
    </I18nProvider>,
  );

describe("programme catalogue deep links", () => {
  it("opens the exact programme requested by a valid program query parameter", async () => {
    renderCatalogue("/programs?program=7");

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("Programme genou recommandé")).toBeInTheDocument();
    expect(screen.getByTestId("location-search")).toHaveTextContent("?program=7");
  });

  it("ignores an unknown programme id without opening a dialog or crashing", async () => {
    renderCatalogue("/programs?program=999");

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(screen.getByText("Programme genou recommandé")).toBeInTheDocument();
    expect(screen.getByTestId("location-search")).toHaveTextContent("?program=999");
  });

  it("removes the program query parameter when the programme dialog closes", async () => {
    const user = userEvent.setup();
    renderCatalogue("/programs?program=7");

    await screen.findByRole("dialog");
    await user.click(screen.getByRole("button", { name: "Close" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(screen.getByTestId("location-search")).toHaveTextContent("");
  });
});
