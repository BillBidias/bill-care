import { Link } from "react-router-dom";
import { useI18n, useTr } from "@/lib/i18n";
import { useConsent } from "@/lib/consent";

const Footer = () => {
  const { t } = useI18n();
  const tr = useTr();
  const { openSettings } = useConsent();

  const legalLinks = [
    { to: "/impressum", label: tr({ fr: "Mentions légales", en: "Legal notice", de: "Impressum" }) },
    { to: "/privacy", label: tr({ fr: "Confidentialité", en: "Privacy", de: "Datenschutz" }) },
    { to: "/terms", label: tr({ fr: "CGV & CGU", en: "Terms", de: "AGB" }) },
    { to: "/withdrawal", label: tr({ fr: "Rétractation", en: "Withdrawal", de: "Widerruf" }) },
    { to: "/cookies", label: tr({ fr: "Cookies", en: "Cookies", de: "Cookies" }) },
    {
      to: "/medical-disclaimer",
      label: tr({ fr: "Avertissement médical", en: "Medical disclaimer", de: "Medizinischer Hinweis" }),
    },
  ];

  return (
    <footer className="bg-forest py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <span className="text-2xl font-heading font-bold text-primary-foreground">Dein Digital-PHYSIO</span>
            <p className="mt-2 text-sm text-primary-foreground/70 max-w-xs font-body">{tr(t.footer.tagline)}</p>
          </div>
          <div className="flex flex-col gap-2">
            <Link to="/programs" className="text-sm text-primary-foreground/70 hover:text-primary-foreground font-body">{tr(t.nav.programs)}</Link>
            <Link to="/about" className="text-sm text-primary-foreground/70 hover:text-primary-foreground font-body">{tr(t.nav.about)}</Link>
            <Link to="/blog" className="text-sm text-primary-foreground/70 hover:text-primary-foreground font-body">{tr(t.nav.blog)}</Link>
            <Link to="/contact" className="text-sm text-primary-foreground/70 hover:text-primary-foreground font-body">{tr(t.nav.contact)}</Link>
          </div>
          <nav
            className="flex flex-col gap-2"
            aria-label={tr({ fr: "Informations légales", en: "Legal information", de: "Rechtliche Hinweise" })}
          >
            {legalLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="text-sm text-primary-foreground/70 hover:text-primary-foreground font-body"
              >
                {l.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={openSettings}
              className="text-sm text-left text-primary-foreground/70 hover:text-primary-foreground font-body underline"
            >
              {tr({ fr: "Gérer mes cookies", en: "Cookie settings", de: "Cookie-Einstellungen" })}
            </button>
          </nav>
        </div>
        <div className="border-t border-primary-foreground/20 pt-6 text-center">
          <p className="text-xs text-primary-foreground/50 font-body">© {new Date().getFullYear()} Dein Digital-PHYSIO. {tr(t.footer.rights)}.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
