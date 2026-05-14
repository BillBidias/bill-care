import { Link } from "react-router-dom";
import { useI18n, useTr } from "@/lib/i18n";

const Footer = () => {
  const { t } = useI18n();
  const tr = useTr();

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
          <div className="flex flex-col gap-2">
            <Link to="/legal" className="text-sm text-primary-foreground/70 hover:text-primary-foreground font-body">{tr(t.footer.legal)}</Link>
            <Link to="/privacy" className="text-sm text-primary-foreground/70 hover:text-primary-foreground font-body">{tr(t.footer.privacy)}</Link>
            <Link to="/terms" className="text-sm text-primary-foreground/70 hover:text-primary-foreground font-body">{tr(t.footer.terms)}</Link>
          </div>
        </div>
        <div className="border-t border-primary-foreground/20 pt-6 text-center">
          <p className="text-xs text-primary-foreground/50 font-body">© {new Date().getFullYear()} Dein Digital-PHYSIO. {tr(t.footer.rights)}.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
