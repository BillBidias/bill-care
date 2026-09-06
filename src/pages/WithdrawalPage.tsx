/**
 * P15 — Withdrawal information reconciliation for digital content.
 * Draft only. Commercial use requires final German legal review and checkout implementation.
 */
import LegalLayout from "@/components/LegalLayout";
import { useTr } from "@/lib/i18n";
import { legalConfig, isMissing } from "@/legal/legalConfig";

const Missing = () => <span className="text-destructive font-mono text-xs">REQUIRED_INPUT</span>;

const WithdrawalPage = () => {
  const tr = useTr();
  const c = legalConfig;
  const review = tr({
    fr: "[REVUE JURIDIQUE REQUISE]",
    en: "[LEGAL REVIEW REQUIRED]",
    de: "[JURISTISCHE PRÜFUNG ERFORDERLICH]",
  });

  return (
    <LegalLayout
      docKey="withdrawal"
      title={tr({
        fr: "Droit de rétractation",
        en: "Withdrawal information",
        de: "Widerrufsbelehrung",
      })}
      intro={tr({
        fr: "Brouillon de préproduction. Le checkout Stripe existe techniquement, mais cette information de rétractation n’est pas encore approuvée pour une activation commerciale.",
        en: "Preproduction draft. Stripe checkout exists technically, but this withdrawal information is not yet approved for commercial activation.",
        de: "Vorproduktionsentwurf. Stripe Checkout ist technisch vorhanden, diese Widerrufsinformation ist jedoch noch nicht für eine kommerzielle Aktivierung freigegeben.",
      })}
      sections={[
        {
          heading: tr({ fr: "1. Statut actuel", en: "1. Current status", de: "1. Aktueller Stand" }),
          body: (
            <p data-testid="withdrawal-checkout-status">
              {tr({
                fr: "Le flux technique peut créer une commande et une session Stripe Checkout. La commercialisation reste toutefois bloquée tant que les textes juridiques, les consentements requis, la confirmation contractuelle et le test de production ne sont pas validés.",
                en: "The technical flow can create an order and a Stripe Checkout Session. Commercial use remains blocked until the legal texts, required consents, contract confirmation and production test are approved.",
                de: "Der technische Ablauf kann eine Bestellung und eine Stripe-Checkout-Session erstellen. Die kommerzielle Nutzung bleibt jedoch gesperrt, bis Rechtstexte, erforderliche Zustimmungen, Vertragsbestätigung und Produktionstest freigegeben sind.",
              })}
            </p>
          ),
        },
        {
          heading: tr({ fr: "2. Droit de rétractation du consommateur", en: "2. Consumer right of withdrawal", de: "2. Verbraucherwiderrufsrecht" }),
          body: (
            <p>
              {review}{" "}
              {tr({
                fr: "En principe, les contrats à distance B2C peuvent ouvrir un délai de rétractation de quatorze jours. Le texte final, le point de départ, les exceptions et le formulaire type doivent être validés juridiquement pour l’offre réelle.",
                en: "As a rule, B2C distance contracts may carry a fourteen-day withdrawal period. The final wording, start of the period, exceptions and model form must be legally approved for the actual offering.",
                de: "Grundsätzlich kann bei B2C-Fernabsatzverträgen ein vierzehntägiges Widerrufsrecht bestehen. Endgültiger Wortlaut, Fristbeginn, Ausnahmen und Musterformular müssen für das tatsächliche Angebot rechtlich geprüft werden.",
              })}
            </p>
          ),
        },
        {
          heading: tr({ fr: "3. Contenus numériques fournis immédiatement", en: "3. Digital content supplied immediately", de: "3. Sofort bereitgestellte digitale Inhalte" }),
          body: (
            <p>
              {review}{" "}
              {tr({
                fr: "Pour un contenu numérique non fourni sur support matériel, l’extinction anticipée du droit de rétractation ne doit être envisagée que si toutes les conditions légales applicables sont remplies. En particulier, §356(6) BGB exige notamment un consentement exprès au démarrage avant la fin du délai, la confirmation par le consommateur de sa connaissance de la perte du droit et la fourniture d’une confirmation conforme à §312f BGB.",
                en: "For digital content not supplied on a tangible medium, early lapse of the withdrawal right should only be relied on if all applicable statutory conditions are met. In particular, §356(6) BGB requires, among other things, express consent to begin before the period expires, acknowledgement by the consumer that the right will be lost, and provision of confirmation in accordance with §312f BGB.",
                de: "Bei digitalen Inhalten, die nicht auf einem körperlichen Datenträger geliefert werden, darf ein vorzeitiges Erlöschen des Widerrufsrechts nur angenommen werden, wenn sämtliche gesetzlichen Voraussetzungen erfüllt sind. § 356 Abs. 6 BGB verlangt insbesondere die ausdrückliche Zustimmung zum Beginn vor Ablauf der Frist, die Bestätigung der Kenntnis vom Erlöschen des Widerrufsrechts und eine Bestätigung gemäß § 312f BGB.",
              })}
            </p>
          ),
        },
        {
          heading: tr({ fr: "4. Contact pour la rétractation", en: "4. Withdrawal contact", de: "4. Kontakt für den Widerruf" }),
          body: (
            <p>
              {isMissing(c.operatorName) ? <Missing /> : c.operatorName} —{" "}
              {isMissing(c.email) ? <Missing /> : c.email}
            </p>
          ),
        },
        {
          heading: tr({ fr: "5. Exigences avant activation commerciale", en: "5. Requirements before commercial activation", de: "5. Anforderungen vor kommerzieller Aktivierung" }),
          body: (
            <ul className="list-disc pl-5 space-y-1">
              <li>{tr({ fr: "Présenter l’information de rétractation avant la conclusion du contrat.", en: "Present withdrawal information before the contract is concluded.", de: "Widerrufsinformationen vor Vertragsschluss bereitstellen." })}</li>
              <li>{tr({ fr: "Recueillir, lorsque nécessaire, un consentement exprès et non pré-coché au démarrage immédiat.", en: "Where required, collect express, non-pre-ticked consent to begin immediately.", de: "Soweit erforderlich, ausdrückliche und nicht vorangekreuzte Zustimmung zum sofortigen Beginn einholen." })}</li>
              <li>{tr({ fr: "Recueillir séparément la reconnaissance de la perte éventuelle du droit de rétractation lorsque la loi l’exige.", en: "Separately collect acknowledgement of any loss of the withdrawal right where required by law.", de: "Soweit gesetzlich erforderlich, die Kenntnisnahme des möglichen Erlöschens des Widerrufsrechts gesondert erfassen." })}</li>
              <li>{tr({ fr: "Fournir la confirmation contractuelle sur support durable conformément aux exigences applicables.", en: "Provide contractual confirmation on a durable medium in accordance with applicable requirements.", de: "Die Vertragsbestätigung entsprechend den anwendbaren Anforderungen auf einem dauerhaften Datenträger bereitstellen." })}</li>
              <li>{tr({ fr: "Enregistrer côté serveur la version des textes et les preuves contractuelles requises, sans les mélanger à un consentement marketing.", en: "Record required legal-text versions and contractual evidence server-side, without bundling them with marketing consent.", de: "Erforderliche Rechtstextversionen und Vertragsnachweise serverseitig erfassen, ohne sie mit Marketing-Einwilligungen zu koppeln." })}</li>
            </ul>
          ),
        },
      ]}
    />
  );
};

export default WithdrawalPage;
