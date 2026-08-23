/**
 * P14 — Terms: AGB (B2C sales terms) + Nutzungsbedingungen (terms of use)
 * as ONE coherent document. Draft only; sensitive clauses flagged for review.
 * No payment provider clauses — no checkout exists.
 */
import LegalLayout from "@/components/LegalLayout";
import { useTr } from "@/lib/i18n";
import { legalConfig, isMissing } from "@/legal/legalConfig";

const Missing = () => <span className="text-destructive font-mono text-xs">REQUIRED_INPUT</span>;

const TermsPage = () => {
  const tr = useTr();
  const c = legalConfig;
  const review = tr({
    fr: "[REVUE JURIDIQUE REQUISE]",
    en: "[LEGAL REVIEW REQUIRED]",
    de: "[JURISTISCHE PRÜFUNG ERFORDERLICH]",
  });

  return (
    <LegalLayout
      docKey="terms"
      title={tr({
        fr: "CGV et CGU",
        en: "Terms & Conditions and Terms of Use",
        de: "AGB und Nutzungsbedingungen",
      })}
      intro={tr({
        fr: "Document unique couvrant les conditions de vente et d’utilisation. Aucun processus de paiement n’est actif à ce stade.",
        en: "Single document covering sales and usage conditions. No payment process is active at this stage.",
        de: "Einheitliches Dokument für Verkaufs- und Nutzungsbedingungen. Derzeit ist kein Zahlungsprozess aktiv.",
      })}
      sections={[
        {
          heading: tr({ fr: "1. Champ d’application", en: "1. Scope", de: "1. Geltungsbereich" }),
          body: (
            <p>
              {tr({
                fr: "Ces conditions régissent l’utilisation du site et, à l’avenir, l’achat de programmes vidéo numériques auprès de l’exploitant",
                en: "These terms govern use of the site and, in future, the purchase of digital video programmes from the operator",
                de: "Diese Bedingungen regeln die Nutzung der Website und künftig den Erwerb digitaler Videoprogramme beim Anbieter",
              })}{" "}
              {isMissing(c.operatorName) ? <Missing /> : c.operatorName}.
            </p>
          ),
        },
        {
          heading: tr({ fr: "2. Compte utilisateur", en: "2. User account", de: "2. Nutzerkonto" }),
          body: (
            <p>
              {tr({
                fr: "Un compte est personnel. Vous êtes responsable de la confidentialité de vos identifiants et des activités effectuées via votre compte.",
                en: "An account is personal. You are responsible for keeping your credentials confidential and for activity carried out through your account.",
                de: "Ein Konto ist persönlich. Sie sind für die Vertraulichkeit Ihrer Zugangsdaten und für Aktivitäten über Ihr Konto verantwortlich.",
              })}
            </p>
          ),
        },
        {
          heading: tr({ fr: "3. Programmes numériques", en: "3. Digital programmes", de: "3. Digitale Programme" }),
          body: (
            <p>
              {tr({
                fr: "Les programmes sont des contenus numériques d’exercices mis à disposition en ligne. Leur contenu peut évoluer.",
                en: "Programmes are digital exercise content made available online. Their content may evolve.",
                de: "Programme sind digitale Übungsinhalte, die online bereitgestellt werden. Ihr Inhalt kann sich ändern.",
              })}
            </p>
          ),
        },
        {
          heading: tr({ fr: "4. Formation du contrat", en: "4. Contract formation", de: "4. Vertragsschluss" }),
          body: (
            <p>
              {review}{" "}
              {tr({
                fr: "Aucun processus de commande n’est actuellement actif : l’ajout au panier constitue une simple intention d’achat et ne crée aucun contrat.",
                en: "No order process is currently active: adding to the cart is a mere purchase intent and creates no contract.",
                de: "Derzeit ist kein Bestellprozess aktiv: Das Hinzufügen zum Warenkorb ist eine bloße Kaufabsicht und begründet keinen Vertrag.",
              })}
            </p>
          ),
        },
        {
          heading: tr({ fr: "5. Disponibilité", en: "5. Availability", de: "5. Verfügbarkeit" }),
          body: (
            <p>
              {tr({
                fr: "L’exploitant s’efforce d’assurer la disponibilité du service, sans garantie d’accès ininterrompu.",
                en: "The operator endeavours to keep the service available, without guaranteeing uninterrupted access.",
                de: "Der Anbieter bemüht sich um die Verfügbarkeit des Dienstes, garantiert jedoch keinen unterbrechungsfreien Zugang.",
              })}
            </p>
          ),
        },
        {
          heading: tr({ fr: "6. Prix", en: "6. Pricing", de: "6. Preise" }),
          body: (
            <p>
              {tr({
                fr: "Les prix affichés sont indicatifs tant qu’aucun processus de commande n’est actif. Le montant contractuel sera calculé par un processus serveur de confiance lors de la mise en place du paiement.",
                en: "Displayed prices are indicative while no order process is active. The contractual amount will be computed by a trusted server process once payment is introduced.",
                de: "Angezeigte Preise sind unverbindlich, solange kein Bestellprozess aktiv ist. Der vertragliche Betrag wird bei Einführung der Zahlung durch einen vertrauenswürdigen Serverprozess berechnet.",
              })}
            </p>
          ),
        },
        {
          heading: tr({ fr: "7. Paiement", en: "7. Payment", de: "7. Zahlung" }),
          body: (
            <p data-testid="terms-payment-placeholder">
              {tr({
                fr: "PRESTATAIRE DE PAIEMENT NON ENCORE ACTIF. Aucun moyen de paiement n’est proposé sur ce site à ce jour.",
                en: "PAYMENT PROVIDER NOT YET ACTIVE. No payment method is offered on this site at present.",
                de: "ZAHLUNGSDIENSTLEISTER NOCH NICHT AKTIV. Auf dieser Website wird derzeit keine Zahlungsart angeboten.",
              })}
            </p>
          ),
        },
        {
          heading: tr({
            fr: "8. Fourniture du contenu numérique",
            en: "8. Delivery of digital content",
            de: "8. Bereitstellung digitaler Inhalte",
          }),
          body: (
            <p>
              {review}{" "}
              {tr({
                fr: "Les modalités d’accès après achat seront définies avec la mise en place du paiement (aucun système d’accès aux contenus payants n’existe actuellement).",
                en: "Access terms after purchase will be defined together with payment (no paid-content access system currently exists).",
                de: "Die Zugangsmodalitäten nach dem Kauf werden mit der Einführung der Zahlung festgelegt (derzeit besteht kein Zugangssystem für kostenpflichtige Inhalte).",
              })}
            </p>
          ),
        },
        {
          heading: tr({
            fr: "9. Usage personnel et propriété intellectuelle",
            en: "9. Personal use and intellectual property",
            de: "9. Persönliche Nutzung und Urheberrecht",
          }),
          body: (
            <p>
              {tr({
                fr: "Les contenus sont réservés à un usage personnel et non commercial. Le partage, la revente, la rediffusion, le téléchargement non autorisé ou la mise à disposition de comptes à des tiers sont interdits.",
                en: "Content is for personal, non-commercial use. Sharing, resale, redistribution, unauthorised downloading or giving third parties access to accounts is prohibited.",
                de: "Die Inhalte sind für den persönlichen, nicht kommerziellen Gebrauch bestimmt. Weitergabe, Weiterverkauf, Verbreitung, unbefugtes Herunterladen oder die Überlassung von Konten an Dritte sind untersagt.",
              })}
            </p>
          ),
        },
        {
          heading: tr({
            fr: "10. Exigences techniques",
            en: "10. Technical requirements",
            de: "10. Technische Voraussetzungen",
          }),
          body: (
            <p>
              {tr({
                fr: "Un navigateur à jour et une connexion internet stable sont nécessaires. L’espace nécessaire à l’exercice en sécurité relève de votre responsabilité.",
                en: "An up-to-date browser and a stable internet connection are required. Ensuring a safe space to exercise is your responsibility.",
                de: "Ein aktueller Browser und eine stabile Internetverbindung sind erforderlich. Für einen sicheren Übungsplatz sind Sie selbst verantwortlich.",
              })}
            </p>
          ),
        },
        {
          heading: tr({ fr: "11. Responsabilité", en: "11. Liability", de: "11. Haftung" }),
          body: (
            <p>
              {review}{" "}
              {tr({
                fr: "Les clauses de limitation de responsabilité doivent être rédigées et validées par un professionnel du droit avant publication.",
                en: "Liability limitation clauses must be drafted and validated by a legal professional before publication.",
                de: "Haftungsbeschränkungsklauseln müssen vor der Veröffentlichung von einer Rechtsberatung erstellt und geprüft werden.",
              })}
            </p>
          ),
        },
        {
          heading: tr({
            fr: "12. Résiliation / clôture de compte",
            en: "12. Termination / account closure",
            de: "12. Kündigung / Kontoschließung",
          }),
          body: (
            <p>
              {tr({
                fr: "Vous pouvez demander la clôture de votre compte à tout moment. L’exploitant peut suspendre un compte en cas de violation grave des présentes conditions.",
                en: "You may request closure of your account at any time. The operator may suspend an account in case of serious breach of these terms.",
                de: "Sie können jederzeit die Schließung Ihres Kontos verlangen. Der Anbieter kann ein Konto bei schwerwiegenden Verstößen sperren.",
              })}
            </p>
          ),
        },
        {
          heading: tr({
            fr: "13. Droit applicable et droits des consommateurs",
            en: "13. Governing law and consumer rights",
            de: "13. Anwendbares Recht und Verbraucherrechte",
          }),
          body: <p>{review}</p>,
        },
        {
          heading: tr({
            fr: "14. Règlement des litiges",
            en: "14. Dispute resolution",
            de: "14. Streitbeilegung",
          }),
          body: (
            <p>
              {isMissing(c.disputeResolution) ? <Missing /> : c.disputeResolution} {review}
            </p>
          ),
        },
      ]}
    />
  );
};

export default TermsPage;
