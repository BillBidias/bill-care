import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useI18n, useTr } from "@/lib/i18n";
import { ArrowRight, ListChecks } from "lucide-react";

const HeroSection = () => {
  const { t } = useI18n();
  const tr = useTr();

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden pt-16">
      <img
        src="/hero-bg-exercise.jpg"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        width={1920}
        height={1080}
      />
      <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px]" />
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "3s" }} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-flex items-center gap-2 bg-secondary text-foreground px-4 py-1.5 rounded-full font-body font-bold text-xs my-0 mb-px">
              {tr(t.hero.badge)}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold leading-tight mb-6 mt-[39px]">
              {tr(t.hero.title1)}{" "}
              <span className="text-gradient-primary">{tr(t.hero.title2)}</span>
            </h1>
            <p className="text-lg text-foreground font-body font-bold max-w-lg mb-8 leading-relaxed">
              {tr({
                fr: "Des programmes d’exercices structurés et un parcours guidé pour vous orienter vers les contenus les plus pertinents, avec une vérification de sécurité avant recommandation.",
                en: "Structured exercise programmes and a guided pathway to help orient you toward the most relevant content, with a safety check before recommendation.",
                de: "Strukturierte Übungsprogramme und ein geführter Ablauf zur Orientierung zu passenden Inhalten – mit Sicherheitsprüfung vor einer Empfehlung.",
              })}
            </p>
            <div className="flex flex-wrap gap-4 mb-10">
              <Button size="lg" className="rounded-full px-8 gap-2 font-body font-semibold" asChild>
                <Link to="/finder">
                  {tr({ fr: "Trouver mon programme", en: "Find my programme", de: "Mein Programm finden" })} <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full px-8 gap-2 font-body font-semibold" asChild>
                <Link to="/programs">
                  <ListChecks className="w-4 h-4" /> {tr({ fr: "Voir le catalogue", en: "Browse catalogue", de: "Katalog ansehen" })}
                </Link>
              </Button>
            </div>
            <div className="flex flex-wrap gap-3 text-xs font-body font-bold text-foreground">
              <span className="rounded-full bg-card/80 border border-border px-3 py-1.5">FR · EN · DE</span>
              <span className="rounded-full bg-card/80 border border-border px-3 py-1.5">{tr({ fr: "Safety Engine intégré", en: "Integrated Safety Engine", de: "Integrierte Sicherheitsprüfung" })}</span>
              <span className="rounded-full bg-card/80 border border-border px-3 py-1.5">{tr({ fr: "Suivi de progression", en: "Progress tracking", de: "Fortschrittsverfolgung" })}</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl rotate-3" />
              <img
                src="/hero-physio.jpg"
                alt="Physiotherapy rehabilitation"
                className="relative w-full h-full object-cover rounded-3xl shadow-soft"
              />
              <motion.div
                className="absolute -bottom-4 -left-4 bg-card rounded-2xl shadow-card p-4 flex items-center gap-3 max-w-xs"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-lg">🧭</div>
                <div>
                  <p className="text-xs font-body font-semibold text-foreground">
                    {tr({ fr: "Orientation guidée", en: "Guided orientation", de: "Geführte Orientierung" })}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-body">
                    {tr({ fr: "Besoin → sécurité → recommandation", en: "Need → safety → recommendation", de: "Bedarf → Sicherheit → Empfehlung" })}
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
