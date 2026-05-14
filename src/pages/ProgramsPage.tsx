import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n, useTr } from "@/lib/i18n";
import { Search, Filter, Clock, Dumbbell, BarChart3, FileSearch } from "lucide-react";

const mockPrograms = [
  { id: 1, cat: 0, title: { fr: "Soulagement lombalgie chronique", en: "Chronic low back pain relief", de: "Chronische Rückenschmerzen Linderung" }, price: 49, duration: "6 sem.", level: "Débutant", image: "🦴", icd10: "M54.5" },
  { id: 2, cat: 0, title: { fr: "Hernie discale - Phase 1", en: "Disc herniation - Phase 1", de: "Bandscheibenvorfall - Phase 1" }, price: 59, duration: "8 sem.", level: "Intermédiaire", image: "🦴", icd10: "M51.1" },
  { id: 3, cat: 1, title: { fr: "Rééducation coiffe des rotateurs", en: "Rotator cuff rehabilitation", de: "Rotatorenmanschette Rehabilitation" }, price: 54, duration: "6 sem.", level: "Débutant", image: "💪", icd10: "M75.1" },
  { id: 4, cat: 2, title: { fr: "Post-opératoire LCA", en: "Post-ACL surgery", de: "Nach Kreuzband-OP" }, price: 69, duration: "12 sem.", level: "Avancé", image: "🦵", icd10: "S83.5" },
  { id: 5, cat: 3, title: { fr: "Arthrose de hanche", en: "Hip osteoarthritis", de: "Hüftarthrose" }, price: 49, duration: "8 sem.", level: "Débutant", image: "🫀", icd10: "M16.9" },
  { id: 6, cat: 5, title: { fr: "Correction posturale bureau", en: "Office posture correction", de: "Büro-Haltungskorrektur" }, price: 39, duration: "4 sem.", level: "Débutant", image: "🧘", icd10: "M54.2" },
  { id: 7, cat: 6, title: { fr: "Renforcement core complet", en: "Complete core strengthening", de: "Komplette Rumpfkräftigung" }, price: 44, duration: "6 sem.", level: "Intermédiaire", image: "🏋️", icd10: "M62.81" },
  { id: 8, cat: 7, title: { fr: "Mobilité articulaire globale", en: "Full body joint mobility", de: "Globale Gelenkmobilität" }, price: 39, duration: "4 sem.", level: "Débutant", image: "🤸", icd10: "M25.6" },
  { id: 9, cat: 4, title: { fr: "Entorse cheville - Retour au sport", en: "Ankle sprain - Return to sport", de: "Knöchelverstauchung - Sportrückkehr" }, price: 49, duration: "6 sem.", level: "Intermédiaire", image: "🦶", icd10: "S93.4" },
  { id: 10, cat: 8, title: { fr: "Rééducation post-partum", en: "Postpartum rehabilitation", de: "Postpartale Rehabilitation" }, price: 54, duration: "8 sem.", level: "Débutant", image: "👶", icd10: "O90.8" },
  { id: 11, cat: 9, title: { fr: "Bundle dos complet", en: "Complete back bundle", de: "Komplettes Rücken-Bundle" }, price: 99, duration: "16 sem.", level: "Tous", image: "🎯", icd10: "M54" },
  { id: 12, cat: 0, title: { fr: "Sciatique - Programme progressif", en: "Sciatica - Progressive program", de: "Ischias - Progressives Programm" }, price: 54, duration: "8 sem.", level: "Débutant", image: "🦴", icd10: "M54.3" },
];

const ProgramsPage = () => {
  const { t } = useI18n();
  const tr = useTr();
  const [selectedCat, setSelectedCat] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const filtered = mockPrograms.filter((p) => {
    if (selectedCat !== null && p.cat !== selectedCat) return false;
    if (search && !tr(p.title).toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

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
            {t.categories.items.map((cat, i) => (
              <button
                key={i}
                onClick={() => setSelectedCat(i)}
                className={`px-4 py-1.5 rounded-full text-sm font-body font-medium transition-colors ${selectedCat === i ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-primary/10"}`}
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
                className="bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-soft transition-all group cursor-pointer"
              >
                <div className="h-40 bg-gradient-to-br from-primary/10 to-secondary flex items-center justify-center text-5xl group-hover:scale-105 transition-transform">
                  {program.image}
                </div>
                <div className="p-5">
                  <h3 className="font-body font-semibold text-sm mb-2 line-clamp-2">{tr(program.title)}</h3>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground font-body mb-3">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {program.duration}</span>
                    <span className="flex items-center gap-1"><BarChart3 className="w-3 h-3" /> {program.level}</span>
                    <a
                      href={`https://icd.who.int/browse10/2019/en#/${program.icd10}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      title={`ICD-10: ${program.icd10}`}
                      className="flex items-center gap-1 hover:text-primary transition-colors"
                    >
                      <FileSearch className="w-3 h-3" /> {program.icd10}
                    </a>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-heading font-bold text-primary">{program.price}€</span>
                    <Button size="sm" className="rounded-full text-xs font-body">
                      {tr({ fr: "Voir", en: "View", de: "Ansehen" })}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProgramsPage;
