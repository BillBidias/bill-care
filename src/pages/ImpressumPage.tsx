/**
 * P14 — Impressum / Mentions légales / Legal notice.
 * All operator data is REQUIRED_INPUT until supplied. Nothing is invented.
 */
import LegalLayout from "@/components/LegalLayout";
import { useTr } from "@/lib/i18n";
import { legalConfig, isMissing, type LegalValue } from "@/legal/legalConfig";

const Field = ({ label, value }: { label: string; value: LegalValue }) => (
  <p>
    <span className="font-semibold text-foreground">{label}: </span>
    {isMissing(value) ? (
      <span className="text-destructive font-mono text-xs">REQUIRED_INPUT</span>
    ) : (
      value
    )}
  </p>
);

const ImpressumPage = () => {
  const tr = useTr();
  const c = legalConfig;

  return (
    <LegalLayout
      docKey="impressum"
      title={tr({ fr: "Mentions légales", en: "Legal notice", de: "Impressum" })}
      intro={tr({
        fr: "Informations relatives au fournisseur du service. Les champs marqués REQUIRED_INPUT doivent être complétés par l’exploitant avant toute mise en production.",
        en: "Service provider information. Fields marked REQUIRED_INPUT must be completed by the operator before any production release.",
        de: "Anbieterkennzeichnung. Mit REQUIRED_INPUT markierte Felder müssen vor einer Veröffentlichung vom Betreiber ergänzt werden.",
      })}
      sections={[
        {
          heading: tr({ fr: "Exploitant", en: "Operator", de: "Anbieter" }),
          body: (
            <>
              <Field label={tr({ fr: "Marque", en: "Brand", de: "Marke" })} value={c.brandName} />
              <Field label={tr({ fr: "Nom / raison sociale", en: "Name / entity", de: "Name / Firma" })} value={c.operatorName} />
              <Field label={tr({ fr: "Forme juridique", en: "Legal form", de: "Rechtsform" })} value={c.legalForm} />
              <Field label={tr({ fr: "Représentant", en: "Representative", de: "Vertretungsberechtigte Person" })} value={c.representative} />
            </>
          ),
        },
        {
          heading: tr({ fr: "Adresse", en: "Address", de: "Anschrift" }),
          body: (
            <>
              <Field label={tr({ fr: "Rue", en: "Street", de: "Straße" })} value={c.addressLine1} />
              <Field label={tr({ fr: "Complément", en: "Additional line", de: "Adresszusatz" })} value={c.addressLine2} />
              <Field label={tr({ fr: "Code postal", en: "Postal code", de: "PLZ" })} value={c.postalCode} />
              <Field label={tr({ fr: "Ville", en: "City", de: "Ort" })} value={c.city} />
              <Field label={tr({ fr: "Pays", en: "Country", de: "Land" })} value={c.country} />
            </>
          ),
        },
        {
          heading: tr({ fr: "Contact", en: "Contact", de: "Kontakt" }),
          body: (
            <>
              <Field label={tr({ fr: "E-mail", en: "Email", de: "E-Mail" })} value={c.email} />
              <Field label={tr({ fr: "Téléphone", en: "Phone", de: "Telefon" })} value={c.phone} />
            </>
          ),
        },
        {
          heading: tr({ fr: "Registre et TVA", en: "Register and VAT", de: "Register und Umsatzsteuer" }),
          body: (
            <>
              <Field label={tr({ fr: "Tribunal du registre", en: "Register court", de: "Registergericht" })} value={c.registerCourt} />
              <Field label={tr({ fr: "Numéro d’immatriculation", en: "Registration number", de: "Registernummer" })} value={c.registerNumber} />
              <Field label={tr({ fr: "N° de TVA", en: "VAT ID", de: "USt-IdNr." })} value={c.vatId} />
            </>
          ),
        },
        {
          heading: tr({
            fr: "Profession réglementée",
            en: "Regulated profession",
            de: "Reglementierter Beruf",
          }),
          body: (
            <>
              <Field label={tr({ fr: "Titre professionnel", en: "Professional title", de: "Berufsbezeichnung" })} value={c.professionalTitle} />
              <Field label={tr({ fr: "Pays d’attribution du titre", en: "Country where title was awarded", de: "Verleihungsstaat" })} value={c.professionalTitleCountry} />
              <Field label={tr({ fr: "Chambre / ordre professionnel", en: "Professional chamber", de: "Berufskammer" })} value={c.professionalChamber} />
              <Field label={tr({ fr: "Réglementation applicable", en: "Applicable regulations", de: "Berufsrechtliche Regelungen" })} value={c.professionalRegulations} />
              <Field label={tr({ fr: "Accès à la réglementation", en: "Access to regulations", de: "Zugang zu den Regelungen" })} value={c.professionalRegulationsUrl} />
              <Field label={tr({ fr: "Autorité compétente", en: "Competent authority", de: "Zuständige Aufsichtsbehörde" })} value={c.supervisoryAuthority} />
            </>
          ),
        },
        {
          heading: tr({
            fr: "Règlement des litiges",
            en: "Dispute resolution",
            de: "Streitbeilegung",
          }),
          body: <Field label={tr({ fr: "Information", en: "Information", de: "Hinweis" })} value={c.disputeResolution} />,
        },
      ]}
    />
  );
};

export default ImpressumPage;
