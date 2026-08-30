import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n, useTr } from "@/lib/i18n";
import {
  Search,
  Clock,
  BarChart3,
  FileSearch,
  ClipboardCheck,
  ShieldCheck,
  Play,
  CheckCircle2,
  ShoppingCart,
  Sparkles,
  Video,
} from "lucide-react";
import { type Program } from "@/data/programs";
import type { ProgramCategoryKey } from "@/data/categories";
import { useCatalogue } from "@/hooks/useCatalogue";
import { useCart } from "@/lib/cart";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const ProgramsPage = () => {
  const { t } = useI18n();
  const tr = useTr();
  const { programs: catalogue, categoryKeys, loading } = useCatalogue();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCat, setSelectedCat] = useState<ProgramCategoryKey | null>(null);
  const [search, setSearch] = useState("");
  const [openProgram, setOpenProgram] = useState<Program | null>(null);
  const { addProgramme, has } = useCart();

  const requestedProgrammeId = useMemo(() => {
    const raw = searchParams.get("program");
    if (!raw) return null;
    const id = Number(raw);
    return Number.isInteger(id) && id > 0 ? id : null;
  }, [searchParams]);

  useEffect(() => {
    if (loading || requestedProgrammeId === null) return;
    const programme = catalogue.find((item) => item.id === requestedProgrammeId);
    if (programme) setOpenProgram(programme);
  }, [catalogue, loading, requestedProgrammeId]);

  const closeProgram = () => {
    setOpenProgram(null);
    if (searchParams.has("program")) {
      const next = new URLSearchParams(searchParams);
      next.delete("program");
      setSearchParams(next, { replace: true });
    }
  };

  const openProgrammeDetails = (program: Program) => {
    setOpenProgram(program);
    const next = new URLSearchParams(searchParams);
    next.set("program", String(program.id));
    setSearchParams(next, { replace: true });
  };

  const orderedCategories = categoryKeys
    .map((key) => t.categories.items.find((c) => c.key === key))
    .filter((c): c is (typeof t.categories.items)[number] => Boolean(c));

  const filtered = catalogue.filter((p) => {
    if (selectedCat !== null && p.category !== selectedCat) return false;
    if (search) {
      const q = search.toLowerCase();
      const hay = `${tr(p.title)} ${tr(p.region)} ${p.icd10 ?? ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const benefits = [
    tr({ fr: "Séances guidées et progressives", en: "Guided progressive sessions", de: "Geführte progressive Einheiten" }),
    tr({ fr: "Vidéos d’exercices avec consignes", en: "Exercise videos with instructions", de: "Übungsvideos mit Anleitungen" }),
    tr({ fr: "Dosage : séries, répétitions, tempo", en: "Dosage: sets, reps and tempo", de: "Dosierung: Sätze, Wiederholungen, Tempo" }),
    tr({ fr: "Sécurité, erreurs à éviter et critères d’arrêt", en: "Safety, common mistakes and stop criteria", de: "Sicherheit, häufige Fehler und Abbruchkriterien" }),
    tr({ fr: "Progression suivie dans votre espace patient", en: "Progress tracked in your patient area", de: "Fortschritt im Patientenbereich" }),
    tr({ fr: "Accès au programme après achat confirmé", en: "Programme access after confirmed purchase", de: "Programmzugang nach bestätigtem Kauf" }),
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-28 pb-20">
        <div className="container mx-auto px-4">
          <section className="max-w-5xl mx-auto text-center mb-10">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-secondary px-3 py-1.5 text-xs font-bold text-primary mb-4">
              <Sparkles className="w-4 h-4" />
              {tr({ fr: "Catalogue officiel Dein Digital-PHYSIO", en: "Official Dein Digital-PHYSIO catalogue", de: "Offizieller Dein Digital-PHYSIO Katalog" })}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              {tr({ fr: "Choisissez votre programme thérapeutique digital", en: "Choose your digital therapeutic programme", de: "Wählen Sie Ihr digitales Therapieprogramm" })}
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {tr({
                fr: "12 programmes structurés par région, objectif et niveau. Chaque achat donne accès à un parcours guidé dans votre espace patient.",
                en: "12 programmes structured by body area, goal and level. Each purchase unlocks a guided pathway in your patient area.",
                de: "12 Programme nach Körperregion, Ziel und Niveau. Jeder Kauf schaltet einen geführten Ablauf im Patientenbereich frei.",
              })}
            </p>
          </section>

          <section className="max-w-4xl mx-auto mb-9 rounded-xl border border-border bg-card p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-4 justify-between shadow-card">
            <div className="flex gap-3">
              <ClipboardCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm mb-1">{tr({ fr: "Vous hésitez entre plusieurs programmes ?", en: "Not sure which programme fits?", de: "Unsicher, welches Programm passt?" })}</p>
                <p className="text-sm text-muted-foreground">{tr({ fr: "Le Program Finder vous oriente à partir de votre zone du corps, vos limitations et votre objectif.", en: "The Program Finder guides you using your body area, limitations and goal.", de: "Der Program Finder orientiert sich an Körperregion, Einschränkungen und Ziel." })}</p>
              </div>
            </div>
            <Button asChild className="shrink-0"><Link to="/finder">{tr({ fr: "Trouver mon programme", en: "Find my programme", de: "Mein Programm finden" })}</Link></Button>
          </section>

          <div className="flex flex-col md:flex-row gap-4 mb-7 max-w-3xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder={tr({ fr: "Rechercher une zone, un programme ou un code ICD-10…", en: "Search an area, programme or ICD-10 code…", de: "Körperregion, Programm oder ICD-10-Code suchen…" })} className="pl-10 bg-card" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-10">
            <button onClick={() => setSelectedCat(null)} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${selectedCat === null ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground hover:bg-secondary"}`}>
              {tr({ fr: "Tous", en: "All", de: "Alle" })}
            </button>
            {orderedCategories.map((cat) => (
              <button key={cat.key} onClick={() => setSelectedCat(cat.key as ProgramCategoryKey)} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${selectedCat === cat.key ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground hover:bg-secondary"}`}>
                {cat.icon} {tr(cat.name)}
              </button>
            ))}
          </div>

          <div aria-busy={loading} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {filtered.map((program, i) => (
              <motion.article key={program.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.035 }} className="group overflow-hidden rounded-xl border border-border bg-card shadow-card hover:shadow-soft transition-all">
                <button type="button" onClick={() => openProgrammeDetails(program)} className="relative w-full h-48 bg-muted flex items-center justify-center overflow-hidden text-left">
                  <div className="text-7xl transition-transform duration-300 group-hover:scale-105" aria-hidden="true">{program.image}</div>
                  <span className="absolute top-3 left-3 rounded-md bg-white/95 border border-border px-2.5 py-1 text-[11px] font-bold text-foreground">{tr(program.region)}</span>
                  <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/5">
                    <span className="grid h-14 w-14 place-items-center rounded-full bg-primary text-white shadow-lg"><Play className="w-6 h-6 fill-current ml-0.5" /></span>
                  </span>
                </button>

                <div className="p-5">
                  <h2 className="font-bold text-lg leading-snug mb-3 min-h-[3.2rem]">{tr(program.title)}</h2>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4 flex-wrap">
                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{program.duration}</span>
                    <span className="flex items-center gap-1.5"><BarChart3 className="w-3.5 h-3.5" />{program.level}</span>
                  </div>

                  <div className="flex items-end justify-between gap-3 border-t border-border pt-4">
                    <div>
                      <p className="text-[11px] text-muted-foreground mb-0.5">{tr({ fr: "Accès au programme", en: "Programme access", de: "Programmzugang" })}</p>
                      <span className="text-2xl font-bold text-primary">{program.price} €</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => openProgrammeDetails(program)}>{tr({ fr: "Détails", en: "Details", de: "Details" })}</Button>
                      <Button size="sm" disabled={has(program.id)} onClick={() => addProgramme(program.id)}>{has(program.id) ? tr({ fr: "Ajouté", en: "Added", de: "Hinzugefügt" }) : tr({ fr: "Acheter", en: "Buy", de: "Kaufen" })}</Button>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </main>

      <Dialog open={!!openProgram} onOpenChange={(open) => !open && closeProgram()}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {openProgram && (
            <>
              <DialogHeader>
                <p className="text-xs uppercase tracking-[0.18em] font-bold text-primary">{tr(openProgram.region)}</p>
                <DialogTitle className="text-2xl md:text-3xl font-bold leading-tight">{tr(openProgram.title)}</DialogTitle>
                <DialogDescription className="flex flex-wrap items-center gap-4 pt-2 text-sm">
                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{openProgram.duration}</span>
                  <span className="flex items-center gap-1.5"><BarChart3 className="w-4 h-4" />{openProgram.level}</span>
                </DialogDescription>
              </DialogHeader>

              <div className="relative overflow-hidden rounded-xl border border-border bg-muted aspect-video flex items-center justify-center mt-2">
                <div className="text-8xl" aria-hidden="true">{openProgram.image}</div>
                <div className="absolute inset-0 grid place-items-center">
                  <button type="button" className="grid h-16 w-16 place-items-center rounded-full bg-primary text-white shadow-lg" aria-label={tr({ fr: "Aperçu vidéo", en: "Video preview", de: "Videovorschau" })}><Play className="w-7 h-7 fill-current ml-1" /></button>
                </div>
                <span className="absolute bottom-3 left-3 rounded-md bg-black/75 text-white px-3 py-1.5 text-xs font-semibold">{tr({ fr: "Visuel vidéo temporaire", en: "Temporary video visual", de: "Temporäre Videodarstellung" })}</span>
              </div>

              <div className="grid md:grid-cols-[1fr_220px] gap-5 mt-5">
                <div>
                  <h3 className="font-bold text-lg mb-3">{tr({ fr: "Ce programme comprend", en: "This programme includes", de: "Dieses Programm umfasst" })}</h3>
                  <div className="grid sm:grid-cols-2 gap-2.5">
                    {benefits.map((benefit) => <div key={benefit} className="flex gap-2.5 rounded-lg border border-border bg-background p-3 text-sm"><CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" /><span>{benefit}</span></div>)}
                  </div>
                </div>
                <aside className="rounded-xl border border-border bg-background p-4 h-fit">
                  <p className="text-xs text-muted-foreground mb-1">{tr({ fr: "Prix", en: "Price", de: "Preis" })}</p>
                  <p className="text-3xl font-bold text-primary mb-4">{openProgram.price} €</p>
                  <dl className="space-y-2.5 text-sm">
                    <div className="flex justify-between gap-3"><dt className="text-muted-foreground">{tr({ fr: "Durée", en: "Duration", de: "Dauer" })}</dt><dd className="font-semibold">{openProgram.duration}</dd></div>
                    <div className="flex justify-between gap-3"><dt className="text-muted-foreground">{tr({ fr: "Niveau", en: "Level", de: "Niveau" })}</dt><dd className="font-semibold">{openProgram.level}</dd></div>
                    <div className="flex justify-between gap-3"><dt className="text-muted-foreground">{tr({ fr: "Format", en: "Format", de: "Format" })}</dt><dd className="font-semibold">{tr({ fr: "Digital", en: "Digital", de: "Digital" })}</dd></div>
                  </dl>
                </aside>
              </div>

              {openProgram.icd10 && (
                <div className="mt-5 rounded-lg border border-border bg-background p-4 text-sm text-muted-foreground flex gap-3">
                  <FileSearch className="w-5 h-5 shrink-0" />
                  <p><strong className="text-foreground">ICD-10 :</strong> {openProgram.icd10}. {tr({ fr: "Métadonnée du catalogue uniquement ; elle ne constitue pas un diagnostic du visiteur.", en: "Catalogue metadata only; it is not a diagnosis of the visitor.", de: "Nur Katalog-Metadaten; keine Diagnose des Besuchers." })}</p>
                </div>
              )}

              <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-border pt-5">
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><ShieldCheck className="w-4 h-4 text-primary" />{tr({ fr: "Checkout sécurisé avant activation de l’accès", en: "Secure checkout before access activation", de: "Sicherer Checkout vor Zugangsaktivierung" })}</div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button variant="outline" asChild><Link to={`/purchase-simulation?program=${openProgram.id}`}><Video className="w-4 h-4" />{tr({ fr: "Simuler l’achat", en: "Simulate purchase", de: "Kauf simulieren" })}</Link></Button>
                  <Button disabled={has(openProgram.id)} onClick={() => addProgramme(openProgram.id)}><ShoppingCart className="w-4 h-4" />{has(openProgram.id) ? tr({ fr: "Dans le panier", en: "In cart", de: "Im Warenkorb" }) : tr({ fr: "Ajouter au panier", en: "Add to cart", de: "In den Warenkorb" })}</Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default ProgramsPage;
