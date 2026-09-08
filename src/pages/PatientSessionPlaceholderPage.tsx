import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Dumbbell,
  Info,
  Play,
  Repeat2,
  ShieldAlert,
  TimerReset,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useI18n, useTr } from "@/lib/i18n";
import {
  fetchPatientSessionExperience,
  type PatientSessionExperience,
  type SessionExercise,
} from "@/data/sessionExperienceRepository";
import {
  completeProgrammeExercise,
  fetchCompletedExerciseIds,
} from "@/data/progressRepository";

const formatSeconds = (value: number | null, tr: ReturnType<typeof useTr>) =>
  value == null ? "—" : `${value} ${tr({ fr: "sec", en: "sec", de: "Sek." })}`;

const PatientSessionPlaceholderPage = () => {
  const { enrollmentId = "" } = useParams();
  const navigate = useNavigate();
  const { lang } = useI18n();
  const tr = useTr();
  const [session, setSession] = useState<PatientSessionExperience | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [experience, completedIds] = await Promise.all([
        fetchPatientSessionExperience(enrollmentId, lang),
        fetchCompletedExerciseIds(enrollmentId),
      ]);
      setSession(experience);
      setCompleted(completedIds);
      setActiveIndex((current) => Math.min(current, Math.max(0, experience.exercises.length - 1)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "session.load_failed");
    } finally {
      setLoading(false);
    }
  }, [enrollmentId, lang]);

  useEffect(() => { void load(); }, [load]);

  const exercise = useMemo<SessionExercise | null>(
    () => session?.exercises[activeIndex] ?? null,
    [session, activeIndex],
  );

  const go = (index: number) => {
    if (!session) return;
    setActiveIndex(Math.max(0, Math.min(index, session.exercises.length - 1)));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const markCompleted = async () => {
    if (!session || !exercise || working || completed.has(exercise.prescriptionId)) return;
    setWorking(true);
    setError(null);
    try {
      const result = await completeProgrammeExercise(session.enrollmentId, exercise.prescriptionId);
      setCompleted((current) => new Set(current).add(exercise.prescriptionId));

      if (result.programmeCompleted) {
        navigate("/patient", { replace: true });
        return;
      }
      if (result.sessionCompleted) {
        await load();
        setActiveIndex(0);
        return;
      }
      if (activeIndex < session.exercises.length - 1) go(activeIndex + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "progress_update_failed");
    } finally {
      setWorking(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-background"><Navbar /><main className="pt-28 pb-20"><div className="container mx-auto px-4 max-w-7xl"><div className="rounded-3xl border border-border bg-card p-8" aria-busy="true">{tr({ fr: "Chargement de votre séance…", en: "Loading your session…", de: "Ihre Sitzung wird geladen…" })}</div></div></main><Footer /></div>;
  }

  if (!session || !exercise) {
    return <div className="min-h-screen bg-background"><Navbar /><main className="pt-28 pb-20"><div className="container mx-auto px-4 max-w-2xl"><div className="rounded-3xl border border-border bg-card p-8 text-center"><ShieldAlert className="w-10 h-10 mx-auto text-primary mb-4" /><h1 className="text-3xl font-heading font-bold mb-3">{tr({ fr: "Séance non disponible", en: "Session unavailable", de: "Sitzung nicht verfügbar" })}</h1><p className="font-body text-muted-foreground mb-6">{tr({ fr: "Cette séance n’est pas encore publiée ou votre compte ne dispose pas de l’accès requis.", en: "This session is not yet published or your account does not have the required access.", de: "Diese Sitzung ist noch nicht veröffentlicht oder Ihr Konto verfügt nicht über den erforderlichen Zugriff." })}</p>{error && <p role="alert" className="text-sm text-destructive mb-4">{error}</p>}<Button asChild><Link to="/patient">{tr({ fr: "Retour à mon espace", en: "Back to my space", de: "Zurück zu meinem Bereich" })}</Link></Button></div></div></main><Footer /></div>;
  }

  const mediaImage = exercise.placeholderImage || session.programmeImage;
  const isCompleted = completed.has(exercise.prescriptionId);
  const completedInSession = session.exercises.filter((item) => completed.has(item.prescriptionId)).length;
  const sessionPercent = Math.round((completedInSession / session.exercises.length) * 100);

  return (
    <div className="min-h-screen bg-muted/20">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-[1480px]">
          <div className="flex flex-wrap items-center justify-between gap-3 py-5">
            <div>
              <Link to="/patient" className="inline-flex items-center gap-2 text-sm font-body font-semibold text-primary hover:underline mb-2"><ArrowLeft className="w-4 h-4" />{tr({ fr: "Retour à mes programmes", en: "Back to my programmes", de: "Zurück zu meinen Programmen" })}</Link>
              <h1 className="font-heading text-2xl md:text-3xl font-bold">{session.sessionName}</h1>
              <p className="font-body text-sm text-muted-foreground mt-1">{session.programmeTitle} · {session.phaseName}</p>
            </div>
            <div className="min-w-48">
              <div className="flex items-center justify-between text-xs font-body mb-1.5"><span className="text-muted-foreground">{completedInSession}/{session.exercises.length} {tr({ fr: "exercices", en: "exercises", de: "Übungen" })}</span><strong>{sessionPercent}%</strong></div>
              <div className="h-2 rounded-full bg-muted overflow-hidden"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${sessionPercent}%` }} /></div>
            </div>
          </div>

          {error && <div role="alert" className="mb-4 rounded-2xl border border-destructive/30 bg-card p-4 text-sm text-destructive">{error}</div>}

          <div className="grid xl:grid-cols-[300px_minmax(0,1fr)] gap-5 items-start">
            <aside className="hidden xl:block rounded-3xl border border-border bg-card p-4 sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto">
              <div className="mb-4 px-2"><p className="text-xs uppercase tracking-wide font-body font-semibold text-primary">{tr({ fr: "Séance", en: "Session", de: "Sitzung" })}</p><h2 className="font-heading font-bold text-xl mt-1">{session.sessionName}</h2>{session.estimatedDurationMinutes && <p className="text-sm text-muted-foreground font-body mt-1"><Clock3 className="inline w-4 h-4 mr-1" />{session.estimatedDurationMinutes} min</p>}</div>
              <div className="space-y-2">{session.exercises.map((item, index) => <ExerciseListItem key={item.prescriptionId} item={item} index={index} active={index === activeIndex} done={completed.has(item.prescriptionId)} onClick={() => go(index)} />)}</div>
            </aside>

            <div className="space-y-5 min-w-0">
              <section className="rounded-3xl border border-border bg-card overflow-hidden shadow-sm">
                <div className="grid lg:grid-cols-[minmax(0,1.45fr)_minmax(330px,.9fr)]">
                  <div className="p-4 md:p-6">
                    <div className="relative aspect-video rounded-2xl overflow-hidden bg-muted border border-border">
                      {mediaImage ? <img src={mediaImage} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-br from-primary/10 via-background to-muted" />}
                      <div className="absolute inset-0 bg-black/10" />
                      <button type="button" className="absolute inset-0 m-auto w-20 h-20 md:w-24 md:h-24 rounded-full bg-primary text-primary-foreground grid place-items-center shadow-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/50" aria-label={tr({ fr: "Vidéo de démonstration à venir", en: "Demonstration video coming later", de: "Demonstrationsvideo folgt später" })}><Play className="w-9 h-9 md:w-11 md:h-11 fill-current translate-x-0.5" /></button>
                      <span className="absolute bottom-3 left-3 rounded-full bg-background/90 backdrop-blur px-3 py-1.5 text-xs font-body font-semibold">{tr({ fr: "Vidéo bientôt disponible", en: "Video coming soon", de: "Video folgt in Kürze" })}</span>
                    </div>
                  </div>

                  <div className="p-5 md:p-7 lg:border-l border-border">
                    {exercise.target && <span className="inline-flex rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs uppercase tracking-wide font-body font-bold text-primary">{exercise.target}</span>}
                    <h2 className="font-heading text-2xl md:text-3xl font-bold mt-3">{exercise.name}</h2>
                    {exercise.whyThisExercise && <p className="font-body text-muted-foreground mt-3 leading-relaxed">{exercise.whyThisExercise}</p>}
                    <div className="mt-6 divide-y divide-border border-y border-border">
                      <Metric icon={<Repeat2 className="w-4 h-4" />} label={tr({ fr: "Répétitions / maintien", en: "Repetitions / hold", de: "Wiederholungen / Halten" })} value={`${exercise.repetitions ?? "—"}${exercise.holdSeconds ? ` × ${exercise.holdSeconds}s` : ""}`} />
                      <Metric icon={<Dumbbell className="w-4 h-4" />} label={tr({ fr: "Séries", en: "Sets", de: "Sätze" })} value={exercise.sets?.toString() ?? "—"} />
                      <Metric icon={<Clock3 className="w-4 h-4" />} label={tr({ fr: "Repos", en: "Rest", de: "Pause" })} value={formatSeconds(exercise.restSeconds, tr)} />
                      <Metric icon={<TimerReset className="w-4 h-4" />} label={tr({ fr: "Tempo", en: "Tempo", de: "Tempo" })} value={exercise.tempo ?? "—"} />
                    </div>
                    <Button className="w-full mt-6" size="lg" disabled={isCompleted || working || session.enrollmentStatus !== "active"} onClick={() => void markCompleted()}>
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      {isCompleted ? tr({ fr: "Exercice terminé", en: "Exercise completed", de: "Übung abgeschlossen" }) : tr({ fr: "Marquer comme terminé", en: "Mark as completed", de: "Als abgeschlossen markieren" })}
                    </Button>
                  </div>
                </div>
                {exercise.mainTip && <div className="mx-4 md:mx-6 mb-5 rounded-2xl bg-primary/5 border border-primary/15 p-4 flex gap-3"><Info className="w-5 h-5 text-primary shrink-0 mt-0.5" /><p className="font-body text-sm leading-relaxed">{exercise.mainTip}</p></div>}
              </section>

              <section className="grid md:grid-cols-2 gap-4">
                {(exercise.startingPosition || exercise.movement) && <InfoCard title={tr({ fr: "Comment réaliser l’exercice", en: "How to perform the exercise", de: "So führen Sie die Übung aus" })}>{exercise.startingPosition && <p><strong>{tr({ fr: "Position :", en: "Position:", de: "Position:" })}</strong> {exercise.startingPosition}</p>}{exercise.movement && <p><strong>{tr({ fr: "Mouvement :", en: "Movement:", de: "Bewegung:" })}</strong> {exercise.movement}</p>}</InfoCard>}
                {(exercise.commonMistakes || exercise.safetyInstructions || exercise.stopCriteria) && <InfoCard title={tr({ fr: "Sécurité et points d’attention", en: "Safety and key points", de: "Sicherheit und wichtige Hinweise" })} warning>{exercise.commonMistakes && <p><strong>{tr({ fr: "À éviter :", en: "Avoid:", de: "Vermeiden:" })}</strong> {exercise.commonMistakes}</p>}{exercise.safetyInstructions && <p>{exercise.safetyInstructions}</p>}{exercise.stopCriteria && <p><strong>{tr({ fr: "Arrêtez si :", en: "Stop if:", de: "Beenden bei:" })}</strong> {exercise.stopCriteria}</p>}</InfoCard>}
              </section>

              <section className="rounded-3xl border border-border bg-card p-4 md:p-5">
                <div className="flex items-center justify-between gap-4 mb-4"><h2 className="font-heading text-xl font-bold">{tr({ fr: "Exercices de la séance", en: "Session exercises", de: "Übungen der Sitzung" })}</h2><span className="text-sm text-muted-foreground">{session.exercises.length}</span></div>
                <div className="flex gap-3 overflow-x-auto pb-2 snap-x">{session.exercises.map((item, index) => <button key={item.prescriptionId} type="button" onClick={() => go(index)} className={`min-w-[220px] max-w-[220px] snap-start text-left rounded-2xl border overflow-hidden bg-background transition ${index === activeIndex ? "border-primary ring-1 ring-primary/20" : "border-border"}`}><div className="relative aspect-video bg-muted">{item.placeholderImage && <img src={item.placeholderImage} alt="" className="w-full h-full object-cover" />}<span className="absolute inset-0 grid place-items-center"><span className="grid place-items-center w-11 h-11 rounded-full bg-primary text-primary-foreground shadow">{completed.has(item.prescriptionId) ? <CheckCircle2 className="w-6 h-6" /> : <Play className="w-5 h-5 fill-current" />}</span></span></div><div className="p-3"><p className="font-body font-semibold text-sm line-clamp-2">{index + 1}. {item.name}</p></div></button>)}</div>
              </section>

              <div className="sticky bottom-3 z-20 rounded-2xl border border-border bg-background/95 backdrop-blur shadow-lg p-3 flex items-center justify-between gap-3">
                <Button variant="outline" onClick={() => go(activeIndex - 1)} disabled={activeIndex === 0}><ChevronLeft className="w-4 h-4 mr-1" />{tr({ fr: "Précédent", en: "Previous", de: "Zurück" })}</Button>
                <span className="hidden sm:block text-sm font-body text-muted-foreground">{activeIndex + 1} / {session.exercises.length}</span>
                <Button onClick={() => go(activeIndex + 1)} disabled={activeIndex === session.exercises.length - 1}>{tr({ fr: "Suivant", en: "Next", de: "Weiter" })}<ChevronRight className="w-4 h-4 ml-1" /></Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

const ExerciseListItem = ({ item, index, active, done, onClick }: { item: SessionExercise; index: number; active: boolean; done: boolean; onClick: () => void }) => (
  <button type="button" onClick={onClick} className={`w-full text-left rounded-2xl border p-3 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${active ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"}`} aria-current={active ? "step" : undefined}>
    <div className="flex gap-3 items-center"><div className="relative w-20 aspect-video rounded-xl overflow-hidden bg-muted shrink-0">{item.placeholderImage ? <img src={item.placeholderImage} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-br from-primary/10 to-muted" />}<span className="absolute inset-0 grid place-items-center"><span className="grid place-items-center w-9 h-9 rounded-full bg-primary text-primary-foreground shadow">{done ? <CheckCircle2 className="w-5 h-5" /> : <Play className="w-4 h-4 fill-current" />}</span></span></div><div className="min-w-0"><p className="text-sm font-body font-semibold line-clamp-2">{index + 1}. {item.name}</p><p className="text-xs text-muted-foreground mt-1">{item.sets ? `${item.sets}×` : ""}{item.repetitions ?? ""}{item.holdSeconds ? ` · ${item.holdSeconds}s` : ""}</p></div></div>
  </button>
);

const Metric = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => <div className="py-3 flex items-center justify-between gap-4 font-body text-sm"><span className="flex items-center gap-2 text-muted-foreground">{icon}{label}</span><strong className="text-right">{value}</strong></div>;

const InfoCard = ({ title, children, warning = false }: { title: string; children: React.ReactNode; warning?: boolean }) => <article className={`rounded-2xl border p-5 bg-card ${warning ? "border-amber-300/60" : "border-border"}`}><h3 className="font-heading font-bold text-lg mb-3">{title}</h3><div className="space-y-3 font-body text-sm leading-relaxed text-muted-foreground">{children}</div></article>;

export default PatientSessionPlaceholderPage;
