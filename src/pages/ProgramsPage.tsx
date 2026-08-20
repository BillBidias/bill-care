import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n, useTr } from "@/lib/i18n";
import { Search, Clock, BarChart3, FileSearch, PlayCircle, Lock } from "lucide-react";
import { type Program } from "@/data/programs";
import type { ProgramCategoryKey } from "@/data/categories";
import { useCatalogue } from "@/hooks/useCatalogue";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";


const ProgramsPage = () => {
  const { t } = useI18n();
  const tr = useTr();
  const { programs: catalogue, categoryKeys, loading } = useCatalogue();
  const [selectedCat, setSelectedCat] = useState<ProgramCategoryKey | null>(null);
  const [search, setSearch] = useState("");
  const [openProgram, setOpenProgram] = useState<Program | null>(null);

  const orderedCategories = categoryKeys
    .map((key) => t.categories.items.find((c) => c.key === key))
    .filter((c): c is (typeof t.categories.items)[number] => Boolean(c));

  const filtered = catalogue.filter((p) => {
    if (selectedCat !== null && p.category !== selectedCat) return false;
    if (search) {
      const q = search.toLowerCase();
      const hay = `${tr(p.title)} ${tr(p.region)} ${p.icd10}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });


  // Génère des rubriques à partir des codes ICD-10 (1 rubrique par code/plage)
  const buildRubrics = (icd10: string) => {
    const codes = icd10.split("·").map((c) => c.trim()).filter(Boolean);
    const labelsByPrefix: Record<string, { fr: string; en: string; de: string }> = {
      M: { fr: "Système musculo-squelettique", en: "Musculoskeletal", de: "Bewegungsapparat" },
      G: { fr: "Système nerveux", en: "Nervous system", de: "Nervensystem" },
      N: { fr: "Système urogénital", en: "Urogenital", de: "Urogenital" },
      F: { fr: "Troubles psychiques", en: "Mental & behavioral", de: "Psychisch" },
      J: { fr: "Système respiratoire", en: "Respiratory", de: "Atmungssystem" },
      E: { fr: "Endocrinien & métabolique", en: "Endocrine & metabolic", de: "Endokrin" },
      O: { fr: "Grossesse & post-partum", en: "Pregnancy & postpartum", de: "Schwangerschaft" },
      Q: { fr: "Malformations congénitales", en: "Congenital", de: "Angeboren" },
      R: { fr: "Symptômes & signes", en: "Symptoms & signs", de: "Symptome" },
      Z: { fr: "Facteurs de santé & prévention", en: "Health factors & prevention", de: "Gesundheitsfaktoren" },
    };
    return codes.map((code, idx) => {
      const prefix = code.charAt(0).toUpperCase();
      const family = labelsByPrefix[prefix] ?? { fr: "Module thérapeutique", en: "Therapy module", de: "Therapiemodul" };
      // 3 à 5 vidéos par rubrique en fonction de la longueur du code
      const videoCount = 3 + (code.replace(/\D/g, "").length % 3);
      const videos = Array.from({ length: videoCount }).map((_, vi) => ({
        id: `${idx}-${vi}`,
        duration: `${5 + vi * 3} min`,
        free: vi === 0,
        title: {
          fr: `Séance ${vi + 1} — ${code}`,
          en: `Session ${vi + 1} — ${code}`,
          de: `Einheit ${vi + 1} — ${code}`,
        },
      }));
      return { code, family, videos };
    });
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-heading font-bold mb-3">{tr(t.categories.title)}</h1>
            <p className="text-muted-foreground font-body max-w-xl mx-auto">{tr(t.categories.subtitle)}</p>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={tr({ fr: "Rechercher un programme...", en: "Search a program...", de: "Programm suchen..." })}
                className="pl-10 rounded-full font-body"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Category pills */}
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

          {/* Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((program, i) => (
              <motion.div
                key={program.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => setOpenProgram(program)}
                className="bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-soft transition-all group cursor-pointer"
              >
                <div className="h-40 bg-gradient-to-br from-primary/10 to-secondary flex items-center justify-center text-5xl group-hover:scale-105 transition-transform">
                  {program.image}
                </div>
                <div className="p-5">
                  <p className="text-[10px] uppercase tracking-wider font-body font-semibold text-primary/80 mb-1">{tr(program.region)}</p>
                  <h3 className="font-body font-semibold text-sm mb-2 line-clamp-2">{tr(program.title)}</h3>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground font-body mb-3">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {program.duration}</span>
                    <span className="flex items-center gap-1"><BarChart3 className="w-3 h-3" /> {program.level}</span>
                    <a
                      href={`https://icd.who.int/browse10/2019/en#/search?q=${encodeURIComponent(program.icd10)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      title={`ICD-10: ${program.icd10}`}
                      className="flex items-center gap-1 hover:text-primary transition-colors line-clamp-1"
                    >
                      <FileSearch className="w-3 h-3" /> {program.icd10}
                    </a>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-heading font-bold text-primary">{program.price}€</span>
                    <Button
                      size="sm"
                      className="rounded-full text-xs font-body"
                      onClick={(e) => { e.stopPropagation(); setOpenProgram(program); }}
                    >
                      {tr({ fr: "Voir", en: "View", de: "Ansehen" })}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={!!openProgram} onOpenChange={(o) => !o && setOpenProgram(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          {openProgram && (
            <>
              <DialogHeader>
                <p className="text-[10px] uppercase tracking-wider font-body font-semibold text-primary/80">
                  {tr(openProgram.region)}
                </p>
                <DialogTitle className="font-heading text-2xl">{tr(openProgram.title)}</DialogTitle>
                <DialogDescription className="font-body flex flex-wrap items-center gap-3">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {openProgram.duration}</span>
                  <span className="flex items-center gap-1"><BarChart3 className="w-3.5 h-3.5" /> {openProgram.level}</span>
                  <span className="flex items-center gap-1"><FileSearch className="w-3.5 h-3.5" /> {openProgram.icd10}</span>
                </DialogDescription>
              </DialogHeader>

              <div className="mt-4 space-y-5">
                {buildRubrics(openProgram.icd10).map((rub, ri) => (
                  <div key={ri} className="border border-border rounded-xl p-4">
                    <div className="flex items-baseline justify-between mb-3">
                      <h4 className="font-heading font-semibold text-base">
                        {tr(rub.family)}
                      </h4>
                      <span className="text-xs font-body text-primary font-semibold">{rub.code}</span>
                    </div>
                    <ul className="space-y-2">
                      {rub.videos.map((v) => (
                        <li key={v.id} className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-secondary/60 transition-colors">
                          <div className="flex items-center gap-3 min-w-0">
                            {v.free ? (
                              <PlayCircle className="w-5 h-5 text-primary shrink-0" />
                            ) : (
                              <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
                            )}
                            <span className="font-body text-sm truncate">{tr(v.title)}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs text-muted-foreground font-body">{v.duration}</span>
                            {v.free && (
                              <span className="text-[10px] font-body font-semibold uppercase bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                {tr({ fr: "Aperçu", en: "Preview", de: "Vorschau" })}
                              </span>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                <span className="text-2xl font-heading font-bold text-primary">{openProgram.price}€</span>
                <Button className="rounded-full font-body">
                  {tr({ fr: "Ajouter au panier", en: "Add to cart", de: "In den Warenkorb" })}
                </Button>
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
