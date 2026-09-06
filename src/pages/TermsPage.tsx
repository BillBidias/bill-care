/**
 * P15 — Terms reconciliation with the implemented technical checkout.
 * Draft only; sensitive clauses remain explicitly subject to legal review.
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
        fr: "Brouillon de préproduction couvrant l’utilisation du service et le futur cadre contractuel B2C. Le checkout Stripe est techniquement implémenté, mais l’activation commerciale reste interdite tant que les exigences juridiques, cliniques et de préproduction ne sont pas validées.",
        en: "Preproduction draft covering use of the service and the future B2C contractual framework. Stripe checkout is technically implemented, but commercial activation remains prohibited until legal, clinical and preproduction requirements are approved.",
        de: "Vorproduktionsentwurf für die Nutzung des Dienstes und den künftigen B2C-Vertragsrahmen. Stripe Checkout ist technisch implementiert, eine kommerzielle Aktivierung bleibt jedoch bis zur Freigabe der rechtlichen, klinischen und Vorproduktionsanforderungen untersagt.",
      })}
      sections={[
        {
          heading: tr({ fr: "1. Champ d’application", en: "1. Scope", de: "1. Geltungsbereich" }),
          body: (
            <p>
              {tr({
                fr: "Ces conditions sont destinées à régir l’utilisation de Dein Digital Physio et, après validation de la mise en production commerciale, l’achat de programmes numériques auprès de l’exploitant",
                en: "These terms are intended to govern use of Dein Digital Physio and, after commercial production approval, the purchase of digital programmes from the operator",
                de: "Diese Bedingungen sollen die Nutzung von Dein Digital Physio und nach Freigabe des kommerziellen Produktivbetriebs den Erwerb digitaler Programme beim Anbieter regeln",
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
                fr: "Un compte est personnel. L’accès aux contenus payants dépend d’un entitlement serveur valide et non d’un simple état affiché par le navigateur.",
                en: "An account is personal. Access to paid content depends on a valid server-side entitlement, not merely on browser-displayed state.",
                de: "Ein Konto ist persönlich. Der Zugriff auf bezahlte Inhalte hängt von einer gültigen serverseitigen Berechtigung ab und nicht lediglich von einem im Browser angezeigten Zustand.",
              })}
            </p>
          ),
        },
        {
          heading: tr({ fr: "3. Programmes numériques", en: "3. Digital programmes", de: "3. Digitale Programme" }),
          body: (
            <p>
              {tr({
                fr: "Le MVP est conçu comme une offre de programmes numériques auto-guidés d’exercices, accompagnée d’une orientation non diagnostique et de vérifications de sécurité. La qualification juridique définitive de l’offre reste soumise à revue avant production.",
                en: "The MVP is designed as self-guided digital exercise programmes with non-diagnostic guidance and safety checks. The final legal classification of the offering remains subject to review before production.",
                de: "Das MVP ist als Angebot selbstgeführter digitaler Übungsprogramme mit nicht-diagnostischer Orientierung und Sicherheitsprüfungen konzipiert. Die endgültige rechtliche Einordnung des Angebots bleibt vor dem Produktivstart zu prüfen.",
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
                fr: "Le flux technique peut créer une commande serveur et une session Stripe Checkout. La formulation juridiquement correcte de l’offre, de l’acceptation, du bouton de commande, de la confirmation de contrat et du moment exact de conclusion du contrat doit être validée avant activation commerciale.",
                en: "The technical flow can create a server-side order and Stripe Checkout Session. The legally correct wording for offer, acceptance, order button, contract confirmation and the exact moment of contract formation must be approved before commercial activation.",
                de: "Der technische Ablauf kann eine serverseitige Bestellung und eine Stripe-Checkout-Session erstellen. Die rechtlich korrekte Gestaltung von Angebot, Annahme, Bestellbutton, Vertragsbestätigung und dem genauen Zeitpunkt des Vertragsschlusses muss vor der kommerziellen Aktivierung geprüft werden.",
              })}
            </p>
          ),
        },
        {
          heading: tr({ fr: "5. Prix", en: "5. Pricing", de: "5. Preise" }),
          body: (
            <p>
              {tr({
                fr: "Le montant final du checkout est calculé et validé côté serveur. Le navigateur ne peut pas fixer autoritativement le prix. Les informations fiscales et d’affichage des prix destinées au consommateur doivent être validées avant publication commerciale.",
                en: "The final checkout amount is calculated and validated server-side. The browser cannot authoritatively set the price. Consumer-facing tax and price-display information must be approved before commercial publication.",
                de: "Der endgültige Checkout-Betrag wird serverseitig berechnet und validiert. Der Browser kann den Preis nicht autoritativ festlegen. Steuer- und Preisangaben gegenüber Verbrauchern müssen vor der kommerziellen Veröffentlichung geprüft werden.",
              })}
            </p>
          ),
        },
        {
          heading: tr({ fr: "6. Paiement", en: "6. Payment", de: "6. Zahlung" }),
          body: (
            <p data-testid="terms-payment-status">
              {tr({
                fr: "Stripe Checkout est techniquement intégré. Le statut payé est confirmé côté serveur à partir d’événements Stripe vérifiés ; un retour navigateur vers la page de succès ne suffit jamais à débloquer un programme. L’environnement de production, les secrets/webhooks et un test E2E contrôlé restent à valider avant activation commerciale.",
                en: "Stripe Checkout is technically integrated. Paid status is confirmed server-side from verified Stripe events; a browser return to the success page never by itself unlocks a programme. Production configuration, secrets/webhooks and a controlled E2E test remain to be validated before commercial activation.",
                de: "Stripe Checkout ist technisch integriert. Der Bezahlstatus wird serverseitig anhand verifizierter Stripe-Ereignisse bestätigt; die Rückkehr des Browsers zur Erfolgsseite allein schaltet niemals ein Programm frei. Produktionskonfiguration, Secrets/Webhooks und ein kontrollierter E2E-Test müssen vor der kommerziellen Aktivierung noch validiert werden.",
              })}
            </p>
          ),
        },
        {
          heading: tr({ fr: "7. Fourniture du contenu numérique", en: "7. Delivery of digital content", de: "7. Bereitstellung digitaler Inhalte" }),
          body: (
            <p>
              {review}{" "}
              {tr({
                fr: "Après un paiement autoritatif confirmé, l’accès applicatif repose sur un entitlement serveur. Les modalités contractuelles de fourniture immédiate, la confirmation sur support durable et les éventuelles conséquences sur le droit de rétractation doivent être validées et implémentées avant activation commerciale.",
                en: "After authoritative payment confirmation, application access relies on a server-side entitlement. Contractual terms for immediate supply, durable-medium confirmation and any consequences for withdrawal rights must be approved and implemented before commercial activation.",
                de: "Nach autoritativer Zahlungsbestätigung beruht der Anwendungszugriff auf einer serverseitigen Berechtigung. Vertragsbedingungen zur sofortigen Bereitstellung, Bestätigung auf einem dauerhaften Datenträger und mögliche Auswirkungen auf das Widerrufsrecht müssen vor der kommerziellen Aktivierung geprüft und umgesetzt werden.",
              })}
            </p>
          ),
        },
        {
          heading: tr({ fr: "8. Sécurité clinique", en: "8. Clinical safety", de: "8. Klinische Sicherheit" }),
          body: (
            <p>
              {tr({
                fr: "Les règles de sécurité ont priorité sur la recommandation et le commerce. Un résultat RED bloque la recommandation/progression automatique ; les flux AMBER/RED conservent les orientations de sécurité applicables. Aucun résultat automatisé ne doit être présenté comme un diagnostic.",
                en: "Safety rules take priority over recommendation and commerce. A RED result blocks automated recommendation/progression; AMBER/RED flows retain the applicable safety guidance. No automated result may be presented as a diagnosis.",
                de: "Sicherheitsregeln haben Vorrang vor Empfehlung und Handel. Ein RED-Ergebnis blockiert automatische Empfehlung/Fortführung; AMBER-/RED-Abläufe behalten die vorgesehenen Sicherheitshinweise bei. Kein automatisiertes Ergebnis darf als Diagnose dargestellt werden.",
              })}
            </p>
          ),
        },
        {
          heading: tr({ fr: "9. Usage personnel et propriété intellectuelle", en: "9. Personal use and intellectual property", de: "9. Persönliche Nutzung und Urheberrecht" }),
          body: (
            <p>
              {tr({
                fr: "Les contenus sont destinés à un usage personnel et non commercial. Les droits de propriété intellectuelle et les limites d’usage définitives doivent être confirmés dans la version juridiquement approuvée.",
                en: "Content is intended for personal, non-commercial use. Intellectual-property rights and final usage restrictions must be confirmed in the legally approved version.",
                de: "Die Inhalte sind für den persönlichen, nicht kommerziellen Gebrauch bestimmt. Rechte des geistigen Eigentums und endgültige Nutzungsbeschränkungen sind in der rechtlich freigegebenen Fassung zu bestätigen.",
              })}
            </p>
          ),
        },
        {
          heading: tr({ fr: "10. Résiliation / clôture de compte", en: "10. Termination / account closure", de: "10. Kündigung / Kontoschließung" }),
          body: (
            <p>
              {tr({
                fr: "L’utilisateur dispose d’un flux de demande d’effacement de compte. L’architecture P13 supprime les données applicatives ciblées et détache l’identité des commandes conservées, sous réserve de blocages de sécurité/commerce. La durée de conservation commerciale et l’éventuelle application de règles de dossier de traitement restent soumises à revue juridique et fiscale.",
                en: "Users have an account-erasure request flow. The P13 architecture deletes targeted application data and detaches identity from retained orders, subject to safety/commerce blockers. Commercial retention periods and any treatment-record rules remain subject to legal and tax review.",
                de: "Nutzer verfügen über einen Prozess zur Kontolöschung. Die P13-Architektur löscht gezielte Anwendungsdaten und trennt die Identität von aufbewahrten Bestellungen, vorbehaltlich Sicherheits-/Handelsblockern. Kommerzielle Aufbewahrungsfristen und eine mögliche Anwendung von Behandlungsakten-Regeln bleiben rechtlich und steuerlich zu prüfen.",
              })}
            </p>
          ),
        },
        {
          heading: tr({ fr: "11. Responsabilité", en: "11. Liability", de: "11. Haftung" }),
          body: <p>{review}</p>,
        },
        {
          heading: tr({ fr: "12. Droit applicable et droits des consommateurs", en: "12. Governing law and consumer rights", de: "12. Anwendbares Recht und Verbraucherrechte" }),
          body: <p>{review}</p>,
        },
        {
          heading: tr({ fr: "13. Règlement des litiges", en: "13. Dispute resolution", de: "13. Streitbeilegung" }),
          body: (
            <p>
              {isMissing(c.disputeResolution) ? <Missing /> : c.disputeResolution} {review}{" "}
              {tr({
                fr: "Ne pas réintroduire un lien vers l’ancienne plateforme européenne ODR : elle a cessé ses activités en 2025. La déclaration allemande de règlement extrajudiciaire applicable à l’exploitant doit être déterminée avant publication.",
                en: "Do not reintroduce a link to the former EU ODR platform: it ceased operation in 2025. The German out-of-court dispute-resolution statement applicable to the operator must be determined before publication.",
                de: "Keinen Link zur früheren EU-OS-Plattform wieder einführen: Sie wurde 2025 eingestellt. Die für den Anbieter geltende deutsche Erklärung zur außergerichtlichen Streitbeilegung muss vor Veröffentlichung festgelegt werden.",
              })}
            </p>
          ),
        },
      ]}
    />
  );
};

export default TermsPage;
