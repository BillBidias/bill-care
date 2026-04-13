import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n, useTr, Lang } from "@/lib/i18n";

const langs: { code: Lang; label: string }[] = [
  { code: "fr", label: "FR" },
  { code: "en", label: "EN" },
  { code: "de", label: "DE" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { lang, setLang, t } = useI18n();
  const tr = useTr();

  const links = [
    { to: "/", label: tr(t.nav.home) },
    { to: "/programs", label: tr(t.nav.programs) },
    { to: "/how-it-works", label: tr(t.nav.howItWorks) },
    { to: "/about", label: tr(t.nav.about) },
    { to: "/blog", label: tr(t.nav.blog) },
    { to: "/faq", label: tr(t.nav.faq) },
    { to: "/contact", label: tr(t.nav.contact) },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-heading text-gradient-primary">
            <span className="text-2xl">Bill</span><span className="font-bold text-4xl">CARE</span>
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden lg:flex items-center gap-6">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="text-sm font-body font-medium text-muted-foreground hover:text-primary transition-colors">
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <div className="flex items-center gap-1 border border-border rounded-full px-2 py-1">
            <Globe className="w-3.5 h-3.5 text-muted-foreground" />
            {langs.map((l) => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                className={`text-xs font-medium px-1.5 py-0.5 rounded-full transition-colors ${lang === l.code ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {l.label}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/login">{tr(t.nav.login)}</Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/programs">{tr(t.nav.startNow)}</Link>
          </Button>
        </div>

        {/* Mobile toggle */}
        <button className="lg:hidden p-2" onClick={() => setOpen(!open)}>
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden bg-card border-b border-border px-4 pb-4">
          {links.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="block py-2 text-sm font-medium text-muted-foreground hover:text-primary">
              {l.label}
            </Link>
          ))}
          <div className="flex items-center gap-2 mt-3">
            {langs.map((l) => (
              <button key={l.code} onClick={() => setLang(l.code)} className={`text-xs font-medium px-2 py-1 rounded-full ${lang === l.code ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{l.label}</button>
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <Button variant="outline" size="sm" className="flex-1" asChild><Link to="/login">{tr(t.nav.login)}</Link></Button>
            <Button size="sm" className="flex-1" asChild><Link to="/programs">{tr(t.nav.startNow)}</Link></Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
