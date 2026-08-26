import type { ProgramCategoryKey } from "./categories";

export interface LocalizedText {
  fr: string;
  en: string;
  de: string;
}

export interface Program {
  id: number;
  category: ProgramCategoryKey;
  region: LocalizedText;
  title: LocalizedText;
  price: number;
  duration: string;
  level: string;
  image: string;
  /** Optional catalogue lookup metadata. Never treated as a patient diagnosis. */
  icd10: string | null;
}

export const programs: Program[] = [
  // 12 programmes existants. ICD-10 reste facultatif pour permettre les parcours prévention/maintien.
  { id: 1, category: "spine-back", region: { fr: "Tête & cou", en: "Head & neck", de: "Kopf & Hals" }, title: { fr: "Cervicalgies, nuque, ATM, vertiges positionnels", en: "Neck pain, TMJ, positional vertigo", de: "Nackenschmerzen, KG, Lagerungsschwindel" }, price: 44, duration: "6 sem.", level: "Débutant", image: "🧠", icd10: "M50–M54 · G54 · M53" },
  { id: 2, category: "spine-back", region: { fr: "Colonne vertébrale", en: "Spine", de: "Wirbelsäule" }, title: { fr: "Lombalgies, hernies, scoliose, coccyx, dorsalgies", en: "Low back pain, hernias, scoliosis, coccyx", de: "Rückenschmerz, Bandscheiben, Skoliose" }, price: 59, duration: "8 sem.", level: "Intermédiaire", image: "🦴", icd10: "M40–M54 · M51" },
  { id: 3, category: "shoulder-arm", region: { fr: "Épaule & bras", en: "Shoulder & arm", de: "Schulter & Arm" }, title: { fr: "Coiffe, capsulite, instabilité, biceps, post-op", en: "Rotator cuff, frozen shoulder, instability, post-op", de: "Rotatorenmanschette, Schultersteife, post-OP" }, price: 54, duration: "6 sem.", level: "Débutant", image: "💪", icd10: "M75 · M77 · G56" },
  { id: 4, category: "shoulder-arm", region: { fr: "Coude & avant-bras", en: "Elbow & forearm", de: "Ellbogen & Unterarm" }, title: { fr: "Épicondylites, tendinopathies de l'avant-bras", en: "Epicondylitis, forearm tendinopathies", de: "Epicondylitis, Unterarm-Tendinopathien" }, price: 44, duration: "5 sem.", level: "Débutant", image: "💪", icd10: "M77.0 · M77.1 · M70" },
  { id: 5, category: "shoulder-arm", region: { fr: "Poignet & main", en: "Wrist & hand", de: "Handgelenk & Hand" }, title: { fr: "Canal carpien, arthrose digitale, mobilité", en: "Carpal tunnel, finger OA, mobility", de: "Karpaltunnel, Fingerarthrose, Mobilität" }, price: 39, duration: "4 sem.", level: "Débutant", image: "✋", icd10: "G56 · M15 · M70 · M77.2" },
  { id: 6, category: "hip-pelvis", region: { fr: "Hanche & bassin", en: "Hip & pelvis", de: "Hüfte & Becken" }, title: { fr: "Coxarthrose, FAI, prothèse, piriforme, pubalgies", en: "Hip OA, FAI, THR, piriformis, groin pain", de: "Hüftarthrose, FAI, Hüft-TEP, Piriformis" }, price: 54, duration: "8 sem.", level: "Débutant", image: "🦵", icd10: "M16 · M70 · M76 · Z96" },
  { id: 7, category: "knee-thigh", region: { fr: "Genou & cuisse", en: "Knee & thigh", de: "Knie & Oberschenkel" }, title: { fr: "Gonarthrose, rotule, LCA, ménisque, PTG, bandelette IT", en: "Knee OA, patella, ACL, meniscus, TKR, IT band", de: "Gonarthrose, Patella, Kreuzband, Meniskus, KTEP" }, price: 69, duration: "12 sem.", level: "Avancé", image: "🦵", icd10: "M17 · M22 · M23 · M71 · M76" },
  { id: 8, category: "ankle-foot", region: { fr: "Cheville & pied", en: "Ankle & foot", de: "Sprunggelenk & Fuß" }, title: { fr: "Entorse, Achille, fasciite, hallux valgus, Morton", en: "Sprain, Achilles, fasciitis, hallux valgus, Morton", de: "Verstauchung, Achilles, Fasziitis, Hallux, Morton" }, price: 49, duration: "6 sem.", level: "Intermédiaire", image: "🦶", icd10: "M72 · M76 · M77 · G57.6 · M20" },
  { id: 9, category: "spine-back", region: { fr: "Posture & ergonomie", en: "Posture & ergonomics", de: "Haltung & Ergonomie" }, title: { fr: "Hypercyphose, lordose, télétravail, conducteurs", en: "Hyperkyphosis, lordosis, remote work, drivers", de: "Hyperkyphose, Lordose, Homeoffice, Fahrer" }, price: 39, duration: "4 sem.", level: "Débutant", image: "🧘", icd10: "M40 · M41 · Z57.5" },
  { id: 10, category: "mobility-flexibility", region: { fr: "Renforcement global", en: "Global strengthening", de: "Ganzkörperkräftigung" }, title: { fr: "Core, senior, reconditionnement, plancher pelvien", en: "Core, senior, reconditioning, pelvic floor", de: "Core, Senior, Rekonditionierung, Beckenboden" }, price: 54, duration: "8 sem.", level: "Intermédiaire", image: "🏋️", icd10: "M62 · R26 · N39 · Z72 · Z73" },
  { id: 11, category: "mobility-flexibility", region: { fr: "Mobilité & souplesse", en: "Mobility & flexibility", de: "Mobilität & Beweglichkeit" }, title: { fr: "Stretching, yoga thérapeutique, foam roller, masters", en: "Stretching, therapeutic yoga, foam roller, masters", de: "Stretching, Yogatherapie, Faszienrolle, Masters" }, price: 39, duration: "5 sem.", level: "Débutant", image: "🧘", icd10: "M62 · M79 · Z72" },
  { id: 12, category: "special-populations", region: { fr: "Populations spéciales", en: "Special populations", de: "Besondere Gruppen" }, title: { fr: "Grossesse, fibromyalgie, SEP, Parkinson, AVC, ado", en: "Pregnancy, fibromyalgia, MS, Parkinson, stroke, teens", de: "Schwangerschaft, Fibromyalgie, MS, Parkinson, Schlaganfall" }, price: 64, duration: "10 sem.", level: "Avancé", image: "👶", icd10: "G20 · G35 · M79.70 · O26 · N99 · F45" },
];

export default programs;
