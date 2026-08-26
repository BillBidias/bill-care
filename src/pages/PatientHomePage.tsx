import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, LockKeyhole, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useI18n, useTr } from "@/lib/i18n";
import { fetchPatientAppHome, type PatientHomeProgramme } from "@/data/patientHomeRepository";
import {
  pauseProgrammeEnrollment,
  resumeProgrammeEnrollment,
  startProgrammeEnrollment,
} from "@/data/enrollmentRepository";

const PatientHomePage = () => {
  const tr = useTr();
  const { lang } = useI18n();
  const navigate = useNavigate();
  const [programmes, setProgrammes] = useState<PatientHomeProgramme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workingId, setWorkingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setProgrammes(await fetchPatientAppHome(lang));
    } catch (err) {
      setError(err instanceof Error ? err.message : "patient_home_load_failed");
    } finally {
      setLoading(false);
    }
  }, [lang]);

  useEffect(() => {
    void load();
  }, [load]);

  const today = useMemo(
    () => programmes.find((item) => item.todayAction === "resume_session")
      ?? programmes.find((item) => item.todayAction === "resume_programme")
      ?? programmes.find((item) => item.todayAction === "start_programme")
      ?? programmes[0]
      ?? null,
    [programmes],
  );

  const runAction = async (programme: PatientHomeProgramme) => {
    if (workingId !== null) return;
    setWorkingId(programme.programmeId);
    setError(null);
    try {
      if (programme.todayAction === "start_programme") {
        await startProgrammeEnrollment(programme.programmeId);
        await load();
        return;
      }
      if (programme.todayAction === "resume_programme" && programme.enrollmentId) {
        await resumeProgrammeEnrollment(programme.enrollmentId);
        await load();
        return;
      }
      if (programme.todayAction === "resume_session" && programme.enrollmentId && programme.currentSessionId) {
        navigate(`/patient/session/${programme.enrollmentId}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "patient_home_action_failed");
    } finally {
      setWorkingId(null);
    }
  };

  const pause = async (programme: PatientHomeProgramme) => {
    if (!programme.enrollmentId || workingId !== null) return;
    setWorkingId(programme.programmeId);
    setError(null);
    try {
      await pauseProgrammeEnrollment(programme.enrollmentId);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "patient_home_action_failed");
    } finally {
      setWorkingId(null);
    }
  };

  const actionLabel = (programme: PatientHomeProgramme) => {
    if (programme.todayAction === "resume_session") {
      return tr({ fr: "Reprendre ma séance", en: "Resume my session", de: "Sitzung fortsetzen" });
    }
    if (programme.todayAction === "resume_programme") {
      return tr({ fr: "Reprendre le programme", en: "Resume programme", de: "Programm fortsetzen" });
    }
    if (programme.todayAction === "start_programme") {
      return tr({ fr: "Démarrer le programme", en: "Start programme", de: "Programm starten" });
    }
    return tr({ fr: "Contenu en préparation", en: "Content being prepared", de: "Inhalt in Vorbereitung" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-28 pb-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
              <div>
                <p className="text-sm font-body font-semibold text-primary mb-2">
                  {tr({ fr: "Espace patient", en: "Patient space", de: "Patientenbereich" })}
                </p>
                <h1 className="text-3xl md:text-4xl font-heading font-bold">
                  {tr({ fr: "Que dois-je faire aujourd’hui ?", en: "What should I do today?", de: "Was soll ich heute tun?" })}
                </h1>
                <p className="mt-2 text-muted-foreground font-body max-w-2xl">
                  {tr({
                    fr: "Retrouvez vos programmes achetés et reprenez votre parcours là où vous l’avez laissé.",
                    en: "Find your purchased programmes and continue where you left off.",
                    de: "Finden Sie Ihre gekauften Programme und setzen Sie dort fort, wo Sie aufgehört haben.",
                  })}
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link to="/account">{tr({ fr: "Mon profil", en: "My profile", de: "Mein Profil" })}</Link>
              </Button>
            </div>

            {loading ? (
              <div className="rounded-2xl border border-border bg-card p-8" aria-busy="true">
                <p className="font-body text-muted-foreground">
                  {tr({ fr: "Chargement de vos programmes…", en: "Loading your programmes…", de: "Programme werden geladen…" })}
                </p>
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-destructive/30 bg-card p-6">
                <p role="alert" className="text-sm text-destructive font-body mb-4">{error}</p>
                <Button variant="outline" onClick={() => void load()}>
                  {tr({ fr: "Réessayer", en: "Try again", de: "Erneut versuchen" })}
                </Button>
              </div>
            ) : programmes.length === 0 ? (
              <div className="rounded-3xl border border-border bg-card p-8 md:p-10 text-center">
                <LockKeyhole className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
                <h2 className="text-2xl font-heading font-bold mb-2">
                  {tr({ fr: "Aucun programme dans votre compte", en: "No programme in your account", de: "Noch kein Programm in Ihrem Konto" })}
                </h2>
                <p className="font-body text-muted-foreground mb-6">
                  {tr({
                    fr: "Utilisez le Program Finder ou consultez les programmes disponibles pour trouver le parcours adapté.",
                    en: "Use the Program Finder or browse available programmes to find a suitable path.",
                    de: "Nutzen Sie den Program Finder oder sehen Sie sich verfügbare Programme an.",
                  })}
                </p>
                <Button asChild><Link to="/programs">{tr({ fr: "Voir les programmes", en: "Browse programmes", de: "Programme ansehen" })}</Link></Button>
              </div>
            ) : (
              <>
                {today && (
                  <section className="rounded-3xl border border-primary/20 bg-card p-6 md:p-8 shadow-sm mb-10">
                    <div className="grid md:grid-cols-[1fr_auto] gap-6 items-center">
                      <div>
                        <p className="text-sm font-body font-semibold text-primary mb-2">
                          {tr({ fr: "Votre prochaine action", en: "Your next action", de: "Ihre nächste Aktion" })}
                        </p>
                        <h2 className="text-2xl font-heading font-bold mb-2">{today.programmeTitle}</h2>
                        {today.currentPhaseTitle && <p className="text-sm font-body text-muted-foreground">{today.currentPhaseTitle}</p>}
                        {today.currentSessionTitle && <p className="text-base font-body font-semibold mt-1">{today.currentSessionTitle}</p>}
                      </div>
                      <div>
                        <Button
                          size="lg"
                          disabled={today.todayAction === "content_not_ready" || workingId === today.programmeId}
                          onClick={() => void runAction(today)}
                          className="min-w-48"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          {actionLabel(today)}
                        </Button>
                      </div>
                    </div>
                  </section>
                )}

                <section>
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <h2 className="text-2xl font-heading font-bold">
                      {tr({ fr: "Mes programmes", en: "My programmes", de: "Meine Programme" })}
                    </h2>
                    <span className="text-sm font-body text-muted-foreground">{programmes.length}</span>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-5">
                    {programmes.map((programme) => (
                      <article key={programme.programmeId} className="rounded-2xl border border-border bg-card p-6">
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div>
                            <h3 className="font-heading font-bold text-xl">{programme.programmeTitle}</h3>
                            <p className="text-xs font-body text-muted-foreground mt-1">
                              {programme.entitlementType === "permanent_purchase"
                                ? tr({ fr: "Accès permanent", en: "Permanent access", de: "Dauerhafter Zugriff" })
                                : tr({ fr: "Accès actif", en: "Active access", de: "Aktiver Zugriff" })}
                            </p>
                          </div>
                          <CheckCircle2 className="w-5 h-5 text-primary shrink-0" aria-hidden="true" />
                        </div>

                        {programme.enrollmentStatus ? (
                          <div className="rounded-xl bg-muted/50 p-4 mb-4">
                            <p className="text-sm font-body font-semibold">
                              {programme.enrollmentStatus === "paused"
                                ? tr({ fr: "Programme en pause", en: "Programme paused", de: "Programm pausiert" })
                                : tr({ fr: "Programme en cours", en: "Programme in progress", de: "Programm läuft" })}
                            </p>
                            {programme.currentSessionTitle && (
                              <p className="text-sm font-body text-muted-foreground mt-1">{programme.currentSessionTitle}</p>
                            )}
                          </div>
                        ) : (
                          <div className="rounded-xl bg-muted/50 p-4 mb-4">
                            <p className="text-sm font-body text-muted-foreground">
                              {programme.contentReady
                                ? tr({ fr: "Acheté — pas encore commencé", en: "Purchased — not started yet", de: "Gekauft — noch nicht begonnen" })
                                : tr({ fr: "Acheté — contenu clinique encore en préparation", en: "Purchased — clinical content still being prepared", de: "Gekauft — klinischer Inhalt noch in Vorbereitung" })}
                            </p>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-2">
                          <Button
                            disabled={programme.todayAction === "content_not_ready" || workingId === programme.programmeId}
                            onClick={() => void runAction(programme)}
                          >
                            {programme.todayAction === "resume_programme" ? <RotateCcw className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                            {actionLabel(programme)}
                          </Button>
                          {programme.enrollmentStatus === "active" && programme.enrollmentId && (
                            <Button variant="outline" disabled={workingId === programme.programmeId} onClick={() => void pause(programme)}>
                              <Pause className="w-4 h-4 mr-2" />
                              {tr({ fr: "Mettre en pause", en: "Pause", de: "Pausieren" })}
                            </Button>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              </>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PatientHomePage;
