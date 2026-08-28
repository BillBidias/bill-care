import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2, AlertTriangle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useTr } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { findOwnOrderByStripeSession, type CheckoutOrderStatus } from "@/data/paymentRepository";

const CheckoutSuccessPage = () => {
  const tr = useTr();
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const sessionId = searchParams.get("session_id") ?? "";
  const [order, setOrder] = useState<CheckoutOrderStatus | null>(null);
  const [checking, setChecking] = useState(true);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      setChecking(false);
      return;
    }

    let cancelled = false;
    let attempts = 0;
    const check = async () => {
      attempts += 1;
      try {
        const result = await findOwnOrderByStripeSession(sessionId);
        if (cancelled) return;
        setOrder(result);
        if (result?.status === "paid") {
          clearCart();
          setChecking(false);
          return;
        }
      } catch {
        // Keep polling briefly: Stripe webhook and browser redirect are asynchronous.
      }

      if (cancelled) return;
      if (attempts >= 12) {
        setChecking(false);
        setTimedOut(true);
        return;
      }
      window.setTimeout(() => void check(), 1500);
    };

    void check();
    return () => { cancelled = true; };
  }, [sessionId, clearCart]);

  const paid = order?.status === "paid";

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-28 pb-20">
        <div className="container mx-auto px-4 max-w-xl">
          <div className="rounded-3xl border border-border bg-card shadow-card p-7 md:p-9 text-center">
            {checking ? (
              <>
                <Loader2 className="w-12 h-12 mx-auto mb-5 text-primary animate-spin" />
                <h1 className="text-2xl font-heading font-bold mb-3">{tr({ fr: "Confirmation du paiement…", en: "Confirming payment…", de: "Zahlung wird bestätigt…" })}</h1>
                <p className="text-sm text-muted-foreground">{tr({ fr: "Nous attendons la confirmation sécurisée de Stripe. L’accès au programme n’est jamais débloqué par le navigateur seul.", en: "We are waiting for Stripe's secure confirmation. Programme access is never unlocked by the browser alone.", de: "Wir warten auf die sichere Bestätigung von Stripe. Der Programmzugang wird niemals allein durch den Browser freigeschaltet." })}</p>
              </>
            ) : paid ? (
              <>
                <CheckCircle2 className="w-12 h-12 mx-auto mb-5 text-primary" />
                <h1 className="text-2xl font-heading font-bold mb-3">{tr({ fr: "Paiement confirmé", en: "Payment confirmed", de: "Zahlung bestätigt" })}</h1>
                <p className="text-sm text-muted-foreground mb-6">{tr({ fr: "Votre commande a été confirmée côté serveur. Votre droit d’accès est maintenant géré automatiquement dans votre espace patient.", en: "Your order was confirmed server-side. Your access entitlement is now managed automatically in your patient area.", de: "Ihre Bestellung wurde serverseitig bestätigt. Ihr Zugangsrecht wird nun automatisch in Ihrem Patientenbereich verwaltet." })}</p>
                <Button asChild className="rounded-full"><Link to="/patient">{tr({ fr: "Ouvrir mon espace", en: "Open my space", de: "Meinen Bereich öffnen" })}</Link></Button>
              </>
            ) : (
              <>
                <AlertTriangle className="w-12 h-12 mx-auto mb-5 text-accent" />
                <h1 className="text-2xl font-heading font-bold mb-3">{tr({ fr: "Confirmation encore en attente", en: "Confirmation still pending", de: "Bestätigung noch ausstehend" })}</h1>
                <p className="text-sm text-muted-foreground mb-6">{timedOut ? tr({ fr: "La confirmation serveur prend plus de temps que prévu. Aucun accès n’a été accordé prématurément.", en: "Server confirmation is taking longer than expected. No access has been granted prematurely.", de: "Die Serverbestätigung dauert länger als erwartet. Es wurde kein Zugang vorzeitig gewährt." }) : tr({ fr: "Le paiement n’est pas encore confirmé.", en: "Payment is not yet confirmed.", de: "Die Zahlung ist noch nicht bestätigt." })}</p>
                <div className="flex justify-center gap-3 flex-wrap">
                  <Button asChild variant="outline" className="rounded-full"><Link to="/cart">{tr({ fr: "Retour au panier", en: "Back to cart", de: "Zurück zum Warenkorb" })}</Link></Button>
                  <Button asChild className="rounded-full"><Link to="/patient">{tr({ fr: "Voir mon espace", en: "View my space", de: "Meinen Bereich ansehen" })}</Link></Button>
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

export default CheckoutSuccessPage;
