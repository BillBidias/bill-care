/**
 * P14 — Legal document version metadata.
 *
 * Status lifecycle: DRAFT → BUSINESS INPUT → LEGAL REVIEW → PRODUCTION APPROVAL.
 * Generated content is ALWAYS `draft`. Only a real, explicitly supplied
 * professional/business approval may ever change a status here.
 * These versions will later be referenced by trusted checkout acceptance
 * records (server-side, not in P14).
 */

export type LegalDocumentStatus = "draft" | "reviewed" | "approved";

export type LegalDocumentKey =
  | "impressum"
  | "privacy"
  | "terms"
  | "withdrawal"
  | "cookies"
  | "medicalDisclaimer";

export type LegalDocumentMeta = {
  key: LegalDocumentKey;
  version: string;
  /** ISO date the version was authored. Not an approval date. */
  effectiveDate: string;
  status: LegalDocumentStatus;
};

export const legalDocuments: Record<LegalDocumentKey, LegalDocumentMeta> = {
  impressum: { key: "impressum", version: "0.1.0", effectiveDate: "2026-08-23", status: "draft" },
  privacy: { key: "privacy", version: "0.1.0", effectiveDate: "2026-08-23", status: "draft" },
  terms: { key: "terms", version: "0.1.0", effectiveDate: "2026-08-23", status: "draft" },
  withdrawal: { key: "withdrawal", version: "0.1.0", effectiveDate: "2026-08-23", status: "draft" },
  cookies: { key: "cookies", version: "0.1.0", effectiveDate: "2026-08-23", status: "draft" },
  medicalDisclaimer: {
    key: "medicalDisclaimer",
    version: "0.1.0",
    effectiveDate: "2026-08-23",
    status: "draft",
  },
};

/** True when every legal document is still unapproved draft content. */
export const allDocumentsAreDraft = (): boolean =>
  Object.values(legalDocuments).every((d) => d.status === "draft");

/**
 * German is treated as the legal master language for a Germany-based
 * deployment once operator details are confirmed. FR/EN are informational
 * translations unless separately reviewed.
 */
export const LEGAL_MASTER_LANGUAGE = "de" as const;
