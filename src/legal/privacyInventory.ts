/**
 * P14 — Privacy / data-processing inventory.
 *
 * Documents CURRENT processing only, derived from the actual codebase.
 * Legal bases and retention periods are review placeholders — they are NOT
 * established facts and must not be invented.
 */
import type { LocalizedLabel } from "@/lib/i18n";
import { REQUIRED_INPUT } from "./legalConfig";

export type ProcessingActivity = {
  id: string;
  name: LocalizedLabel;
  purpose: LocalizedLabel;
  dataCategories: LocalizedLabel;
  source: LocalizedLabel;
  storage: LocalizedLabel;
  /** Only stated when actually established; otherwise a review placeholder. */
  retention: LocalizedLabel | typeof REQUIRED_INPUT;
  recipients: LocalizedLabel | typeof REQUIRED_INPUT;
  legalBasisReview: typeof REQUIRED_INPUT;
  thirdCountryTransferReview: typeof REQUIRED_INPUT;
  active: boolean;
};

const REVIEW = REQUIRED_INPUT;

export const processingActivities: ProcessingActivity[] = [
  {
    id: "auth",
    name: {
      fr: "Authentification (compte utilisateur)",
      en: "Authentication (user account)",
      de: "Authentifizierung (Nutzerkonto)",
    },
    purpose: {
      fr: "Création de compte, connexion et maintien de la session.",
      en: "Account creation, sign-in and session maintenance.",
      de: "Kontoerstellung, Anmeldung und Sitzungsverwaltung.",
    },
    dataCategories: {
      fr: "Adresse e-mail, identifiant utilisateur, données de session/authentification.",
      en: "Email address, user id, session/authentication data.",
      de: "E-Mail-Adresse, Nutzer-ID, Sitzungs-/Authentifizierungsdaten.",
    },
    source: {
      fr: "Saisie directe par l’utilisateur.",
      en: "Provided directly by the user.",
      de: "Direkt vom Nutzer angegeben.",
    },
    storage: {
      fr: "Projet Supabase externe utilisé par ce service ; jeton de session dans le stockage local du navigateur.",
      en: "External Supabase project used by this service; session token in browser local storage.",
      de: "Externes Supabase-Projekt dieses Dienstes; Sitzungstoken im lokalen Browser-Speicher.",
    },
    retention: REVIEW,
    recipients: {
      fr: "Fournisseur de base de données / d’authentification utilisé par ce service (Supabase).",
      en: "Database / authentication provider used by this service (Supabase).",
      de: "Von diesem Dienst genutzter Datenbank-/Authentifizierungsanbieter (Supabase).",
    },
    legalBasisReview: REVIEW,
    thirdCountryTransferReview: REVIEW,
    active: true,
  },
  {
    id: "profile",
    name: { fr: "Profil utilisateur", en: "User profile", de: "Nutzerprofil" },
    purpose: {
      fr: "Personnalisation de l’affichage (nom affiché) et langue préférée.",
      en: "Display personalisation (display name) and preferred language.",
      de: "Anzeige-Personalisierung (Anzeigename) und bevorzugte Sprache.",
    },
    dataCategories: {
      fr: "display_name, preferred_language (fr/en/de).",
      en: "display_name, preferred_language (fr/en/de).",
      de: "display_name, preferred_language (fr/en/de).",
    },
    source: { fr: "Saisie par l’utilisateur.", en: "Entered by the user.", de: "Vom Nutzer eingegeben." },
    storage: {
      fr: "Table privée « profiles », accessible uniquement au compte concerné (RLS).",
      en: "Private “profiles” table, accessible only to the owning account (RLS).",
      de: "Private Tabelle „profiles“, nur für das eigene Konto zugänglich (RLS).",
    },
    retention: REVIEW,
    recipients: REVIEW,
    legalBasisReview: REVIEW,
    thirdCountryTransferReview: REVIEW,
    active: true,
  },
  {
    id: "cart",
    name: { fr: "Panier (intention d’achat)", en: "Cart (purchase intent)", de: "Warenkorb (Kaufabsicht)" },
    purpose: {
      fr: "Mémoriser les programmes sélectionnés entre les pages et les visites.",
      en: "Remember selected programmes across pages and visits.",
      de: "Ausgewählte Programme über Seiten und Besuche hinweg merken.",
    },
    dataCategories: {
      fr: "Identifiants numériques de programmes uniquement. Aucune donnée personnelle.",
      en: "Programme numeric identifiers only. No personal data.",
      de: "Nur numerische Programmkennungen. Keine personenbezogenen Daten.",
    },
    source: { fr: "Action de l’utilisateur.", en: "User action.", de: "Nutzeraktion." },
    storage: {
      fr: "Stockage local du navigateur (bill-care:cart:v1). Aucune transmission serveur.",
      en: "Browser local storage (bill-care:cart:v1). No server transmission.",
      de: "Lokaler Browser-Speicher (bill-care:cart:v1). Keine Serverübertragung.",
    },
    retention: {
      fr: "Jusqu’à suppression par l’utilisateur.",
      en: "Until removed by the user.",
      de: "Bis zur Löschung durch den Nutzer.",
    },
    recipients: {
      fr: "Aucun — les données restent sur votre appareil.",
      en: "None — data stays on your device.",
      de: "Keine – die Daten verbleiben auf Ihrem Gerät.",
    },
    legalBasisReview: REVIEW,
    thirdCountryTransferReview: REVIEW,
    active: true,
  },
  {
    id: "catalogue",
    name: { fr: "Catalogue de programmes", en: "Programme catalogue", de: "Programmkatalog" },
    purpose: {
      fr: "Affichage public des programmes et catégories.",
      en: "Public display of programmes and categories.",
      de: "Öffentliche Anzeige von Programmen und Kategorien.",
    },
    dataCategories: {
      fr: "Données produit publiques. Aucune donnée personnelle.",
      en: "Public product data. No personal data.",
      de: "Öffentliche Produktdaten. Keine personenbezogenen Daten.",
    },
    source: { fr: "Contenu de l’éditeur.", en: "Publisher content.", de: "Inhalte des Anbieters." },
    storage: {
      fr: "Tables publiques en lecture seule.",
      en: "Public read-only tables.",
      de: "Öffentliche, nur lesbare Tabellen.",
    },
    retention: REVIEW,
    recipients: REVIEW,
    legalBasisReview: REVIEW,
    thirdCountryTransferReview: REVIEW,
    active: true,
  },
  {
    id: "orders",
    name: {
      fr: "Commandes (fondation technique — NON ACTIVE)",
      en: "Orders (technical foundation — NOT ACTIVE)",
      de: "Bestellungen (technische Grundlage – NICHT AKTIV)",
    },
    purpose: {
      fr: "Une structure de base de données privée existe, mais aucun processus de commande ou de paiement n’est actif ; aucune commande n’est créée.",
      en: "A private database structure exists, but no checkout or payment process is active; no order is created.",
      de: "Eine private Datenbankstruktur existiert, jedoch ist kein Bestell- oder Zahlungsprozess aktiv; es werden keine Bestellungen erstellt.",
    },
    dataCategories: {
      fr: "Aucune donnée traitée actuellement.",
      en: "No data processed at present.",
      de: "Derzeit werden keine Daten verarbeitet.",
    },
    source: { fr: "Sans objet actuellement.", en: "Not applicable at present.", de: "Derzeit nicht anwendbar." },
    storage: {
      fr: "Tables privées « orders » / « order_items » (lecture réservée au propriétaire).",
      en: "Private “orders” / “order_items” tables (owner-only read).",
      de: "Private Tabellen „orders“ / „order_items“ (Lesezugriff nur für Eigentümer).",
    },
    retention: REVIEW,
    recipients: REVIEW,
    legalBasisReview: REVIEW,
    thirdCountryTransferReview: REVIEW,
    active: false,
  },
];

/**
 * Explicit statement of fact for the current MVP: no health data is requested,
 * collected or stored intentionally anywhere in the application.
 */
export const HEALTH_DATA_COLLECTED = false;

export const healthDataStatement: LocalizedLabel = {
  fr: "Cette version du service ne demande, ne collecte ni ne stocke intentionnellement de données de santé. Merci de ne transmettre aucune information de santé via ce site.",
  en: "This version of the service does not intentionally request, collect or store health data. Please do not submit any health information through this site.",
  de: "Diese Version des Dienstes erhebt, verarbeitet und speichert absichtlich keine Gesundheitsdaten. Bitte übermitteln Sie über diese Website keine Gesundheitsinformationen.",
};
