import type { Lang } from "@/lib/i18n";

type Localized = Record<Lang, string>;

export const authMessages: Record<string, Localized> = {
  "auth.invalidEmail": {
    fr: "Adresse e-mail invalide.",
    en: "Invalid email address.",
    de: "Ungültige E-Mail-Adresse.",
  },
  "auth.passwordRequired": {
    fr: "Le mot de passe est requis.",
    en: "Password is required.",
    de: "Passwort ist erforderlich.",
  },
  "auth.passwordTooShort": {
    fr: "Le mot de passe doit contenir au moins 8 caractères.",
    en: "Password must be at least 8 characters.",
    de: "Das Passwort muss mindestens 8 Zeichen haben.",
  },
  "auth.passwordMismatch": {
    fr: "Les mots de passe ne correspondent pas.",
    en: "Passwords do not match.",
    de: "Die Passwörter stimmen nicht überein.",
  },
  "auth.invalidCredentials": {
    fr: "E-mail ou mot de passe incorrect.",
    en: "Incorrect email or password.",
    de: "E-Mail oder Passwort ist falsch.",
  },
  "auth.emailTaken": {
    fr: "Un compte existe déjà avec cet e-mail.",
    en: "An account already exists with this email.",
    de: "Mit dieser E-Mail existiert bereits ein Konto.",
  },
  "auth.weakPassword": {
    fr: "Mot de passe trop faible ou invalide.",
    en: "Password is too weak or invalid.",
    de: "Passwort ist zu schwach oder ungültig.",
  },
  "auth.emailNotConfirmed": {
    fr: "Veuillez confirmer votre e-mail avant de vous connecter.",
    en: "Please confirm your email before signing in.",
    de: "Bitte bestätigen Sie Ihre E-Mail vor der Anmeldung.",
  },
  "auth.rateLimited": {
    fr: "Trop de tentatives. Réessayez plus tard.",
    en: "Too many attempts. Please try again later.",
    de: "Zu viele Versuche. Bitte später erneut versuchen.",
  },
  "auth.network": {
    fr: "Connexion impossible. Vérifiez votre réseau.",
    en: "Connection failed. Please check your network.",
    de: "Verbindung fehlgeschlagen. Bitte Netzwerk prüfen.",
  },
  "auth.unavailable": {
    fr: "Le service d'authentification est momentanément indisponible.",
    en: "The authentication service is temporarily unavailable.",
    de: "Der Authentifizierungsdienst ist vorübergehend nicht verfügbar.",
  },
  "auth.generic": {
    fr: "Une erreur est survenue. Réessayez.",
    en: "Something went wrong. Please try again.",
    de: "Etwas ist schiefgelaufen. Bitte erneut versuchen.",
  },
  "profile.loadFailed": {
    fr: "Impossible de charger votre profil. Réessayez.",
    en: "Unable to load your profile. Please try again.",
    de: "Ihr Profil konnte nicht geladen werden. Bitte erneut versuchen.",
  },
  "profile.saveFailed": {
    fr: "Impossible d'enregistrer votre profil. Réessayez.",
    en: "Unable to save your profile. Please try again.",
    de: "Ihr Profil konnte nicht gespeichert werden. Bitte erneut versuchen.",
  },
  "profile.missing": {
    fr: "Profil introuvable. Contactez le support.",
    en: "Profile not found. Please contact support.",
    de: "Profil nicht gefunden. Bitte den Support kontaktieren.",
  },
  "profile.invalidLanguage": {
    fr: "Langue invalide.",
    en: "Invalid language.",
    de: "Ungültige Sprache.",
  },
  "profile.displayNameTooLong": {
    fr: "Le nom affiché doit contenir au maximum 100 caractères.",
    en: "Display name must be 100 characters or fewer.",
    de: "Der Anzeigename darf höchstens 100 Zeichen haben.",
  },
};


export function authMessage(key: string): Localized {
  return authMessages[key] ?? authMessages["auth.generic"];
}
