import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useTr } from "@/lib/i18n";
import { Heart, Award, Users, BookOpen } from "lucide-react";

const AboutPage = () => {
  const tr = useTr();

  const values = [
    { icon: <Heart className="w-6 h-6 text-primary" />, title: tr({ fr: "Humanité", en: "Humanity", de: "Menschlichkeit" }), desc: tr({ fr: "Chaque programme est conçu avec empathie et compréhension du parcours patient.", en: "Every program is designed with empathy and understanding of the patient journey.", de: "Jedes Programm wird mit Empathie und Verständnis entwickelt." }) },
    { icon: <Award className="w-6 h-6 text-primary" />, title: tr({ fr: "Excellence", en: "Excellence", de: "Exzellenz" }), desc: tr({ fr: "Basé sur les dernières données scientifiques et la pratique clinique.", en: "Based on the latest scientific evidence and clinical practice.", de: "Basierend auf neuesten wissenschaftlichen Erkenntnissen." }) },
    { icon: <Users className="w-6 h-6 text-primary" />, title: tr({ fr: "Accessibilité", en: "Accessibility", de: "Zugänglichkeit" }), desc: tr({ fr: "Rendre la kinésithérapie de qualité accessible à tous, partout.", en: "Making quality physiotherapy accessible to everyone, everywhere.", de: "Qualitative Physiotherapie für alle zugänglich machen." }) },
    { icon: <BookOpen className="w-6 h-6 text-primary" />, title: tr({ fr: "Pédagogie", en: "Education", de: "Pädagogik" }), desc: tr({ fr: "Comprendre sa pathologie est la première étape vers la guérison.", en: "Understanding your condition is the first step towards healing.", de: "Das Verständnis Ihrer Erkrankung ist der erste Schritt zur Heilung." }) },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          {/* Hero */}
          <div className="max-w-3xl mx-auto text-center mb-16">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-5xl font-heading font-bold mb-6"
            >
              {tr({ fr: "L'expertise au service de votre santé", en: "Expertise serving your health", de: "Expertise im Dienst Ihrer Gesundheit" })}
            </motion.h1>
            <p className="text-lg text-muted-foreground font-body leading-relaxed">
              {tr({
                fr: "KinéMove est né de la conviction qu'une rééducation de qualité ne devrait pas dépendre de votre lieu de résidence. Fondé par un kinésithérapeute diplômé d'État avec 15 ans d'expérience en cabinet et en milieu hospitalier.",
                en: "KinéMove was born from the belief that quality rehabilitation shouldn't depend on where you live. Founded by a state-certified physiotherapist with 15 years of experience in private practice and hospital settings.",
                de: "KinéMove wurde aus der Überzeugung geboren, dass qualitative Rehabilitation nicht vom Wohnort abhängen sollte. Gegründet von einem staatlich geprüften Physiotherapeuten mit 15 Jahren Erfahrung."
              })}
            </p>
          </div>

          {/* Values */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {values.map((v, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-2xl p-6 shadow-card text-center"
              >
                <div className="inline-flex w-12 h-12 items-center justify-center bg-primary/10 rounded-xl mb-4">
                  {v.icon}
                </div>
                <h3 className="font-heading font-semibold text-lg mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground font-body">{v.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Mission */}
          <div className="bg-gradient-to-br from-primary/5 to-secondary rounded-3xl p-8 md:p-12 max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-heading font-bold mb-4 text-center">
              {tr({ fr: "Notre mission", en: "Our mission", de: "Unsere Mission" })}
            </h2>
            <p className="text-muted-foreground font-body text-center leading-relaxed max-w-2xl mx-auto">
              {tr({
                fr: "Démocratiser l'accès à une rééducation guidée, scientifiquement fondée et humainement accompagnée. Nous croyons que chaque personne mérite de retrouver sa mobilité, sa confiance et sa qualité de vie, peu importe la distance qui la sépare d'un praticien.",
                en: "Democratize access to guided, scientifically-based and humanly supported rehabilitation. We believe that every person deserves to regain their mobility, confidence and quality of life, regardless of the distance from a practitioner.",
                de: "Zugang zu geführter, wissenschaftlich fundierter und menschlich begleiteter Rehabilitation demokratisieren. Wir glauben, dass jeder Mensch es verdient, seine Mobilität und Lebensqualität zurückzugewinnen."
              })}
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AboutPage;
