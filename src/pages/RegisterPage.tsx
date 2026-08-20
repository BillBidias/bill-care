import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTr } from "@/lib/i18n";
import { useAuth } from "@/auth/useAuth";
import { validateRegister, type FieldErrors } from "@/auth/validation";
import { authMessage } from "@/auth/messages";

const RegisterPage = () => {
  const tr = useTr();
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);
    const errors = validateRegister({ email, password, confirmPassword });
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    const result = await signUp(email.trim(), password);
    setSubmitting(false);
    if (result.error) {
      setFormError(result.error);
      return;
    }
    if (result.needsEmailConfirmation) {
      setConfirmationSent(true);
      return;
    }
    navigate("/");
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
              {tr({ fr: "Créer un compte", en: "Create an account", de: "Konto erstellen" })}
            </h1>
            <p className="text-sm text-muted-foreground font-body mb-6">
              {tr({
                fr: "Commencez votre parcours de rééducation.",
                en: "Start your rehabilitation journey.",
                de: "Starten Sie Ihre Rehabilitation.",
              })}
            </p>

            {confirmationSent ? (
              <p role="status" className="text-sm font-body text-foreground">
                {tr({
                  fr: "Vérifiez votre boîte mail pour confirmer votre adresse, puis connectez-vous.",
                  en: "Check your inbox to confirm your email address, then log in.",
                  de: "Prüfen Sie Ihr Postfach, bestätigen Sie Ihre E-Mail und melden Sie sich an.",
                })}
              </p>
            ) : (
              <form onSubmit={onSubmit} noValidate className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">{tr({ fr: "E-mail", en: "Email", de: "E-Mail" })}</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-invalid={Boolean(fieldErrors.email)}
                  />
                  {fieldErrors.email && (
                    <p role="alert" className="text-xs text-destructive font-body">
                      {tr(authMessage(fieldErrors.email))}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password">
                    {tr({ fr: "Mot de passe", en: "Password", de: "Passwort" })}
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    aria-invalid={Boolean(fieldErrors.password)}
                  />
                  {fieldErrors.password && (
                    <p role="alert" className="text-xs text-destructive font-body">
                      {tr(authMessage(fieldErrors.password))}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword">
                    {tr({
                      fr: "Confirmer le mot de passe",
                      en: "Confirm password",
                      de: "Passwort bestätigen",
                    })}
                  </Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    aria-invalid={Boolean(fieldErrors.confirmPassword)}
                  />
                  {fieldErrors.confirmPassword && (
                    <p role="alert" className="text-xs text-destructive font-body">
                      {tr(authMessage(fieldErrors.confirmPassword))}
                    </p>
                  )}
                </div>

                {formError && (
                  <p role="alert" className="text-sm text-destructive font-body">
                    {tr(authMessage(formError))}
                  </p>
                )}

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting
                    ? tr({ fr: "Création…", en: "Creating…", de: "Wird erstellt…" })
                    : tr({ fr: "Créer un compte", en: "Create an account", de: "Konto erstellen" })}
                </Button>
              </form>
            )}

            <p className="text-sm text-muted-foreground font-body mt-6 text-center">
              {tr({ fr: "Déjà inscrit ?", en: "Already registered?", de: "Bereits registriert?" })}{" "}
              <Link to="/login" className="text-primary font-semibold hover:underline">
                {tr({ fr: "Se connecter", en: "Log in", de: "Anmelden" })}
              </Link>
            </p>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RegisterPage;
