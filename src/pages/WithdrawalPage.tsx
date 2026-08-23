/**
 * P14 — Withdrawal information for digital content.
 * Architecture/documentation only: NO checkout checkbox is implemented here.
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
        fr: "Aucun achat n’est actuellement possible sur ce site. Ce document prépare l’information de rétractation applicable aux contenus numériques.",
        en: "No purchase is currently possible on this site. This document prepares the withdrawal information applicable to digital content.",
        de: "Auf dieser Website ist derzeit kein Kauf möglich. Dieses Dokument bereitet die Widerrufsinformationen für digitale Inhalte vor.",
      })}
      sections={[
        {
          heading: tr({ fr: "1. Statut actuel", en: "1. Current status", de: "1. Aktueller Stand" }),
          body: (
            <p data-testid="withdrawal-no-checkout">
              {tr({
                fr: "Aucun processus de commande ou de paiement n’est actif. Aucun contrat de contenu numérique ne peut donc être conclu à ce stade.",
                en: "No order or payment process is active. No digital content contract can therefore be concluded at this stage.",
                de: "Es ist kein Bestell- oder Zahlungsprozess aktiv. Ein Vertrag über digitale Inhalte kann derzeit daher nicht geschlossen werden.",
              })}
            </p>
          ),
        },
        {
          heading: tr({
            fr: "2. Droit de rétractation du consommateur",
            en: "2. Consumer right of withdrawal",
            de: "2. Verbraucherwiderrufsrecht",
          }),
          body: (
            <p>
              {review}{" "}
              {tr({
                fr: "En principe, un consommateur dispose d’un délai de rétractation de quatorze jours pour les contrats à distance. Le texte définitif, le point de départ du délai et le formulaire type doivent être validés juridiquement.",
                en: "In principle, a consumer has a fourteen-day withdrawal period for distance contracts. The final text, the start of the period and the model form must be legally validated.",
                de: "Grundsätzlich steht Verbrauchern bei Fernabsatzverträgen ein vierzehntägiges Widerrufsrecht zu. Der endgültige Text, der Fristbeginn und das Muster-Widerrufsformular sind rechtlich zu prüfen.",
              })}
            </p>
          ),
        },
        {
          heading: tr({
            fr: "3. Contenus numériques et perte du droit",
            en: "3. Digital content and loss of the right",
            de: "3. Digitale Inhalte und Erlöschen des Rechts",
          }),
          body: (
            <p>
              {review}{" "}
              {tr({
                fr: "Pour un contenu numérique fourni immédiatement, le droit de rétractation peut s’éteindre lorsque les conditions légales sont réunies : consentement exprès du consommateur au démarrage de l’exécution avant la fin du délai et reconnaissance explicite de la perte du droit.",
                en: "For digital content supplied immediately, the right of withdrawal may lapse when the statutory conditions are met: the consumer’s express consent to begin performance before the period expires and explicit acknowledgement of losing the right.",
                de: "Bei sofort bereitgestellten digitalen Inhalten kann das Widerrufsrecht erlöschen, wenn die gesetzlichen Voraussetzungen erfüllt sind: ausdrückliche Zustimmung zum vorzeitigen Beginn der Ausführung und ausdrückliche Kenntnisnahme des Erlöschens des Widerrufsrechts.",
              })}
            </p>
          ),
        },
        {
          heading: tr({
            fr: "4. Contact pour la rétractation",
            en: "4. Withdrawal contact",
            de: "4. Kontakt für den Widerruf",
          }),
          body: (
            <p>
              {isMissing(c.operatorName) ? <Missing /> : c.operatorName} —{" "}
              {isMissing(c.email) ? <Missing /> : c.email}
            </p>
          ),
        },
        {
          heading: tr({
            fr: "5. Exigences pour le futur paiement (P15/P16)",
            en: "5. Requirements for future checkout (P15/P16)",
            de: "5. Anforderungen an den künftigen Checkout (P15/P16)",
          }),
          body: (
            <ul className="list-disc pl-5 space-y-1">
              <li>
                {tr({
                  fr: "Information de rétractation présentée avant la conclusion du contrat.",
                  en: "Withdrawal information presented before the contract is concluded.",
                  de: "Widerrufsinformationen vor Vertragsschluss anzeigen.",
                })}
              </li>
              <li>
                {tr({
                  fr: "Consentement exprès et non pré-coché au démarrage immédiat de l’exécution.",
                  en: "Express, never pre-ticked consent to begin performance immediately.",
                  de: "Ausdrückliche, nicht vorangekreuzte Zustimmung zum sofortigen Beginn der Ausführung.",
                })}
              </li>
              <li>
                {tr({
                  fr: "Reconnaissance explicite et distincte de la perte éventuelle du droit de rétractation.",
                  en: "Explicit, separate acknowledgement of the possible loss of the withdrawal right.",
                  de: "Ausdrückliche, gesonderte Kenntnisnahme des möglichen Erlöschens des Widerrufsrechts.",
                })}
              </li>
              <li>
                {tr({
                  fr: "Confirmation du contrat sur support durable lorsque la loi l’exige.",
                  en: "Contract confirmation on a durable medium where legally required.",
                  de: "Vertragsbestätigung auf einem dauerhaften Datenträger, soweit gesetzlich erforderlich.",
                })}
              </li>
              <li>
                {tr({
                  fr: "Aucun consentement marketing ne peut être combiné à l’acceptation contractuelle.",
                  en: "No marketing consent may be combined with contractual acceptance.",
                  de: "Marketing-Einwilligungen dürfen nicht mit der Vertragsannahme verbunden werden.",
                })}
              </li>
              <li>
                {tr({
                  fr: "L’acceptation doit être enregistrée côté serveur avec la version du document, jamais comme simple indicateur navigateur.",
                  en: "Acceptance must be recorded server-side with the document version, never as a browser-only flag.",
                  de: "Die Annahme ist serverseitig mit der Dokumentversion zu protokollieren, nie nur als Browser-Flag.",
                })}
              </li>
            </ul>
          ),
        },
      ]}
    />
  );
};

export default WithdrawalPage;
