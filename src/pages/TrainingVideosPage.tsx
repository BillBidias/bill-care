import { Link } from "react-router-dom";
import {
  Award,
  CalendarDays,
  CheckCircle2,
  Clock3,
  LockKeyhole,
  Play,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Video,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";

type Level = "Débutant" | "Intermédiaire" | "Avancé";
type Exercise = { region: string; beginner: string[]; intermediate: string[]; advanced: string[] };
type Phase = { id: string; label: string; weeks: string; level: Level; dosage: string; focus: string };

const metrics = [
  { label: "24 semaines", detail: "Progression complète", icon: CalendarDays },
  { label: "168 séances", detail: "7 jours structurés", icon: CheckCircle2 },
  { label: "30-45 min", detail: "Par séance", icon: Clock3 },
  { label: "3 niveaux", detail: "Débutant à avancé", icon: Sparkles },
  { label: "+300 vidéos", detail: "Démonstration guidée", icon: Video },
  { label: "Certificat", detail: "Fin de parcours", icon: Award },
];

const phases: Phase[] = [
  {
    id: "phase-1",
    label: "Phase 1",
    weeks: "Semaines 1-8",
    level: "Débutant",
    dosage: "2 à 3 tours | 10-12 répétitions ou 30s statique | 45s de repos",
    focus: "Bases techniques, contrôle articulaire et reprise progressive.",
  },
  {
    id: "phase-2",
    label: "Phase 2",
    weeks: "Semaines 9-16",
    level: "Intermédiaire",
    dosage: "3 à 4 tours | 12-15 répétitions ou 45s statique | 30s de repos",
    focus: "Renforcement global, stabilité dynamique et endurance musculaire.",
  },
  {
    id: "phase-3",
    label: "Phase 3",
    weeks: "Semaines 17-24",
    level: "Avancé",
    dosage: "4 à 5 tours | 8-12 répétitions lourdes ou explosivité | 20-30s de repos",
    focus: "Puissance, contrôle avancé et autonomie complète.",
  },
];

const exercises: Exercise[] = [
  {
    region: "Pieds & Chevilles",
    beginner: ["Towel Curls", "Élévations des mollets au sol"],
    intermediate: ["Élévations unipodales sur marche", "Marche pointes / talons alternée"],
    advanced: ["Pogo Jumps", "Équilibre unipodal instable avec perturbations"],
  },
  {
    region: "Genoux",
    beginner: ["Chaise au mur", "Extension de jambe au sol"],
    intermediate: ["Fentes arrière", "Step-ups sur chaise ou banc"],
    advanced: ["Squat Pistol assisté ou libre", "Nordic Hamstring Curl"],
  },
  {
    region: "Thorax/Pectoraux",
    beginner: ["Pompes inclinées", "Écartés au sol légers"],
    intermediate: ["Pompes classiques", "Dips sur chaise ou barres"],
    advanced: ["Pompes déclinées", "Pompes explosives"],
  },
  {
    region: "Dos",
    beginner: ["Superman au sol", "Tirage élastique / TRX Row léger"],
    intermediate: ["Tirage inverted", "Bird-Dog dynamique"],
    advanced: ["Tractions à la barre", "Good Morning / soulevé jambes tendues"],
  },
  {
    region: "Épaules",
    beginner: ["Y-T-W au sol", "Élévations latérales légères"],
    intermediate: ["Développé militaire", "Pike Push-ups"],
    advanced: ["Handstand Hold au mur", "Face Pulls avec élastique"],
  },
  {
    region: "Ventre/Abdominaux",
    beginner: ["Gainage frontal sur les coudes", "Crunchs classiques"],
    intermediate: ["Gainage latéral", "Mountain Climbers"],
    advanced: ["Hollow Body Hold", "Hanging Leg Raises"],
  },
  {
    region: "Cou/Cervicales",
    beginner: ["Isométrie cervicale 4 directions", "Flexions / extensions contrôlées à vide"],
    intermediate: ["Neck Curl allongé", "Neck Extension plat ventre"],
    advanced: ["Flexion/extension cervicale avec 1-2 kg", "Shrugs lourds"],
  },
];

const days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

const levelKey: Record<Level, keyof Pick<Exercise, "beginner" | "intermediate" | "advanced">> = {
  Débutant: "beginner",
  Intermédiaire: "intermediate",
  Avancé: "advanced",
};

const recoveryByRegion: Record<string, string> = {
  "Pieds & Chevilles": "Mobilité douce cheville + respiration",
  Genoux: "Flexion-extension lente sans charge",
  "Thorax/Pectoraux": "Ouverture thoracique calme",
  Dos: "Auto-grandissement + dos relâché",
  Épaules: "Cercles d'épaules contrôlés",
  "Ventre/Abdominaux": "Respiration abdominale guidée",
  "Cou/Cervicales": "Mobilité cervicale lente",
};

const getDailyExercises = (phase: Phase, dayIndex: number) => {
  if (dayIndex === 6) {
    return exercises.map((exercise) => ({ region: exercise.region, movement: recoveryByRegion[exercise.region] }));
  }

  const key = levelKey[phase.level];
  return exercises.map((exercise, exerciseIndex) => {
    const options = exercise[key];
    const optionIndex = (dayIndex + exerciseIndex) % options.length;
    return { region: exercise.region, movement: options[optionIndex] };
  });
};

const benefits = [
  "Circuit Full-Body complet avec 7 zones travaillées chaque jour",
  "Progression stricte par blocs de 8 semaines, sans mélange de niveaux",
  "Dimanche réservé à une récupération active douce",
  "Séances pensées pour être suivies à domicile, à votre rythme",
  "Aperçu clair des exercices avant l'achat réel du programme",
];

const included = [
  "Planning complet sur 24 semaines",
  "Bibliothèque vidéo Full-Body",
  "Consignes de sécurité et critères d'arrêt",
  "Progression Débutant, Intermédiaire, Avancé",
  "Certificat de fin de parcours",
];

const TrainingVideosPage = () => {
  const handleDemoCart = () => {
    toast({
      title: "Mode démonstration",
      description: "Le programme Full-Body 24 semaines n'a pas été ajouté à un vrai panier.",
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-28 pb-20">
        <div className="container mx-auto px-4">
          <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm font-semibold text-muted-foreground" aria-label="Fil d'Ariane">
            <Link to="/" className="rounded-md px-1.5 py-1 hover:text-foreground">Accueil</Link>
            <span aria-hidden="true">&gt;</span>
            <Link to="/training-videos" className="rounded-md px-1.5 py-1 hover:text-foreground">Vidéos d'entraînement</Link>
            <span aria-hidden="true">&gt;</span>
            <span className="text-foreground">Full-Body 24 semaines</span>
          </nav>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
            <div className="min-w-0 space-y-8">
              <section className="space-y-7">
                <div className="max-w-4xl">
                  <Badge className="mb-4 border-primary/15 bg-secondary text-primary hover:bg-secondary">
                    Vidéos d'entraînement
                  </Badge>
                  <h1 className="text-4xl font-extrabold leading-tight md:text-6xl">
                    Programme Full-Body 24 Semaines
                  </h1>
                  <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground md:text-xl">
                    Un parcours vidéo progressif pour travailler chaque jour les 7 régions corporelles, avec une montée en niveau claire: Débutant, Intermédiaire puis Avancé.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {metrics.map((metric) => {
                    const Icon = metric.icon;
                    return (
                      <div key={metric.label} className="rounded-md border border-border bg-card p-4 shadow-card">
                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-secondary text-primary">
                          <Icon className="h-5 w-5" />
                        </div>
                        <p className="text-xl font-extrabold text-foreground">{metric.label}</p>
                        <p className="mt-1 text-sm font-semibold text-muted-foreground">{metric.detail}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="overflow-hidden rounded-md border border-border bg-card shadow-card">
                  <div className="relative aspect-video min-h-[240px] bg-[url('/hero-bg-exercise.jpg')] bg-cover bg-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/20 to-primary/30" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 p-6 text-center text-white">
                      <button
                        type="button"
                        onClick={() => toast({ title: "Aperçu vidéo", description: "Lecture vidéo simulée pour la maquette frontend." })}
                        className="grid h-20 w-20 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg ring-8 ring-white/20 transition-transform hover:scale-105"
                        aria-label="Lire l'aperçu vidéo"
                      >
                        <Play className="ml-1 h-9 w-9 fill-current" />
                      </button>
                      <div>
                        <p className="text-sm font-bold uppercase tracking-[0.18em] text-white/80">Aperçu vidéo</p>
                        <p className="mt-2 text-2xl font-extrabold md:text-3xl">Full-Body progressif, guidé jour après jour</p>
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-4 rounded-md bg-white/95 px-3 py-2 text-xs font-bold text-foreground shadow-card">
                      Placeholder vidéo - frontend uniquement
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-md border border-border bg-card p-4 shadow-card md:p-6">
                <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">Planification 24 semaines</p>
                    <h2 className="mt-2 text-2xl font-extrabold md:text-3xl">3 phases strictes, 7 exercices par jour</h2>
                  </div>
                  <Badge variant="outline" className="w-fit bg-background text-foreground">Dimanche: récupération active douce</Badge>
                </div>

                <Tabs defaultValue="phase-1" className="w-full">
                  <TabsList className="mb-6 grid h-auto w-full grid-cols-1 gap-2 bg-background p-2 md:grid-cols-3">
                    {phases.map((phase) => (
                      <TabsTrigger key={phase.id} value={phase.id} className="h-auto flex-col items-start gap-1 rounded-md px-4 py-3 text-left data-[state=active]:bg-secondary data-[state=active]:text-foreground">
                        <span className="text-sm font-extrabold">{phase.label}</span>
                        <span className="text-xs font-semibold text-muted-foreground">{phase.weeks} - {phase.level}</span>
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {phases.map((phase) => (
                    <TabsContent key={phase.id} value={phase.id} className="mt-0 space-y-5">
                      <div className="grid gap-3 rounded-md border border-border bg-background p-4 md:grid-cols-[1fr_1.5fr]">
                        <div>
                          <p className="text-sm font-bold text-primary">{phase.weeks}</p>
                          <p className="mt-1 text-xl font-extrabold">Uniquement {phase.level}</p>
                        </div>
                        <div className="text-sm leading-6 text-muted-foreground">
                          <p className="font-semibold text-foreground">{phase.dosage}</p>
                          <p className="mt-1">{phase.focus}</p>
                        </div>
                      </div>

                      <div className="grid gap-3 md:grid-cols-7">
                        {days.map((day, dayIndex) => (
                          <a key={day} href={`#${phase.id}-${day}`} className="rounded-md border border-border bg-background px-3 py-3 text-center text-sm font-extrabold text-foreground hover:text-white">
                            {day}
                          </a>
                        ))}
                      </div>

                      <div className="space-y-4">
                        {days.map((day, dayIndex) => {
                          const isRecovery = dayIndex === 6;
                          const dailyExercises = getDailyExercises(phase, dayIndex);
                          return (
                            <article key={day} id={`${phase.id}-${day}`} className="rounded-md border border-border bg-background p-4 md:p-5">
                              <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                <div>
                                  <h3 className="text-xl font-extrabold">{day}</h3>
                                  <p className="text-sm font-semibold text-muted-foreground">
                                    {isRecovery ? "Récupération active douce, mobilité et respiration" : `Circuit Full-Body ${phase.level}: 7 régions, 1 exercice par région`}
                                  </p>
                                </div>
                                <Badge className={isRecovery ? "bg-accent text-accent-foreground hover:bg-accent" : "bg-primary text-primary-foreground hover:bg-primary"}>
                                  {isRecovery ? "Récupération" : phase.level}
                                </Badge>
                              </div>

                              <div className="grid gap-2">
                                {dailyExercises.map((exercise, index) => (
                                  <div key={`${day}-${exercise.region}`} className="grid gap-2 rounded-md border border-border bg-card p-3 sm:grid-cols-[36px_190px_1fr] sm:items-center">
                                    <span className="grid h-9 w-9 place-items-center rounded-md bg-secondary text-sm font-extrabold text-primary">{index + 1}</span>
                                    <span className="text-sm font-extrabold text-foreground">{exercise.region}</span>
                                    <span className="text-sm font-semibold text-muted-foreground">{exercise.movement}</span>
                                  </div>
                                ))}
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </section>
            </div>

            <aside className="rounded-md border border-border bg-card p-5 shadow-card lg:sticky lg:top-28">
              <div className="mb-5 flex items-center justify-between gap-3">
                <h2 className="text-xl font-extrabold">À propos de ce programme</h2>
                <Badge className="bg-accent text-accent-foreground hover:bg-accent">-25%</Badge>
              </div>

              <div className="mb-5 rounded-md border border-border bg-background p-4">
                <div className="flex items-end gap-3">
                  <span className="text-4xl font-extrabold text-primary">89 €</span>
                  <span className="pb-1 text-lg font-bold text-muted-foreground line-through">119 €</span>
                </div>
                <p className="mt-2 text-sm font-semibold text-muted-foreground">Économie de 30 € sur la prévisualisation Full-Body.</p>
              </div>

              <div className="space-y-3">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex gap-3 text-sm font-semibold leading-6 text-foreground">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid gap-3">
                <Button type="button" variant="outline" className="w-full justify-center bg-background" onClick={handleDemoCart}>
                  <ShoppingCart className="h-4 w-4" />
                  Ajouter au panier
                </Button>
                <Button className="w-full justify-center" asChild>
                  <Link to="/purchase-simulation?demo=full-body-24">
                    Acheter maintenant
                  </Link>
                </Button>
              </div>

              <div className="mt-4 flex items-center gap-2 rounded-md border border-primary/10 bg-secondary px-3 py-2 text-xs font-bold text-foreground">
                <LockKeyhole className="h-4 w-4 text-primary" />
                Paiement sécurisé - parcours démo sans paiement réel
              </div>

              <div className="mt-6 rounded-md border border-border bg-background p-4">
                <div className="mb-3 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <h3 className="font-extrabold">Ce que vous allez obtenir</h3>
                </div>
                <ul className="space-y-2 text-sm font-semibold text-muted-foreground">
                  {included.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="mt-5 text-xs leading-5 text-muted-foreground">
                Les contenus sont codés en frontend pour prévisualisation. Aucune écriture Supabase, aucun appel Stripe et aucun panier réel ne sont déclenchés depuis cette page.
              </p>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TrainingVideosPage;
