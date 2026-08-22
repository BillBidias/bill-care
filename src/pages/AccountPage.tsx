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

const languageOptions: { value: PreferredLanguage; label: string }[] = [
  { value: "fr", label: "Français" },
  { value: "en", label: "English" },
  { value: "de", label: "Deutsch" },
];

const AccountPage = () => {
  const tr = useTr();
  const { user, signOut } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState<string>("fr");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<"displayName" | "preferredLanguage", string>>
  >({});
  const [saved, setSaved] = useState(false);

  const applyProfile = useCallback((next: Profile) => {
    setProfile(next);
    setDisplayName(next.display_name ?? "");
    setPreferredLanguage(next.preferred_language);
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
    return () => {
      active = false;
    };
  }, [user, applyProfile]);

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
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-28 pb-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto bg-card border border-border rounded-2xl p-8 shadow-sm"
          >
            <h1 className="text-2xl font-heading font-bold mb-2">
              {tr({ fr: "Mon compte", en: "My account", de: "Mein Konto" })}
            </h1>
            <p className="text-sm text-muted-foreground font-body mb-6">
              {tr({
                fr: "Gérez vos informations de profil.",
                en: "Manage your profile information.",
                de: "Verwalten Sie Ihre Profildaten.",
              })}
            </p>

            <div className="space-y-1.5 mb-6">
              <Label htmlFor="account-email">
                {tr({ fr: "E-mail", en: "Email", de: "E-Mail" })}
              </Label>
              <Input id="account-email" type="email" value={user?.email ?? ""} readOnly disabled />
            </div>

            {loading ? (
              <p className="text-sm font-body text-muted-foreground" aria-busy="true">
                {tr({ fr: "Chargement du profil…", en: "Loading profile…", de: "Profil wird geladen…" })}
              </p>
            ) : loadError ? (
              <p role="alert" className="text-sm text-destructive font-body">
                {tr(authMessage(loadError))}
              </p>
            ) : (
              <form onSubmit={onSubmit} noValidate className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="display-name">
                    {tr({ fr: "Nom affiché", en: "Display name", de: "Anzeigename" })}
                  </Label>
                  <Input
                    id="display-name"
                    name="display_name"
                    value={displayName}
                    maxLength={DISPLAY_NAME_MAX_LENGTH + 1}
                    onChange={(e) => setDisplayName(e.target.value)}
                    aria-invalid={Boolean(fieldErrors.displayName)}
                  />
                  {fieldErrors.displayName && (
                    <p role="alert" className="text-xs text-destructive font-body">
                      {tr(authMessage(fieldErrors.displayName))}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="preferred-language">
                    {tr({ fr: "Langue préférée", en: "Preferred language", de: "Bevorzugte Sprache" })}
                  </Label>
                  <select
                    id="preferred-language"
                    name="preferred_language"
                    value={preferredLanguage}
                    onChange={(e) => setPreferredLanguage(e.target.value)}
                    aria-invalid={Boolean(fieldErrors.preferredLanguage)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-body ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    {languageOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.preferredLanguage && (
                    <p role="alert" className="text-xs text-destructive font-body">
                      {tr(authMessage(fieldErrors.preferredLanguage))}
                    </p>
                  )}
                </div>

                {formError && (
                  <p role="alert" className="text-sm text-destructive font-body">
                    {tr(authMessage(formError))}
                  </p>
                )}
                {saved && (
                  <p role="status" className="text-sm text-primary font-body">
                    {tr({ fr: "Profil enregistré.", en: "Profile saved.", de: "Profil gespeichert." })}
                  </p>
                )}

                <Button type="submit" className="w-full" disabled={saving}>
                  {saving
                    ? tr({ fr: "Enregistrement…", en: "Saving…", de: "Wird gespeichert…" })
                    : tr({ fr: "Enregistrer", en: "Save", de: "Speichern" })}
                </Button>
              </form>
            )}

            {profile && (
              <p className="sr-only" data-testid="profile-id">
                {profile.id}
              </p>
            )}

            <Button
              type="button"
              variant="outline"
              className="w-full mt-6"
              onClick={() => void signOut()}
            >
              {tr({ fr: "Se déconnecter", en: "Log out", de: "Abmelden" })}
            </Button>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AccountPage;
