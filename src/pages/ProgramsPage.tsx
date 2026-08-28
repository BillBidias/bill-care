import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n, useTr } from "@/lib/i18n";
import { Search, Clock, BarChart3, FileSearch, ClipboardCheck, ShieldCheck } from "lucide-react";
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

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-heading font-bold mb-3">{tr(t.categories.title)}</h1>
            <p className="text-muted-foreground font-body max-w-xl mx-auto">{tr(t.categories.subtitle)}</p>
          </div>

          <div className="max-w-3xl mx-auto mb-8 rounded-2xl border border-primary/20 bg-primary/5 p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-4 justify-between">
            <div className="flex gap-3">
              <ClipboardCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-body font-semibold text-sm">
                  {tr({ fr: "Vous ne savez pas quel programme choisir ?", en: "Not sure which programme to choose?", de: "Sie wissen nicht, welches Programm passt?" })}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {tr({
                    fr: "Utilisez le Program Finder : zone du corps, symptômes, limitations, objectif et contrôle de sécurité.",
                    en: "Use the Program Finder: body area, symptoms, limitations, goal and safety screening.",
                    de: "Nutzen Sie den Program Finder: Körperbereich, Beschwerden, Einschränkungen, Ziel und Sicherheitsprüfung.",
                  })}
                </p>
              </div>
            </div>
            <Button asChild className="rounded-full shrink-0">
              <Link to="/finder">{tr({ fr: "Trouver mon programme", en: "Find my programme", de: "Mein Programm finden" })}</Link>
            </Button>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-8 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={tr({ fr: "Rechercher un programme...", en: "Search a programme...", de: "Programm suchen..." })}
                className="pl-10 rounded-full font-body"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-10">
            <button
              onClick={() => setSelectedCat(null)}
              className={`px-4 py-1.5 rounded-full text-sm font-body font-medium transition-colors ${selectedCat === null ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-primary/10"}`}
            >
              {tr({ fr: "Tous", en: "All", de: "Alle" })}
            </button>
            {orderedCategories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setSelectedCat(cat.key as ProgramCategoryKey)}
                className={`px-4 py-1.5 rounded-full text-sm font-body font-medium transition-colors ${selectedCat === cat.key ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-primary/10"}`}
              >
                {cat.icon} {tr(cat.name)}
              </button>
            ))}
          </div>

          <div aria-busy={loading} className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((program, i) => (
              <motion.div
                key={program.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => openProgrammeDetails(program)}
                className="bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-soft transition-all group cursor-pointer"
              >
                <div className="h-40 bg-gradient-to-br from-primary/10 to-secondary flex items-center justify-center text-5xl group-hover:scale-105 transition-transform">
                  {program.image}
                </div>
                <div className="p-5">
                  <p className="text-[10px] uppercase tracking-wider font-body font-semibold text-primary/80 mb-1">{tr(program.region)}</p>
                  <h3 className="font-body font-semibold text-sm mb-2 line-clamp-2">{tr(program.title)}</h3>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground font-body mb-3 flex-wrap">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {program.duration}</span>
                    <span className="flex items-center gap-1"><BarChart3 className="w-3 h-3" /> {program.level}</span>
                    {program.icd10 && <span className="flex items-center gap-1"><FileSearch className="w-3 h-3" /> {program.icd10}</span>}
                  </div>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-lg font-heading font-bold text-primary">{program.price}€</span>
                    <Button
                      size="sm"
                      className="rounded-full text-xs font-body"
                      onClick={(e) => { e.stopPropagation(); openProgrammeDetails(program); }}
                    >
                      {tr({ fr: "Voir", en: "View", de: "Ansehen" })}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full text-xs font-body"
                      disabled={has(program.id)}
                      aria-label={has(program.id)
                        ? tr({ fr: `${tr(program.title)} est dans le panier`, en: `${tr(program.title)} is in cart`, de: `${tr(program.title)} ist im Warenkorb` })
                        : tr({ fr: `Ajouter ${tr(program.title)} au panier`, en: `Add ${tr(program.title)} to cart`, de: `${tr(program.title)} in den Warenkorb legen` })}
                      onClick={(e) => { e.stopPropagation(); addProgramme(program.id); }}
                    >
                      {has(program.id)
                        ? tr({ fr: "Dans le panier", en: "In cart", de: "Im Warenkorb" })
                        : tr({ fr: "Ajouter", en: "Add", de: "Hinzufügen" })}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={!!openProgram} onOpenChange={(open) => !open && closeProgram()}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {openProgram && (
            <>
              <DialogHeader>
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-4xl mb-3" aria-hidden="true">
                  {openProgram.image}
                </div>
                <p className="text-[10px] uppercase tracking-wider font-body font-semibold text-primary/80">
                  {tr(openProgram.region)}
                </p>
                <DialogTitle className="font-heading text-2xl">{tr(openProgram.title)}</DialogTitle>
                <DialogDescription className="font-body flex flex-wrap items-center gap-3 pt-1">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {openProgram.duration}</span>
                  <span className="flex items-center gap-1"><BarChart3 className="w-3.5 h-3.5" /> {openProgram.level}</span>
                  {openProgram.icd10 && <span className="flex items-center gap-1"><FileSearch className="w-3.5 h-3.5" /> ICD-10: {openProgram.icd10}</span>}
                </DialogDescription>
              </DialogHeader>

              <div className="mt-4 space-y-4">
                <div className="rounded-2xl border border-border p-4 flex gap-3">
                  <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-body font-semibold text-sm mb-1">
                      {tr({ fr: "Contenu structuré et protégé", en: "Structured and protected content", de: "Strukturierter und geschützter Inhalt" })}
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {tr({
                        fr: "Les phases, séances et exercices réels de ce programme sont gérés par l’espace patient. Nous n’affichons plus de séances ou vidéos fictives générées à partir d’un code ICD-10.",
                        en: "The real phases, sessions and exercises for this programme are managed in the patient area. We no longer display fictional sessions or videos generated from an ICD-10 code.",
                        de: "Die tatsächlichen Phasen, Einheiten und Übungen dieses Programms werden im Patientenbereich verwaltet. Es werden keine fiktiven Einheiten oder Videos mehr aus einem ICD-10-Code erzeugt.",
                      })}
                    </p>
                  </div>
                </div>

                {openProgram.icd10 && (
                  <div className="rounded-2xl bg-secondary/60 p-4 text-sm text-muted-foreground">
                    <strong className="text-foreground">ICD-10:</strong> {openProgram.icd10}. {tr({
                      fr: "Cette information est une métadonnée facultative du catalogue et ne constitue pas un diagnostic du visiteur.",
                      en: "This is optional catalogue metadata and is not a diagnosis of the visitor.",
                      de: "Diese Angabe ist eine optionale Katalog-Metadateninformation und keine Diagnose des Besuchers.",
                    })}
                  </div>
                )}
              </div>

              <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-border pt-5">
                <div>
                  <p className="text-xs text-muted-foreground font-body">{tr({ fr: "Accès au programme", en: "Programme access", de: "Programmzugang" })}</p>
                  <span className="text-2xl font-heading font-bold text-primary">{openProgram.price}€</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" className="rounded-full" asChild>
                    <Link to="/finder">{tr({ fr: "Vérifier l’adéquation", en: "Check suitability", de: "Eignung prüfen" })}</Link>
                  </Button>
                  <Button
                    className="rounded-full font-body"
                    disabled={has(openProgram.id)}
                    onClick={() => addProgramme(openProgram.id)}
                  >
                    {has(openProgram.id)
                      ? tr({ fr: "Dans le panier", en: "In cart", de: "Im Warenkorb" })
                      : tr({ fr: "Ajouter au panier", en: "Add to cart", de: "In den Warenkorb" })}
                  </Button>
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
