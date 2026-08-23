/**
 * P14 — Privacy policy built from the ACTUAL processing inventory.
 * Legal bases, retention, processors and transfers are review placeholders.
 */
import LegalLayout from "@/components/LegalLayout";
import { useTr } from "@/lib/i18n";
import { legalConfig, isMissing, REQUIRED_INPUT } from "@/legal/legalConfig";
import { processingActivities, healthDataStatement } from "@/legal/privacyInventory";
import { storageInventory } from "@/legal/storageInventory";

const Missing = () => <span className="text-destructive font-mono text-xs">REQUIRED_INPUT</span>;

const PrivacyPage = () => {
  const tr = useTr();
  const c = legalConfig;

  const reviewLabel = tr({
    fr: "à déterminer — revue juridique requise",
    en: "to be determined — legal review required",
    de: "noch festzulegen – juristische Prüfung erforderlich",
  });

  return (
    <LegalLayout
      docKey="privacy"
      title={tr({
        fr: "Politique de confidentialité",
        en: "Privacy policy",
        de: "Datenschutzerklärung",
      })}
      intro={tr({
        fr: "Cette politique décrit uniquement les traitements réellement effectués par la version actuelle du service.",
        en: "This policy describes only the processing actually carried out by the current version of the service.",
        de: "Diese Erklärung beschreibt ausschließlich die tatsächlich durchgeführten Verarbeitungen der aktuellen Version des Dienstes.",
      })}
      sections={[
        {
          heading: tr({ fr: "1. Responsable du traitement", en: "1. Controller", de: "1. Verantwortlicher" }),
          body: (
            <>
              <p>
                {tr({ fr: "Exploitant", en: "Operator", de: "Anbieter" })}:{" "}
                {isMissing(c.operatorName) ? <Missing /> : c.operatorName}
              </p>
              <p>
                {tr({ fr: "Contact vie privée", en: "Privacy contact", de: "Datenschutzkontakt" })}:{" "}
                {isMissing(c.privacyContactEmail) ? <Missing /> : c.privacyContactEmail}
              </p>
              <p>
                {tr({ fr: "Délégué à la protection des données", en: "Data protection officer", de: "Datenschutzbeauftragte:r" })}:{" "}
                {isMissing(c.dataProtectionOfficer) ? <Missing /> : c.dataProtectionOfficer}
              </p>
            </>
          ),
        },
        {
          heading: tr({ fr: "2. Données de santé", en: "2. Health data", de: "2. Gesundheitsdaten" }),
          body: <p>{tr(healthDataStatement)}</p>,
        },
        {
          heading: tr({
            fr: "3. Activités de traitement",
            en: "3. Processing activities",
            de: "3. Verarbeitungstätigkeiten",
          }),
          body: (
            <div className="space-y-6">
              {processingActivities.map((a) => (
                <div key={a.id} className="rounded-xl border border-border p-4">
                  <p className="font-semibold text-foreground">
                    {tr(a.name)}{" "}
                    {!a.active && (
                      <span className="text-xs font-mono text-destructive">
                        {tr({ fr: "NON ACTIVE", en: "NOT ACTIVE", de: "NICHT AKTIV" })}
                      </span>
                    )}
                  </p>
                  <p>
                    <strong>{tr({ fr: "Finalité", en: "Purpose", de: "Zweck" })}: </strong>
                    {tr(a.purpose)}
                  </p>
                  <p>
                    <strong>{tr({ fr: "Catégories de données", en: "Data categories", de: "Datenkategorien" })}: </strong>
                    {tr(a.dataCategories)}
                  </p>
                  <p>
                    <strong>{tr({ fr: "Source", en: "Source", de: "Quelle" })}: </strong>
                    {tr(a.source)}
                  </p>
                  <p>
                    <strong>{tr({ fr: "Stockage", en: "Storage", de: "Speicherung" })}: </strong>
                    {tr(a.storage)}
                  </p>
                  <p>
                    <strong>{tr({ fr: "Conservation", en: "Retention", de: "Speicherdauer" })}: </strong>
                    {a.retention === REQUIRED_INPUT ? reviewLabel : tr(a.retention)}
                  </p>
                  <p>
                    <strong>{tr({ fr: "Destinataires", en: "Recipients", de: "Empfänger" })}: </strong>
                    {a.recipients === REQUIRED_INPUT ? reviewLabel : tr(a.recipients)}
                  </p>
                  <p>
                    <strong>{tr({ fr: "Base légale", en: "Legal basis", de: "Rechtsgrundlage" })}: </strong>
                    {reviewLabel}
                  </p>
                  <p>
                    <strong>
                      {tr({ fr: "Transfert hors UE/EEE", en: "Transfer outside the EU/EEA", de: "Drittlandtransfer" })}:{" "}
                    </strong>
                    {reviewLabel}
                  </p>
                </div>
              ))}
            </div>
          ),
        },
        {
          heading: tr({
            fr: "4. Stockage sur votre appareil",
            en: "4. Storage on your device",
            de: "4. Speicherung auf Ihrem Gerät",
          }),
          body: (
            <ul className="list-disc pl-5 space-y-1">
              {storageInventory.map((s) => (
                <li key={s.id}>
                  <code className="text-xs">{s.name}</code> ({s.kind}) — {tr(s.purpose)}
                </li>
              ))}
            </ul>
          ),
        },
        {
          heading: tr({
            fr: "5. Hébergement et sous-traitants",
            en: "5. Hosting and processors",
            de: "5. Hosting und Auftragsverarbeiter",
          }),
          body: (
            <p>
              {tr({
                fr: "Le service utilise un projet Supabase externe pour l’authentification et la base de données. L’hébergeur du site et les autres sous-traitants n’ont pas encore été vérifiés :",
                en: "The service uses an external Supabase project for authentication and database. The site host and any further processors have not yet been verified:",
                de: "Der Dienst nutzt ein externes Supabase-Projekt für Authentifizierung und Datenbank. Der Hoster der Website sowie weitere Auftragsverarbeiter wurden noch nicht verifiziert:",
              })}{" "}
              {isMissing(c.hostingProvider) ? <Missing /> : c.hostingProvider}
            </p>
          ),
        },
        {
          heading: tr({ fr: "6. Vos droits", en: "6. Your rights", de: "6. Ihre Rechte" }),
          body: (
            <p>
              {tr({
                fr: "Vous disposez, dans les conditions prévues par le RGPD, des droits d’accès, de rectification, d’effacement, de limitation, d’opposition et de portabilité, ainsi que du droit de retirer votre consentement à tout moment pour les traitements fondés sur celui-ci.",
                en: "Subject to the conditions of the GDPR, you have rights of access, rectification, erasure, restriction, objection and portability, and the right to withdraw consent at any time for processing based on it.",
                de: "Nach Maßgabe der DSGVO haben Sie Rechte auf Auskunft, Berichtigung, Löschung, Einschränkung, Widerspruch und Datenübertragbarkeit sowie das Recht, eine Einwilligung jederzeit zu widerrufen.",
              })}
            </p>
          ),
        },
        {
          heading: tr({
            fr: "7. Réclamation auprès d’une autorité de contrôle",
            en: "7. Complaint to a supervisory authority",
            de: "7. Beschwerde bei einer Aufsichtsbehörde",
          }),
          body: (
            <p>
              {tr({ fr: "Autorité compétente", en: "Competent authority", de: "Zuständige Behörde" })}:{" "}
              {isMissing(c.dataProtectionAuthority) ? <Missing /> : c.dataProtectionAuthority}
            </p>
          ),
        },
        {
          heading: tr({
            fr: "8. Retrait du consentement",
            en: "8. Withdrawing consent",
            de: "8. Widerruf der Einwilligung",
          }),
          body: (
            <p>
              {tr({
                fr: "Vous pouvez modifier ou retirer vos choix concernant les technologies optionnelles à tout moment via « Gérer mes cookies » en pied de page.",
                en: "You can change or withdraw your choices regarding optional technologies at any time via “Cookie settings” in the footer.",
                de: "Sie können Ihre Auswahl zu optionalen Technologien jederzeit über „Cookie-Einstellungen“ im Footer ändern oder widerrufen.",
              })}
            </p>
          ),
        },
        {
          heading: tr({
            fr: "9. Modifications de cette politique",
            en: "9. Changes to this policy",
            de: "9. Änderungen dieser Erklärung",
          }),
          body: (
            <p>
              {tr({
                fr: "Cette politique est versionnée. La version et la date figurent en haut de la page.",
                en: "This policy is versioned. The version and date are shown at the top of the page.",
                de: "Diese Erklärung ist versioniert. Version und Datum stehen oben auf der Seite.",
              })}
            </p>
          ),
        },
      ]}
    />
  );
};

export default PrivacyPage;
