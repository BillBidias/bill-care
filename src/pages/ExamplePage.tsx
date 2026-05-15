import { useState, Fragment } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useTr } from "@/lib/i18n";
import { PlayCircle, Lock, Clock, BarChart3, FileSearch, ChevronDown, Eye, ShoppingBasket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { toast } from "@/components/ui/use-toast";

const ExamplePage = () => {
  const tr = useTr();

  const makeWeeks = (programId: number, title: { fr: string; en: string; de: string }) => {
    const sessions = [
      ["Bilan, sécurité et objectifs", "Assessment, safety and goals", "Befund, Sicherheit und Ziele"],
      ["Mobilité douce et antalgie", "Gentle mobility and pain relief", "Sanfte Mobilität und Schmerzlinderung"],
      ["Activation musculaire ciblée", "Targeted muscle activation", "Gezielte Muskelaktivierung"],
      ["Renforcement progressif", "Progressive strengthening", "Progressive Kräftigung"],
      ["Coordination et contrôle moteur", "Coordination and motor control", "Koordination und motorische Kontrolle"],
      ["Fonctionnel et gestes du quotidien", "Functional work and daily activities", "Funktionelles Training und Alltag"],
      ["Progression autonomie", "Self-management progression", "Progression zur Selbstständigkeit"],
      ["Routine finale et prévention", "Final routine and prevention", "Abschlussroutine und Prävention"],
    ];

    return Array.from({ length: 4 }).map((_, weekIndex) => ({
      week: weekIndex + 1,
      title: {
        fr: `Semaine ${weekIndex + 1}`,
        en: `Week ${weekIndex + 1}`,
        de: `Woche ${weekIndex + 1}`,
      },
      videos: [0, 1].map((slot) => {
        const index = weekIndex * 2 + slot;
        return {
          id: `${programId}-w${weekIndex + 1}-v${slot + 1}`,
          duration: `${12 + index} min`,
          free: weekIndex === 0 && slot === 0,
          title: {
            fr: `${title.fr} — Vidéo ${index + 1} : ${sessions[index][0]}`,
            en: `${title.en} — Video ${index + 1}: ${sessions[index][1]}`,
            de: `${title.de} — Video ${index + 1}: ${sessions[index][2]}`,
          },
        };
      }),
    }));
  };

  const rawPrograms = [
    { id: 3, cat: 0, region: { fr: "Tête & cou", en: "Head & neck", de: "Kopf & Hals" }, title: { fr: "Rééducation cervicalgies", en: "Neck pain rehabilitation", de: "Reha bei Nackenschmerzen" }, description: { fr: "Programme complet pour douleurs cervicales : étirements, renforcement, automassage", en: "Complete program for neck pain: stretching, strengthening and self-massage", de: "Komplettes Programm bei Nackenschmerzen: Dehnung, Kräftigung und Selbstmassage" }, price: 49, duration: "4 sem.", level: "Débutant", image: "🧠", icd10: "M54.2 · M53.1 · Z50.1!" },
    { id: 8, cat: 0, region: { fr: "Tête & cou", en: "Head & neck", de: "Kopf & Hals" }, title: { fr: "Hernie cervicale C5-C6", en: "C5-C6 cervical disc herniation", de: "Zervikale Bandscheibenhernie C5-C6" }, description: { fr: "Protocole de traction douce et stabilisation cervicale", en: "Gentle traction and cervical stabilization protocol", de: "Sanfte Traktion und zervikale Stabilisation" }, price: 59, duration: "4 sem.", level: "Intermédiaire", image: "🧠", icd10: "M50.1 · M50.2 · G54.2" },
    { id: 54, cat: 0, region: { fr: "Tête & cou", en: "Head & neck", de: "Kopf & Hals" }, title: { fr: "Tête en avant (forward head posture)", en: "Forward head posture", de: "Kopfvorhaltung" }, description: { fr: "Correction posturale cervicale pour réduire la tension nuque épaules", en: "Cervical posture correction to reduce neck and shoulder tension", de: "Haltungskorrektur der Halswirbelsäule zur Entlastung von Nacken und Schultern" }, price: 39, duration: "4 sem.", level: "Débutant", image: "🧘", icd10: "M40.02 · M54.2 · Z57.5" },
    { id: 82, cat: 0, region: { fr: "Tête & cou", en: "Head & neck", de: "Kopf & Hals" }, title: { fr: "Libération myofasciale du cou et des épaules", en: "Neck and shoulder myofascial release", de: "Myofasziale Entspannung von Nacken und Schultern" }, description: { fr: "Techniques d'automassage et de relâchement pour la nuque et trapèzes", en: "Self-massage and release techniques for neck and trapezius", de: "Selbstmassage und Entspannungstechniken für Nacken und Trapezmuskel" }, price: 39, duration: "4 sem.", level: "Débutant", image: "🧘", icd10: "M54.2 · M79.11 · M79.12" },

    { id: 1, cat: 1, region: { fr: "Colonne vertébrale", en: "Spine", de: "Wirbelsäule" }, title: { fr: "Programme lombalgies chroniques", en: "Chronic low back pain program", de: "Programm bei chronischen Rückenschmerzen" }, description: { fr: "8 semaines de rééducation progressive pour douleurs lombaires persistantes", en: "Progressive rehabilitation for persistent low back pain", de: "Progressive Reha bei anhaltenden Lendenschmerzen" }, price: 59, duration: "4 sem.", level: "Intermédiaire", image: "🦴", icd10: "M54.56 · M54.57 · Z50.1!" },
    { id: 2, cat: 1, region: { fr: "Colonne vertébrale", en: "Spine", de: "Wirbelsäule" }, title: { fr: "Protocole hernie discale L4-L5", en: "L4-L5 disc herniation protocol", de: "Protokoll Bandscheibenvorfall L4-L5" }, description: { fr: "Exercices de décompression et stabilisation pour hernie discale lombaire", en: "Decompression and stabilization exercises for lumbar disc herniation", de: "Dekompression und Stabilisation bei lumbaler Bandscheibenhernie" }, price: 59, duration: "4 sem.", level: "Intermédiaire", image: "🦴", icd10: "M51.1 · M51.2" },
    { id: 4, cat: 1, region: { fr: "Colonne vertébrale", en: "Spine", de: "Wirbelsäule" }, title: { fr: "Soulager la sciatique", en: "Sciatica relief", de: "Ischiasbeschwerden lindern" }, description: { fr: "Protocole journalier de 20 min pour réduire l'irradiation sciatique", en: "Daily 20-minute protocol to reduce sciatic radiating pain", de: "Tägliches 20-Minuten-Protokoll gegen Ischiasschmerzen" }, price: 49, duration: "4 sem.", level: "Débutant", image: "🦴", icd10: "M54.3 · M54.4 · G54.1" },
    { id: 5, cat: 1, region: { fr: "Colonne vertébrale", en: "Spine", de: "Wirbelsäule" }, title: { fr: "Dos du télétravailleur", en: "Remote worker back program", de: "Rückenprogramm fürs Homeoffice" }, description: { fr: "Routine express de 10 min matin/soir contre les douleurs liées au bureau", en: "10-minute morning/evening routine for desk-related pain", de: "10-Minuten-Routine gegen bürobedingte Beschwerden" }, price: 39, duration: "4 sem.", level: "Débutant", image: "💻", icd10: "M54.56 · M54.2 · Z57.5" },
    { id: 6, cat: 1, region: { fr: "Colonne vertébrale", en: "Spine", de: "Wirbelsäule" }, title: { fr: "Scoliose : mobilité & renforcement", en: "Scoliosis: mobility and strengthening", de: "Skoliose: Mobilität und Kräftigung" }, description: { fr: "Programme adapté pour adultes atteints de scoliose légère à modérée", en: "Adapted program for adults with mild to moderate scoliosis", de: "Angepasstes Programm bei leichter bis moderater Skoliose" }, price: 59, duration: "4 sem.", level: "Intermédiaire", image: "🦴", icd10: "M41.2 · M41.5 · Q67.5" },
    { id: 7, cat: 1, region: { fr: "Colonne vertébrale", en: "Spine", de: "Wirbelsäule" }, title: { fr: "Syndrome facettaire", en: "Facet joint syndrome", de: "Facettensyndrom" }, description: { fr: "Exercices de décharge des articulaires postérieures lombaires", en: "Relief exercises for lumbar facet joints", de: "Entlastungsübungen für lumbale Facettengelenke" }, price: 49, duration: "4 sem.", level: "Intermédiaire", image: "🦴", icd10: "M47.86 · M53.86 · M54.56" },
    { id: 9, cat: 1, region: { fr: "Colonne vertébrale", en: "Spine", de: "Wirbelsäule" }, title: { fr: "Dorsalgies & thorax raide", en: "Mid-back pain and stiff thorax", de: "Brustwirbelsäulenschmerz und steifer Thorax" }, description: { fr: "Mobilisation thoracique progressive pour soulager le dos moyen", en: "Progressive thoracic mobility for mid-back relief", de: "Progressive BWS-Mobilisation zur Entlastung des mittleren Rückens" }, price: 49, duration: "4 sem.", level: "Débutant", image: "🦴", icd10: "M54.64 · M54.6 · M40.04" },
    { id: 10, cat: 1, region: { fr: "Colonne vertébrale", en: "Spine", de: "Wirbelsäule" }, title: { fr: "Lombalgie aiguë : reprise rapide", en: "Acute low back pain: fast return", de: "Akute Lumbalgie: schneller Wiedereinstieg" }, description: { fr: "Protocole 5 jours pour retrouver la mobilité après un lumbago", en: "5-day protocol to restore mobility after acute low back pain", de: "5-Tage-Protokoll nach Hexenschuss" }, price: 39, duration: "4 sem.", level: "Débutant", image: "🦴", icd10: "M54.56 · M51.2 · Z54.9!" },
    { id: 11, cat: 1, region: { fr: "Colonne vertébrale", en: "Spine", de: "Wirbelsäule" }, title: { fr: "Renforcement muscles profonds du dos", en: "Deep back muscle strengthening", de: "Kräftigung der tiefen Rückenmuskulatur" }, description: { fr: "Programme de gainage profond centré sur le transverse et le multifide", en: "Deep core program focused on transverse abdominis and multifidus", de: "Tiefes Core-Training für Transversus und Multifidus" }, price: 49, duration: "4 sem.", level: "Intermédiaire", image: "🏋️", icd10: "M54.56 · M53.86 · Z50.1!" },
    { id: 12, cat: 1, region: { fr: "Colonne vertébrale", en: "Spine", de: "Wirbelsäule" }, title: { fr: "Douleurs coccyx & coccygodynie", en: "Coccyx pain and coccygodynia", de: "Steißbeinschmerzen und Kokzygodynie" }, description: { fr: "Exercices ciblés sur le plancher pelvien et le bas du rachis", en: "Targeted exercises for pelvic floor and lower spine", de: "Gezielte Übungen für Beckenboden und unteren Rücken" }, price: 49, duration: "4 sem.", level: "Débutant", image: "🦴", icd10: "M53.3 · M54.88" },

    { id: 13, cat: 2, region: { fr: "Épaule", en: "Shoulder", de: "Schulter" }, title: { fr: "Conflit sous-acromial", en: "Subacromial impingement", de: "Subakromiales Impingement" }, description: { fr: "Programme 6 semaines pour éliminer le pincement d'épaule en mouvement", en: "Program to reduce shoulder pinching during movement", de: "Programm gegen Schulterengpass bei Bewegung" }, price: 49, duration: "4 sem.", level: "Intermédiaire", image: "💪", icd10: "M75.4 · M75.1" },
    { id: 14, cat: 2, region: { fr: "Épaule", en: "Shoulder", de: "Schulter" }, title: { fr: "Tendinite de la coiffe des rotateurs", en: "Rotator cuff tendinopathy", de: "Rotatorenmanschetten-Tendinopathie" }, description: { fr: "Rééducation progressive des 4 muscles de la coiffe avec échauffement intégré", en: "Progressive rehab of the rotator cuff with integrated warm-up", de: "Progressive Reha der Rotatorenmanschette mit Warm-up" }, price: 49, duration: "4 sem.", level: "Débutant", image: "💪", icd10: "M75.1 · M75.3" },
    { id: 15, cat: 2, region: { fr: "Épaule", en: "Shoulder", de: "Schulter" }, title: { fr: "Épaule gelée (capsulite)", en: "Frozen shoulder", de: "Frozen Shoulder" }, description: { fr: "Protocole de récupération en 3 phases pour retrouver l'amplitude articulaire", en: "Three-phase protocol to restore shoulder range of motion", de: "3-Phasen-Protokoll zur Wiederherstellung der Beweglichkeit" }, price: 59, duration: "4 sem.", level: "Intermédiaire", image: "💪", icd10: "M75.0 · Z50.1!" },
    { id: 16, cat: 2, region: { fr: "Épaule", en: "Shoulder", de: "Schulter" }, title: { fr: "Instabilité d'épaule", en: "Shoulder instability", de: "Schulterinstabilität" }, description: { fr: "Renforcement des stabilisateurs et proprioception pour éviter les récidives", en: "Stabilizer strengthening and proprioception to prevent recurrence", de: "Stabilisatorentraining und Propriozeption gegen Rückfälle" }, price: 59, duration: "4 sem.", level: "Avancé", image: "💪", icd10: "M25.31 · M75.8" },
    { id: 17, cat: 3, region: { fr: "Coude & avant-bras", en: "Elbow & forearm", de: "Ellbogen & Unterarm" }, title: { fr: "Épicondylite latérale (tennis elbow)", en: "Lateral epicondylitis", de: "Laterale Epicondylitis" }, description: { fr: "Programme excentrique + étirements pour tendon extenseurs du coude", en: "Eccentric program and stretching for elbow extensor tendons", de: "Exzentrisches Programm und Dehnung der Strecksehnen" }, price: 39, duration: "4 sem.", level: "Débutant", image: "💪", icd10: "M77.1 · Z50.1!" },
    { id: 18, cat: 3, region: { fr: "Coude & avant-bras", en: "Elbow & forearm", de: "Ellbogen & Unterarm" }, title: { fr: "Épicondylite médiale (golf elbow)", en: "Medial epicondylitis", de: "Mediale Epicondylitis" }, description: { fr: "Rééducation des fléchisseurs de l'avant-bras avec gestion de la charge", en: "Forearm flexor rehab with load management", de: "Reha der Unterarmbeuger mit Belastungssteuerung" }, price: 39, duration: "4 sem.", level: "Débutant", image: "💪", icd10: "M77.0 · Z50.1!" },
    { id: 19, cat: 4, region: { fr: "Poignet & main", en: "Wrist & hand", de: "Handgelenk & Hand" }, title: { fr: "Syndrome du canal carpien", en: "Carpal tunnel syndrome", de: "Karpaltunnelsyndrom" }, description: { fr: "Exercices de glissement nerveux et d'étirement pour libérer le nerf médian", en: "Nerve gliding and stretching exercises for the median nerve", de: "Nervengleit- und Dehnübungen für den Medianusnerv" }, price: 39, duration: "4 sem.", level: "Débutant", image: "✋", icd10: "G56.0 · M77.2" },
    { id: 20, cat: 2, region: { fr: "Épaule", en: "Shoulder", de: "Schulter" }, title: { fr: "Tendinite bicipitale", en: "Bicipital tendinopathy", de: "Bizepssehnen-Tendinopathie" }, description: { fr: "Renforcement en excentriques et mobilisation de l'épaule", en: "Eccentric strengthening and shoulder mobility", de: "Exzentrische Kräftigung und Schultermobilisation" }, price: 49, duration: "4 sem.", level: "Débutant", image: "💪", icd10: "M75.2 · Z50.1!" },
    { id: 21, cat: 2, region: { fr: "Épaule", en: "Shoulder", de: "Schulter" }, title: { fr: "Post-opératoire épaule (conservateur)", en: "Post-operative shoulder program", de: "Postoperatives Schulterprogramm" }, description: { fr: "Programme de reprise douce après chirurgie d'épaule", en: "Gentle return program after shoulder surgery", de: "Sanfter Wiedereinstieg nach Schulteroperation" }, price: 59, duration: "4 sem.", level: "Intermédiaire", image: "💪", icd10: "M75.8 · Z96.61 · Z54.9!" },
    { id: 22, cat: 4, region: { fr: "Poignet & main", en: "Wrist & hand", de: "Handgelenk & Hand" }, title: { fr: "Douleurs poignet & main", en: "Wrist and hand pain", de: "Handgelenk- und Handschmerzen" }, description: { fr: "Exercices de mobilité, renforcement et libération myofasciale du poignet", en: "Mobility, strengthening and wrist myofascial release exercises", de: "Mobilität, Kräftigung und myofasziale Entlastung fürs Handgelenk" }, price: 39, duration: "4 sem.", level: "Débutant", image: "✋", icd10: "M77.2 · M70.0 · Z57.5" },

    { id: 23, cat: 6, region: { fr: "Genou & cuisse", en: "Knee & thigh", de: "Knie & Oberschenkel" }, title: { fr: "Gonarthrose : mobilité sans douleur", en: "Knee osteoarthritis: pain-free mobility", de: "Gonarthrose: schmerzfreie Mobilität" }, description: { fr: "Programme articulaire et musculaire adapté à l'arthrose du genou", en: "Joint and muscle program adapted to knee osteoarthritis", de: "Gelenk- und Muskelprogramm bei Kniearthrose" }, price: 49, duration: "4 sem.", level: "Débutant", image: "🦵", icd10: "M17.1 · M17.9" },
    { id: 24, cat: 6, region: { fr: "Genou & cuisse", en: "Knee & thigh", de: "Knie & Oberschenkel" }, title: { fr: "Syndrome rotulien (douleur antérieure)", en: "Patellofemoral pain syndrome", de: "Patellofemorales Schmerzsyndrom" }, description: { fr: "Rééducation VMO et biomécanique pour supprimer le craquement rotulien", en: "VMO and biomechanics rehab for anterior knee pain", de: "VMO- und Biomechaniktraining bei vorderem Knieschmerz" }, price: 49, duration: "4 sem.", level: "Intermédiaire", image: "🦵", icd10: "M22.2 · M25.56" },
    { id: 25, cat: 6, region: { fr: "Genou & cuisse", en: "Knee & thigh", de: "Knie & Oberschenkel" }, title: { fr: "Tendinite rotulienne", en: "Patellar tendinopathy", de: "Patellarsehnen-Tendinopathie" }, description: { fr: "Protocole excentrique classique pour genou du sauteur", en: "Classic eccentric protocol for jumper's knee", de: "Klassisches exzentrisches Protokoll beim Springerknie" }, price: 49, duration: "4 sem.", level: "Intermédiaire", image: "🦵", icd10: "M76.5" },
    { id: 26, cat: 6, region: { fr: "Genou & cuisse", en: "Knee & thigh", de: "Knie & Oberschenkel" }, title: { fr: "Post-opératoire ligament croisé antérieur", en: "Post-operative ACL rehabilitation", de: "Postoperative VKB-Rehabilitation" }, description: { fr: "Rééducation progressive de J0 à 6 mois après reconstruction LCA", en: "Progressive rehab from day 0 to 6 months after ACL reconstruction", de: "Progressive Reha von Tag 0 bis 6 Monate nach VKB-Rekonstruktion" }, price: 69, duration: "4 sem.", level: "Avancé", image: "🦵", icd10: "M23.61 · Z96.651 · Z54.9!" },
    { id: 27, cat: 6, region: { fr: "Genou & cuisse", en: "Knee & thigh", de: "Knie & Oberschenkel" }, title: { fr: "Syndrome de l'essuie-glace (bandelette IT)", en: "IT band syndrome", de: "IT-Band-Syndrom" }, description: { fr: "Étirements et renforcement latéral pour coureurs souffrant de la hanche/genou", en: "Stretching and lateral strengthening for runners with hip/knee pain", de: "Dehnung und laterale Kräftigung für Laufende mit Hüft-/Knieschmerz" }, price: 49, duration: "4 sem.", level: "Intermédiaire", image: "🦵", icd10: "M76.3 · Z72.3" },
    { id: 28, cat: 6, region: { fr: "Genou & cuisse", en: "Knee & thigh", de: "Knie & Oberschenkel" }, title: { fr: "Renforcement quadriceps & ischio-jambiers", en: "Quadriceps and hamstring strengthening", de: "Quadrizeps- und Hamstring-Kräftigung" }, description: { fr: "Programme ciblé sur le ratio agoniste/antagoniste pour protéger le genou", en: "Program targeting agonist/antagonist balance to protect the knee", de: "Programm für Agonist-/Antagonist-Balance zum Knieschutz" }, price: 49, duration: "4 sem.", level: "Intermédiaire", image: "🦵", icd10: "M79.16 · M62.56" },
    { id: 29, cat: 6, region: { fr: "Genou & cuisse", en: "Knee & thigh", de: "Knie & Oberschenkel" }, title: { fr: "Méniscopathie dégénérative", en: "Degenerative meniscus condition", de: "Degenerative Meniskopathie" }, description: { fr: "Exercices de décharge et renforcement péri-articulaire sans chirurgie", en: "Load relief and periarticular strengthening without surgery", de: "Entlastung und periartikuläre Kräftigung ohne Operation" }, price: 49, duration: "4 sem.", level: "Débutant", image: "🦵", icd10: "M23.20 · M23.30" },
    { id: 30, cat: 12, region: { fr: "Populations spéciales", en: "Special populations", de: "Besondere Gruppen" }, title: { fr: "Prévention blessures genou sportif", en: "Sports knee injury prevention", de: "Prävention von Knieverletzungen im Sport" }, description: { fr: "Programme de gainage et proprioception spécifique sport collectif", en: "Core and proprioception program for team sports", de: "Core- und Propriozeptionstraining für Teamsport" }, price: 49, duration: "4 sem.", level: "Avancé", image: "🏃", icd10: "Z72.3 · M25.36 · Z71.89" },
    { id: 31, cat: 6, region: { fr: "Genou & cuisse", en: "Knee & thigh", de: "Knie & Oberschenkel" }, title: { fr: "Genou après prothèse totale (PTG)", en: "Knee after total replacement", de: "Knie nach Totalendoprothese" }, description: { fr: "Rééducation à domicile après arthroplastie du genou", en: "Home rehabilitation after knee arthroplasty", de: "Heimrehabilitation nach Kniearthroplastik" }, price: 59, duration: "4 sem.", level: "Intermédiaire", image: "🦵", icd10: "Z96.651 · Z96.652 · Z50.1!" },
    { id: 32, cat: 6, region: { fr: "Genou & cuisse", en: "Knee & thigh", de: "Knie & Oberschenkel" }, title: { fr: "Douleurs genou senior 60+", en: "Knee pain senior 60+", de: "Knieschmerzen Senioren 60+" }, description: { fr: "Programme doux de maintien de la mobilité et de l'autonomie", en: "Gentle program to maintain mobility and independence", de: "Sanftes Programm zur Erhaltung von Mobilität und Selbstständigkeit" }, price: 39, duration: "4 sem.", level: "Débutant", image: "🦵", icd10: "M17.9 · M25.36 · R26.9" },
    { id: 33, cat: 6, region: { fr: "Genou & cuisse", en: "Knee & thigh", de: "Knie & Oberschenkel" }, title: { fr: "Kyste de Baker", en: "Baker's cyst", de: "Baker-Zyste" }, description: { fr: "Exercices de réduction de l'inflammation et de renforcement du genou", en: "Exercises to reduce inflammation and strengthen the knee", de: "Übungen zur Entzündungsreduktion und Kniekräftigung" }, price: 39, duration: "4 sem.", level: "Débutant", image: "🦵", icd10: "M71.2" },

    { id: 34, cat: 5, region: { fr: "Hanche & bassin", en: "Hip & pelvis", de: "Hüfte & Becken" }, title: { fr: "Coxarthrose : programme fonctionnel", en: "Hip osteoarthritis: functional program", de: "Coxarthrose: funktionelles Programm" }, description: { fr: "Exercices d'entretien articulaire et musculaire pour hanche arthrosique", en: "Joint and muscle maintenance exercises for hip osteoarthritis", de: "Gelenk- und Muskelübungen bei Hüftarthrose" }, price: 49, duration: "4 sem.", level: "Débutant", image: "🦵", icd10: "M16.1 · M16.9 · E11.69" },
    { id: 35, cat: 5, region: { fr: "Hanche & bassin", en: "Hip & pelvis", de: "Hüfte & Becken" }, title: { fr: "Syndrome du piriforme & pseudo-sciatique", en: "Piriformis syndrome and pseudo-sciatica", de: "Piriformis-Syndrom und Pseudo-Ischialgie" }, description: { fr: "Libération du muscle piriforme et rééducation de la ceinture pelvienne", en: "Piriformis release and pelvic girdle rehabilitation", de: "Piriformis-Entlastung und Beckenring-Reha" }, price: 49, duration: "4 sem.", level: "Intermédiaire", image: "🦵", icd10: "M79.15 · G57.0" },
    { id: 36, cat: 5, region: { fr: "Hanche & bassin", en: "Hip & pelvis", de: "Hüfte & Becken" }, title: { fr: "Conflit fémoro-acétabulaire (FAI)", en: "Femoroacetabular impingement", de: "Femoroazetabuläres Impingement" }, description: { fr: "Mobilité de hanche et renforcement spécifique pour le pincement intra-articulaire", en: "Hip mobility and specific strengthening for intra-articular impingement", de: "Hüftmobilität und spezifische Kräftigung bei Impingement" }, price: 59, duration: "4 sem.", level: "Intermédiaire", image: "🦵", icd10: "M24.15 · M25.55 · Q65.9" },
    { id: 37, cat: 5, region: { fr: "Hanche & bassin", en: "Hip & pelvis", de: "Hüfte & Becken" }, title: { fr: "Tendinite du moyen fessier", en: "Gluteus medius tendinopathy", de: "Gluteus-medius-Tendinopathie" }, description: { fr: "Renforcement latéral de hanche en décharge et en charge progressive", en: "Lateral hip strengthening with progressive loading", de: "Laterale Hüftkräftigung mit progressiver Belastung" }, price: 49, duration: "4 sem.", level: "Intermédiaire", image: "🦵", icd10: "M76.0 · M70.6" },
    { id: 38, cat: 5, region: { fr: "Hanche & bassin", en: "Hip & pelvis", de: "Hüfte & Becken" }, title: { fr: "Hanche post-prothèse (PTH)", en: "Hip after total replacement", de: "Hüfte nach Totalendoprothese" }, description: { fr: "Programme de récupération à domicile après prothèse totale de hanche", en: "Home recovery program after total hip replacement", de: "Heimprogramm nach Hüft-Totalendoprothese" }, price: 59, duration: "4 sem.", level: "Intermédiaire", image: "🦵", icd10: "Z96.641 · Z96.642 · Z50.1!" },
    { id: 39, cat: 12, region: { fr: "Populations spéciales", en: "Special populations", de: "Besondere Gruppen" }, title: { fr: "Douleurs bassin post-partum", en: "Postpartum pelvic pain", de: "Beckenschmerzen nach der Geburt" }, description: { fr: "Rééducation périnéale et pelvienne pour jeunes mamans", en: "Pelvic floor and pelvic rehabilitation for new mothers", de: "Beckenboden- und Beckenreha für junge Mütter" }, price: 49, duration: "4 sem.", level: "Débutant", image: "👶", icd10: "O26.7 · M53.35 · N99.3 · Z39.2" },
    { id: 40, cat: 5, region: { fr: "Hanche & bassin", en: "Hip & pelvis", de: "Hüfte & Becken" }, title: { fr: "Pubalgies & douleurs inguinales", en: "Groin pain and pubalgia", de: "Pubalgie und Leistenschmerzen" }, description: { fr: "Programme de renforcement adducteurs et core pour sportifs", en: "Adductor and core strengthening program for athletes", de: "Adduktoren- und Core-Training für Sportler" }, price: 49, duration: "4 sem.", level: "Avancé", image: "🦵", icd10: "M79.15 · Z72.3" },
    { id: 41, cat: 5, region: { fr: "Hanche & bassin", en: "Hip & pelvis", de: "Hüfte & Becken" }, title: { fr: "Déséquilibre bassin & jambe courte fonctionnelle", en: "Pelvic imbalance and functional leg length difference", de: "Beckenungleichgewicht und funktionelle Beinlängendifferenz" }, description: { fr: "Travail d'équilibration du bassin et des chaînes myofasciales", en: "Pelvic balance and myofascial chain work", de: "Beckenausgleich und myofasziale Kettenarbeit" }, price: 49, duration: "4 sem.", level: "Intermédiaire", image: "🦵", icd10: "M53.35 · M95.5 · Q66.9" },
    { id: 42, cat: 5, region: { fr: "Hanche & bassin", en: "Hip & pelvis", de: "Hüfte & Becken" }, title: { fr: "Bursites trochantériennes", en: "Trochanteric bursitis", de: "Trochanter-Bursitis" }, description: { fr: "Traitement conservateur : étirements, renforcement, gestion de la douleur", en: "Conservative treatment: stretching, strengthening and pain management", de: "Konservative Behandlung: Dehnung, Kräftigung und Schmerzmanagement" }, price: 49, duration: "4 sem.", level: "Débutant", image: "🦵", icd10: "M70.6 · M70.7" },
    { id: 43, cat: 5, region: { fr: "Hanche & bassin", en: "Hip & pelvis", de: "Hüfte & Becken" }, title: { fr: "Stabilité du bassin pour sportifs", en: "Pelvic stability for athletes", de: "Beckenstabilität für Sportler" }, description: { fr: "Proprioception et gainage de hanche pour la performance et la prévention", en: "Hip proprioception and core stability for performance and prevention", de: "Hüftpropriozeption und Core-Stabilität für Leistung und Prävention" }, price: 59, duration: "4 sem.", level: "Avancé", image: "🦵", icd10: "M54.55 · M79.15 · Z72.3" },

    { id: 44, cat: 7, region: { fr: "Cheville & pied", en: "Ankle & foot", de: "Sprunggelenk & Fuß" }, title: { fr: "Entorse de cheville : protocole POLICE", en: "Ankle sprain: POLICE protocol", de: "Sprunggelenksdistorsion: POLICE-Protokoll" }, description: { fr: "Rééducation en 4 phases depuis la phase aiguë jusqu'à la reprise sportive", en: "Four-phase rehab from acute phase to return to sport", de: "4-Phasen-Reha von Akutphase bis Sport-Rückkehr" }, price: 49, duration: "4 sem.", level: "Intermédiaire", image: "🦶", icd10: "M25.37 · Z54.9!" },
    { id: 45, cat: 7, region: { fr: "Cheville & pied", en: "Ankle & foot", de: "Sprunggelenk & Fuß" }, title: { fr: "Tendinite d'Achille", en: "Achilles tendinopathy", de: "Achillessehnen-Tendinopathie" }, description: { fr: "Programme excentrique de Alfredson adapté à domicile", en: "Home-adapted Alfredson eccentric program", de: "Alfredson-Exzentrikprogramm für zuhause" }, price: 49, duration: "4 sem.", level: "Intermédiaire", image: "🦶", icd10: "M76.6 · Z50.1!" },
    { id: 46, cat: 7, region: { fr: "Cheville & pied", en: "Ankle & foot", de: "Sprunggelenk & Fuß" }, title: { fr: "Fasciite plantaire & talalgie", en: "Plantar fasciitis and heel pain", de: "Plantarfasziitis und Fersenschmerz" }, description: { fr: "Étirements et renforcement intrinsèque du pied pour réduire la douleur au talon", en: "Stretching and intrinsic foot strengthening to reduce heel pain", de: "Dehnung und Fußbinnenmuskulatur gegen Fersenschmerz" }, price: 49, duration: "4 sem.", level: "Débutant", image: "🦶", icd10: "M72.2 · M77.3 · E11.69" },
    { id: 47, cat: 7, region: { fr: "Cheville & pied", en: "Ankle & foot", de: "Sprunggelenk & Fuß" }, title: { fr: "Instabilité chronique de cheville", en: "Chronic ankle instability", de: "Chronische Sprunggelenksinstabilität" }, description: { fr: "Proprioception progressive pour éviter les récidives d'entorses", en: "Progressive proprioception to prevent recurrent sprains", de: "Progressive Propriozeption gegen erneute Distorsionen" }, price: 49, duration: "4 sem.", level: "Intermédiaire", image: "🦶", icd10: "M25.37 · M24.27" },
    { id: 48, cat: 7, region: { fr: "Cheville & pied", en: "Ankle & foot", de: "Sprunggelenk & Fuß" }, title: { fr: "Hallux valgus : prévention & soulagement", en: "Hallux valgus: prevention and relief", de: "Hallux valgus: Prävention und Entlastung" }, description: { fr: "Exercices musculaires du pied pour limiter l'évolution de l'oignon", en: "Foot muscle exercises to slow bunion progression", de: "Fußmuskelübungen zur Begrenzung der Fehlstellung" }, price: 39, duration: "4 sem.", level: "Débutant", image: "🦶", icd10: "M20.1 · Q66.9" },
    { id: 49, cat: 7, region: { fr: "Cheville & pied", en: "Ankle & foot", de: "Sprunggelenk & Fuß" }, title: { fr: "Syndrome du tibial postérieur (pied plat)", en: "Posterior tibial tendon syndrome", de: "Tibialis-posterior-Syndrom" }, description: { fr: "Renforcement de l'arche plantaire et de la musculature tibiale", en: "Arch and tibial muscle strengthening", de: "Kräftigung des Fußgewölbes und der Tibialmuskulatur" }, price: 49, duration: "4 sem.", level: "Intermédiaire", image: "🦶", icd10: "M76.8 · M21.47 · Q66.5" },
    { id: 50, cat: 7, region: { fr: "Cheville & pied", en: "Ankle & foot", de: "Sprunggelenk & Fuß" }, title: { fr: "Douleurs métatarsiennes", en: "Metatarsal pain", de: "Metatarsalgie" }, description: { fr: "Décompression et mobilisation des articulations métatarso-phalangiennes", en: "Decompression and mobility for metatarsophalangeal joints", de: "Dekompression und Mobilisation der MTP-Gelenke" }, price: 39, duration: "4 sem.", level: "Débutant", image: "🦶", icd10: "M77.4 · M79.27" },
    { id: 51, cat: 7, region: { fr: "Cheville & pied", en: "Ankle & foot", de: "Sprunggelenk & Fuß" }, title: { fr: "Névrome de Morton", en: "Morton's neuroma", de: "Morton-Neurom" }, description: { fr: "Programme conservateur : mobilisation, automassage et adaptation de charge", en: "Conservative program: mobility, self-massage and load adaptation", de: "Konservatives Programm: Mobilisation, Selbstmassage und Belastungsanpassung" }, price: 49, duration: "4 sem.", level: "Débutant", image: "🦶", icd10: "G57.6 · Z50.1!" },
    { id: 52, cat: 7, region: { fr: "Cheville & pied", en: "Ankle & foot", de: "Sprunggelenk & Fuß" }, title: { fr: "Reprise course après blessure cheville", en: "Return to running after ankle injury", de: "Laufrückkehr nach Sprunggelenksverletzung" }, description: { fr: "Programme de retour au jogging sécurisé", en: "Safe return-to-jogging program", de: "Sicheres Programm zur Rückkehr zum Joggen" }, price: 49, duration: "4 sem.", level: "Intermédiaire", image: "🦶", icd10: "M25.37 · Z72.3" },

    { id: 53, cat: 8, region: { fr: "Posture & ergonomie", en: "Posture & ergonomics", de: "Haltung & Ergonomie" }, title: { fr: "Correction du dos rond (hypercyphose)", en: "Rounded back correction", de: "Korrektur Rundrücken" }, description: { fr: "Renforcement des extenseurs dorsaux et ouverture thoracique", en: "Back extensor strengthening and thoracic opening", de: "Kräftigung der Rückenstrecker und Thoraxöffnung" }, price: 39, duration: "4 sem.", level: "Débutant", image: "🧘", icd10: "M40.04 · M40.24" },
    { id: 55, cat: 8, region: { fr: "Posture & ergonomie", en: "Posture & ergonomics", de: "Haltung & Ergonomie" }, title: { fr: "Hyperlordose lombaire", en: "Lumbar hyperlordosis", de: "Lumbale Hyperlordose" }, description: { fr: "Rééducation de la bascule de bassin et renforcement des abdominaux profonds", en: "Pelvic tilt retraining and deep abdominal strengthening", de: "Beckenkippung und tiefe Bauchmuskelkräftigung" }, price: 39, duration: "4 sem.", level: "Débutant", image: "🧘", icd10: "M40.46 · M40.56" },
    { id: 56, cat: 2, region: { fr: "Épaule", en: "Shoulder", de: "Schulter" }, title: { fr: "Épaules enroulées", en: "Rounded shoulders", de: "Nach vorne gezogene Schultern" }, description: { fr: "Travail de rétraction scapulaire et stretching pectoral", en: "Scapular retraction work and pectoral stretching", de: "Skapularetraktion und Brustmuskeldehnung" }, price: 39, duration: "4 sem.", level: "Débutant", image: "💪", icd10: "M40.01 · M75.8" },
    { id: 57, cat: 8, region: { fr: "Posture & ergonomie", en: "Posture & ergonomics", de: "Haltung & Ergonomie" }, title: { fr: "Ergonomie au poste de travail", en: "Workstation ergonomics", de: "Ergonomie am Arbeitsplatz" }, description: { fr: "Guide vidéo + exercices pour régler son environnement et prévenir les TMS", en: "Video guide and exercises to set up the workstation and prevent MSDs", de: "Videoguide und Übungen zur Arbeitsplatzanpassung und Prävention" }, price: 39, duration: "4 sem.", level: "Débutant", image: "💻", icd10: "Z57.5 · M70.9" },
    { id: 58, cat: 8, region: { fr: "Posture & ergonomie", en: "Posture & ergonomics", de: "Haltung & Ergonomie" }, title: { fr: "Posture debout prolongée", en: "Prolonged standing posture", de: "Langes Stehen" }, description: { fr: "Programme de soulagement pour les métiers debout", en: "Relief program for standing occupations", de: "Entlastungsprogramm für stehende Berufe" }, price: 39, duration: "4 sem.", level: "Débutant", image: "🧍", icd10: "Z57.5 · M54.56 · M79.17" },
    { id: 59, cat: 1, region: { fr: "Colonne vertébrale", en: "Spine", de: "Wirbelsäule" }, title: { fr: "Respiration & posture", en: "Breathing and posture", de: "Atmung und Haltung" }, description: { fr: "Travail du diaphragme comme stabilisateur du rachis", en: "Diaphragm work as a spinal stabilizer", de: "Zwerchfelltraining als Wirbelsäulenstabilisator" }, price: 39, duration: "4 sem.", level: "Débutant", image: "🌬️", icd10: "M54.56 · J98.09" },
    { id: 60, cat: 8, region: { fr: "Posture & ergonomie", en: "Posture & ergonomics", de: "Haltung & Ergonomie" }, title: { fr: "Posture de l'enfant & adolescent", en: "Child and teen posture", de: "Haltung bei Kindern und Jugendlichen" }, description: { fr: "Programme adapté aux 10-18 ans : prévention scoliose et port de sac à dos", en: "Program for ages 10-18: scoliosis prevention and backpack habits", de: "Programm für 10-18 Jahre: Skolioseprävention und Rucksacktragen" }, price: 39, duration: "4 sem.", level: "Débutant", image: "🎒", icd10: "M41.1 · Q67.5 · Z71.89" },
    { id: 61, cat: 8, region: { fr: "Posture & ergonomie", en: "Posture & ergonomics", de: "Haltung & Ergonomie" }, title: { fr: "Posture du conducteur", en: "Driver posture", de: "Fahrerhaltung" }, description: { fr: "Exercices de décompression après longs trajets en voiture", en: "Decompression exercises after long car rides", de: "Dekompressionsübungen nach langen Autofahrten" }, price: 39, duration: "4 sem.", level: "Débutant", image: "🚗", icd10: "M54.56 · M53.86 · Z57.5" },
    { id: 62, cat: 8, region: { fr: "Posture & ergonomie", en: "Posture & ergonomics", de: "Haltung & Ergonomie" }, title: { fr: "Pieds plats & problèmes en cascade", en: "Flat feet and chain reactions", de: "Plattfüße und Folgebeschwerden" }, description: { fr: "Correction de la chaîne ascendante : pied, genou, hanche, dos", en: "Ascending chain correction: foot, knee, hip and back", de: "Korrektur der aufsteigenden Kette: Fuß, Knie, Hüfte, Rücken" }, price: 49, duration: "4 sem.", level: "Intermédiaire", image: "🦶", icd10: "M21.47 · M17.9 · M54.56" },

    { id: 63, cat: 9, region: { fr: "Renforcement global", en: "Global strengthening", de: "Ganzkörperkräftigung" }, title: { fr: "Gainage fonctionnel sans douleur", en: "Pain-free functional core training", de: "Schmerzfreies funktionelles Core-Training" }, description: { fr: "Programme core stability adapté aux personnes avec douleurs chroniques", en: "Core stability program adapted to chronic pain", de: "Core-Stability-Programm bei chronischen Schmerzen" }, price: 49, duration: "4 sem.", level: "Intermédiaire", image: "🏋️", icd10: "M54.59 · M79.70 · F45.40" },
    { id: 64, cat: 9, region: { fr: "Renforcement global", en: "Global strengthening", de: "Ganzkörperkräftigung" }, title: { fr: "Renforcement pour les 60 ans et plus", en: "Strength training for 60+", de: "Kräftigung für 60+" }, description: { fr: "Musculation douce et équilibre pour maintenir l'autonomie et prévenir les chutes", en: "Gentle strength and balance to maintain independence and prevent falls", de: "Sanfte Kräftigung und Gleichgewicht zur Sturzprävention" }, price: 49, duration: "4 sem.", level: "Débutant", image: "🏋️", icd10: "R26.9 · M62.50 · Z73.6" },
    { id: 65, cat: 9, region: { fr: "Renforcement global", en: "Global strengthening", de: "Ganzkörperkräftigung" }, title: { fr: "Reprise du sport après longue inactivité", en: "Return to sport after long inactivity", de: "Sportrückkehr nach langer Inaktivität" }, description: { fr: "Programme de reprise progressive multi-articulaire 8 semaines", en: "Progressive multi-joint return program", de: "Progressives Mehrgelenk-Wiedereinstiegsprogramm" }, price: 49, duration: "4 sem.", level: "Intermédiaire", image: "🏃", icd10: "Z72.3 · M62.50" },
    { id: 66, cat: 9, region: { fr: "Renforcement global", en: "Global strengthening", de: "Ganzkörperkräftigung" }, title: { fr: "Renforcement sans matériel (poids du corps)", en: "Bodyweight strengthening", de: "Kräftigung ohne Geräte" }, description: { fr: "Progression structurée de 0 à 3 séances/sem avec guidage vidéo", en: "Structured progression from 0 to 3 sessions per week with video guidance", de: "Strukturierte Progression von 0 bis 3 Einheiten pro Woche" }, price: 39, duration: "4 sem.", level: "Débutant", image: "🏋️", icd10: "Z72.3 · E66.09" },
    { id: 67, cat: 9, region: { fr: "Renforcement global", en: "Global strengthening", de: "Ganzkörperkräftigung" }, title: { fr: "Renforcement avec élastiques de rééducation", en: "Resistance band strengthening", de: "Kräftigung mit Therapieband" }, description: { fr: "Plan d'entraînement complet avec bandes élastiques résistantes", en: "Complete training plan with resistance bands", de: "Kompletter Trainingsplan mit Widerstandsbändern" }, price: 39, duration: "4 sem.", level: "Débutant", image: "🏋️", icd10: "Z72.3 · M62.50" },
    { id: 68, cat: 9, region: { fr: "Renforcement global", en: "Global strengthening", de: "Ganzkörperkräftigung" }, title: { fr: "Prévention des chutes chez le senior", en: "Fall prevention for seniors", de: "Sturzprävention bei Senioren" }, description: { fr: "Équilibre, renforcement des membres inférieurs et réactivité", en: "Balance, lower-limb strengthening and reactivity", de: "Gleichgewicht, Beintraining und Reaktionsfähigkeit" }, price: 49, duration: "4 sem.", level: "Débutant", image: "⚖️", icd10: "R26.9 · W19 · Z73.6" },
    { id: 69, cat: 9, region: { fr: "Renforcement global", en: "Global strengthening", de: "Ganzkörperkräftigung" }, title: { fr: "Stabilité pour sportifs de haut niveau", en: "Stability for high-level athletes", de: "Stabilität für Leistungssportler" }, description: { fr: "Gainage avancé et proprioception pour la performance athlétique", en: "Advanced core and proprioception for athletic performance", de: "Fortgeschrittenes Core- und Propriozeptionstraining" }, price: 69, duration: "4 sem.", level: "Avancé", image: "🏋️", icd10: "Z72.3 · M25.30" },
    { id: 70, cat: 9, region: { fr: "Renforcement global", en: "Global strengthening", de: "Ganzkörperkräftigung" }, title: { fr: "Reconditionnement après hospitalisation", en: "Reconditioning after hospitalization", de: "Rekonditionierung nach Krankenhausaufenthalt" }, description: { fr: "Programme de remise en forme très progressive après séjour hospitalier", en: "Very progressive fitness recovery after hospitalization", de: "Sehr progressives Aufbauprogramm nach Krankenhausaufenthalt" }, price: 49, duration: "4 sem.", level: "Débutant", image: "🏥", icd10: "Z74.09 · M62.50 · Z54.9!" },
    { id: 71, cat: 9, region: { fr: "Renforcement global", en: "Global strengthening", de: "Ganzkörperkräftigung" }, title: { fr: "Renforcement du plancher pelvien (hommes)", en: "Pelvic floor strengthening for men", de: "Beckenbodentraining für Männer" }, description: { fr: "Exercices de Kegel et rééducation pelvienne pour hommes", en: "Kegel exercises and pelvic rehab for men", de: "Kegel-Übungen und Beckenreha für Männer" }, price: 49, duration: "4 sem.", level: "Débutant", image: "🏋️", icd10: "N39.3 · N39.4 · R32" },
    { id: 72, cat: 9, region: { fr: "Renforcement global", en: "Global strengthening", de: "Ganzkörperkräftigung" }, title: { fr: "Marche nordique thérapeutique", en: "Therapeutic Nordic walking", de: "Therapeutisches Nordic Walking" }, description: { fr: "Guide de démarrage et progressions de marche nordique en rééducation", en: "Starter guide and progressions for Nordic walking rehabilitation", de: "Einstieg und Progressionen fürs Nordic Walking in der Reha" }, price: 39, duration: "4 sem.", level: "Débutant", image: "🚶", icd10: "Z72.3 · M54.56" },

    { id: 73, cat: 10, region: { fr: "Mobilité & souplesse", en: "Mobility & flexibility", de: "Mobilität & Beweglichkeit" }, title: { fr: "Mobilité matinale quotidienne", en: "Daily morning mobility", de: "Tägliche Morgenmobilität" }, description: { fr: "Routine de 15 min pour bien démarrer la journée sans douleur", en: "15-minute routine to start the day without pain", de: "15-Minuten-Routine für einen schmerzfreien Start" }, price: 29, duration: "4 sem.", level: "Débutant", image: "🧘", icd10: "M62.40 · M79.60" },
    { id: 74, cat: 10, region: { fr: "Mobilité & souplesse", en: "Mobility & flexibility", de: "Mobilität & Beweglichkeit" }, title: { fr: "Stretching thérapeutique complet", en: "Complete therapeutic stretching", de: "Ganzheitliches therapeutisches Stretching" }, description: { fr: "Programme d'étirements segmentaires du pied à la nuque", en: "Segmental stretching program from feet to neck", de: "Segmentales Dehnprogramm von Fuß bis Nacken" }, price: 39, duration: "4 sem.", level: "Débutant", image: "🧘", icd10: "M25.60 · M79.60" },
    { id: 75, cat: 1, region: { fr: "Colonne vertébrale", en: "Spine", de: "Wirbelsäule" }, title: { fr: "Yoga thérapeutique pour le dos", en: "Therapeutic yoga for the back", de: "Therapeutisches Yoga für den Rücken" }, description: { fr: "Séquences de yoga adaptées pour soulager les douleurs rachidiennes", en: "Adapted yoga sequences to relieve spinal pain", de: "Angepasste Yoga-Sequenzen gegen Wirbelsäulenschmerzen" }, price: 39, duration: "4 sem.", level: "Débutant", image: "🧘", icd10: "M54.56 · F45.40" },
    { id: 76, cat: 4, region: { fr: "Poignet & main", en: "Wrist & hand", de: "Handgelenk & Hand" }, title: { fr: "Mobilisation articulaire des mains", en: "Hand joint mobility", de: "Gelenkmobilisation der Hände" }, description: { fr: "Programme pour arthrose digitale, polyarthrite et rigidité matinale", en: "Program for finger osteoarthritis, arthritis and morning stiffness", de: "Programm bei Fingerarthrose, Arthritis und Morgensteifigkeit" }, price: 39, duration: "4 sem.", level: "Débutant", image: "✋", icd10: "M15.1 · M15.2 · M06.9" },
    { id: 77, cat: 10, region: { fr: "Mobilité & souplesse", en: "Mobility & flexibility", de: "Mobilität & Beweglichkeit" }, title: { fr: "Souplesse des ischio-jambiers raides", en: "Tight hamstring flexibility", de: "Beweglichkeit bei verkürzten Hamstrings" }, description: { fr: "Programme progressif d'allongement musculaire pour le bas du corps", en: "Progressive lower-body muscle lengthening program", de: "Progressives Beweglichkeitsprogramm für die Beinrückseite" }, price: 39, duration: "4 sem.", level: "Débutant", image: "🧘", icd10: "M62.46 · M62.47" },
    { id: 78, cat: 10, region: { fr: "Mobilité & souplesse", en: "Mobility & flexibility", de: "Mobilität & Beweglichkeit" }, title: { fr: "Routine de récupération post-sport", en: "Post-sport recovery routine", de: "Regeneration nach dem Sport" }, description: { fr: "Mobilisation et étirements post-effort pour réduire les courbatures", en: "Post-exercise mobility and stretching to reduce soreness", de: "Mobilisation und Dehnung nach Belastung" }, price: 39, duration: "4 sem.", level: "Débutant", image: "🧘", icd10: "M79.16 · M79.10" },
    { id: 79, cat: 10, region: { fr: "Mobilité & souplesse", en: "Mobility & flexibility", de: "Mobilität & Beweglichkeit" }, title: { fr: "Mobilité thoracique pour sportifs et sédentaires", en: "Thoracic mobility for athletes and sedentary people", de: "Thoraxmobilität für Sportler und Sitzende" }, description: { fr: "Techniques d'ouverture du thorax avec rouleau et exercices actifs", en: "Thoracic opening techniques with roller and active exercises", de: "Thoraxöffnung mit Rolle und aktiven Übungen" }, price: 39, duration: "4 sem.", level: "Débutant", image: "🧘", icd10: "M54.64 · M40.04 · J98.09" },
    { id: 80, cat: 10, region: { fr: "Mobilité & souplesse", en: "Mobility & flexibility", de: "Mobilität & Beweglichkeit" }, title: { fr: "Automassage au rouleau de massage", en: "Foam roller self-massage", de: "Selbstmassage mit Faszienrolle" }, description: { fr: "Guide complet d'utilisation du foam roller par zone corporelle", en: "Complete foam roller guide by body area", de: "Kompletter Faszienrollen-Guide nach Körperregion" }, price: 39, duration: "4 sem.", level: "Débutant", image: "🧘", icd10: "M79.10 · M62.40" },
    { id: 81, cat: 10, region: { fr: "Mobilité & souplesse", en: "Mobility & flexibility", de: "Mobilität & Beweglichkeit" }, title: { fr: "Étirements pour sportifs masters 45+", en: "Stretching for masters athletes 45+", de: "Stretching für Mastersportler 45+" }, description: { fr: "Programme de souplesse adapté aux adultes pratiquant un sport de loisir", en: "Flexibility program for recreational adult athletes", de: "Beweglichkeitsprogramm für erwachsene Freizeitsportler" }, price: 39, duration: "4 sem.", level: "Intermédiaire", image: "🧘", icd10: "M62.40 · M79.60 · Z72.3" },

    { id: 83, cat: 12, region: { fr: "Populations spéciales", en: "Special populations", de: "Besondere Gruppen" }, title: { fr: "Rééducation pendant la grossesse", en: "Rehabilitation during pregnancy", de: "Reha während der Schwangerschaft" }, description: { fr: "Exercices validés pour maintenir la mobilité et soulager les douleurs gestationnelles", en: "Validated exercises to maintain mobility and relieve pregnancy pain", de: "Geeignete Übungen zur Mobilität und Schmerzlinderung in der Schwangerschaft" }, price: 49, duration: "4 sem.", level: "Débutant", image: "👶", icd10: "O26.7 · Z34 · O99.89" },
    { id: 84, cat: 12, region: { fr: "Populations spéciales", en: "Special populations", de: "Besondere Gruppen" }, title: { fr: "Récupération post-accouchement", en: "Postpartum recovery", de: "Rückbildung nach der Geburt" }, description: { fr: "Rééducation périnéale et abdominale progressive après l'accouchement", en: "Progressive pelvic floor and abdominal rehab after birth", de: "Progressive Beckenboden- und Bauchreha nach der Geburt" }, price: 49, duration: "4 sem.", level: "Débutant", image: "👶", icd10: "N99.3 · O90.89 · Z39.2" },
    { id: 85, cat: 12, region: { fr: "Populations spéciales", en: "Special populations", de: "Besondere Gruppen" }, title: { fr: "Fibromyalgie : bouger sans aggraver", en: "Fibromyalgia: move without flare-ups", de: "Fibromyalgie: Bewegen ohne Verschlechterung" }, description: { fr: "Programme doux de mobilisation et renforcement adapté à la fibromyalgie", en: "Gentle mobility and strengthening adapted to fibromyalgia", de: "Sanfte Mobilisation und Kräftigung bei Fibromyalgie" }, price: 49, duration: "4 sem.", level: "Débutant", image: "🌿", icd10: "M79.70 · F45.40" },
    { id: 86, cat: 12, region: { fr: "Populations spéciales", en: "Special populations", de: "Besondere Gruppen" }, title: { fr: "Douleurs chroniques & gestion de la charge", en: "Chronic pain and load management", de: "Chronische Schmerzen und Belastungssteuerung" }, description: { fr: "Approche biopsychosociale avec exercices progressifs et psychoéducation", en: "Biopsychosocial approach with progressive exercise and education", de: "Biopsychosozialer Ansatz mit progressiven Übungen und Edukation" }, price: 49, duration: "4 sem.", level: "Intermédiaire", image: "🌿", icd10: "M79.70 · F45.40 · F32.9" },
    { id: 87, cat: 11, region: { fr: "Neurologie & système nerveux", en: "Neurology & nervous system", de: "Neurologie & Nervensystem" }, title: { fr: "Rééducation après AVC à domicile", en: "Home rehabilitation after stroke", de: "Heimrehabilitation nach Schlaganfall" }, description: { fr: "Exercices de réhabilitation motrice et équilibre post-AVC", en: "Motor and balance rehabilitation exercises after stroke", de: "Motorik- und Gleichgewichtsübungen nach Schlaganfall" }, price: 69, duration: "4 sem.", level: "Avancé", image: "🧠", icd10: "I69.30 · I69.40 · R26.1 · Z50.1!" },
    { id: 88, cat: 11, region: { fr: "Neurologie & système nerveux", en: "Neurology & nervous system", de: "Neurologie & Nervensystem" }, title: { fr: "Parkinson : mobilité & équilibre", en: "Parkinson's: mobility and balance", de: "Parkinson: Mobilität und Gleichgewicht" }, description: { fr: "Programme spécialisé pour maintenir la mobilité et réduire le risque de chute", en: "Specialized program to maintain mobility and reduce fall risk", de: "Spezialprogramm zur Mobilitätserhaltung und Sturzreduktion" }, price: 69, duration: "4 sem.", level: "Avancé", image: "🧠", icd10: "G20 · R26.9 · W19" },
    { id: 89, cat: 11, region: { fr: "Neurologie & système nerveux", en: "Neurology & nervous system", de: "Neurologie & Nervensystem" }, title: { fr: "SEP (sclérose en plaques) : programme adapté", en: "Multiple sclerosis: adapted program", de: "Multiple Sklerose: angepasstes Programm" }, description: { fr: "Exercices de maintien fonctionnel et de gestion de la fatigue", en: "Functional maintenance and fatigue management exercises", de: "Funktionserhalt und Fatigue-Management" }, price: 69, duration: "4 sem.", level: "Avancé", image: "🧠", icd10: "G35 · R53.1 · R26.9" },
    { id: 90, cat: 12, region: { fr: "Populations spéciales", en: "Special populations", de: "Besondere Gruppen" }, title: { fr: "Ostéoporose & renforcement osseux", en: "Osteoporosis and bone strengthening", de: "Osteoporose und Knochenstärkung" }, description: { fr: "Programme de mise en charge progressive et renforcement pour la santé osseuse", en: "Progressive loading and strengthening for bone health", de: "Progressive Belastung und Kräftigung für Knochengesundheit" }, price: 49, duration: "4 sem.", level: "Intermédiaire", image: "🦴", icd10: "M81.0 · M80.08 · E21.3" },
    { id: 91, cat: 12, region: { fr: "Populations spéciales", en: "Special populations", de: "Besondere Gruppen" }, title: { fr: "Sédentarité sévère : premiers pas", en: "Severe inactivity: first steps", de: "Starke Inaktivität: erste Schritte" }, description: { fr: "Programme d'initiation pour personnes très peu actives ou obèses", en: "Starter program for very inactive or obese people", de: "Einstiegsprogramm für sehr inaktive oder adipöse Personen" }, price: 39, duration: "4 sem.", level: "Débutant", image: "🚶", icd10: "Z72.3 · E66.09 · E11.9" },
    { id: 92, cat: 12, region: { fr: "Populations spéciales", en: "Special populations", de: "Besondere Gruppen" }, title: { fr: "Douleurs chroniques chez l'adolescent", en: "Chronic pain in teenagers", de: "Chronische Schmerzen bei Jugendlichen" }, description: { fr: "Programme éducatif et physique adapté aux jeunes souffrant de douleurs persistantes", en: "Educational and physical program for teenagers with persistent pain", de: "Edukatives und körperliches Programm bei persistierenden Schmerzen Jugendlicher" }, price: 49, duration: "4 sem.", level: "Débutant", image: "🌿", icd10: "M79.70 · F45.40 · F32.9" },

    { id: 93, cat: 13, region: { fr: "Bundles & parcours", en: "Bundles & pathways", de: "Bundles & Programme" }, title: { fr: "Bundle Dos complet 12 semaines", en: "Complete back bundle 12 weeks", de: "Komplettes Rücken-Bundle 12 Wochen" }, description: { fr: "Association des programmes lombaires, cervicaux et posturaux en un seul parcours", en: "Lumbar, cervical and posture programs combined in one pathway", de: "Lenden-, Nacken- und Haltungsprogramme in einem Kurs" }, price: 99, duration: "4 sem.", level: "Intermédiaire", image: "📦", icd10: "M54.56 · M54.2 · M40.04" },
    { id: 94, cat: 13, region: { fr: "Bundles & parcours", en: "Bundles & pathways", de: "Bundles & Programme" }, title: { fr: "Pack Senior autonomie & prévention", en: "Senior independence and prevention pack", de: "Seniorenpaket Autonomie & Prävention" }, description: { fr: "Bundle 4 programmes pour les 65+ : chutes, arthrose, mobilité, cardio doux", en: "Four-program bundle for 65+: falls, arthritis, mobility and gentle cardio", de: "Vier Programme für 65+: Stürze, Arthrose, Mobilität und sanftes Cardio" }, price: 99, duration: "4 sem.", level: "Débutant", image: "📦", icd10: "R26.9 · M17.9 · W19 · Z73.6" },
    { id: 95, cat: 13, region: { fr: "Bundles & parcours", en: "Bundles & pathways", de: "Bundles & Programme" }, title: { fr: "Pack sportif blessé : genou + cheville", en: "Injured athlete pack: knee and ankle", de: "Sportverletzten-Paket: Knie und Sprunggelenk" }, description: { fr: "Association des protocoles genou et cheville pour une reprise sportive complète", en: "Knee and ankle protocols combined for complete return to sport", de: "Knie- und Sprunggelenkprotokolle für die Sportrückkehr" }, price: 99, duration: "4 sem.", level: "Avancé", image: "📦", icd10: "M17.9 · M25.37 · M76.5 · M76.6" },
    { id: 96, cat: 13, region: { fr: "Bundles & parcours", en: "Bundles & pathways", de: "Bundles & Programme" }, title: { fr: "Parcours post-op complet membres inférieurs", en: "Complete lower-limb post-op pathway", de: "Kompletter postoperativer Kurs untere Extremität" }, description: { fr: "Bundle hanche + genou + cheville pour les patients opérés des MI", en: "Hip, knee and ankle bundle for lower-limb surgery patients", de: "Hüfte-, Knie- und Sprunggelenk-Bundle nach Operation" }, price: 119, duration: "4 sem.", level: "Avancé", image: "📦", icd10: "Z96.641 · Z96.651 · M25.37" },
    { id: 97, cat: 13, region: { fr: "Bundles & parcours", en: "Bundles & pathways", de: "Bundles & Programme" }, title: { fr: "Programme annuel d'entretien musculo-articulaire", en: "Annual musculoskeletal maintenance program", de: "Jahresprogramm für Muskel- und Gelenkpflege" }, description: { fr: "Abonnement annuel à 12 programmes mensuels glissants avec mises à jour", en: "Annual subscription to 12 rolling monthly programs with updates", de: "Jahresabo mit 12 monatlichen Programmen und Updates" }, price: 149, duration: "4 sem.", level: "Intermédiaire", image: "📦", icd10: "Z72.3 · M25.60 · Z71.89" },
    { id: 98, cat: 13, region: { fr: "Bundles & parcours", en: "Bundles & pathways", de: "Bundles & Programme" }, title: { fr: "Pack TMS & douleurs professionnelles", en: "Work-related MSD and pain pack", de: "Paket für arbeitsbedingte Beschwerden" }, description: { fr: "Association ergonomie, cervicalgies, canal carpien et épicondylite", en: "Ergonomics, neck pain, carpal tunnel and epicondylitis combined", de: "Ergonomie, Nackenschmerz, Karpaltunnel und Epicondylitis kombiniert" }, price: 99, duration: "4 sem.", level: "Débutant", image: "📦", icd10: "M70.9 · M54.2 · G56.0 · M77.1 · Z57.5" },
    { id: 99, cat: 13, region: { fr: "Bundles & parcours", en: "Bundles & pathways", de: "Bundles & Programme" }, title: { fr: "Parcours maman : grossesse + post-partum", en: "Mother pathway: pregnancy and postpartum", de: "Mama-Kurs: Schwangerschaft und Rückbildung" }, description: { fr: "Continuité complète des exercices de la grossesse à la récupération post-accouchement", en: "Complete exercise continuity from pregnancy to postpartum recovery", de: "Durchgängiges Übungsprogramm von Schwangerschaft bis Rückbildung" }, price: 99, duration: "4 sem.", level: "Débutant", image: "📦", icd10: "O26.7 · Z34 · N99.3 · Z39.2" },
    { id: 100, cat: 13, region: { fr: "Bundles & parcours", en: "Bundles & pathways", de: "Bundles & Programme" }, title: { fr: "Pass Accès Total", en: "All Access Pass", de: "Pass Gesamtzugang" }, description: { fr: "Accès illimité à l'ensemble des 99 programmes individuels du catalogue", en: "Unlimited access to all 99 individual catalog programs", de: "Unbegrenzter Zugang zu allen 99 Einzelprogrammen" }, price: 199, duration: "4 sem.", level: "Tous niveaux", image: "🔓", icd10: "Z72.3 · Z50.1! · Z71.89" },
  ];

  const mockPrograms = rawPrograms.map((program) => ({
    ...program,
    weeks: makeWeeks(program.id, program.title),
  }));


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

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const toggleExpand = (id: number) => setExpandedId(expandedId === id ? null : id);
  const { addItem } = useCart();

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-heading font-bold mb-3">
              {tr({ fr: "Tous les programmes", en: "All programs", de: "Alle Programme" })}
            </h1>
            <p className="text-muted-foreground font-body max-w-xl mx-auto">
              {tr({ fr: "Cliquez sur un programme pour voir les détails", en: "Click a program to see details", de: "Klicken Sie auf ein Programm, um Details zu sehen" })}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {mockPrograms.map((program, i) => (
              <Fragment key={program.id}>
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  onClick={() => toggleExpand(program.id)}
                  className={`bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-soft transition-all group cursor-pointer ${expandedId === program.id ? "ring-2 ring-primary/40 border border-primary/30 shadow-lg shadow-primary/10" : "border border-border"}`}
                >
                  <div className="h-36 bg-gradient-to-br from-primary/10 to-secondary flex items-center justify-center text-4xl group-hover:scale-105 transition-transform relative">
                    {program.image}
                    <div className={`absolute top-2 right-2 transition-transform ${expandedId === program.id ? "rotate-180" : ""}`}>
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-[10px] uppercase tracking-wider font-body font-semibold text-primary/80 mb-1">{tr(program.region)}</p>
                    <h3 className="font-body font-semibold text-sm mb-2 line-clamp-2">{tr(program.title)} [{program.icd10}]</h3>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground font-body mb-2">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {program.duration}</span>
                      <span className="flex items-center gap-1"><BarChart3 className="w-3 h-3" /> {program.level}</span>
                    </div>
                    <p className="text-xs text-muted-foreground/80 font-body line-clamp-2 mb-3">{tr(program.description)}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-heading font-bold text-primary">{program.price}€</span>
                      <Button size="sm" className="rounded-full text-xs font-body">
                        <ShoppingBasket className="w-3 h-3" />  Panier
                      </Button>
                      <Button size="sm" className="rounded-full">
                        <Eye className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </motion.div>

                {expandedId === program.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="col-span-full overflow-hidden"
                  >
                    <div className="relative bg-gradient-to-br from-primary/[0.04] via-card to-secondary/20 rounded-2xl border-3 border-primary/50 shadow-lg shadow-primary/5 p-5 mt-2 mb-4">
                      <div className="absolute top-0 left-0 w-1 h-full bg-primary rounded-l-2xl" />
                      <div className="flex items-center gap-2 text-xs text-muted-foreground font-body mb-4">
                        <FileSearch className="w-3 h-3" />
                        <span>{program.price}</span>
                      </div>

                      <div className="grid md:grid-cols-2 gap-5 mb-5">
                        {program.weeks.map((week) => (
                          <div key={week.week} className="border border-border rounded-xl overflow-hidden">
                            <div className="bg-gradient-to-r from-primary/5 to-secondary/30 px-4 py-2.5">
                              <h4 className="font-heading font-semibold text-sm">{tr(week.title)}</h4>
                            </div>
                            <div className="p-3 space-y-3">
                              {week.videos.map((v) => (
                                <div key={v.id} className="group relative bg-card rounded-lg overflow-hidden border border-border/60 hover:border-primary/30 transition-all cursor-pointer">
                                  <div className="flex gap-3 p-2">
                                    <div className="relative w-24 h-16 shrink-0 rounded-md overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/40 flex items-center justify-center">
                                      <span className="text-lg font-heading font-bold text-primary/40">
                                        {v.id.slice(-1)}
                                      </span>
                                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                        {v.free ? (
                                          <div className="w-8 h-8 rounded-full bg-primary/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                                            <PlayCircle className="w-5 h-5 text-white fill-white" />
                                          </div>
                                        ) : (
                                          <Lock className="w-4 h-4 text-muted-foreground/60" />
                                        )}
                                      </div>
                                      <span className="absolute bottom-1 right-1 text-[9px] font-body font-semibold bg-black/50 text-white px-1 py-0.5 rounded">
                                        {v.duration}
                                      </span>
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                      <span className="font-body text-xs leading-snug line-clamp-2">{tr(v.title)}</span>
                                      {v.free && (
                                        <span className="mt-1 self-start text-[9px] font-body font-semibold uppercase bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                                          {tr({ fr: "Aperçu", en: "Preview", de: "Vorschau" })}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-4 mb-5">
                      </div>

                      <div className="flex items-center justify-between border-t border-border pt-4">
                        <span className="text-2xl font-heading font-bold text-primary">{program.price}€</span>
                        <Button
                          className="rounded-full font-body"
                          onClick={(e) => {
                            e.stopPropagation();
                            addItem({
                              id: program.id,
                              title: program.title,
                              price: program.price,
                              image: program.image,
                              region: program.region,
                            });
                            toast({
                              title: tr({ fr: "Ajouté au panier", en: "Added to cart", de: "In den Warenkorb" }),
                              description: tr(program.title),
                            });
                          }}
                        >
                          {tr({ fr: "Ajouter au panier", en: "Add to cart", de: "In den Warenkorb" })}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </Fragment>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ExamplePage;
