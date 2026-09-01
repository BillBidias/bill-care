/**
 * P01 — Program Finder RED safety regression tests.
 * RED must stop the automated therapeutic path while GREEN/AMBER keep their existing flow.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import { I18nProvider } from "@/lib/i18n";

vi.mock("@/components/Navbar", () => ({ default: () => <div data-testid="navbar" /> }));
vi.mock("@/components/Footer", () => ({ default: () => <div data-testid="footer" /> }));
vi.mock("@/hooks/useCatalogue", () => ({
  useCatalogue: () => ({
    programs: [
      {
        id: 1,
        title: { fr: "Programme test", en: "Test programme", de: "Testprogramm" },
        region: { fr: "Genou", en: "Knee", de: "Knie" },
        image: "🦵",
        price: 49,
      },
    ],
  }),
}));

const repoMocks = vi.hoisted(() => {
  const outcomes = {
    green: {
      level: "green",
      allowsRecommendations: true,
      requiresAcknowledgement: true,
      requiresProfessionalReview: false,
      blocksProgrammeStart: false,
      title: { fr: "GREEN OK", en: "GREEN OK", de: "GREEN OK" },
      body: { fr: "GREEN BODY", en: "GREEN BODY", de: "GREEN BODY" },
    },
    amber: {
      level: "amber",
      allowsRecommendations: true,
      requiresAcknowledgement: true,
      requiresProfessionalReview: true,
      blocksProgrammeStart: true,
      title: { fr: "AMBER REVIEW", en: "AMBER REVIEW", de: "AMBER REVIEW" },
      body: { fr: "AMBER BODY", en: "AMBER BODY", de: "AMBER BODY" },
    },
    red: {
      level: "red",
      allowsRecommendations: false,
      requiresAcknowledgement: false,
      requiresProfessionalReview: true,
      blocksProgrammeStart: true,
      title: { fr: "RED STOP", en: "RED STOP", de: "RED STOP" },
      body: {
        fr: "Évaluation professionnelle requise avant tout programme automatique.",
        en: "Professional assessment is required before any automatic programme.",
        de: "Vor einem automatischen Programm ist eine fachliche Abklärung erforderlich.",
      },
    },
  } as const;

  const config = {
    bodyRegions: [{ key: "knee", label: { fr: "Genou", en: "Knee", de: "Knie" }, sortOrder: 0 }],
    goals: [{ key: "relief", label: { fr: "Soulager", en: "Relief", de: "Linderung" }, sortOrder: 0 }],
    options: [
      {
        id: "symptom-1",
        stableKey: "pain",
        optionType: "symptom",
        sortOrder: 0,
        label: { fr: "Douleur", en: "Pain", de: "Schmerz" },
        helpText: {},
        bodyRegions: ["knee"],
        programmeScores: [{ programmeId: 1, score: 10 }],
      },
    ],
    safetyQuestions: [
      {
        id: "safety-1",
        stableKey: "red-flag",
        riskIfYes: "red",
        riskIfNo: "green",
        isGlobal: true,
        sortOrder: 0,
        question: { fr: "Signal d’alerte ?", en: "Warning sign?", de: "Warnsignal?" },
        helpText: {},
        bodyRegions: [],
      },
    ],
    safetyOutcomes: Object.values(outcomes),
    acknowledgement: {
      version: "test",
      title: { fr: "Avertissement", en: "Acknowledgement", de: "Hinweis" },
      body: { fr: "Texte avertissement", en: "Acknowledgement body", de: "Hinweistext" },
      checkboxLabel: { fr: "J’ai compris", en: "I understand", de: "Ich verstehe" },
    },
    recommendationPolicy: {
      version: "test",
      maxResults: 3,
      minScore: 1,
      primaryBodyRegionWeight: 10,
      secondaryBodyRegionWeight: 6,
      goalWeight: 5,
      assessmentSignalMultiplier: 1,
      icd10SignalMultiplier: 1,
    },
    programmeBodyRegions: [{ programmeId: 1, bodyRegionKey: "knee", isPrimary: true }],
    programmeGoals: [{ programmeId: 1, goalKey: "relief" }],
    icd10Matches: [],
  };

  return {
    outcome: "green" as "green" | "amber" | "red",
    outcomes,
    config,
    rankProgrammes: vi.fn(() => [
      { programmeId: 1, score: 20, matchedOptionCount: 1, matchedGoal: true, matchedIcd10: false },
    ]),
  };
});

vi.mock("@/data/programFinderRepository", async () => {
  const actual = await vi.importActual<typeof import("@/data/programFinderRepository")>(
    "@/data/programFinderRepository",
  );
  return {
    ...actual,
    loadProgramFinderConfig: vi.fn(async () => repoMocks.config),
    getApplicableSafetyQuestions: vi.fn(() => repoMocks.config.safetyQuestions),
    evaluateSafety: vi.fn(() => repoMocks.outcomes[repoMocks.outcome]),
    rankProgrammes: repoMocks.rankProgrammes,
  };
});

import ProgramFinderPage from "@/pages/ProgramFinderPage";

const renderFinder = () =>
  render(
    <I18nProvider>
      <MemoryRouter initialEntries={["/program-finder"]}>
        <ProgramFinderPage />
      </MemoryRouter>
    </I18nProvider>,
  );

async function advanceToSafety(user: ReturnType<typeof userEvent.setup>) {
  await screen.findByText("Genou");
  await user.click(screen.getByRole("button", { name: "Genou" }));
  await user.click(screen.getByRole("button", { name: /Continuer/ }));
  await user.click(screen.getByRole("button", { name: "Douleur" }));
  await user.click(screen.getByRole("button", { name: /Continuer/ }));
  await user.click(screen.getByRole("button", { name: /Continuer/ }));
  await user.click(screen.getByRole("button", { name: "Soulager" }));
  await user.click(screen.getByRole("button", { name: /Continuer/ }));
  await user.click(screen.getByRole("button", { name: /Continuer/ }));
  await screen.findByText("Signal d’alerte ?");
}

async function completeAllowedFlow(level: "green" | "amber") {
  repoMocks.outcome = level;
  const user = userEvent.setup();
  renderFinder();
  await advanceToSafety(user);
  await user.click(screen.getByRole("button", { name: "Non" }));
  await user.click(screen.getByRole("button", { name: "Évaluer la sécurité" }));
  expect(await screen.findByText(repoMocks.outcomes[level].title.fr)).toBeInTheDocument();
  expect(screen.getByText("Avertissement")).toBeInTheDocument();
  await user.click(screen.getByRole("checkbox"));
  await user.click(screen.getByRole("button", { name: /Voir les programmes recommandés/ }));
  expect(await screen.findByText("Programmes potentiellement pertinents")).toBeInTheDocument();
  expect(screen.getByText("Programme test")).toBeInTheDocument();
}

beforeEach(() => {
  repoMocks.outcome = "green";
  repoMocks.rankProgrammes.mockClear();
});

describe("Program Finder safety gating", () => {
  it("preserves GREEN recommendation flow", async () => {
    await completeAllowedFlow("green");
    expect(repoMocks.rankProgrammes).toHaveBeenCalled();
  });

  it("preserves AMBER recommendation flow", async () => {
    await completeAllowedFlow("amber");
    expect(repoMocks.rankProgrammes).toHaveBeenCalled();
  });

  it("RED stops automated therapeutic progression and keeps professional safety orientation visible", async () => {
    repoMocks.outcome = "red";
    const user = userEvent.setup();
    renderFinder();
    await advanceToSafety(user);
    await user.click(screen.getByRole("button", { name: "Oui" }));
    await user.click(screen.getByRole("button", { name: "Évaluer la sécurité" }));

    expect(await screen.findByText("RED STOP")).toBeInTheDocument();
    expect(
      screen.getByText("Évaluation professionnelle requise avant tout programme automatique."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Voir les programmes recommandés/ }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Programmes potentiellement pertinents")).not.toBeInTheDocument();
    expect(screen.queryByText("Programme test")).not.toBeInTheDocument();
    await waitFor(() => expect(repoMocks.rankProgrammes).not.toHaveBeenCalled());
  });
});
