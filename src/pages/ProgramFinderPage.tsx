import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, ClipboardCheck, Loader2, ShieldAlert, Stethoscope } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCatalogue } from "@/hooks/useCatalogue";
import { useI18n, useTr } from "@/lib/i18n";
import {
  evaluateSafety,
  getApplicableSafetyQuestions,
  isPlausibleIcd10,
  loadProgramFinderConfig,
  rankProgrammes,
  type FinderSafetyOutcome,
  type ProgramFinderConfig,
} from "@/data/programFinderRepository";

const STEPS = ["region", "symptoms", "limitations", "goal", "icd", "safety", "warning", "results"] as const;
type Step = (typeof STEPS)[number];

const ProgramFinderPage = () => {
  const { lang } = useI18n();
  const tr = useTr();
  const { programs } = useCatalogue();
  const [config, setConfig] = useState<ProgramFinderConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [step, setStep] = useState<Step>("region");
  const [bodyRegion, setBodyRegion] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [goal, setGoal] = useState("");
  const [icd10, setIcd10] = useState("");
  const [otherProblem, setOtherProblem] = useState("");
  const [safetyAnswers, setSafetyAnswers] = useState<Record<string, boolean>>({});
  const [safetyOutcome, setSafetyOutcome] = useState<FinderSafetyOutcome | null>(null);
  const [warningAccepted, setWarningAccepted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadProgramFinderConfig()
      .then((value) => {
        if (cancelled) return;
        setConfig(value);
        setLoadError(false);
      })
      .catch(() => {
        if (cancelled) return;
        setLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const availableRegionKeys = useMemo(() => {
    if (!config) return new Set<string>();
    return new Set(config.programmeBodyRegions.map((relation) => relation.bodyRegionKey));
  }, [config]);

  const bodyRegions = useMemo(
    () => config?.bodyRegions.filter((region) => availableRegionKeys.has(region.key)) ?? [],
    [config, availableRegionKeys],
  );

  const regionOptions = useMemo(
    () => config?.options.filter((option) => option.bodyRegions.includes(bodyRegion)) ?? [],
    [config, bodyRegion],
  );
  const symptoms = regionOptions.filter((option) => option.optionType === "symptom");
  const limitations = regionOptions.filter((option) => option.optionType === "limitation");

  const applicableSafetyQuestions = useMemo(
    () => (config && bodyRegion ? getApplicableSafetyQuestions(config, bodyRegion) : []),
    [config, bodyRegion],
  );

  const recommendations = useMemo(() => {
    if (!config || !warningAccepted) return [];
    return rankProgrammes(config, {
      bodyRegionKey: bodyRegion,
      selectedOptionIds: selectedOptions,
      goalKey: goal,
      icd10,
    });
  }, [config, bodyRegion, selectedOptions, goal, icd10, warningAccepted]);

  const toggleOption = (id: string) => {
    setSelectedOptions((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const resetAfterRegion = (key: string) => {
    setBodyRegion(key);
    setSelectedOptions([]);
    setGoal("");
    setIcd10("");
    setOtherProblem("");
    setSafetyAnswers({});
    setSafetyOutcome(null);
    setWarningAccepted(false);
  };

  const goBack = () => {
    const index = STEPS.indexOf(step);
    if (index > 0) setStep(STEPS[index - 1]);
  };

  const progressIndex = Math.max(0, STEPS.indexOf(step));

  const proceedFromSafety = () => {
    if (!config) return;
    const missing = applicableSafetyQuestions.some(
      (question) => typeof safetyAnswers[question.stableKey] !== "boolean",
    );
    if (missing) return;
    const outcome = evaluateSafety(config, bodyRegion, safetyAnswers);
    setSafetyOutcome(outcome);
    setWarningAccepted(false);
    setStep("warning");
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="pt-28 pb-20 container mx-auto px-4 flex items-center justify-center min-h-[70vh]">
          <div className="flex items-center gap-3 text-muted-foreground font-body">
            <Loader2 className="w-5 h-5 animate-spin" />
            {tr({ fr: "Préparation du questionnaire…", en: "Preparing the questionnaire…", de: "Fragebogen wird vorbereitet…" })}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (loadError || !config) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="pt-28 pb-20 container mx-auto px-4 max-w-2xl text-center">
          <ShieldAlert className="w-10 h-10 mx-auto mb-4 text-destructive" />
          <h1 className="text-3xl font-heading font-bold mb-3">
            {tr({ fr: "Questionnaire momentanément indisponible", en: "Questionnaire temporarily unavailable", de: "Fragebogen vorübergehend nicht verfügbar" })}
          </h1>
          <p className="text-muted-foreground mb-6">
            {tr({ fr: "Aucune recommandation automatique ne sera inventée. Vous pouvez consulter le catalogue directement.", en: "No automatic recommendation will be invented. You can browse the catalogue directly.", de: "Es wird keine automatische Empfehlung erfunden. Sie können den Katalog direkt ansehen." })}
          </p>
          <Button asChild><Link to="/programs">{tr({ fr: "Voir les programmes", en: "Browse programmes", de: "Programme ansehen" })}</Link></Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />
      <main className="pt-28 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-xs font-semibold text-secondary-foreground">
              <ClipboardCheck className="w-4 h-4" />
              {tr({ fr: "Program Finder — orientation non diagnostique", en: "Program Finder — non-diagnostic guidance", de: "Program Finder – nicht-diagnostische Orientierung" })}
            </span>
            <h1 className="text-3xl md:text-4xl font-heading font-bold mt-4 mb-3">
              {tr({ fr: "Trouvons le programme qui correspond le mieux à vos besoins", en: "Let’s find the programme that best matches your needs", de: "Finden wir das Programm, das am besten zu Ihren Bedürfnissen passt" })}
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto font-body">
              {tr({ fr: "Vos réponses servent uniquement à orienter le choix d’un programme. Elles ne constituent pas un diagnostic médical et ne sont pas enregistrées dans votre profil à cette étape.", en: "Your answers are used only to guide programme selection. They are not a medical diagnosis and are not saved to your profile at this stage.", de: "Ihre Antworten dienen nur zur Orientierung bei der Programmauswahl. Sie stellen keine medizinische Diagnose dar und werden in diesem Schritt nicht in Ihrem Profil gespeichert." })}
            </p>
          </div>

          <div className="h-2 rounded-full bg-secondary overflow-hidden mb-8" aria-hidden="true">
            <div className="h-full bg-primary transition-all" style={{ width: `${((progressIndex + 1) / STEPS.length) * 100}%` }} />
          </div>

          <section className="bg-card rounded-3xl shadow-soft border border-border p-5 md:p-8">
            {step === "region" && (
              <div>
                <h2 className="text-2xl font-heading font-bold mb-2">{tr({ fr: "1. Où se situe principalement votre problème ?", en: "1. Where is your main problem located?", de: "1. Wo befindet sich Ihr Hauptproblem?" })}</h2>
                <p className="text-sm text-muted-foreground mb-6">{tr({ fr: "Choisissez la zone principale. Le support de plusieurs zones pourra être ajouté ensuite.", en: "Choose the main area. Support for multiple areas can be added later.", de: "Wählen Sie den Hauptbereich. Mehrere Bereiche können später unterstützt werden." })}</p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {bodyRegions.map((region) => (
                    <button
                      key={region.key}
                      type="button"
                      onClick={() => resetAfterRegion(region.key)}
                      className={`rounded-2xl border p-4 text-left font-body transition-all ${bodyRegion === region.key ? "border-primary bg-primary/10 ring-2 ring-primary/20" : "border-border bg-background hover:border-primary/40"}`}
                    >
                      <span className="font-semibold">{tr(region.label)}</span>
                    </button>
                  ))}
                </div>
                <div className="mt-7 flex justify-end">
                  <Button disabled={!bodyRegion} onClick={() => setStep("symptoms")} className="rounded-full gap-2">
                    {tr({ fr: "Continuer", en: "Continue", de: "Weiter" })} <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {step === "symptoms" && (
              <div>
                <h2 className="text-2xl font-heading font-bold mb-2">{tr({ fr: "2. Que ressentez-vous dans cette zone ?", en: "2. What do you notice in this area?", de: "2. Was bemerken Sie in diesem Bereich?" })}</h2>
                <p className="text-sm text-muted-foreground mb-5">{tr({ fr: "Vous pouvez choisir plusieurs réponses.", en: "You can select several answers.", de: "Sie können mehrere Antworten auswählen." })}</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {symptoms.map((option) => (
                    <button key={option.id} type="button" onClick={() => toggleOption(option.id)} className={`rounded-2xl border p-4 text-left transition-all ${selectedOptions.includes(option.id) ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"}`}>
                      <p className="font-semibold font-body">{tr(option.label)}</p>
                      {option.helpText[lang] && <p className="text-xs text-muted-foreground mt-1">{option.helpText[lang]}</p>}
                    </button>
                  ))}
                </div>
                <div className="mt-5 rounded-2xl border border-dashed border-border p-4">
                  <label className="font-body text-sm font-semibold block mb-2">{tr({ fr: "Autre / Je ne trouve pas mon problème", en: "Other / I cannot find my problem", de: "Andere / Ich finde mein Problem nicht" })}</label>
                  <Input value={otherProblem} onChange={(event) => setOtherProblem(event.target.value.slice(0, 300))} maxLength={300} placeholder={tr({ fr: "Décrivez brièvement avec vos propres mots…", en: "Briefly describe it in your own words…", de: "Beschreiben Sie es kurz mit eigenen Worten…" })} />
                  <p className="text-[11px] text-muted-foreground mt-2">{tr({ fr: "Ce texte libre n’est pas utilisé pour poser un diagnostic ni interprété automatiquement dans ce MVP.", en: "This free text is not used to diagnose or automatically interpreted in this MVP.", de: "Dieser Freitext wird in diesem MVP weder zur Diagnose verwendet noch automatisch interpretiert." })}</p>
                </div>
                <NavButtons onBack={goBack} onNext={() => setStep("limitations")} nextDisabled={selectedOptions.length === 0 && !otherProblem.trim()} tr={tr} />
              </div>
            )}

            {step === "limitations" && (
              <div>
                <h2 className="text-2xl font-heading font-bold mb-2">{tr({ fr: "3. Qu’est-ce que cela vous empêche ou gêne de faire ?", en: "3. What does this make difficult for you?", de: "3. Was fällt Ihnen dadurch schwer?" })}</h2>
                <p className="text-sm text-muted-foreground mb-5">{tr({ fr: "Les limitations fonctionnelles nous aident à mieux orienter le programme.", en: "Functional limitations help us guide programme selection.", de: "Funktionelle Einschränkungen helfen bei der Programmauswahl." })}</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {limitations.map((option) => (
                    <button key={option.id} type="button" onClick={() => toggleOption(option.id)} className={`rounded-2xl border p-4 text-left transition-all ${selectedOptions.includes(option.id) ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"}`}>
                      <p className="font-semibold font-body">{tr(option.label)}</p>
                      {option.helpText[lang] && <p className="text-xs text-muted-foreground mt-1">{option.helpText[lang]}</p>}
                    </button>
                  ))}
                </div>
                <NavButtons onBack={goBack} onNext={() => setStep("goal")} tr={tr} />
              </div>
            )}

            {step === "goal" && (
              <div>
                <h2 className="text-2xl font-heading font-bold mb-5">{tr({ fr: "4. Quel est votre objectif principal ?", en: "4. What is your main goal?", de: "4. Was ist Ihr Hauptziel?" })}</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {config.goals.map((item) => (
                    <button key={item.key} type="button" onClick={() => setGoal(item.key)} className={`rounded-2xl border p-4 text-left transition-all ${goal === item.key ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"}`}>
                      <span className="font-semibold font-body">{tr(item.label)}</span>
                    </button>
                  ))}
                </div>
                <NavButtons onBack={goBack} onNext={() => setStep("icd")} nextDisabled={!goal} tr={tr} />
              </div>
            )}

            {step === "icd" && (
              <div>
                <h2 className="text-2xl font-heading font-bold mb-2">{tr({ fr: "5. Avez-vous déjà un code ICD-10 donné par un médecin ?", en: "5. Do you already have an ICD-10 code given by a doctor?", de: "5. Haben Sie bereits einen ICD-10-Code von einem Arzt erhalten?" })}</h2>
                <p className="text-sm text-muted-foreground mb-6">{tr({ fr: "Cette étape est facultative. Le code sert uniquement comme signal supplémentaire pour rechercher des programmes pertinents.", en: "This step is optional. The code is used only as an additional signal to find relevant programmes.", de: "Dieser Schritt ist freiwillig. Der Code dient nur als zusätzliches Signal zur Suche nach passenden Programmen." })}</p>
                <label className="block text-sm font-semibold font-body mb-2">ICD-10</label>
                <Input value={icd10} onChange={(event) => setIcd10(event.target.value.slice(0, 12))} placeholder="Ex. M54.5" className={!isPlausibleIcd10(icd10) ? "border-destructive" : ""} />
                {!isPlausibleIcd10(icd10) && <p className="text-xs text-destructive mt-2">{tr({ fr: "Format non reconnu. Exemple : M54.5. Vous pouvez aussi laisser ce champ vide.", en: "Format not recognised. Example: M54.5. You can also leave this blank.", de: "Format nicht erkannt. Beispiel: M54.5. Sie können das Feld auch leer lassen." })}</p>}
                <div className="mt-6 rounded-2xl bg-secondary/60 p-4 text-sm text-muted-foreground flex gap-3">
                  <Stethoscope className="w-5 h-5 shrink-0 text-primary" />
                  <p>{tr({ fr: "Ne saisissez un code que s’il vous a déjà été communiqué dans le cadre d’un diagnostic professionnel. Nous ne générons aucun diagnostic ICD-10 à partir de vos symptômes.", en: "Only enter a code if it has already been provided to you as part of a professional diagnosis. We do not generate an ICD-10 diagnosis from your symptoms.", de: "Geben Sie einen Code nur ein, wenn er Ihnen bereits im Rahmen einer fachlichen Diagnose mitgeteilt wurde. Wir erzeugen aus Ihren Symptomen keine ICD-10-Diagnose." })}</p>
                </div>
                <NavButtons onBack={goBack} onNext={() => setStep("safety")} nextDisabled={!isPlausibleIcd10(icd10)} tr={tr} />
              </div>
            )}

            {step === "safety" && (
              <div>
                <h2 className="text-2xl font-heading font-bold mb-2">{tr({ fr: "6. Vérification de sécurité", en: "6. Safety check", de: "6. Sicherheitsprüfung" })}</h2>
                <p className="text-sm text-muted-foreground mb-6">{tr({ fr: "Répondez à toutes les questions. Une réponse d’alerte affichera un avertissement renforcé avant la recommandation automatique.", en: "Answer every question. A warning answer will show a stronger warning before automatic recommendation.", de: "Beantworten Sie alle Fragen. Eine Warnantwort zeigt vor der automatischen Empfehlung einen stärkeren Hinweis." })}</p>
                <div className="space-y-4">
                  {applicableSafetyQuestions.map((question) => (
                    <div key={question.id} className="rounded-2xl border border-border p-4">
                      <p className="font-body font-semibold mb-2">{tr(question.question)}</p>
                      {question.helpText[lang] && <p className="text-xs text-muted-foreground mb-3">{question.helpText[lang]}</p>}
                      <div className="flex gap-2">
                        {[true, false].map((value) => (
                          <button key={String(value)} type="button" onClick={() => setSafetyAnswers((current) => ({ ...current, [question.stableKey]: value }))} className={`px-4 py-2 rounded-full border text-sm font-semibold ${safetyAnswers[question.stableKey] === value ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/40"}`}>
                            {value ? tr({ fr: "Oui", en: "Yes", de: "Ja" }) : tr({ fr: "Non", en: "No", de: "Nein" })}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <NavButtons onBack={goBack} onNext={proceedFromSafety} nextDisabled={applicableSafetyQuestions.some((question) => typeof safetyAnswers[question.stableKey] !== "boolean")} tr={tr} nextLabel={tr({ fr: "Évaluer la sécurité", en: "Evaluate safety", de: "Sicherheit auswerten" })} />
              </div>
            )}

            {step === "warning" && safetyOutcome && (
              <div>
                <div className={`rounded-2xl p-5 mb-6 border ${safetyOutcome.level !== "green" ? "border-accent bg-accent/10" : "border-primary/30 bg-primary/5"}`}>
                  <div className="flex gap-3">
                    {safetyOutcome.level !== "green" ? <AlertTriangle className="w-6 h-6 shrink-0 text-accent" /> : <CheckCircle2 className="w-6 h-6 shrink-0 text-primary" />}
                    <div>
                      <h2 className="font-heading text-xl font-bold mb-2">{tr(safetyOutcome.title)}</h2>
                      <p className="text-sm text-muted-foreground">{tr(safetyOutcome.body)}</p>
                    </div>
                  </div>
                </div>

                <h3 className="text-2xl font-heading font-bold mb-3">{tr(config.acknowledgement.title)}</h3>
                <div className="rounded-2xl border border-border bg-background p-5 text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {tr(config.acknowledgement.body)}
                </div>
                <label className="mt-5 flex items-start gap-3 rounded-2xl border border-border p-4 cursor-pointer">
                  <input type="checkbox" checked={warningAccepted} onChange={(event) => setWarningAccepted(event.target.checked)} className="mt-1 h-4 w-4" />
                  <span className="font-body text-sm">{tr(config.acknowledgement.checkboxLabel)}</span>
                </label>
                <NavButtons onBack={() => { setStep("safety"); setWarningAccepted(false); }} onNext={() => setStep("results")} nextDisabled={!warningAccepted} tr={tr} nextLabel={tr({ fr: "Voir les programmes recommandés", en: "See recommended programmes", de: "Empfohlene Programme ansehen" })} />
              </div>
            )}

            {step === "results" && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-heading font-bold mb-2">{tr({ fr: "Programmes potentiellement pertinents", en: "Potentially relevant programmes", de: "Möglicherweise passende Programme" })}</h2>
                  <p className="text-sm text-muted-foreground">{tr({ fr: "Ce classement est une orientation basée sur vos réponses déclarées. Il ne confirme aucune pathologie.", en: "This ranking is guidance based on your declared answers. It does not confirm any condition.", de: "Diese Rangfolge ist eine Orientierung auf Basis Ihrer Angaben. Sie bestätigt keine Erkrankung." })}</p>
                </div>
                {safetyOutcome && safetyOutcome.level !== "green" && (
                  <div className={`mb-5 rounded-2xl border p-4 flex gap-3 ${safetyOutcome.level === "red" ? "border-destructive/30 bg-destructive/10" : "border-accent bg-accent/10"}`}>
                    <AlertTriangle className={`w-5 h-5 shrink-0 ${safetyOutcome.level === "red" ? "text-destructive" : "text-accent"}`} />
                    <p className="text-sm">{tr({ fr: "Vous pouvez consulter ces programmes, mais ils ne remplacent pas l’avis ou la consultation d’un professionnel de santé.", en: "You can review these programmes, but they do not replace advice or consultation with a healthcare professional.", de: "Sie können diese Programme ansehen, sie ersetzen jedoch keine Beratung oder Konsultation durch eine medizinische Fachperson." })}</p>
                  </div>
                )}
                {recommendations.length === 0 ? (
                  <div className="rounded-2xl border border-border p-8 text-center">
                    <p className="font-body font-semibold mb-2">{tr({ fr: "Aucune correspondance suffisamment forte n’a été trouvée.", en: "No sufficiently strong match was found.", de: "Es wurde keine ausreichend starke Übereinstimmung gefunden." })}</p>
                    <p className="text-sm text-muted-foreground mb-5">{tr({ fr: "Nous préférons ne pas inventer une recommandation. Vous pouvez parcourir le catalogue ou demander un avis professionnel.", en: "We prefer not to invent a recommendation. You can browse the catalogue or seek professional advice.", de: "Wir erfinden lieber keine Empfehlung. Sie können den Katalog ansehen oder fachlichen Rat einholen." })}</p>
                    <Button asChild variant="outline"><Link to="/programs">{tr({ fr: "Voir le catalogue", en: "Browse catalogue", de: "Katalog ansehen" })}</Link></Button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {recommendations.map((recommendation, index) => {
                      const program = programs.find((item) => item.id === recommendation.programmeId);
                      if (!program) return null;
                      return (
                        <div key={program.id} className="rounded-2xl border border-border bg-background p-5 shadow-card">
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div>
                              <p className="text-xs uppercase tracking-wider text-primary font-semibold">{index === 0 ? tr({ fr: "Meilleure correspondance", en: "Best match", de: "Beste Übereinstimmung" }) : tr({ fr: "Alternative", en: "Alternative", de: "Alternative" })}</p>
                              <h3 className="font-heading font-bold text-xl mt-1">{tr(program.title)}</h3>
                            </div>
                            <span className="text-3xl" aria-hidden="true">{program.image}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-4">{tr(program.region)}</p>
                          <div className="flex flex-wrap gap-2 text-xs mb-5">
                            <span className="rounded-full bg-secondary px-3 py-1">{recommendation.matchedOptionCount} {tr({ fr: "signal(aux) correspondant(s)", en: "matching signal(s)", de: "passende Signal(e)" })}</span>
                            {recommendation.matchedGoal && <span className="rounded-full bg-secondary px-3 py-1">{tr({ fr: "objectif correspondant", en: "matching goal", de: "passendes Ziel" })}</span>}
                            {recommendation.matchedIcd10 && <span className="rounded-full bg-secondary px-3 py-1">ICD-10</span>}
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-heading font-bold text-primary text-xl">{program.price} €</span>
                            <Button asChild variant="outline" className="rounded-full">
                              <Link to="/programs">{tr({ fr: "Voir le programme", en: "View programme", de: "Programm ansehen" })}</Link>
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="mt-8 border-t border-border pt-5 flex flex-wrap justify-between gap-3">
                  <Button variant="ghost" className="gap-2" onClick={() => {
                    setStep("region");
                    setBodyRegion("");
                    setSelectedOptions([]);
                    setGoal("");
                    setIcd10("");
                    setOtherProblem("");
                    setSafetyAnswers({});
                    setSafetyOutcome(null);
                    setWarningAccepted(false);
                  }}>
                    <ArrowLeft className="w-4 h-4" /> {tr({ fr: "Recommencer", en: "Start again", de: "Neu starten" })}
                  </Button>
                  <Button asChild variant="outline"><Link to="/medical-disclaimer">{tr({ fr: "Lire l’avertissement médical", en: "Read medical disclaimer", de: "Medizinischen Hinweis lesen" })}</Link></Button>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

const NavButtons = ({
  onBack,
  onNext,
  nextDisabled = false,
  nextLabel,
  tr,
}: {
  onBack: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
  nextLabel?: string;
  tr: ReturnType<typeof useTr>;
}) => (
  <div className="mt-7 flex items-center justify-between gap-3">
    <Button type="button" variant="ghost" onClick={onBack} className="gap-2 rounded-full">
      <ArrowLeft className="w-4 h-4" /> {tr({ fr: "Retour", en: "Back", de: "Zurück" })}
    </Button>
    <Button type="button" disabled={nextDisabled} onClick={onNext} className="gap-2 rounded-full">
      {nextLabel ?? tr({ fr: "Continuer", en: "Continue", de: "Weiter" })} <ArrowRight className="w-4 h-4" />
    </Button>
  </div>
);

export default ProgramFinderPage;
