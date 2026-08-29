import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X, Globe, ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { useI18n, useTr, Lang } from "@/lib/i18n";
import { useAuth } from "@/auth/useAuth";

const langs: { code: Lang; label: string }[] = [
  { code: "fr", label: "FR" },
  { code: "en", label: "EN" },
  { code: "de", label: "DE" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { lang, setLang, t } = useI18n();
  const tr = useTr();
  const { itemCount } = useCart();
  const { user, signOut } = useAuth();
  const logoutLabel = tr({ fr: "Se déconnecter", en: "Log out", de: "Abmelden" });
  const patientLabel = tr({ fr: "Mon espace", en: "My space", de: "Mein Bereich" });
  const cartLabel = tr({
    fr: `Panier (${itemCount} programme${itemCount === 1 ? "" : "s"})`,
    en: `Cart (${itemCount} programme${itemCount === 1 ? "" : "s"})`,
    de: `Warenkorb (${itemCount} Programm${itemCount === 1 ? "" : "e"})`,
  });

  const links = [
    { to: "/", label: tr(t.nav.home) },
    { to: "/finder", label: tr({ fr: "Trouver mon programme", en: "Find my programme", de: "Mein Programm finden" }) },
    { to: "/programs", label: tr(t.nav.programs) },
    { to: "/how-it-works", label: tr(t.nav.howItWorks) },
    { to: "/about", label: tr(t.nav.about) },
    { to: "/blog", label: tr(t.nav.blog) },
    { to: "/faq", label: tr(t.nav.faq) },
    { to: "/contact", label: tr(t.nav.contact) },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/98 backdrop-blur-xl shadow-[0_1px_10px_rgba(15,45,34,0.025)]">
      <div className="container mx-auto flex items-center justify-between gap-5 h-[68px] px-4">
        <Link to="/" className="flex shrink-0 items-center gap-3 rounded-xl bg-[#00572f] px-3 py-2 group" aria-label="Dein Digital-PHYSIO">
          <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-white border border-white/10">
            <span className="absolute h-2.5 w-2.5 rounded-full bg-primary -translate-y-[7px]" />
            <span className="absolute h-[5px] w-5 rounded-full bg-primary rotate-[-42deg] translate-y-[5px] translate-x-[-4px]" />
            <span className="absolute h-[5px] w-5 rounded-full bg-primary rotate-[42deg] translate-y-[5px] translate-x-[4px]" />
          </span>
          <span className="leading-[1.05] text-left">
            <span className="block text-[18px] font-extrabold tracking-[-0.03em] text-white">Dein</span>
            <span className="block text-[14px] font-bold tracking-[-0.02em]"><span className="text-[#8ee000]">Digital-</span><span className="text-[#ff7a00]">PHYSIO</span></span>
          </span>
        </Link>

        <div className="hidden min-w-0 flex-1 lg:flex items-center justify-center gap-3 xl:gap-5">
          {links.map((l) => <NavLink key={l.to} to={l.to} className="whitespace-nowrap text-[12px] xl:text-[13px] font-bold text-foreground transition-colors hover:text-foreground">{l.label}</NavLink>)}
        </div>

        <div className="hidden lg:flex shrink-0 items-center gap-3 ml-6">
          <Link to="/cart" aria-label={cartLabel} className="relative grid h-9 w-9 place-items-center rounded-lg border border-border bg-background text-foreground hover:border-primary/25 hover:bg-secondary transition-colors">
            <ShoppingCart className="w-4 h-4" />
            {itemCount > 0 && <span className="absolute -top-1.5 -right-1.5 grid h-5 w-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground ring-2 ring-background">{itemCount}</span>}
          </Link>
          <div className="flex items-center gap-1 border border-border rounded-lg bg-background px-1.5 py-1">
            <Globe className="w-3.5 h-3.5 text-foreground ml-1" />
            {langs.map((l) => <button key={l.code} onClick={() => setLang(l.code)} className={`text-[11px] font-bold px-2 py-1 rounded-md text-foreground transition-colors ${lang === l.code ? "bg-secondary" : "hover:bg-secondary"}`}>{l.label}</button>)}
          </div>
          <div className="flex flex-col gap-1">
            <Button size="sm" className="h-7 px-4 font-bold" asChild><Link to="/finder">{tr(t.nav.startNow)}</Link></Button>
            {user ? <><Button variant="ghost" size="sm" className="h-7 px-4 font-bold text-foreground" asChild><Link to="/patient">{patientLabel}</Link></Button><Button variant="outline" size="sm" className="sr-only" onClick={() => void signOut()}>{logoutLabel}</Button></> : <Button variant="outline" size="sm" className="h-7 px-4 font-bold text-foreground" asChild><Link to="/login">{tr(t.nav.login)}</Link></Button>}
          </div>
        </div>

        <button className="lg:hidden grid h-10 w-10 place-items-center rounded-lg border border-border bg-background" onClick={() => setOpen(!open)} aria-label={open ? "Close menu" : "Open menu"}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden bg-background border-t border-border px-4 py-4 shadow-soft">
          <div className="space-y-0.5">
            {links.map((l) => <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-secondary hover:text-primary">{l.label}</Link>)}
            {user && <Link to="/patient" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-secondary hover:text-primary">{patientLabel}</Link>}
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <Link to="/cart" onClick={() => setOpen(false)} aria-label={cartLabel} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-secondary hover:text-primary"><ShoppingCart className="w-4 h-4" aria-hidden="true" />{tr({ fr: "Panier", en: "Cart", de: "Warenkorb" })}{itemCount > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">{itemCount}</span>}</Link>
            <div className="flex items-center gap-2 px-3 mt-3">{langs.map((l) => <button key={l.code} onClick={() => setLang(l.code)} className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${lang === l.code ? "border-primary/20 bg-secondary text-primary" : "border-border bg-background text-muted-foreground"}`}>{l.label}</button>)}</div>
            <div className="grid grid-cols-2 gap-2 mt-4 px-3">
              {user ? <Button variant="outline" size="sm" onClick={() => { setOpen(false); void signOut(); }}>{logoutLabel}</Button> : <Button variant="outline" size="sm" asChild><Link to="/login" onClick={() => setOpen(false)}>{tr(t.nav.login)}</Link></Button>}
              <Button size="sm" asChild><Link to="/finder" onClick={() => setOpen(false)}>{tr(t.nav.startNow)}</Link></Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
