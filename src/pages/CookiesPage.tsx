/**
 * P14 — Cookies & similar device-storage technologies.
 * Lists the ACTUAL audited storage; includes a re-open consent settings action.
 */
import LegalLayout from "@/components/LegalLayout";
import { Button } from "@/components/ui/button";
import { useTr } from "@/lib/i18n";
import { useConsent } from "@/lib/consent";
import { storageInventory } from "@/legal/storageInventory";

const CookiesPage = () => {
  const tr = useTr();
  const { consent, openSettings, rejectOptional } = useConsent();

  const categoryLabel = (key: string) =>
    key === "necessary"
      ? tr({ fr: "Nécessaire", en: "Necessary", de: "Notwendig" })
      : key === "analytics"
        ? tr({ fr: "Mesure d’audience", en: "Analytics", de: "Analyse" })
        : tr({ fr: "Marketing", en: "Marketing", de: "Marketing" });

  return (
    <LegalLayout
      docKey="cookies"
      title={tr({
        fr: "Cookies et technologies similaires",
        en: "Cookies & similar technologies",
        de: "Cookie- und Speichertechnologien",
      })}
      intro={tr({
        fr: "Ce site n’utilise actuellement aucun cookie de mesure d’audience ni traceur publicitaire. Les technologies listées ci-dessous sont nécessaires aux fonctionnalités que vous demandez.",
        en: "This site currently uses no analytics cookies and no advertising trackers. The technologies listed below are necessary for the functionality you request.",
        de: "Diese Website verwendet derzeit keine Analyse-Cookies und keine Werbe-Tracker. Die unten aufgeführten Technologien sind für die von Ihnen gewünschten Funktionen erforderlich.",
      })}
      sections={[
        {
          heading: tr({
            fr: "Technologies actuellement utilisées",
            en: "Technologies currently in use",
            de: "Derzeit eingesetzte Technologien",
          }),
          body: (
            <ul className="space-y-4">
              {storageInventory.map((s) => (
                <li key={s.id} className="rounded-xl border border-border p-4">
                  <p className="font-semibold text-foreground">
                    <code className="text-xs">{s.name}</code>
                  </p>
                  <p>
                    <strong>{tr({ fr: "Type", en: "Type", de: "Typ" })}: </strong>
                    {s.kind}
                  </p>
                  <p>
                    <strong>{tr({ fr: "Catégorie", en: "Category", de: "Kategorie" })}: </strong>
                    {categoryLabel(s.category)}
                  </p>
                  <p>
                    <strong>{tr({ fr: "Fournisseur", en: "Provider", de: "Anbieter" })}: </strong>
                    {s.provider}
                  </p>
                  <p>
                    <strong>{tr({ fr: "Finalité", en: "Purpose", de: "Zweck" })}: </strong>
                    {tr(s.purpose)}
                  </p>
                  <p>
                    <strong>{tr({ fr: "Durée", en: "Duration", de: "Dauer" })}: </strong>
                    {tr(s.retention)}
                  </p>
                </li>
              ))}
            </ul>
          ),
        },
        {
          heading: tr({
            fr: "Catégories optionnelles",
            en: "Optional categories",
            de: "Optionale Kategorien",
          }),
          body: (
            <>
              <p>
                {tr({
                  fr: "Mesure d’audience et marketing sont désactivés par défaut et ne sont activés qu’avec votre consentement explicite. Aucun script correspondant n’existe actuellement dans l’application.",
                  en: "Analytics and marketing are off by default and are only enabled with your explicit consent. No such script currently exists in the application.",
                  de: "Analyse und Marketing sind standardmäßig deaktiviert und werden nur mit Ihrer ausdrücklichen Einwilligung aktiviert. Derzeit existiert kein entsprechendes Skript in der Anwendung.",
                })}
              </p>
              <p data-testid="consent-current-state">
                {tr({ fr: "État actuel", en: "Current state", de: "Aktueller Stand" })}: analytics=
                {String(consent.analytics)} · marketing={String(consent.marketing)}
              </p>
            </>
          ),
        },
        {
          heading: tr({
            fr: "Gérer ou retirer votre consentement",
            en: "Manage or withdraw your consent",
            de: "Einwilligung verwalten oder widerrufen",
          }),
          body: (
            <div className="flex flex-wrap gap-2">
              <Button type="button" className="rounded-full font-body" onClick={openSettings}>
                {tr({ fr: "Gérer mes cookies", en: "Cookie settings", de: "Cookie-Einstellungen" })}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-full font-body"
                onClick={rejectOptional}
              >
                {tr({
                  fr: "Retirer les consentements optionnels",
                  en: "Withdraw optional consent",
                  de: "Optionale Einwilligungen widerrufen",
                })}
              </Button>
            </div>
          ),
        },
      ]}
    />
  );
};

export default CookiesPage;
