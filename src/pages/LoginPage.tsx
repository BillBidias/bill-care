import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTr } from "@/lib/i18n";
import { useAuth } from "@/auth/useAuth";
import { validateLogin, type FieldErrors } from "@/auth/validation";
import { authMessage } from "@/auth/messages";

const SAFE_RETURN_PATHS = new Set(["/account", "/admin", "/patient", "/cart"]);

function safeLoginReturnPath(path: string | null): string {
  if (!path) return "/patient";
  if (SAFE_RETURN_PATHS.has(path)) return path;
  if (path.startsWith("/patient/session/")) return path;
  return "/patient";
}

const LoginPage = () => {
  const tr = useTr();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const returnPath = safeLoginReturnPath(searchParams.get("from"));

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);
    const errors = validateLogin({ email, password });
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    const result = await signIn(email.trim(), password);
    setSubmitting(false);
    if (result.error) {
      setFormError(result.error);
      return;
    }

    navigate(returnPath);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-28 pb-20">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto bg-card border border-border rounded-2xl p-8 shadow-sm">
            <h1 className="text-2xl font-heading font-bold mb-2">{tr({ fr: "Se connecter", en: "Log in", de: "Anmelden" })}</h1>
            <p className="text-sm text-muted-foreground font-body mb-6">{tr({ fr: "Accédez à votre espace thérapeutique.", en: "Access your therapy space.", de: "Zugang zu Ihrem Therapiebereich." })}</p>

            <form onSubmit={onSubmit} noValidate className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">{tr({ fr: "E-mail", en: "Email", de: "E-Mail" })}</Label>
                <Input id="email" name="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={Boolean(fieldErrors.email)} />
                {fieldErrors.email && <p role="alert" className="text-xs text-destructive font-body">{tr(authMessage(fieldErrors.email))}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">{tr({ fr: "Mot de passe", en: "Password", de: "Passwort" })}</Label>
                <Input id="password" name="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} aria-invalid={Boolean(fieldErrors.password)} />
                {fieldErrors.password && <p role="alert" className="text-xs text-destructive font-body">{tr(authMessage(fieldErrors.password))}</p>}
              </div>
              {formError && <p role="alert" className="text-sm text-destructive font-body">{tr(authMessage(formError))}</p>}
              <Button type="submit" className="w-full" disabled={submitting}>{submitting ? tr({ fr: "Connexion…", en: "Signing in…", de: "Anmeldung…" }) : tr({ fr: "Se connecter", en: "Log in", de: "Anmelden" })}</Button>
            </form>

            <p className="text-sm text-muted-foreground font-body mt-6 text-center">
              {tr({ fr: "Pas encore de compte ?", en: "No account yet?", de: "Noch kein Konto?" })}{" "}
              <Link to={`/register?from=${encodeURIComponent(returnPath)}`} className="text-primary font-semibold hover:underline">{tr({ fr: "Créer un compte", en: "Create an account", de: "Konto erstellen" })}</Link>
            </p>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LoginPage;
