/**
 * P14 — Legal / business identity configuration.
 *
 * NO VALUE IN THIS FILE MAY BE INVENTED.
 * Every field that has not been supplied by the operator is `REQUIRED_INPUT`
 * and must be filled before any production publication. Never place secrets
 * (service_role, sb_secret_*, DB passwords, tokens) in this file.
 */

export const REQUIRED_INPUT = "REQUIRED_INPUT" as const;
export type RequiredInput = typeof REQUIRED_INPUT;

/** A legal value is either a confirmed string or an explicit missing marker. */
export type LegalValue = string | RequiredInput;

export const isMissing = (value: LegalValue): value is RequiredInput =>
  value === REQUIRED_INPUT;

export type LegalConfig = {
  /** Brand shown in the UI (marketing name, not a legal identity claim). */
  brandName: string;
  /** Natural person or company that legally operates the service. */
  operatorName: LegalValue;
  /** e.g. sole proprietor / GmbH / UG — must not be guessed. */
  legalForm: LegalValue;
  /** Full postal business address (street, postal code, city, country). */
  addressLine1: LegalValue;
  addressLine2: LegalValue;
  postalCode: LegalValue;
  city: LegalValue;
  country: LegalValue;
  /** Person authorised to represent the operator (§5 TMG / DDG). */
  representative: LegalValue;
  email: LegalValue;
  phone: LegalValue;
  /** Commercial register court + number, where applicable. */
  registerCourt: LegalValue;
  registerNumber: LegalValue;
  /** USt-IdNr. (§27a UStG) or business/tax ID, where applicable. */
  vatId: LegalValue;
  /** Supervisory / competent authority, where applicable. */
  supervisoryAuthority: LegalValue;
  /** Professional title (e.g. Physiotherapeut/in) and awarding country. */
  professionalTitle: LegalValue;
  professionalTitleCountry: LegalValue;
  /** Professional regulations and where they can be consulted. */
  professionalRegulations: LegalValue;
  professionalRegulationsUrl: LegalValue;
  /** Professional chamber / association, where applicable. */
  professionalChamber: LegalValue;
  /** Data protection controller contact (may equal operator contact). */
  privacyContactEmail: LegalValue;
  /** Data protection officer — only if one is actually appointed. */
  dataProtectionOfficer: LegalValue;
  /** Competent data protection supervisory authority for complaints. */
  dataProtectionAuthority: LegalValue;
  /** Hosting / infrastructure providers actually verified. */
  hostingProvider: LegalValue;
  /** EU ODR / consumer arbitration statement. */
  disputeResolution: LegalValue;
};

/**
 * The operator details below are provisional and sourced from the currently
 * published Bill Physio imprint. They must be reviewed before production and
 * can be replaced here without changing the legal-page components.
 */
export const legalConfig: LegalConfig = {
  brandName: "Dein Digital-PHYSIO",
  operatorName: "Bidias Thina Bill Hyacinthe",
  legalForm: "Einzelunternehmen",
  addressLine1: "Traubenstraße 16",
  addressLine2: REQUIRED_INPUT,
  postalCode: "55545",
  city: "Bad Kreuznach",
  country: "Deutschland",
  representative: "Bidias Thina Bill Hyacinthe",
  email: "kontakt@bill-physio.de",
  phone: "0671 97029941",
  registerCourt: "Kein Handelsregistereintrag (Einzelunternehmen)",
  registerNumber: "Nicht zutreffend",
  vatId: REQUIRED_INPUT,
  supervisoryAuthority: REQUIRED_INPUT,
  professionalTitle: "Physiotherapeut",
  professionalTitleCountry: "Deutschland",
  professionalRegulations: REQUIRED_INPUT,
  professionalRegulationsUrl: REQUIRED_INPUT,
  professionalChamber: "Physio Deutschland",
  privacyContactEmail: "kontakt@bill-physio.de",
  dataProtectionOfficer: REQUIRED_INPUT,
  dataProtectionAuthority: REQUIRED_INPUT,
  hostingProvider: REQUIRED_INPUT,
  disputeResolution:
    "Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.",
};

/** Every field still awaiting operator/legal input (production blockers). */
export function missingLegalFields(config: LegalConfig = legalConfig): string[] {
  return Object.entries(config)
    .filter(([, value]) => isMissing(value as LegalValue))
    .map(([key]) => key);
}
