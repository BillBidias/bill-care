/**
 * P10 — Privacy / data-processing inventory reconciled against the current app.
 *
 * Documents CURRENT processing only, derived from the codebase and live schema.
 * Legal bases, retention periods and transfer assessments remain review
 * placeholders unless they are already established facts. They MUST NOT be
 * invented in code.
 */
import type { LocalizedLabel } from "@/lib/i18n";
import { REQUIRED_INPUT } from "./legalConfig";

export type ProcessingActivity = {
  id: string;
  name: LocalizedLabel;
  purpose: LocalizedLabel;
  dataCategories: LocalizedLabel;
  source: LocalizedLabel;
  storage: LocalizedLabel;
  /** Only stated when actually established; otherwise a review placeholder. */
  retention: LocalizedLabel | typeof REQUIRED_INPUT;
  recipients: LocalizedLabel | typeof REQUIRED_INPUT;
  legalBasisReview: typeof REQUIRED_INPUT;
  thirdCountryTransferReview: typeof REQUIRED_INPUT;
  active: boolean;
};

const REVIEW = REQUIRED_INPUT;

export const processingActivities: ProcessingActivity[] = [
  {
    id: "auth",
    name: {
      fr: "Authentification (compte utilisateur)",
      en: "Authentication (user account)",
      de: "Authentifizierung (Nutzerkonto)",
    },
    purpose: {
      fr: "Création de compte, connexion et maintien de la session.",
      en: "Account creation, sign-in and session maintenance.",
      de: "Kontoerstellung, Anmeldung und Sitzungsverwaltung.",
    },
    dataCategories: {
      fr: "Adresse e-mail, identifiant utilisateur, données de session/authentification.",
      en: "Email address, user id, session/authentication data.",
      de: "E-Mail-Adresse, Nutzer-ID, Sitzungs-/Authentifizierungsdaten.",
    },
    source: {
      fr: "Saisie directe par l’utilisateur et données techniques de session.",
      en: "Provided directly by the user plus technical session data.",
      de: "Direkt vom Nutzer angegeben sowie technische Sitzungsdaten.",
    },
    storage: {
      fr: "Supabase Auth ; jeton de session dans le stockage local du navigateur.",
      en: "Supabase Auth; session token in browser local storage.",
      de: "Supabase Auth; Sitzungstoken im lokalen Browser-Speicher.",
    },
    retention: REVIEW,
    recipients: {
      fr: "Supabase, fournisseur d’authentification et de base de données utilisé par le service.",
      en: "Supabase, the authentication and database provider used by the service.",
      de: "Supabase, der vom Dienst genutzte Authentifizierungs- und Datenbankanbieter.",
    },
    legalBasisReview: REVIEW,
    thirdCountryTransferReview: REVIEW,
    active: true,
  },
  {
    id: "profile",
    name: { fr: "Profil utilisateur", en: "User profile", de: "Nutzerprofil" },
    purpose: {
      fr: "Personnalisation de l’affichage et langue préférée.",
      en: "Display personalisation and preferred language.",
      de: "Anzeige-Personalisierung und bevorzugte Sprache.",
    },
    dataCategories: {
      fr: "Nom affiché et langue préférée (fr/en/de).",
      en: "Display name and preferred language (fr/en/de).",
      de: "Anzeigename und bevorzugte Sprache (fr/en/de).",
    },
    source: { fr: "Saisie par l’utilisateur.", en: "Entered by the user.", de: "Vom Nutzer eingegeben." },
    storage: {
      fr: "Table privée « profiles », limitée au compte concerné par RLS.",
      en: "Private “profiles” table, restricted to the owning account by RLS.",
      de: "Private Tabelle „profiles“, durch RLS auf das eigene Konto beschränkt.",
    },
    retention: REVIEW,
    recipients: {
      fr: "Supabase ; utilisateur concerné.",
      en: "Supabase; the relevant user.",
      de: "Supabase; betroffener Nutzer.",
    },
    legalBasisReview: REVIEW,
    thirdCountryTransferReview: REVIEW,
    active: true,
  },
  {
    id: "program-finder",
    name: {
      fr: "Program Finder et orientation non diagnostique",
      en: "Program Finder and non-diagnostic guidance",
      de: "Program Finder und nicht-diagnostische Orientierung",
    },
    purpose: {
      fr: "Orienter vers des programmes pertinents et appliquer les règles de sécurité avant toute recommandation automatique.",
      en: "Guide users towards relevant programmes and apply safety rules before any automated recommendation.",
      de: "Zu passenden Programmen orientieren und Sicherheitsregeln vor jeder automatischen Empfehlung anwenden.",
    },
    dataCategories: {
      fr: "Zone corporelle, symptômes sélectionnés, limitations fonctionnelles, objectif, éventuel code ICD-10, éventuel texte libre et réponses de sécurité. Ces éléments peuvent révéler des informations de santé.",
      en: "Body area, selected symptoms, functional limitations, goal, optional ICD-10 code, optional free text and safety answers. These elements may reveal health information.",
      de: "Körperregion, ausgewählte Symptome, funktionelle Einschränkungen, Ziel, optionaler ICD-10-Code, optionaler Freitext und Sicherheitsantworten. Diese Angaben können Gesundheitsinformationen offenbaren.",
    },
    source: {
      fr: "Réponses saisies ou sélectionnées par l’utilisateur.",
      en: "Answers entered or selected by the user.",
      de: "Vom Nutzer eingegebene oder ausgewählte Antworten.",
    },
    storage: {
      fr: "Traitement transitoire dans l’interface pendant le questionnaire. Les réponses détaillées ne sont pas enregistrées dans le profil ni dans une table utilisateur par le flux actuel.",
      en: "Transient processing in the interface during the questionnaire. Detailed answers are not stored in the profile or in a user table by the current flow.",
      de: "Vorübergehende Verarbeitung in der Oberfläche während des Fragebogens. Detaillierte Antworten werden im aktuellen Ablauf weder im Profil noch in einer Nutzertabelle gespeichert.",
    },
    retention: {
      fr: "Pendant l’utilisation du questionnaire dans l’interface ; pas de conservation applicative persistante identifiée pour les réponses détaillées dans le flux actuel.",
      en: "For the duration of questionnaire use in the interface; no persistent application storage identified for the detailed answers in the current flow.",
      de: "Für die Dauer der Fragebogennutzung in der Oberfläche; im aktuellen Ablauf wurde keine persistente Anwendungsspeicherung der detaillierten Antworten festgestellt.",
    },
    recipients: {
      fr: "Aucun destinataire externe identifié pour les réponses détaillées du Program Finder dans le flux actuel ; la configuration du questionnaire est chargée depuis Supabase.",
      en: "No external recipient identified for detailed Program Finder answers in the current flow; questionnaire configuration is loaded from Supabase.",
      de: "Für detaillierte Program-Finder-Antworten wurde im aktuellen Ablauf kein externer Empfänger festgestellt; die Fragebogenkonfiguration wird aus Supabase geladen.",
    },
    legalBasisReview: REVIEW,
    thirdCountryTransferReview: REVIEW,
    active: true,
  },
  {
    id: "cart",
    name: { fr: "Panier", en: "Cart", de: "Warenkorb" },
    purpose: {
      fr: "Mémoriser les programmes sélectionnés entre les pages et les visites.",
      en: "Remember selected programmes across pages and visits.",
      de: "Ausgewählte Programme über Seiten und Besuche hinweg merken.",
    },
    dataCategories: {
      fr: "Identifiants numériques de programmes.",
      en: "Programme numeric identifiers.",
      de: "Numerische Programmkennungen.",
    },
    source: { fr: "Action de l’utilisateur.", en: "User action.", de: "Nutzeraktion." },
    storage: {
      fr: "Stockage local du navigateur (bill-care:cart:v1).",
      en: "Browser local storage (bill-care:cart:v1).",
      de: "Lokaler Browser-Speicher (bill-care:cart:v1).",
    },
    retention: {
      fr: "Jusqu’à suppression par l’utilisateur ou effacement du stockage du navigateur.",
      en: "Until removed by the user or browser storage is cleared.",
      de: "Bis zur Löschung durch den Nutzer oder zum Leeren des Browser-Speichers.",
    },
    recipients: {
      fr: "Aucun tant que le panier reste local ; les identifiants de programmes sont transmis au backend lorsque l’utilisateur démarre le checkout.",
      en: "None while the cart remains local; programme identifiers are sent to the backend when the user starts checkout.",
      de: "Keine, solange der Warenkorb lokal bleibt; Programmkennungen werden beim Start des Checkouts an das Backend übermittelt.",
    },
    legalBasisReview: REVIEW,
    thirdCountryTransferReview: REVIEW,
    active: true,
  },
  {
    id: "checkout-safety",
    name: {
      fr: "Vérification de sécurité avant paiement",
      en: "Safety verification before payment",
      de: "Sicherheitsprüfung vor der Zahlung",
    },
    purpose: {
      fr: "Revalider la sécurité clinique avant de créer une commande et empêcher un checkout automatique en cas de résultat RED ou AMBER.",
      en: "Revalidate clinical safety before creating an order and block automated checkout for RED or AMBER outcomes.",
      de: "Die klinische Sicherheit vor der Bestellung erneut prüfen und einen automatischen Checkout bei RED- oder AMBER-Ergebnissen blockieren.",
    },
    dataCategories: {
      fr: "Réponses booléennes aux questions de sécurité applicables ; version et horodatage de l’avertissement accepté. Les réponses peuvent révéler des informations de santé.",
      en: "Boolean answers to applicable safety questions; version and timestamp of the accepted safety acknowledgement. The answers may reveal health information.",
      de: "Boolesche Antworten auf anwendbare Sicherheitsfragen; Version und Zeitpunkt der bestätigten Sicherheitserklärung. Die Antworten können Gesundheitsinformationen offenbaren.",
    },
    source: {
      fr: "Réponses et confirmation fournies par l’utilisateur au checkout.",
      en: "Answers and confirmation provided by the user at checkout.",
      de: "Vom Nutzer im Checkout bereitgestellte Antworten und Bestätigung.",
    },
    storage: {
      fr: "Les réponses détaillées sont transmises au RPC de sécurité pour évaluation mais ne sont pas persistées dans les tables de commande. Seuls la version de l’avertissement et son horodatage d’acceptation sont conservés avec la commande.",
      en: "Detailed answers are sent to the safety RPC for evaluation but are not persisted in order tables. Only the acknowledgement version and acceptance timestamp are stored with the order.",
      de: "Detaillierte Antworten werden zur Auswertung an den Sicherheits-RPC übermittelt, jedoch nicht in den Bestelltabellen gespeichert. Nur Version und Zeitpunkt der Bestätigung werden mit der Bestellung gespeichert.",
    },
    retention: REVIEW,
    recipients: {
      fr: "Supabase pour l’évaluation serveur et le stockage de la preuve d’acknowledgement minimale.",
      en: "Supabase for server-side evaluation and storage of the minimal acknowledgement proof.",
      de: "Supabase für die serverseitige Auswertung und Speicherung des minimalen Bestätigungsnachweises.",
    },
    legalBasisReview: REVIEW,
    thirdCountryTransferReview: REVIEW,
    active: true,
  },
  {
    id: "orders",
    name: { fr: "Commandes", en: "Orders", de: "Bestellungen" },
    purpose: {
      fr: "Créer et administrer la commande, conserver un instantané du produit et établir l’état du checkout.",
      en: "Create and administer the order, retain a product snapshot and establish checkout status.",
      de: "Bestellung erstellen und verwalten, Produkt-Snapshot speichern und Checkout-Status festhalten.",
    },
    dataCategories: {
      fr: "Identifiant utilisateur, identifiants de commande, programmes commandés, titre produit, montant, devise, statut, identifiant de requête checkout, version/horodatage de l’acknowledgement de sécurité.",
      en: "User id, order identifiers, ordered programmes, product title, amount, currency, status, checkout request id, safety acknowledgement version/timestamp.",
      de: "Nutzer-ID, Bestellkennungen, bestellte Programme, Produkttitel, Betrag, Währung, Status, Checkout-Anfrage-ID, Version/Zeitpunkt der Sicherheitsbestätigung.",
    },
    source: {
      fr: "Sélection de l’utilisateur et données calculées/validées côté serveur.",
      en: "User selection and data calculated/validated server-side.",
      de: "Nutzerauswahl und serverseitig berechnete/validierte Daten.",
    },
    storage: {
      fr: "Tables privées « orders » et « order_items », avec lecture utilisateur limitée au propriétaire par RLS.",
      en: "Private “orders” and “order_items” tables, with user reads restricted to the owner by RLS.",
      de: "Private Tabellen „orders“ und „order_items“, deren Nutzer-Lesezugriff per RLS auf den Eigentümer beschränkt ist.",
    },
    retention: REVIEW,
    recipients: {
      fr: "Supabase ; utilisateurs administratifs autorisés selon les permissions applicables.",
      en: "Supabase; authorised administrative users according to applicable permissions.",
      de: "Supabase; berechtigte Administrationsnutzer gemäß den anwendbaren Berechtigungen.",
    },
    legalBasisReview: REVIEW,
    thirdCountryTransferReview: REVIEW,
    active: true,
  },
  {
    id: "payments",
    name: { fr: "Paiement Stripe", en: "Stripe payment", de: "Stripe-Zahlung" },
    purpose: {
      fr: "Créer une session de paiement, vérifier le paiement côté serveur et synchroniser le statut de la commande.",
      en: "Create a payment session, verify payment server-side and synchronise order status.",
      de: "Zahlungssitzung erstellen, Zahlung serverseitig prüfen und Bestellstatus synchronisieren.",
    },
    dataCategories: {
      fr: "Identifiants de commande/tentative, identifiant Stripe Checkout Session, identifiant Payment Intent le cas échéant, montant, devise, statuts, type et identifiant d’événement Stripe. Les données de carte saisies sur le checkout hébergé ne sont pas stockées dans les tables applicatives vérifiées.",
      en: "Order/attempt identifiers, Stripe Checkout Session id, Payment Intent id where applicable, amount, currency, statuses, Stripe event type and id. Card data entered on hosted checkout is not stored in the verified application tables.",
      de: "Bestell-/Versuchskennungen, Stripe-Checkout-Session-ID, ggf. Payment-Intent-ID, Betrag, Währung, Status sowie Stripe-Ereignistyp und -ID. Im gehosteten Checkout eingegebene Kartendaten werden nicht in den geprüften Anwendungstabellen gespeichert.",
    },
    source: {
      fr: "Backend de commande, Stripe Checkout et événements webhook Stripe vérifiés côté serveur.",
      en: "Order backend, Stripe Checkout and server-verified Stripe webhook events.",
      de: "Bestell-Backend, Stripe Checkout und serverseitig verifizierte Stripe-Webhook-Ereignisse.",
    },
    storage: {
      fr: "Tables privées « payment_attempts » / « payment_events » et systèmes Stripe pour le traitement du paiement.",
      en: "Private “payment_attempts” / “payment_events” tables and Stripe systems for payment processing.",
      de: "Private Tabellen „payment_attempts“ / „payment_events“ sowie Stripe-Systeme zur Zahlungsabwicklung.",
    },
    retention: REVIEW,
    recipients: {
      fr: "Supabase et Stripe.",
      en: "Supabase and Stripe.",
      de: "Supabase und Stripe.",
    },
    legalBasisReview: REVIEW,
    thirdCountryTransferReview: REVIEW,
    active: true,
  },
  {
    id: "entitlements",
    name: {
      fr: "Droits d’accès aux programmes",
      en: "Programme access entitlements",
      de: "Programmberechtigungen",
    },
    purpose: {
      fr: "Déterminer quels programmes payés ou accordés sont accessibles au compte.",
      en: "Determine which paid or granted programmes the account may access.",
      de: "Bestimmen, auf welche bezahlten oder gewährten Programme das Konto zugreifen darf.",
    },
    dataCategories: {
      fr: "Identifiant utilisateur, programme, type/statut du droit, commande source, dates d’octroi, validité et révocation. Le programme associé peut révéler indirectement des informations sur le parcours thérapeutique.",
      en: "User id, programme, entitlement type/status, source order, grant/validity/revocation dates. The associated programme may indirectly reveal information about the therapeutic pathway.",
      de: "Nutzer-ID, Programm, Art/Status der Berechtigung, Quellbestellung sowie Gewährungs-, Gültigkeits- und Widerrufsdaten. Das zugeordnete Programm kann indirekt Informationen über den therapeutischen Verlauf offenbaren.",
    },
    source: {
      fr: "Backend après statut de paiement autoritatif ou attribution autorisée.",
      en: "Backend after authoritative payment status or authorised grant.",
      de: "Backend nach autoritativem Zahlungsstatus oder berechtigter Zuweisung.",
    },
    storage: {
      fr: "Table privée « entitlements », lecture utilisateur limitée au propriétaire par RLS.",
      en: "Private “entitlements” table, user reads restricted to the owner by RLS.",
      de: "Private Tabelle „entitlements“, Nutzer-Lesezugriff per RLS auf den Eigentümer beschränkt.",
    },
    retention: REVIEW,
    recipients: {
      fr: "Supabase ; utilisateurs administratifs autorisés selon les permissions applicables.",
      en: "Supabase; authorised administrative users according to applicable permissions.",
      de: "Supabase; berechtigte Administrationsnutzer gemäß den anwendbaren Berechtigungen.",
    },
    legalBasisReview: REVIEW,
    thirdCountryTransferReview: REVIEW,
    active: true,
  },
  {
    id: "programme-progress",
    name: {
      fr: "Enrollment et progression thérapeutique",
      en: "Enrollment and therapeutic progress",
      de: "Programmeinschreibung und therapeutischer Fortschritt",
    },
    purpose: {
      fr: "Permettre à l’utilisateur de commencer, poursuivre et suivre son programme et ses exercices réalisés.",
      en: "Allow the user to start, continue and track their programme and completed exercises.",
      de: "Dem Nutzer ermöglichen, sein Programm zu starten, fortzuführen und absolvierte Übungen zu verfolgen.",
    },
    dataCategories: {
      fr: "Identifiant utilisateur, programme, entitlement associé, phase/session courante, statut, dates d’activité, sessions et prescriptions d’exercices réalisées. Ces données liées à un programme thérapeutique peuvent révéler des informations sur la santé ou le parcours de soins.",
      en: "User id, programme, related entitlement, current phase/session, status, activity dates, completed sessions and exercise prescriptions. When linked to a therapeutic programme, these data may reveal health or care-pathway information.",
      de: "Nutzer-ID, Programm, zugehörige Berechtigung, aktuelle Phase/Sitzung, Status, Aktivitätsdaten, abgeschlossene Sitzungen und Übungsverordnungen. In Verbindung mit einem therapeutischen Programm können diese Daten Gesundheits- oder Behandlungsinformationen offenbaren.",
    },
    source: {
      fr: "Actions de l’utilisateur dans la Patient App et état calculé par le backend.",
      en: "User actions in the Patient App and backend-calculated state.",
      de: "Nutzeraktionen in der Patient App und vom Backend berechneter Status.",
    },
    storage: {
      fr: "Tables privées « programme_enrollments », « programme_session_progress » et « programme_exercise_completions », avec lecture limitée au propriétaire par RLS.",
      en: "Private “programme_enrollments”, “programme_session_progress” and “programme_exercise_completions” tables, with reads restricted to the owner by RLS.",
      de: "Private Tabellen „programme_enrollments“, „programme_session_progress“ und „programme_exercise_completions“, deren Lesezugriff per RLS auf den Eigentümer beschränkt ist.",
    },
    retention: REVIEW,
    recipients: {
      fr: "Supabase ; utilisateurs administratifs autorisés lorsque leur rôle le permet.",
      en: "Supabase; authorised administrative users where their role permits it.",
      de: "Supabase; berechtigte Administrationsnutzer, sofern ihre Rolle dies erlaubt.",
    },
    legalBasisReview: REVIEW,
    thirdCountryTransferReview: REVIEW,
    active: true,
  },
  {
    id: "admin",
    name: {
      fr: "Administration, rôles et journal d’audit",
      en: "Administration, roles and audit log",
      de: "Administration, Rollen und Audit-Protokoll",
    },
    purpose: {
      fr: "Gérer les autorisations administratives, les affectations client/admin et tracer les actions administratives sensibles.",
      en: "Manage administrative permissions, customer/admin assignments and trace sensitive administrative actions.",
      de: "Administrative Berechtigungen und Kunden-/Admin-Zuweisungen verwalten sowie sensible Verwaltungsaktionen protokollieren.",
    },
    dataCategories: {
      fr: "Identifiants utilisateur/admin, rôles, affectations, statut, auteur de l’action, type d’action, cible, métadonnées d’audit et horodatages.",
      en: "User/admin identifiers, roles, assignments, status, actor, action type, target, audit metadata and timestamps.",
      de: "Nutzer-/Admin-Kennungen, Rollen, Zuweisungen, Status, handelnde Person, Aktionstyp, Ziel, Audit-Metadaten und Zeitstempel.",
    },
    source: {
      fr: "Actions administratives autorisées et backend RBAC.",
      en: "Authorised administrative actions and RBAC backend.",
      de: "Berechtigte Verwaltungsaktionen und RBAC-Backend.",
    },
    storage: {
      fr: "Tables administratives privées et journal d’audit ; pas de politique client permissive directe pour les tables internes auditées.",
      en: "Private administrative tables and audit log; no direct permissive client policy for audited internal tables.",
      de: "Private Administrationstabellen und Audit-Protokoll; keine direkte permissive Client-Policy für die geprüften internen Tabellen.",
    },
    retention: REVIEW,
    recipients: {
      fr: "Supabase et utilisateurs administratifs autorisés selon leurs permissions.",
      en: "Supabase and authorised administrative users according to their permissions.",
      de: "Supabase und berechtigte Administrationsnutzer gemäß ihren Berechtigungen.",
    },
    legalBasisReview: REVIEW,
    thirdCountryTransferReview: REVIEW,
    active: true,
  },
  {
    id: "catalogue",
    name: { fr: "Catalogue de programmes", en: "Programme catalogue", de: "Programmkatalog" },
    purpose: {
      fr: "Affichage public des programmes et catégories.",
      en: "Public display of programmes and categories.",
      de: "Öffentliche Anzeige von Programmen und Kategorien.",
    },
    dataCategories: {
      fr: "Données produit publiques ; aucune donnée utilisateur dans ce traitement.",
      en: "Public product data; no user data in this processing activity.",
      de: "Öffentliche Produktdaten; keine Nutzerdaten in dieser Verarbeitungstätigkeit.",
    },
    source: { fr: "Contenu de l’éditeur.", en: "Publisher content.", de: "Inhalte des Anbieters." },
    storage: {
      fr: "Tables de contenu destinées à la lecture publique selon leur statut de publication.",
      en: "Content tables intended for public reads according to publication status.",
      de: "Inhaltstabellen für öffentliche Lesezugriffe entsprechend ihrem Veröffentlichungsstatus.",
    },
    retention: REVIEW,
    recipients: REVIEW,
    legalBasisReview: REVIEW,
    thirdCountryTransferReview: REVIEW,
    active: true,
  },
];

/** Current P10 fact: health-related data is processed in Finder/Safety flows. */
export const HEALTH_DATA_PROCESSED = true;

/** Detailed symptom / ICD-10 / safety answers are not persistently stored by the audited current flows. */
export const DETAILED_HEALTH_ANSWERS_PERSISTED = false;

/** Backward-compatible name retained for existing consumers/tests. */
export const HEALTH_DATA_COLLECTED = HEALTH_DATA_PROCESSED;

export const healthDataStatement: LocalizedLabel = {
  fr: "Le service traite des informations pouvant concerner votre santé lorsque vous utilisez le Program Finder ou les vérifications de sécurité (par exemple zone corporelle, symptômes, limitations, éventuel code ICD-10 et réponses de sécurité). Dans les flux actuellement audités, ces réponses détaillées sont conçues pour rester transitoires et ne sont pas enregistrées dans votre profil ni dans les tables de commande. En revanche, le programme thérapeutique acheté ou suivi, les droits d’accès, l’inscription au programme et la progression peuvent eux-mêmes révéler des informations sur votre parcours thérapeutique. La base légale applicable, les conditions relatives aux données sensibles, les durées de conservation, les destinataires et les transferts doivent être validés juridiquement avant la mise en production.",
  en: "The service processes information that may concern your health when you use the Program Finder or safety checks (for example body area, symptoms, limitations, an optional ICD-10 code and safety answers). In the currently audited flows, these detailed answers are designed to remain transient and are not stored in your profile or order tables. However, the therapeutic programme purchased or followed, access entitlements, programme enrollment and progress may themselves reveal information about your therapeutic pathway. The applicable legal basis, conditions for sensitive data, retention periods, recipients and transfers must be legally validated before production release.",
  de: "Der Dienst verarbeitet Informationen, die Ihre Gesundheit betreffen können, wenn Sie den Program Finder oder Sicherheitsprüfungen nutzen (z. B. Körperregion, Symptome, Einschränkungen, optionaler ICD-10-Code und Sicherheitsantworten). In den aktuell geprüften Abläufen sind diese detaillierten Antworten als vorübergehend konzipiert und werden weder in Ihrem Profil noch in den Bestelltabellen gespeichert. Das gekaufte oder genutzte therapeutische Programm, Zugriffsberechtigungen, Programmeinschreibung und Fortschritt können jedoch selbst Informationen über Ihren therapeutischen Verlauf offenbaren. Die anwendbare Rechtsgrundlage, Voraussetzungen für sensible Daten, Aufbewahrungsfristen, Empfänger und Übermittlungen müssen vor dem Produktivstart juristisch validiert werden.",
};
