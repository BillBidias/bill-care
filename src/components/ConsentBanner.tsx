/**
 * P14 — Consent banner + settings panel.
 * Optional categories are OFF by default and never pre-ticked. Accepting is
 * not made easier than rejecting: both are equally prominent real buttons.
 */
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useTr } from "@/lib/i18n";
import { useConsent } from "@/lib/consent";

const ConsentBanner = () => {
  const tr = useTr();
  const { consent, needsDecision, settingsOpen, openSettings, closeSettings, acceptAll, rejectOptional, savePreferences } =
    useConsent();

  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const firstButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (settingsOpen) {
      setAnalytics(consent.analytics);
      setMarketing(consent.marketing);
    }
  }, [settingsOpen, consent.analytics, consent.marketing]);

  useEffect(() => {
    if (needsDecision || settingsOpen) firstButtonRef.current?.focus();
  }, [needsDecision, settingsOpen]);

  useEffect(() => {
    if (!settingsOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSettings();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [settingsOpen, closeSettings]);

  if (!needsDecision && !settingsOpen) return null;

  const labels = {
    title: tr({
      fr: "Cookies et technologies de stockage",
      en: "Cookies and storage technologies",
      de: "Cookies und Speichertechnologien",
    }),
    body: tr({
      fr: "Nous utilisons uniquement le stockage nécessaire au fonctionnement demandé (panier, session de connexion, mémorisation de ce choix). Aucun outil de mesure d’audience ni traceur publicitaire n’est actuellement actif.",
      en: "We only use storage necessary for the functionality you request (cart, sign-in session, remembering this choice). No analytics or advertising tracker is currently active.",
      de: "Wir verwenden ausschließlich Speicher, der für die von Ihnen gewünschte Funktion erforderlich ist (Warenkorb, Anmeldesitzung, Speichern dieser Auswahl). Derzeit sind keine Analyse- oder Werbe-Tracker aktiv.",
    }),
    acceptAll: tr({ fr: "Tout accepter", en: "Accept all", de: "Alle akzeptieren" }),
    reject: tr({ fr: "Refuser les cookies optionnels", en: "Reject optional", de: "Optionale ablehnen" }),
    customize: tr({ fr: "Personnaliser", en: "Customize", de: "Einstellungen" }),
    save: tr({ fr: "Enregistrer mes choix", en: "Save my choices", de: "Auswahl speichern" }),
    necessary: tr({ fr: "Nécessaires (toujours actifs)", en: "Necessary (always on)", de: "Notwendig (immer aktiv)" }),
    necessaryDesc: tr({
      fr: "Requis pour le panier, la session de connexion et la mémorisation de vos préférences de consentement.",
      en: "Required for the cart, the sign-in session and remembering your consent preferences.",
      de: "Erforderlich für Warenkorb, Anmeldesitzung und das Speichern Ihrer Einwilligungseinstellungen.",
    }),
    analytics: tr({ fr: "Mesure d’audience", en: "Analytics", de: "Analyse" }),
    analyticsDesc: tr({
      fr: "Aucun outil de mesure n’est installé actuellement. Ce réglage s’appliquera à toute intégration future.",
      en: "No analytics tool is currently installed. This setting will apply to any future integration.",
      de: "Derzeit ist kein Analysewerkzeug installiert. Diese Einstellung gilt für zukünftige Integrationen.",
    }),
    marketing: tr({ fr: "Marketing", en: "Marketing", de: "Marketing" }),
    marketingDesc: tr({
      fr: "Aucun traceur publicitaire n’est installé actuellement. Ce réglage s’appliquera à toute intégration future.",
      en: "No advertising tracker is currently installed. This setting will apply to any future integration.",
      de: "Derzeit ist kein Werbe-Tracker installiert. Diese Einstellung gilt für zukünftige Integrationen.",
    }),
    more: tr({ fr: "En savoir plus", en: "Learn more", de: "Mehr erfahren" }),
  };

  return (
    <div
      role="dialog"
      aria-modal={settingsOpen ? "true" : undefined}
      aria-labelledby="consent-title"
      aria-describedby="consent-body"
      className="fixed inset-x-0 bottom-0 z-[60] p-3 sm:p-4"
    >
      <div className="container mx-auto max-w-3xl bg-card border border-border rounded-2xl shadow-card p-5 sm:p-6">
        <h2 id="consent-title" className="font-heading text-lg sm:text-xl font-bold mb-2">
          {labels.title}
        </h2>
        <p id="consent-body" className="text-sm text-muted-foreground font-body mb-4">
          {labels.body}{" "}
          <Link to="/cookies" className="underline hover:text-primary">
            {labels.more}
          </Link>
        </p>

        {settingsOpen && (
          <div className="space-y-4 mb-5">
            <div className="flex items-start justify-between gap-4 rounded-xl border border-border p-3">
              <div>
                <p className="font-body font-semibold text-sm">{labels.necessary}</p>
                <p className="text-xs text-muted-foreground font-body">{labels.necessaryDesc}</p>
              </div>
              <Switch checked disabled aria-label={labels.necessary} />
            </div>
            <div className="flex items-start justify-between gap-4 rounded-xl border border-border p-3">
              <div>
                <p className="font-body font-semibold text-sm">{labels.analytics}</p>
                <p className="text-xs text-muted-foreground font-body">{labels.analyticsDesc}</p>
              </div>
              <Switch checked={analytics} onCheckedChange={setAnalytics} aria-label={labels.analytics} />
            </div>
            <div className="flex items-start justify-between gap-4 rounded-xl border border-border p-3">
              <div>
                <p className="font-body font-semibold text-sm">{labels.marketing}</p>
                <p className="text-xs text-muted-foreground font-body">{labels.marketingDesc}</p>
              </div>
              <Switch checked={marketing} onCheckedChange={setMarketing} aria-label={labels.marketing} />
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            ref={firstButtonRef}
            type="button"
            variant="outline"
            className="flex-1 rounded-full font-body"
            onClick={rejectOptional}
          >
            {labels.reject}
          </Button>
          <Button type="button" className="flex-1 rounded-full font-body" onClick={acceptAll}>
            {labels.acceptAll}
          </Button>
          {settingsOpen ? (
            <Button
              type="button"
              variant="secondary"
              className="flex-1 rounded-full font-body"
              onClick={() => savePreferences({ analytics, marketing })}
            >
              {labels.save}
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              className="flex-1 rounded-full font-body"
              onClick={openSettings}
            >
              {labels.customize}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConsentBanner;
