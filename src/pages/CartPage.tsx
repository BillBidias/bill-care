/**
 * P13 — Cart page. Purchase intent only.
 * Prices shown here are DISPLAY values derived from the catalogue layer,
 * never authoritative checkout amounts. No order is created here.
 */
import { Link } from "react-router-dom";
import { Trash2, ShoppingCart } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useTr } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { useCatalogue } from "@/hooks/useCatalogue";
import { useAuth } from "@/auth/useAuth";

const CartPage = () => {
  const tr = useTr();
  const { itemIds, removeProgramme, clearCart } = useCart();
  const { programs, loading } = useCatalogue();
  const { user } = useAuth();

  // Derive display data from the catalogue; unknown ids are simply ignored.
  const items = itemIds
    .map((id) => programs.find((p) => p.id === id))
    .filter((p): p is (typeof programs)[number] => Boolean(p));

  /** DISPLAY SUBTOTAL ONLY — not the authoritative checkout total. */
  const displaySubtotal = items.reduce((sum, p) => sum + p.price, 0);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-heading font-bold mb-8">
            {tr({ fr: "Votre panier", en: "Your cart", de: "Ihr Warenkorb" })}
          </h1>

          <div aria-live="polite" aria-busy={loading}>
            {items.length === 0 ? (
              <div className="text-center bg-card rounded-2xl shadow-card py-16 px-6">
                <ShoppingCart className="w-10 h-10 mx-auto mb-4 text-muted-foreground" aria-hidden="true" />
                <p className="font-heading text-xl mb-6">
                  {tr({ fr: "Votre panier est vide", en: "Your cart is empty", de: "Ihr Warenkorb ist leer" })}
                </p>
                <Button asChild className="rounded-full font-body">
                  <Link to="/programs">
                    {tr({ fr: "Découvrir les programmes", en: "Browse programs", de: "Programme entdecken" })}
                  </Link>
                </Button>
              </div>
            ) : (
              <>
                <ul className="space-y-4">
                  {items.map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center gap-4 bg-card rounded-2xl shadow-card p-4"
                    >
                      <div
                        aria-hidden="true"
                        className="w-16 h-16 shrink-0 rounded-xl bg-gradient-to-br from-primary/10 to-secondary flex items-center justify-center text-3xl"
                      >
                        {p.image}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] uppercase tracking-wider font-body font-semibold text-primary/80">
                          {tr(p.region)}
                        </p>
                        <h2 className="font-body font-semibold text-sm line-clamp-2">{tr(p.title)}</h2>
                      </div>
                      <span className="font-heading font-bold text-primary whitespace-nowrap">
                        {p.price} €
                      </span>
                      <button
                        type="button"
                        onClick={() => removeProgramme(p.id)}
                        aria-label={tr({
                          fr: `Retirer ${tr(p.title)} du panier`,
                          en: `Remove ${tr(p.title)} from cart`,
                          de: `${tr(p.title)} aus dem Warenkorb entfernen`,
                        })}
                        className="p-3 rounded-full border border-border text-muted-foreground hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 border-t border-border pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-body text-muted-foreground">
                      {tr({ fr: "Sous-total indicatif", en: "Indicative subtotal", de: "Voraussichtliche Zwischensumme" })}
                    </span>
                    <span className="text-2xl font-heading font-bold text-primary">{displaySubtotal} €</span>
                  </div>
                  <p className="text-xs font-body text-muted-foreground">
                    {tr({
                      fr: "Montant indicatif. Le montant définitif sera calculé de manière sécurisée lors du paiement.",
                      en: "Indicative amount. The final amount will be securely calculated at checkout.",
                      de: "Richtwert. Der endgültige Betrag wird beim Checkout sicher berechnet.",
                    })}
                  </p>

                  <div className="flex flex-wrap gap-3 mt-6">
                    <Button asChild variant="outline" className="rounded-full font-body">
                      <Link to="/programs">
                        {tr({ fr: "Continuer mes achats", en: "Continue shopping", de: "Weiter einkaufen" })}
                      </Link>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="rounded-full font-body"
                      onClick={() => clearCart()}
                    >
                      {tr({ fr: "Vider le panier", en: "Clear cart", de: "Warenkorb leeren" })}
                    </Button>
                    {!user && (
                      <Button asChild variant="outline" className="rounded-full font-body">
                        <Link to="/login">{tr({ fr: "Se connecter", en: "Log in", de: "Anmelden" })}</Link>
                      </Button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CartPage;
