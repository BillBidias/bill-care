/**
 * P15 — Medical / health-service disclaimer reconciliation.
 * Draft only. No diagnosis, individual treatment or regulatory status implied.
 */
import LegalLayout from "@/components/LegalLayout";
import { useTr } from "@/lib/i18n";

const MedicalDisclaimerPage = () => {
  const tr = useTr();

  return (
    <LegalLayout
      docKey="medicalDisclaimer"
      title={tr({
        fr: "Avertissement médical",
        en: "Medical disclaimer",
        de: "Medizinischer Hinweis",
      })}
      intro={tr({
        fr: "Ce document est un brouillon de préproduction et doit être revu juridiquement et cliniquement avant toute publication commerciale.",
        en: "This document is a preproduction draft and requires legal and clinical review before commercial publication.",
        de: "Dieses Dokument ist ein Vorproduktionsentwurf und muss vor einer kommerziellen Veröffentlichung rechtlich und fachlich geprüft werden.",
      })}
      sections={[
        {
          heading: tr({ fr: "Nature du service", en: "Nature of the service", de: "Art des Angebots" }),
          body: (
            <p>
              {tr({
                fr: "Le MVP propose des programmes numériques auto-guidés d’exercices, une orientation non diagnostique et des vérifications de sécurité. Il n’est pas présenté comme un diagnostic médical individualisé, un examen clinique ou un traitement personnalisé.",
                en: "The MVP provides self-guided digital exercise programmes, non-diagnostic guidance and safety checks. It is not presented as an individual medical diagnosis, clinical examination or personalised treatment.",
                de: "Das MVP bietet selbstgeführte digitale Übungsprogramme, nicht-diagnostische Orientierung und Sicherheitsprüfungen. Es wird nicht als individuelle medizinische Diagnose, klinische Untersuchung oder personalisierte Behandlung dargestellt.",
              })}
            </p>
          ),
        },
        {
          heading: tr({ fr: "Orientation et sécurité", en: "Guidance and safety", de: "Orientierung und Sicherheit" }),
          body: (
            <p>
              {tr({
                fr: "Le Program Finder et le Safety Screening servent à orienter et à appliquer des règles de sécurité. Un résultat RED doit bloquer toute recommandation ou progression automatique et orienter vers un professionnel approprié.",
                en: "The Program Finder and Safety Screening are used for guidance and safety rules. A RED result must block automated recommendation or progression and direct the user to an appropriate professional.",
                de: "Program Finder und Safety Screening dienen der Orientierung und Sicherheitsprüfung. Ein RED-Ergebnis muss eine automatische Empfehlung oder Fortführung blockieren und zu einer geeigneten Fachperson verweisen.",
              })}
            </p>
          ),
        },
        {
          heading: tr({ fr: "Avis professionnel", en: "Professional advice", de: "Fachlicher Rat" }),
          body: (
            <p>
              {tr({
                fr: "Suivez en priorité les recommandations professionnelles qui vous ont été données personnellement. En cas de doute sur l’adéquation d’un exercice à votre situation, demandez un avis professionnel adapté avant de commencer ou de poursuivre.",
                en: "Give priority to professional recommendations given to you personally. If you are unsure whether an exercise suits your situation, seek appropriate professional advice before starting or continuing.",
                de: "Beachten Sie vorrangig die Ihnen persönlich erteilten fachlichen Empfehlungen. Wenn Sie unsicher sind, ob eine Übung für Ihre Situation geeignet ist, holen Sie vor Beginn oder Fortsetzung geeigneten fachlichen Rat ein.",
              })}
            </p>
          ),
        },
        {
          heading: tr({ fr: "Symptômes préoccupants", en: "Concerning symptoms", de: "Bedenkliche Symptome" }),
          body: (
            <p>
              {tr({
                fr: "Interrompez l’exercice et faites évaluer votre situation par un professionnel approprié si des symptômes préoccupants, inhabituels ou persistants apparaissent.",
                en: "Stop exercising and have your situation assessed by an appropriate professional if concerning, unusual or persistent symptoms occur.",
                de: "Brechen Sie die Übung ab und lassen Sie Ihre Situation von einer geeigneten Fachperson beurteilen, wenn bedenkliche, ungewöhnliche oder anhaltende Symptome auftreten.",
              })}
            </p>
          ),
        },
        {
          heading: tr({ fr: "Urgences", en: "Emergencies", de: "Notfälle" }),
          body: (
            <p>
              {tr({
                fr: "En cas d’urgence, contactez immédiatement les services d’urgence locaux compétents. Ce service ne fournit aucune assistance d’urgence.",
                en: "In an emergency, contact the competent local emergency services immediately. This service provides no emergency assistance.",
                de: "Kontaktieren Sie im Notfall unverzüglich die zuständigen örtlichen Notdienste. Dieser Dienst bietet keine Notfallhilfe.",
              })}
            </p>
          ),
        },
        {
          heading: tr({ fr: "Données de santé", en: "Health data", de: "Gesundheitsdaten" }),
          body: (
            <p data-testid="medical-health-data-reconciled">
              {tr({
                fr: "Le Program Finder et les vérifications de sécurité peuvent traiter temporairement des informations concernant votre santé, notamment une zone corporelle, des symptômes, des limitations, un éventuel code ICD-10, du texte libre et des réponses de sécurité. Dans les flux actuellement audités, ces réponses détaillées ne sont pas persistées dans votre profil ni dans les tables de commande. Les programmes achetés ou suivis, les droits d’accès, l’inscription et la progression peuvent toutefois révéler indirectement un parcours thérapeutique. Consultez la politique de confidentialité pour le détail des traitements.",
                en: "The Program Finder and safety checks may temporarily process health-related information, including body area, symptoms, limitations, an optional ICD-10 code, free text and safety answers. In the currently audited flows, these detailed answers are not persisted in your profile or order tables. Purchased or followed programmes, access entitlements, enrolment and progress may nevertheless indirectly reveal a therapeutic pathway. See the privacy policy for processing details.",
                de: "Program Finder und Sicherheitsprüfungen können vorübergehend gesundheitsbezogene Informationen verarbeiten, darunter Körperregion, Symptome, Einschränkungen, einen optionalen ICD-10-Code, Freitext und Sicherheitsantworten. In den aktuell geprüften Abläufen werden diese detaillierten Antworten weder im Profil noch in den Bestelltabellen dauerhaft gespeichert. Gekaufte oder genutzte Programme, Zugriffsberechtigungen, Einschreibung und Fortschritt können jedoch indirekt einen therapeutischen Verlauf erkennen lassen. Einzelheiten finden Sie in der Datenschutzerklärung.",
              })}
            </p>
          ),
        },
        {
          heading: tr({ fr: "Qualification juridique", en: "Legal classification", de: "Rechtliche Einordnung" }),
          body: (
            <p>
              {tr({
                fr: "La qualification juridique définitive de l’offre, notamment l’éventuelle application des règles allemandes relatives au contrat de traitement et à la conservation d’une Behandlungsakte (§§ 630a, 630f BGB), reste soumise à une revue juridique avant production.",
                en: "The final legal classification of the service, including any application of German treatment-contract and treatment-record retention rules (§§ 630a, 630f BGB), remains subject to legal review before production.",
                de: "Die endgültige rechtliche Einordnung des Angebots, insbesondere eine mögliche Anwendung der Regeln zum Behandlungsvertrag und zur Aufbewahrung einer Behandlungsakte (§§ 630a, 630f BGB), bedarf vor dem Produktivstart einer juristischen Prüfung.",
              })}
            </p>
          ),
        },
      ]}
    />
  );
};

export default MedicalDisclaimerPage;
