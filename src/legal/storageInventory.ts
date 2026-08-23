/**
 * P14 — Browser / device storage inventory.
 *
 * Audited from the actual codebase (P14 inspection). Covers cookies,
 * localStorage, sessionStorage and authentication persistence.
 * If a future change adds storage, it MUST be added here.
 */
import type { LocalizedLabel } from "@/lib/i18n";

export type StorageKind = "localStorage" | "sessionStorage" | "cookie";
export type ConsentCategory = "necessary" | "analytics" | "marketing";

export type StorageEntry = {
  id: string;
  /** Concrete key/name as written by the application. */
  name: string;
  kind: StorageKind;
  category: ConsentCategory;
  /** First party unless a third party actually sets it. */
  provider: "first-party" | "supabase";
  purpose: LocalizedLabel;
  retention: LocalizedLabel;
};

export const storageInventory: StorageEntry[] = [
  {
    id: "cart",
    name: "bill-care:cart:v1",
    kind: "localStorage",
    category: "necessary",
    provider: "first-party",
    purpose: {
      fr: "Conserve uniquement les identifiants des programmes ajoutés au panier (intention d’achat), fonctionnalité demandée par l’utilisateur.",
      en: "Stores only the identifiers of programmes added to the cart (purchase intent) — functionality requested by the user.",
      de: "Speichert ausschließlich die Kennungen der in den Warenkorb gelegten Programme (Kaufabsicht) – vom Nutzer angeforderte Funktion.",
    },
    retention: {
      fr: "Jusqu’à suppression par l’utilisateur ou effacement du stockage du navigateur.",
      en: "Until removed by the user or browser storage is cleared.",
      de: "Bis zur Löschung durch den Nutzer oder zum Leeren des Browser-Speichers.",
    },
  },
  {
    id: "consent",
    name: "bill-care:consent:v1",
    kind: "localStorage",
    category: "necessary",
    provider: "first-party",
    purpose: {
      fr: "Mémorise votre choix concernant les technologies optionnelles afin de ne pas vous redemander à chaque visite.",
      en: "Remembers your choice regarding optional technologies so you are not asked again on every visit.",
      de: "Speichert Ihre Entscheidung zu optionalen Technologien, damit Sie nicht bei jedem Besuch erneut gefragt werden.",
    },
    retention: {
      fr: "Jusqu’à modification ou suppression par l’utilisateur.",
      en: "Until changed or removed by the user.",
      de: "Bis zur Änderung oder Löschung durch den Nutzer.",
    },
  },
  {
    id: "supabase-auth",
    name: "sb-<project-ref>-auth-token",
    kind: "localStorage",
    category: "necessary",
    provider: "supabase",
    purpose: {
      fr: "Persistance de session d’authentification (connexion à votre compte). Créée uniquement lorsque vous vous connectez.",
      en: "Authentication session persistence (staying signed in to your account). Only created when you sign in.",
      de: "Persistenz der Authentifizierungssitzung (Anmeldung an Ihrem Konto). Wird nur bei der Anmeldung erstellt.",
    },
    retention: {
      fr: "Jusqu’à la déconnexion ou l’expiration de la session.",
      en: "Until sign-out or session expiry.",
      de: "Bis zur Abmeldung oder zum Ablauf der Sitzung.",
    },
  },
];

/**
 * Audit result recorded in P14: no analytics cookie, no marketing pixel, no
 * advertising identifier and no sessionStorage usage exists in the application.
 */
export const optionalStorageInUse: StorageEntry[] = storageInventory.filter(
  (e) => e.category !== "necessary",
);
