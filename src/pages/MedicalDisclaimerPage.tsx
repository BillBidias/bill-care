/**
 * P14 — Medical / health-service disclaimer (conservative, review required).
 * No medical claims, no contraindication lists, no regulatory status implied.
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
        fr: "Ce texte doit être revu par un professionnel du droit et de la santé avant toute publication commerciale.",
        en: "This text must be reviewed by a legal and health professional before any commercial publication.",
        de: "Dieser Text muss vor einer kommerziellen Veröffentlichung rechtlich und fachlich geprüft werden.",
      })}
      sections={[
        {
          heading: tr({ fr: "Nature du service", en: "Nature of the service", de: "Art des Angebots" }),
          body: (
            <p>
              {tr({
                fr: "Les programmes vidéo proposés sont des contenus d’exercices à visée générale. Ils ne remplacent pas un diagnostic médical individualisé, un examen clinique ni un traitement personnalisé lorsque ceux-ci sont nécessaires.",
                en: "The video programmes offered are general exercise content. They do not replace an individualised medical diagnosis, a clinical examination or a personalised treatment where these are needed.",
                de: "Die angebotenen Videoprogramme sind allgemeine Übungsinhalte. Sie ersetzen keine individuelle ärztliche Diagnose, keine klinische Untersuchung und keine persönliche Behandlung, sofern diese erforderlich sind.",
              })}
            </p>
          ),
        },
        {
          heading: tr({ fr: "Avis professionnel", en: "Professional advice", de: "Fachlicher Rat" }),
          body: (
            <p>
              {tr({
                fr: "Suivez en priorité les recommandations professionnelles qui vous ont été données personnellement. En cas de doute sur l’adéquation d’un exercice à votre situation, demandez un avis professionnel adapté avant de commencer.",
                en: "Always give priority to the professional recommendations given to you personally. If you are unsure whether an exercise suits your situation, seek appropriate professional advice before starting.",
                de: "Beachten Sie vorrangig die Ihnen persönlich erteilten fachlichen Empfehlungen. Wenn Sie unsicher sind, ob eine Übung für Ihre Situation geeignet ist, holen Sie vorab geeigneten fachlichen Rat ein.",
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
                fr: "En cas d’urgence, contactez immédiatement les services d’urgence locaux compétents. Ce site ne fournit aucune assistance d’urgence.",
                en: "In an emergency, contact your competent local emergency services immediately. This site provides no emergency assistance.",
                de: "Kontaktieren Sie im Notfall unverzüglich die zuständigen örtlichen Notdienste. Diese Website bietet keine Notfallhilfe.",
              })}
            </p>
          ),
        },
        {
          heading: tr({ fr: "Adéquation individuelle", en: "Individual suitability", de: "Individuelle Eignung" }),
          body: (
            <p>
              {tr({
                fr: "L’adéquation d’un programme ne peut être garantie pour chaque personne. Les contenus sont conçus de manière générale et ne tiennent pas compte de votre situation individuelle.",
                en: "Suitability of a programme cannot be guaranteed for every individual. Content is designed generally and does not take your individual situation into account.",
                de: "Die Eignung eines Programms kann nicht für jede Person garantiert werden. Die Inhalte sind allgemein gestaltet und berücksichtigen Ihre individuelle Situation nicht.",
              })}
            </p>
          ),
        },
        {
          heading: tr({ fr: "Données de santé", en: "Health data", de: "Gesundheitsdaten" }),
          body: (
            <p>
              {tr({
                fr: "Cette version du service ne demande aucune information de santé. Merci de ne transmettre aucune donnée de santé via les formulaires ou votre profil.",
                en: "This version of the service does not request any health information. Please do not submit health data through the forms or your profile.",
                de: "Diese Version des Dienstes fragt keine Gesundheitsinformationen ab. Bitte übermitteln Sie keine Gesundheitsdaten über die Formulare oder Ihr Profil.",
              })}
            </p>
          ),
        },
      ]}
    />
  );
};

export default MedicalDisclaimerPage;
