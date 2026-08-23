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
 * Only `brandName` is a confirmed product fact. Everything else awaits
 * operator input and is reported as a production blocker.
 */
export const legalConfig: LegalConfig = {
  brandName: "Dein Digital-PHYSIO",
  operatorName: REQUIRED_INPUT,
  legalForm: REQUIRED_INPUT,
  addressLine1: REQUIRED_INPUT,
  addressLine2: REQUIRED_INPUT,
  postalCode: REQUIRED_INPUT,
  city: REQUIRED_INPUT,
  country: REQUIRED_INPUT,
  representative: REQUIRED_INPUT,
  email: REQUIRED_INPUT,
  phone: REQUIRED_INPUT,
  registerCourt: REQUIRED_INPUT,
  registerNumber: REQUIRED_INPUT,
  vatId: REQUIRED_INPUT,
  supervisoryAuthority: REQUIRED_INPUT,
  professionalTitle: REQUIRED_INPUT,
  professionalTitleCountry: REQUIRED_INPUT,
  professionalRegulations: REQUIRED_INPUT,
  professionalRegulationsUrl: REQUIRED_INPUT,
  professionalChamber: REQUIRED_INPUT,
  privacyContactEmail: REQUIRED_INPUT,
  dataProtectionOfficer: REQUIRED_INPUT,
  dataProtectionAuthority: REQUIRED_INPUT,
  hostingProvider: REQUIRED_INPUT,
  disputeResolution: REQUIRED_INPUT,
};

/** Every field still awaiting operator/legal input (production blockers). */
export function missingLegalFields(config: LegalConfig = legalConfig): string[] {
  return Object.entries(config)
    .filter(([, value]) => isMissing(value as LegalValue))
    .map(([key]) => key);
}
