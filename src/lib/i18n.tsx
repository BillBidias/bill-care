import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type Lang = "fr" | "en" | "de";

const translations = {
  nav: {
    home: { fr: "Accueil", en: "Home", de: "Startseite" },
    about: { fr: "À propos", en: "About", de: "Über uns" },
    programs: { fr: "Programmes", en: "Programs", de: "Programme" },
    howItWorks: { fr: "Vidéos d’entraînement", en: "Training videos", de: "Trainingsvideos" },
    blog: { fr: "Blog & Conseils", en: "Blog & Tips", de: "Blog & Tipps" },
    faq: { fr: "FAQ", en: "FAQ", de: "FAQ" },
    contact: { fr: "Contact", en: "Contact", de: "Kontakt" },
    login: { fr: "Se connecter", en: "Log in", de: "Anmelden" },
    startNow: { fr: "Commencer", en: "Start now", de: "Jetzt starten" },
  },
  hero: {
    badge: { fr: "🎯 Kinésithérapie digitale", en: "🎯 Digital Physiotherapy", de: "🎯 Digitale Physiotherapie" },
    title1: { fr: "Votre rééducation,", en: "Your rehabilitation,", de: "Ihre Rehabilitation," },
    title2: { fr: "guidée par un expert", en: "guided by an expert", de: "von einem Experten geleitet" },
    subtitle: {
      fr: "Plus de 100 programmes vidéo thérapeutiques conçus par un kinésithérapeute diplômé. Retrouvez mobilité, force et bien-être depuis chez vous.",
      en: "Over 100 therapeutic video programs designed by a certified physiotherapist. Regain mobility, strength and well-being from home.",
      de: "Über 100 therapeutische Videoprogramme von einem zertifizierten Physiotherapeuten. Gewinnen Sie Mobilität, Kraft und Wohlbefinden von zu Hause aus.",
    },
    cta1: { fr: "Découvrir les programmes", en: "Discover programs", de: "Programme entdecken" },
    cta2: { fr: "Faire le quiz", en: "Take the quiz", de: "Quiz starten" },
    stats: {
      programs: { fr: "100+ programmes", en: "100+ programs", de: "100+ Programme" },
      patients: { fr: "5000+ patients", en: "5000+ patients", de: "5000+ Patienten" },
      satisfaction: { fr: "98% satisfaction", en: "98% satisfaction", de: "98% Zufriedenheit" },
    },
  },
  benefits: {
    title: { fr: "Pourquoi choisir KinéMove ?", en: "Why choose KinéMove?", de: "Warum KinéMove wählen?" },
    subtitle: {
      fr: "Une approche scientifique et humaine de la rééducation à distance",
      en: "A scientific and human approach to remote rehabilitation",
      de: "Ein wissenschaftlicher und menschlicher Ansatz zur Fernrehabilitation",
    },
    items: [
      {
        title: { fr: "Expertise médicale", en: "Medical expertise", de: "Medizinische Expertise" },
        desc: { fr: "Programmes conçus par un kinésithérapeute DE avec 15 ans d'expérience clinique", en: "Programs designed by a certified physiotherapist with 15 years of clinical experience", de: "Programme von einem zertifizierten Physiotherapeuten mit 15 Jahren klinischer Erfahrung" },
        icon: "🩺",
      },
      {
        title: { fr: "Suivi personnalisé", en: "Personalized tracking", de: "Persönliches Tracking" },
        desc: { fr: "Journal de douleur, progression, calendrier et rappels pour rester motivé", en: "Pain journal, progress tracking, calendar and reminders to stay motivated", de: "Schmerztagebuch, Fortschrittsverfolgung, Kalender und Erinnerungen" },
        icon: "📊",
      },
      {
        title: { fr: "Accessibilité totale", en: "Total accessibility", de: "Totale Zugänglichkeit" },
        desc: { fr: "Pratiquez où vous voulez, quand vous voulez, à votre rythme", en: "Practice wherever, whenever, at your own pace", de: "Üben Sie wo und wann Sie wollen, in Ihrem eigenen Tempo" },
        icon: "🏠",
      },
      {
        title: { fr: "Résultats prouvés", en: "Proven results", de: "Bewiesene Ergebnisse" },
        desc: { fr: "98% de satisfaction, progression mesurable et accompagnement continu", en: "98% satisfaction, measurable progress and continuous support", de: "98% Zufriedenheit, messbare Fortschritte und kontinuierliche Unterstützung" },
        icon: "✅",
      },
    ],
  },
  categories: {
    title: { fr: "Nos programmes par zone", en: "Programs by body area", de: "Programme nach Körperbereich" },
    subtitle: {
      fr: "Trouvez le programme adapté à votre besoin spécifique",
      en: "Find the program tailored to your specific need",
      de: "Finden Sie das Programm für Ihren spezifischen Bedarf",
    },
    viewAll: { fr: "Voir tout", en: "View all", de: "Alle anzeigen" },
    items: [
      { name: { fr: "Rachis & Dos", en: "Spine & Back", de: "Wirbelsäule & Rücken" }, count: 12, icon: "🦴", color: "from-primary/20 to-secondary" },
      { name: { fr: "Épaule & Bras", en: "Shoulder & Arm", de: "Schulter & Arm" }, count: 10, icon: "💪", color: "from-accent/20 to-cream" },
      { name: { fr: "Genou & Cuisse", en: "Knee & Thigh", de: "Knie & Oberschenkel" }, count: 11, icon: "🦵", color: "from-primary/20 to-mint" },
      { name: { fr: "Hanche & Bassin", en: "Hip & Pelvis", de: "Hüfte & Becken" }, count: 10, icon: "🫀", color: "from-sage/30 to-secondary" },
      { name: { fr: "Cheville & Pied", en: "Ankle & Foot", de: "Knöchel & Fuß" }, count: 9, icon: "🦶", color: "from-accent/20 to-secondary" },
      { name: { fr: "Posture & Ergonomie", en: "Posture & Ergonomics", de: "Haltung & Ergonomie" }, count: 10, icon: "🧘", color: "from-mint to-secondary" },
      { name: { fr: "Renforcement global", en: "Full body strength", de: "Ganzkörperkräftigung" }, count: 10, icon: "🏋️", color: "from-primary/15 to-cream" },
      { name: { fr: "Mobilité & Souplesse", en: "Mobility & Flexibility", de: "Mobilität & Flexibilität" }, count: 10, icon: "🤸", color: "from-sage/20 to-mint" },
      { name: { fr: "Populations spéciales", en: "Special populations", de: "Spezielle Gruppen" }, count: 10, icon: "👶", color: "from-accent/15 to-secondary" },
      { name: { fr: "Bundles & Parcours", en: "Bundles & Paths", de: "Bundles & Pfade" }, count: 8, icon: "🎯", color: "from-primary/20 to-sage/20" },
    ],
  },
  howItWorks: {
    title: { fr: "Vidéos d’entraînement", en: "Training videos", de: "Trainingsvideos" },
    subtitle: { fr: "En 4 étapes simples vers votre rééducation", en: "4 simple steps to your rehabilitation", de: "In 4 einfachen Schritten zu Ihrer Rehabilitation" },
    steps: [
      { title: { fr: "Évaluez", en: "Assess", de: "Bewerten" }, desc: { fr: "Répondez au questionnaire pour identifier votre besoin", en: "Answer the questionnaire to identify your needs", de: "Beantworten Sie den Fragebogen" }, icon: "📋" },
      { title: { fr: "Choisissez", en: "Choose", de: "Wählen" }, desc: { fr: "Sélectionnez le programme adapté à votre pathologie", en: "Select the program suited to your condition", de: "Wählen Sie das passende Programm" }, icon: "🎯" },
      { title: { fr: "Pratiquez", en: "Practice", de: "Üben" }, desc: { fr: "Suivez les vidéos à votre rythme depuis chez vous", en: "Follow the videos at your own pace from home", de: "Folgen Sie den Videos in Ihrem Tempo" }, icon: "▶️" },
      { title: { fr: "Progressez", en: "Progress", de: "Fortschritt" }, desc: { fr: "Suivez votre évolution et célébrez vos progrès", en: "Track your progress and celebrate your achievements", de: "Verfolgen Sie Ihren Fortschritt" }, icon: "📈" },
    ],
  },
  testimonials: {
    title: { fr: "Ils ont retrouvé leur mobilité", en: "They regained their mobility", de: "Sie haben ihre Mobilität zurückgewonnen" },
    items: [
      { name: "Marie L.", text: { fr: "Après 3 semaines, ma douleur au dos a diminué de 70%. Un programme incroyablement bien structuré !", en: "After 3 weeks, my back pain decreased by 70%. An incredibly well-structured program!", de: "Nach 3 Wochen nahm mein Rückenschmerz um 70% ab!" }, role: { fr: "Lombalgie chronique", en: "Chronic low back pain", de: "Chronische Rückenschmerzen" } },
      { name: "Thomas K.", text: { fr: "La rééducation post-opératoire du genou m'a permis de reprendre le sport en 8 semaines.", en: "The post-surgery knee rehab allowed me to return to sports in 8 weeks.", de: "Die Knie-Reha ermöglichte mir die Rückkehr zum Sport in 8 Wochen." }, role: { fr: "Reconstruction LCA", en: "ACL reconstruction", de: "Kreuzband-OP" } },
      { name: "Sophie M.", text: { fr: "Enfin un kinésithérapeute qui explique clairement. Les vidéos sont d'une qualité exceptionnelle.", en: "Finally a physio who explains clearly. The videos are exceptional quality.", de: "Endlich ein Physio, der klar erklärt. Die Videos sind hervorragend." }, role: { fr: "Capsulite épaule", en: "Frozen shoulder", de: "Schultersteife" } },
    ],
  },
  cta: {
    title: { fr: "Prêt à reprendre le contrôle ?", en: "Ready to take back control?", de: "Bereit, die Kontrolle zurückzugewinnen?" },
    subtitle: { fr: "Commencez votre rééducation dès aujourd'hui avec un programme adapté à votre condition.", en: "Start your rehabilitation today with a program tailored to your condition.", de: "Beginnen Sie Ihre Rehabilitation heute mit einem auf Sie zugeschnittenen Programm." },
    button: { fr: "Trouver mon programme", en: "Find my program", de: "Mein Programm finden" },
  },
  footer: {
    tagline: { fr: "La kinésithérapie digitale, accessible à tous.", en: "Digital physiotherapy, accessible to all.", de: "Digitale Physiotherapie, für alle zugänglich." },
    legal: { fr: "Mentions légales", en: "Legal notices", de: "Impressum" },
    privacy: { fr: "Confidentialité", en: "Privacy policy", de: "Datenschutz" },
    terms: { fr: "CGV", en: "Terms", de: "AGB" },
    rights: { fr: "Tous droits réservés", en: "All rights reserved", de: "Alle Rechte vorbehalten" },
  },
};

type Translations = typeof translations;

interface I18nContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Translations;
}

const I18nContext = createContext<I18nContextType>({
  lang: "fr",
  setLang: () => {},
  t: translations,
});

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Lang>("fr");
  return (
    <I18nContext.Provider value={{ lang, setLang, t: translations }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => useContext(I18nContext);

export const T = ({ k }: { k: Record<Lang, string> }) => {
  const { lang } = useI18n();
  return <>{k[lang]}</>;
};

export const useTr = () => {
  const { lang } = useI18n();
  return useCallback(<V,>(obj: Record<Lang, V>): V => obj[lang], [lang]);
};
