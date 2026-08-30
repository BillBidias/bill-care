import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  BadgeCheck,
  Check,
  CheckCircle2,
  CreditCard,
  LockKeyhole,
  Play,
  ShieldCheck,
  UserRound,
  Video,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useCatalogue } from "@/hooks/useCatalogue";
import { useTr } from "@/lib/i18n";

const PurchaseSimulationPage = () => {
  const tr = useTr();
  const [searchParams] = useSearchParams();
  const { programs, loading } = useCatalogue();
  const [step, setStep] = useState(1);
  const [acknowledged, setAcknowledged] = useState(false);

  const programmeId = Number(searchParams.get("program") ?? "");
  const programme = useMemo(
    () => programs.find((item) => item.id === programmeId) ?? programs[0],
    [programs, programmeId],
  );

  const steps = [
    tr({ fr: "Programme", en: "Programme", de: "Programm" }),
    tr({ fr: "Compte", en: "Account", de: "Konto" }),
    tr({ fr: "Sécurité", en: "Safety", de: "Sicherheit" }),
    tr({ fr: "Paiement", en: "Payment", de: "Zahlung" }),
    tr({ fr: "Accès", en: "Access", de: "Zugang" }),
  ];

  if (loading || !programme) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-32 pb-20 container mx-auto px-4">
          <div className="max-w-3xl mx-auto rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">
            {tr({ fr: "Chargement de la simulation…", en: "Loading simulation…", de: "Simulation wird geladen…" })}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-28 pb-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
            <Link to={`/programs?program=${programme.id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary">
              <ArrowLeft className="w-4 h-4" />
              {tr({ fr: "Retour au catalogue", en: "Back to catalogue", de: "Zurück zum Katalog" })}
            </Link>
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 text-xs font-bold text-foreground">
              <BadgeCheck className="w-4 h-4 text-accent" />
              {tr({ fr: "MODE DÉMO — aucun paiement réel", en: "DEMO MODE — no real payment", de: "DEMO-MODUS — keine echte Zahlung" })}
            </span>
          </div>

          <div className="mb-8 grid grid-cols-5 gap-2">
            {steps.map((label, index) => {
              const number = index + 1;
              const active = number === step;
              const done = number < step;
              return (
                <div key={label} className="min-w-0">
                  <div className={`h-1.5 rounded-full ${done || active ? "bg-primary" : "bg-muted"}`} />
                  <p className={`mt-2 text-[11px] md:text-xs font-semibold truncate ${active ? "text-foreground" : "text-muted-foreground"}`}>{number}. {label}</p>
                </div>
              );
            })}
          </div>

          <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
            <section className="rounded-xl border border-border bg-card p-5 md:p-7 shadow-card">
              {step === 1 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary mb-2">
                    {tr({ fr: "Étape 1 — Votre programme", en: "Step 1 — Your programme", de: "Schritt 1 — Ihr Programm" })}
                  </p>
                  <h1 className="text-2xl md:text-3xl font-bold mb-2">{tr(programme.title)}</h1>
                  <p className="text-muted-foreground mb-6">{tr(programme.region)}</p>

                  <div className="relative overflow-hidden rounded-xl border border-border bg-muted aspect-video flex items-center justify-center mb-6">
                    <div className="text-7xl" aria-hidden="true">{programme.image}</div>
                    <button type="button" className="absolute grid h-16 w-16 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg" aria-label={tr({ fr: "Aperçu vidéo", en: "Video preview", de: "Videovorschau" })}>
                      <Play className="w-7 h-7 fill-current ml-1" />
                    </button>
                    <span className="absolute bottom-3 left-3 rounded-md bg-black/75 px-2.5 py-1 text-[11px] font-semibold text-white">
                      {tr({ fr: "Aperçu vidéo — visuel temporaire", en: "Video preview — temporary visual", de: "Videovorschau — temporäre Darstellung" })}
                    </span>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3 mb-7">
                    {[
                      tr({ fr: "Séances guidées et progressives", en: "Guided progressive sessions", de: "Geführte progressive Einheiten" }),
                      tr({ fr: "Dosage et consignes d’exercice", en: "Exercise dosage and instructions", de: "Dosierung und Übungsanweisungen" }),
                      tr({ fr: "Sécurité et critères d’arrêt", en: "Safety and stop criteria", de: "Sicherheit und Abbruchkriterien" }),
                      tr({ fr: "Suivi de progression dans l’espace patient", en: "Progress tracking in the patient area", de: "Fortschrittsverfolgung im Patientenbereich" }),
                    ].map((item) => (
                      <div key={item} className="flex gap-3 rounded-lg border border-border bg-background p-3.5 text-sm font-medium">
                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />{item}
                      </div>
                    ))}
                  </div>

                  <Button className="w-full sm:w-auto" onClick={() => setStep(2)}>
                    {tr({ fr: "Continuer vers le compte", en: "Continue to account", de: "Weiter zum Konto" })}
                  </Button>
                </div>
              )}

              {step === 2 && (
                <div>
                  <div className="w-12 h-12 rounded-lg bg-secondary grid place-items-center mb-5"><UserRound className="w-6 h-6 text-primary" /></div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary mb-2">{tr({ fr: "Étape 2 — Compte client", en: "Step 2 — Customer account", de: "Schritt 2 — Kundenkonto" })}</p>
                  <h2 className="text-2xl font-bold mb-3">{tr({ fr: "Connexion requise avant l’achat", en: "Login required before purchase", de: "Anmeldung vor dem Kauf erforderlich" })}</h2>
                  <p className="text-muted-foreground mb-6 max-w-2xl">
                    {tr({
                      fr: "Dans le parcours réel, le client se connecte ou crée son compte ici. La démonstration ne crée aucun compte et ne collecte aucune donnée.",
                      en: "In the real journey, the customer logs in or creates an account here. This demo creates no account and collects no data.",
                      de: "Im echten Ablauf meldet sich der Kunde hier an oder erstellt ein Konto. Diese Demo erstellt kein Konto und erfasst keine Daten.",
                    })}
                  </p>
                  <div className="rounded-lg border border-border bg-background p-4 mb-6">
                    <p className="text-sm font-semibold">demo.patient@dein-digital-physio.test</p>
                    <p className="text-xs text-muted-foreground mt-1">{tr({ fr: "Compte fictif utilisé uniquement pour cette simulation", en: "Fictional account used only for this simulation", de: "Fiktives Konto nur für diese Simulation" })}</p>
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    <Button variant="outline" onClick={() => setStep(1)}>{tr({ fr: "Retour", en: "Back", de: "Zurück" })}</Button>
                    <Button onClick={() => setStep(3)}>{tr({ fr: "Continuer avec le compte démo", en: "Continue with demo account", de: "Mit Demo-Konto fortfahren" })}</Button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <div className="w-12 h-12 rounded-lg bg-secondary grid place-items-center mb-5"><ShieldCheck className="w-6 h-6 text-primary" /></div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary mb-2">{tr({ fr: "Étape 3 — Sécurité", en: "Step 3 — Safety", de: "Schritt 3 — Sicherheit" })}</p>
                  <h2 className="text-2xl font-bold mb-3">{tr({ fr: "Dernière vérification avant paiement", en: "Final check before payment", de: "Letzte Prüfung vor der Zahlung" })}</h2>
                  <p className="text-muted-foreground mb-5">
                    {tr({
                      fr: "Le vrai checkout revalide la sécurité et l’acceptation de l’avertissement. Ici nous simulons uniquement l’écran et la décision utilisateur.",
                      en: "The real checkout revalidates safety and warning acknowledgement. Here we only simulate the screen and user decision.",
                      de: "Der echte Checkout prüft Sicherheit und Warnhinweis erneut. Hier wird nur die Oberfläche und Nutzerentscheidung simuliert.",
                    })}
                  </p>
                  <div className="rounded-lg border border-border bg-background p-4 mb-4">
                    <p className="font-semibold text-sm mb-2">{tr({ fr: "Résultat de démonstration : GREEN", en: "Demo result: GREEN", de: "Demo-Ergebnis: GREEN" })}</p>
                    <p className="text-sm text-muted-foreground">{tr({ fr: "Aucun signal bloquant n’est simulé dans ce parcours.", en: "No blocking signal is simulated in this journey.", de: "In diesem Ablauf wird kein blockierendes Signal simuliert." })}</p>
                  </div>
                  <label className="flex items-start gap-3 rounded-lg border border-border bg-background p-4 cursor-pointer mb-6">
                    <input type="checkbox" checked={acknowledged} onChange={(event) => setAcknowledged(event.target.checked)} className="mt-1" />
                    <span className="text-sm">{tr({ fr: "Je confirme avoir lu les consignes de sécurité et comprendre que le programme ne remplace pas un diagnostic médical.", en: "I confirm that I have read the safety instructions and understand that the programme does not replace a medical diagnosis.", de: "Ich bestätige, die Sicherheitshinweise gelesen zu haben und zu verstehen, dass das Programm keine medizinische Diagnose ersetzt." })}</span>
                  </label>
                  <div className="flex gap-3 flex-wrap">
                    <Button variant="outline" onClick={() => setStep(2)}>{tr({ fr: "Retour", en: "Back", de: "Zurück" })}</Button>
                    <Button disabled={!acknowledged} onClick={() => setStep(4)}>{tr({ fr: "Continuer vers le paiement", en: "Continue to payment", de: "Weiter zur Zahlung" })}</Button>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div>
                  <div className="w-12 h-12 rounded-lg bg-secondary grid place-items-center mb-5"><CreditCard className="w-6 h-6 text-primary" /></div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary mb-2">{tr({ fr: "Étape 4 — Paiement", en: "Step 4 — Payment", de: "Schritt 4 — Zahlung" })}</p>
                  <h2 className="text-2xl font-bold mb-3">{tr({ fr: "Écran de paiement simulé", en: "Simulated payment screen", de: "Simulierter Zahlungsbildschirm" })}</h2>
                  <p className="text-muted-foreground mb-6">{tr({ fr: "Aucune donnée bancaire n’est demandée. Dans la version réelle, cette étape sera prise en charge par Stripe.", en: "No bank data is requested. In the real version, this step will be handled by Stripe.", de: "Es werden keine Bankdaten abgefragt. In der echten Version übernimmt Stripe diesen Schritt." })}</p>

                  <div className="rounded-xl border border-border bg-background p-5 mb-6">
                    <div className="flex items-center justify-between mb-5">
                      <span className="font-bold">DEMO CARD</span>
                      <LockKeyhole className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="rounded-lg border border-border bg-card p-4 text-sm font-semibold tracking-[0.18em] mb-3">•••• •••• •••• 4242</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg border border-border bg-card p-3 text-sm text-muted-foreground">12 / 34</div>
                      <div className="rounded-lg border border-border bg-card p-3 text-sm text-muted-foreground">CVC •••</div>
                    </div>
                  </div>

                  <div className="flex gap-3 flex-wrap">
                    <Button variant="outline" onClick={() => setStep(3)}>{tr({ fr: "Retour", en: "Back", de: "Zurück" })}</Button>
                    <Button onClick={() => setStep(5)}>{tr({ fr: `Simuler le paiement de ${programme.price} €`, en: `Simulate €${programme.price} payment`, de: `Zahlung von ${programme.price} € simulieren` })}</Button>
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="text-center py-4 md:py-8">
                  <div className="w-20 h-20 rounded-full bg-secondary grid place-items-center mx-auto mb-5"><Check className="w-9 h-9 text-primary" /></div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary mb-2">{tr({ fr: "Étape 5 — Accès", en: "Step 5 — Access", de: "Schritt 5 — Zugang" })}</p>
                  <h2 className="text-3xl font-bold mb-3">{tr({ fr: "Achat simulé réussi", en: "Simulated purchase successful", de: "Simulierter Kauf erfolgreich" })}</h2>
                  <p className="text-muted-foreground max-w-xl mx-auto mb-7">{tr({ fr: "Dans le parcours réel, le paiement confirmé crée ensuite le droit d’accès permanent au programme et celui-ci apparaît dans « Mon espace ».", en: "In the real journey, confirmed payment then creates permanent programme access and the programme appears in “My space”.", de: "Im echten Ablauf erzeugt die bestätigte Zahlung anschließend den dauerhaften Programmzugang und das Programm erscheint in „Mein Bereich“." })}</p>
                  <div className="max-w-md mx-auto rounded-xl border border-border bg-background p-5 text-left mb-7">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-lg bg-muted grid place-items-center text-3xl">{programme.image}</div>
                      <div>
                        <p className="font-bold">{tr(programme.title)}</p>
                        <p className="text-sm text-muted-foreground mt-1">{tr({ fr: "Accès permanent — simulation", en: "Permanent access — simulation", de: "Dauerhafter Zugang — Simulation" })}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center gap-3 flex-wrap">
                    <Button variant="outline" asChild><Link to="/programs">{tr({ fr: "Retour au catalogue", en: "Back to catalogue", de: "Zurück zum Katalog" })}</Link></Button>
                    <Button asChild><Link to="/patient"><Video className="w-4 h-4" />{tr({ fr: "Voir l’espace patient", en: "View patient area", de: "Patientenbereich ansehen" })}</Link></Button>
                  </div>
                </div>
              )}
            </section>

            <aside className="rounded-xl border border-border bg-card p-5 shadow-card lg:sticky lg:top-28">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground mb-4">{tr({ fr: "Récapitulatif", en: "Summary", de: "Zusammenfassung" })}</p>
              <div className="flex items-start gap-3 pb-4 border-b border-border">
                <div className="w-12 h-12 rounded-lg bg-muted grid place-items-center text-2xl">{programme.image}</div>
                <div className="min-w-0">
                  <p className="font-bold text-sm line-clamp-3">{tr(programme.title)}</p>
                  <p className="text-xs text-muted-foreground mt-1">{tr(programme.region)}</p>
                </div>
              </div>
              <dl className="space-y-3 py-4 text-sm">
                <div className="flex justify-between gap-4"><dt className="text-muted-foreground">{tr({ fr: "Durée", en: "Duration", de: "Dauer" })}</dt><dd className="font-semibold">{programme.duration}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-muted-foreground">{tr({ fr: "Niveau", en: "Level", de: "Niveau" })}</dt><dd className="font-semibold">{programme.level}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-muted-foreground">{tr({ fr: "Format", en: "Format", de: "Format" })}</dt><dd className="font-semibold text-right">{tr({ fr: "Programme vidéo", en: "Video programme", de: "Videoprogramm" })}</dd></div>
              </dl>
              <div className="border-t border-border pt-4 flex items-end justify-between">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-2xl font-bold text-primary">{programme.price} €</span>
              </div>
              <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">{tr({ fr: "Simulation visuelle uniquement. Aucun ordre, paiement ou entitlement n’est créé.", en: "Visual simulation only. No order, payment or entitlement is created.", de: "Nur visuelle Simulation. Es werden keine Bestellung, Zahlung oder Berechtigung erstellt." })}</p>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PurchaseSimulationPage;
