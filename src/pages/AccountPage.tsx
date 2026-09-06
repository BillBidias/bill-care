import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTr } from "@/lib/i18n";
import { useAuth } from "@/auth/useAuth";
import { authMessage } from "@/auth/messages";
import {
  DISPLAY_NAME_MAX_LENGTH,
  fetchOwnProfile,
  normalizeDisplayName,
  updateOwnProfile,
  validateProfileUpdate,
  type PreferredLanguage,
  type Profile,
} from "@/data/profileRepository";
import {
  createPrivacyErasureRequest,
  createPrivacyExportRequest,
  downloadPrivacyExport,
  executeOwnPrivacyErasure,
  generateOwnPrivacyExport,
  listOwnPrivacyRequests,
  type PrivacyRequest,
} from "@/data/privacyRepository";

const languageOptions: { value: PreferredLanguage; label: string }[] = [
  { value: "fr", label: "Français" },
  { value: "en", label: "English" },
  { value: "de", label: "Deutsch" },
];

const AccountPage = () => {
  const tr = useTr();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState<string>("fr");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<"displayName" | "preferredLanguage", string>>>({});
  const [saved, setSaved] = useState(false);

  const [privacyRequests, setPrivacyRequests] = useState<PrivacyRequest[]>([]);
  const [privacyLoading, setPrivacyLoading] = useState(true);
  const [privacyWorking, setPrivacyWorking] = useState(false);
  const [privacyError, setPrivacyError] = useState<string | null>(null);
  const [privacySuccess, setPrivacySuccess] = useState(false);

  const [erasureEmail, setErasureEmail] = useState("");
  const [erasureWorking, setErasureWorking] = useState(false);
  const [erasureError, setErasureError] = useState<string | null>(null);

  const applyProfile = useCallback((next: Profile) => {
    setProfile(next);
    setDisplayName(next.display_name ?? "");
    setPreferredLanguage(next.preferred_language);
  }, []);

  const refreshPrivacyRequests = useCallback(async () => {
    setPrivacyLoading(true);
    const result = await listOwnPrivacyRequests();
    if (result.error) setPrivacyError(result.error);
    else {
      setPrivacyRequests(result.requests);
      setPrivacyError(null);
    }
    setPrivacyLoading(false);
  }, []);

  useEffect(() => {
    let active = true;
    if (!user) return;
    setLoading(true);
    fetchOwnProfile(user.id).then((result) => {
      if (!active) return;
      if (result.error) setLoadError(result.error);
      else applyProfile(result.profile);
      setLoading(false);
    });
    void refreshPrivacyRequests();
    return () => {
      active = false;
    };
  }, [user, applyProfile, refreshPrivacyRequests]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (saving || !user) return;
    setFormError(null);
    setSaved(false);

    const errors = validateProfileUpdate({ displayName, preferredLanguage });
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSaving(true);
    const result = await updateOwnProfile(user.id, {
      display_name: normalizeDisplayName(displayName),
      preferred_language: preferredLanguage as PreferredLanguage,
    });
    setSaving(false);

    if (result.error) {
      setFormError(result.error);
      return;
    }
    applyProfile(result.profile);
    setSaved(true);
    window.setTimeout(() => navigate("/"), 1000);
  };

  const onExport = async () => {
    if (privacyWorking) return;
    setPrivacyWorking(true);
    setPrivacyError(null);
    setPrivacySuccess(false);

    const created = await createPrivacyExportRequest();
    let requestId = created.request?.id ?? null;

    if (!requestId && created.error === "privacy.exportAlreadyOpen") {
      const refreshed = await listOwnPrivacyRequests();
      const open = refreshed.error
        ? undefined
        : refreshed.requests.find(
            (request) => request.request_type === "export" && (request.status === "requested" || request.status === "processing"),
          );
      requestId = open?.id ?? null;
    } else if (created.error) {
      setPrivacyError(created.error);
      setPrivacyWorking(false);
      return;
    }

    if (!requestId) {
      setPrivacyError("privacy.exportFailed");
      setPrivacyWorking(false);
      return;
    }

    const generated = await generateOwnPrivacyExport(requestId);
    if (generated.error) {
      setPrivacyError(generated.error);
      setPrivacyWorking(false);
      await refreshPrivacyRequests();
      return;
    }

    downloadPrivacyExport(generated.payload);
    setPrivacySuccess(true);
    setPrivacyWorking(false);
    await refreshPrivacyRequests();
  };

  const onEraseAccount = async () => {
    if (!user?.email || erasureWorking) return;
    setErasureError(null);

    if (erasureEmail.trim().toLowerCase() !== user.email.toLowerCase()) {
      setErasureError("privacy.erasureEmailMismatch");
      return;
    }

    setErasureWorking(true);
    const created = await createPrivacyErasureRequest();
    let requestId = created.request?.id ?? null;

    if (!requestId && created.error === "privacy.erasureAlreadyOpen") {
      const refreshed = await listOwnPrivacyRequests();
      const open = refreshed.error
        ? undefined
        : refreshed.requests.find(
            (request) => request.request_type === "erasure" &&
              (request.status === "requested" || request.status === "processing" || request.status === "partially_fulfilled"),
          );
      requestId = open?.id ?? null;
    } else if (created.error) {
      setErasureError(created.error);
      setErasureWorking(false);
      return;
    }

    if (!requestId) {
      setErasureError("privacy.erasureFailed");
      setErasureWorking(false);
      return;
    }

    const result = await executeOwnPrivacyErasure(requestId);
    if (result.error) {
      setErasureError(result.error);
      setErasureWorking(false);
      await refreshPrivacyRequests();
      return;
    }

    await signOut();
    navigate("/", { replace: true });
  };

  const privacyErrorText = (code: string) => {
    switch (code) {
      case "privacy.unavailable":
        return tr({ fr: "Le service de confidentialité est indisponible.", en: "The privacy service is unavailable.", de: "Der Datenschutzdienst ist nicht verfügbar." });
      case "privacy.loadFailed":
        return tr({ fr: "Impossible de charger vos demandes de confidentialité.", en: "Could not load your privacy requests.", de: "Ihre Datenschutzanfragen konnten nicht geladen werden." });
      case "privacy.requestFailed":
        return tr({ fr: "Impossible de créer la demande.", en: "Could not create the request.", de: "Die Anfrage konnte nicht erstellt werden." });
      case "privacy.erasureEmailMismatch":
        return tr({ fr: "L’adresse e-mail saisie ne correspond pas à votre compte.", en: "The email address does not match your account.", de: "Die eingegebene E-Mail-Adresse stimmt nicht mit Ihrem Konto überein." });
      case "privacy.erasureBlocked":
        return tr({ fr: "La suppression automatique est bloquée car votre compte nécessite une vérification manuelle (par exemple paiement en cours ou rôle administrateur).", en: "Automatic deletion is blocked because your account requires manual review (for example an active payment or administrator role).", de: "Die automatische Löschung ist blockiert, weil Ihr Konto manuell geprüft werden muss (z. B. laufende Zahlung oder Administratorrolle)." });
      case "privacy.erasureFailed":
        return tr({ fr: "La suppression du compte n’a pas pu être finalisée. Votre demande reste enregistrée pour réconciliation.", en: "Account deletion could not be finalised. Your request remains recorded for reconciliation.", de: "Die Kontolöschung konnte nicht abgeschlossen werden. Ihre Anfrage bleibt zur Abstimmung gespeichert." });
      default:
        return tr({ fr: "Impossible de générer l’export de vos données.", en: "Could not generate your data export.", de: "Ihr Datenexport konnte nicht erstellt werden." });
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-28 pb-20">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto space-y-6">
            <section className="bg-card border border-border rounded-2xl p-8 shadow-sm">
              <h1 className="text-2xl font-heading font-bold mb-2">{tr({ fr: "Mon compte", en: "My account", de: "Mein Konto" })}</h1>
              <p className="text-sm text-muted-foreground font-body mb-6">{tr({ fr: "Gérez vos informations de profil.", en: "Manage your profile information.", de: "Verwalten Sie Ihre Profildaten." })}</p>

              <div className="space-y-1.5 mb-6">
                <Label htmlFor="account-email">{tr({ fr: "E-mail", en: "Email", de: "E-Mail" })}</Label>
                <Input id="account-email" type="email" value={user?.email ?? ""} readOnly disabled />
              </div>

              {loading ? (
                <p className="text-sm font-body text-muted-foreground" aria-busy="true">{tr({ fr: "Chargement du profil…", en: "Loading profile…", de: "Profil wird geladen…" })}</p>
              ) : loadError ? (
                <p role="alert" className="text-sm text-destructive font-body">{tr(authMessage(loadError))}</p>
              ) : (
                <form onSubmit={onSubmit} noValidate className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="display-name">{tr({ fr: "Nom affiché", en: "Display name", de: "Anzeigename" })}</Label>
                    <Input id="display-name" name="display_name" value={displayName} maxLength={DISPLAY_NAME_MAX_LENGTH + 1} onChange={(e) => setDisplayName(e.target.value)} aria-invalid={Boolean(fieldErrors.displayName)} />
                    {fieldErrors.displayName && <p role="alert" className="text-xs text-destructive font-body">{tr(authMessage(fieldErrors.displayName))}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="preferred-language">{tr({ fr: "Langue préférée", en: "Preferred language", de: "Bevorzugte Sprache" })}</Label>
                    <select id="preferred-language" name="preferred_language" value={preferredLanguage} onChange={(e) => setPreferredLanguage(e.target.value)} aria-invalid={Boolean(fieldErrors.preferredLanguage)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-body ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                      {languageOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                    {fieldErrors.preferredLanguage && <p role="alert" className="text-xs text-destructive font-body">{tr(authMessage(fieldErrors.preferredLanguage))}</p>}
                  </div>
                  {formError && <p role="alert" className="text-sm text-destructive font-body">{tr(authMessage(formError))}</p>}
                  {saved && <p role="status" className="text-sm text-primary font-body">{tr({ fr: "Profil enregistré.", en: "Profile saved.", de: "Profil gespeichert." })}</p>}
                  <Button type="submit" className="w-full" disabled={saving}>{saving ? tr({ fr: "Enregistrement…", en: "Saving…", de: "Wird gespeichert…" }) : tr({ fr: "Enregistrer", en: "Save", de: "Speichern" })}</Button>
                </form>
              )}

              {profile && <p className="sr-only" data-testid="profile-id">{profile.id}</p>}
              <Button type="button" variant="outline" className="w-full mt-6" onClick={() => void signOut()}>{tr({ fr: "Se déconnecter", en: "Log out", de: "Abmelden" })}</Button>
            </section>

            <section className="bg-card border border-border rounded-2xl p-8 shadow-sm" aria-labelledby="privacy-rights-heading">
              <h2 id="privacy-rights-heading" className="text-xl font-heading font-bold mb-2">{tr({ fr: "Mes données et mes droits", en: "My data and rights", de: "Meine Daten und Rechte" })}</h2>
              <p className="text-sm text-muted-foreground font-body mb-5">{tr({ fr: "Vous pouvez générer une copie JSON sécurisée des données actuellement couvertes par l’export automatisé. Cet export ne remplace pas une évaluation juridique complète d’une demande d’accès.", en: "You can generate a secure JSON copy of the data currently covered by the automated export. This export does not replace a complete legal assessment of an access request.", de: "Sie können eine sichere JSON-Kopie der derzeit vom automatisierten Export erfassten Daten erstellen. Dieser Export ersetzt keine vollständige rechtliche Prüfung eines Auskunftsersuchens." })}</p>

              <Button type="button" className="w-full" onClick={() => void onExport()} disabled={privacyWorking}>{privacyWorking ? tr({ fr: "Préparation de l’export…", en: "Preparing export…", de: "Export wird vorbereitet…" }) : tr({ fr: "Télécharger mes données", en: "Download my data", de: "Meine Daten herunterladen" })}</Button>
              {privacySuccess && <p role="status" className="text-sm text-primary font-body mt-3">{tr({ fr: "Votre export a été généré.", en: "Your export has been generated.", de: "Ihr Export wurde erstellt." })}</p>}
              {privacyError && <p role="alert" className="text-sm text-destructive font-body mt-3">{privacyErrorText(privacyError)}</p>}

              <div className="mt-6">
                <h3 className="text-sm font-heading font-semibold mb-2">{tr({ fr: "Historique des demandes", en: "Request history", de: "Anfrageverlauf" })}</h3>
                {privacyLoading ? (
                  <p className="text-sm text-muted-foreground" aria-busy="true">{tr({ fr: "Chargement…", en: "Loading…", de: "Wird geladen…" })}</p>
                ) : privacyRequests.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{tr({ fr: "Aucune demande enregistrée.", en: "No requests recorded.", de: "Keine Anfragen vorhanden." })}</p>
                ) : (
                  <ul className="space-y-2 text-sm font-body">
                    {privacyRequests.slice(0, 5).map((request) => (
                      <li key={request.id} className="flex items-center justify-between gap-3 border-t border-border pt-2"><span>{request.request_type}</span><span className="text-muted-foreground">{request.status}</span></li>
                    ))}
                  </ul>
                )}
              </div>
            </section>

            <section className="bg-card border border-destructive/40 rounded-2xl p-8 shadow-sm" aria-labelledby="delete-account-heading">
              <h2 id="delete-account-heading" className="text-xl font-heading font-bold mb-2">{tr({ fr: "Supprimer mon compte", en: "Delete my account", de: "Mein Konto löschen" })}</h2>
              <p className="text-sm text-muted-foreground font-body mb-4">{tr({ fr: "Cette action supprime votre profil et vos données thérapeutiques liées au compte. Les données commerciales strictement nécessaires peuvent être conservées séparément après détachement de votre identité, selon les obligations qui devront être validées juridiquement.", en: "This action deletes your profile and therapeutic data linked to the account. Strictly necessary commercial records may be retained separately after your identity is detached, subject to legally validated obligations.", de: "Diese Aktion löscht Ihr Profil und die mit dem Konto verknüpften therapeutischen Daten. Streng erforderliche Geschäftsdaten können nach Trennung Ihrer Identität separat aufbewahrt werden, sofern dies rechtlich bestätigt ist." })}</p>
              <p className="text-sm font-body mb-4">{tr({ fr: "Pour confirmer, saisissez exactement l’adresse e-mail de votre compte.", en: "To confirm, enter your account email address exactly.", de: "Zur Bestätigung geben Sie die E-Mail-Adresse Ihres Kontos exakt ein." })}</p>
              <Label htmlFor="erasure-email">{tr({ fr: "E-mail de confirmation", en: "Confirmation email", de: "Bestätigungs-E-Mail" })}</Label>
              <Input id="erasure-email" type="email" value={erasureEmail} onChange={(event) => setErasureEmail(event.target.value)} className="mt-1.5" autoComplete="off" />
              <Button type="button" variant="destructive" className="w-full mt-4" disabled={erasureWorking || !user?.email} onClick={() => void onEraseAccount()}>{erasureWorking ? tr({ fr: "Suppression en cours…", en: "Deleting account…", de: "Konto wird gelöscht…" }) : tr({ fr: "Supprimer définitivement mon compte", en: "Permanently delete my account", de: "Mein Konto endgültig löschen" })}</Button>
              {erasureError && <p role="alert" className="text-sm text-destructive font-body mt-3">{privacyErrorText(erasureError)}</p>}
            </section>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AccountPage;
