/**
 * P14 — First-party consent manager (no third-party CMP, no trackers).
 *
 * Optional categories default to OFF and can only become true through an
 * explicit user action. Malformed storage fails closed.
 * NOTHING personal is stored here: no email, user id, token, cart or payment data.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export const CONSENT_STORAGE_KEY = "bill-care:consent:v1";
export const CONSENT_VERSION = 1;

export type ConsentState = {
  version: number;
  /** Always true: strictly required for functionality requested by the user. */
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  /** ISO timestamp of the last explicit decision. */
  updatedAt: string;
};

/** Fail-closed default used before any decision and on malformed storage. */
export const DEFAULT_CONSENT: ConsentState = {
  version: CONSENT_VERSION,
  necessary: true,
  analytics: false,
  marketing: false,
  updatedAt: "",
};

export function parseConsent(raw: string | null): ConsentState | null {
  if (!raw) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof parsed !== "object" || parsed === null) return null;
  const value = parsed as Record<string, unknown>;
  if (value.version !== CONSENT_VERSION) return null;
  if (typeof value.analytics !== "boolean" || typeof value.marketing !== "boolean") return null;
  if (typeof value.updatedAt !== "string" || value.updatedAt.length === 0) return null;
  return {
    version: CONSENT_VERSION,
    necessary: true,
    analytics: value.analytics,
    marketing: value.marketing,
    updatedAt: value.updatedAt,
  };
}

function loadConsent(): ConsentState | null {
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    return parseConsent(window.localStorage.getItem(CONSENT_STORAGE_KEY));
  } catch {
    return null;
  }
}

function persistConsent(state: ConsentState) {
  try {
    if (typeof window === "undefined" || !window.localStorage) return;
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable — consent stays in memory, still fails closed */
  }
}

/* ------------------------------------------------------------------ */
/* Optional script gate (readable outside React by future integrations) */
/* ------------------------------------------------------------------ */

let currentConsent: ConsentState = DEFAULT_CONSENT;
const listeners = new Set<(state: ConsentState) => void>();

function setCurrentConsent(state: ConsentState) {
  currentConsent = state;
  listeners.forEach((fn) => fn(state));
}

export const getConsent = (): ConsentState => currentConsent;
/** Gate for any FUTURE analytics integration. False until explicit consent. */
export const canUseAnalytics = (): boolean => currentConsent.analytics === true;
/** Gate for any FUTURE marketing integration. False until explicit consent. */
export const canUseMarketing = (): boolean => currentConsent.marketing === true;

export function subscribeToConsent(fn: (state: ConsentState) => void): () => void {
  listeners.add(fn);
  fn(currentConsent);
  return () => listeners.delete(fn);
}

/** Test helper: restores the fail-closed default. */
export function resetConsentRuntime() {
  currentConsent = DEFAULT_CONSENT;
}

/* ------------------------------------------------------------------ */

export type ConsentContextValue = {
  consent: ConsentState;
  /** True until the user has made an explicit choice (banner visible). */
  needsDecision: boolean;
  settingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
  acceptAll: () => void;
  rejectOptional: () => void;
  savePreferences: (choice: { analytics: boolean; marketing: boolean }) => void;
  withdrawAll: () => void;
};

const ConsentContext = createContext<ConsentContextValue | null>(null);

export const ConsentProvider = ({ children }: { children: ReactNode }) => {
  const [stored, setStored] = useState<ConsentState | null>(loadConsent);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const consent = stored ?? DEFAULT_CONSENT;

  useEffect(() => {
    setCurrentConsent(consent);
  }, [consent]);

  const commit = useCallback((choice: { analytics: boolean; marketing: boolean }) => {
    const next: ConsentState = {
      version: CONSENT_VERSION,
      necessary: true,
      analytics: choice.analytics === true,
      marketing: choice.marketing === true,
      updatedAt: new Date().toISOString(),
    };
    setStored(next);
    setCurrentConsent(next);
    persistConsent(next);
  }, []);

  const value = useMemo<ConsentContextValue>(
    () => ({
      consent,
      needsDecision: stored === null,
      settingsOpen,
      openSettings: () => setSettingsOpen(true),
      closeSettings: () => setSettingsOpen(false),
      acceptAll: () => {
        commit({ analytics: true, marketing: true });
        setSettingsOpen(false);
      },
      rejectOptional: () => {
        commit({ analytics: false, marketing: false });
        setSettingsOpen(false);
      },
      savePreferences: (choice) => {
        commit(choice);
        setSettingsOpen(false);
      },
      withdrawAll: () => {
        commit({ analytics: false, marketing: false });
        setSettingsOpen(false);
      },
    }),
    [consent, stored, settingsOpen, commit],
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
};

export const useConsent = (): ConsentContextValue => {
  const ctx = useContext(ConsentContext);
  if (!ctx) throw new Error("useConsent must be used within a ConsentProvider");
  return ctx;
};
