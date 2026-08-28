import { useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Loader2, ShieldCheck, ShoppingCart, Trash2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useI18n, useTr } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { useCatalogue } from "@/hooks/useCatalogue";
import { useAuth } from "@/auth/useAuth";
import { prepareCheckoutSafety, type CheckoutSafetyPreparation } from "@/data/checkoutSafetyRepository";
import { createCheckoutRequestId, createTrustedCheckoutOrder, TrustedCheckoutError } from "@/data/checkoutRepository";
import { createStripeCheckoutSession, redirectToStripeCheckout, PaymentStartError } from "@/data/paymentRepository";
import type { SafetyAnswer } from "@/data/safetyRepository";

const CartPage = () => {
  const { lang } = useI18n();
  const tr = useTr();
  const { itemIds, removeProgramme, clearCart } = useCart();
  const { programs, loading } = useCatalogue();
  const { user } = useAuth();

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [preparation, setPreparation] = useState<CheckoutSafetyPreparation | null>(null);
  const [safetyAnswers, setSafetyAnswers] = useState<SafetyAnswer[]>([]);
  const [acknowledged, setAcknowledged] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const items = itemIds
    .map((id) => programs.find((p) => p.id === id))
    .filter((p): p is (typeof programs)[number] => Boolean(p));
  const displaySubtotal = items.reduce((sum, p) => sum + p.price, 0);

  const openTrustedCheckout = async () => {
    setCheckoutError(null);
    setPreparing(true);
    try {
      const next = await prepareCheckoutSafety(itemIds);
      setPreparation(next);
      setSafetyAnswers([]);
      setAcknowledged(false);
      setCheckoutOpen(true);
    } catch {
      setCheckoutError(tr({
        fr: "La vérification de sécurité du paiement est momentanément indisponible.",
        en: "Checkout safety verification is temporarily unavailable.",
        de: "Die Sicherheitsprüfung für den Checkout ist vorübergehend nicht verfügbar.",
      }));
    } finally {
      setPreparing(false);
    }
  };

  const setAnswer = (questionId: string, answer: boolean) => {
    setSafetyAnswers((current) => [
      ...current.filter((item) => item.questionId !== questionId),
      { questionId, answer },
    ]);
  };

  const allSafetyAnswered = preparation
    ? preparation.questions.every((question) => safetyAnswers.some((item) => item.questionId === question.id))
    : false;

  const startPayment = async () => {
    if (!preparation || !allSafetyAnswered || !acknowledged) return;
    setCheckoutError(null);
    setSubmitting(true);

    try {
      const order = await createTrustedCheckoutOrder({
        programmeIds: itemIds,
        checkoutRequestId: createCheckoutRequestId(),
        safetyAnswers,
        applicableSafetyQuestions: preparation.questions,
        acknowledgementVersion: preparation.acknowledgement.version,
      });
      const stripeSession = await createStripeCheckoutSession(order.orderId);
      redirectToStripeCheckout(stripeSession);
    } catch (error) {
      if (error instanceof TrustedCheckoutError) {
        if (error.code === "programme_not_available_for_checkout") {
          setCheckoutError(tr({
            fr: "Le paiement de ce programme n’est pas encore ouvert. Son contenu doit d’abord passer la validation clinique et la mise en publication.",
            en: "Checkout for this programme is not open yet. Its content must first pass clinical validation and publication.",
            de: "Der Checkout für dieses Programm ist noch nicht freigeschaltet. Der Inhalt muss zuerst klinisch validiert und veröffentlicht werden.",
          }));
        } else if (error.code === "checkout_blocked_red_safety") {
          setCheckoutError(tr({
            fr: "Le paiement est bloqué par la vérification de sécurité. Une évaluation médicale ou professionnelle est recommandée avant tout programme automatique.",
            en: "Checkout is blocked by the safety screening. Medical or professional assessment is recommended before any automatic programme.",
            de: "Der Checkout wurde durch die Sicherheitsprüfung gesperrt. Vor einem automatischen Programm wird eine medizinische oder fachliche Abklärung empfohlen.",
          }));
        } else if (error.code === "checkout_requires_professional_review") {
          setCheckoutError(tr({
            fr: "Le paiement reste bloqué tant qu’un avis professionnel adapté n’a pas été obtenu.",
            en: "Checkout remains blocked until appropriate professional advice has been obtained.",
            de: "Der Checkout bleibt gesperrt, bis eine geeignete fachliche Abklärung erfolgt ist.",
          }));
        } else {
          setCheckoutError(tr({ fr: "La commande sécurisée n’a pas pu être créée.", en: "The secure order could not be created.", de: "Die sichere Bestellung konnte nicht erstellt werden." }));
        }
      } else if (error instanceof PaymentStartError && error.code === "payment_provider_not_configured") {
        setCheckoutError(tr({
          fr: "Stripe n’est pas encore activé pour les paiements réels.",
          en: "Stripe is not yet activated for real payments.",
          de: "Stripe ist für echte Zahlungen noch nicht aktiviert.",
        }));
      } else {
        setCheckoutError(tr({ fr: "Le paiement n’a pas pu être démarré.", en: "Payment could not be started.", de: "Die Zahlung konnte nicht gestartet werden." }));
      }
    } finally {
      setSubmitting(false);
    }
  };

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
                <ShoppingCart className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
                <p className="font-heading text-xl mb-6">{tr({ fr: "Votre panier est vide", en: "Your cart is empty", de: "Ihr Warenkorb ist leer" })}</p>
                <Button asChild className="rounded-full"><Link to="/programs">{tr({ fr: "Découvrir les programmes", en: "Browse programmes", de: "Programme entdecken" })}</Link></Button>
              </div>
            ) : (
              <>
                <ul className="space-y-4">
                  {items.map((p) => (
                    <li key={p.id} className="flex items-center gap-4 bg-card rounded-2xl shadow-card p-4">
                      <div className="w-16 h-16 shrink-0 rounded-xl bg-gradient-to-br from-primary/10 to-secondary flex items-center justify-center text-3xl">{p.image}</div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] uppercase tracking-wider font-semibold text-primary/80">{tr(p.region)}</p>
                        <h2 className="font-body font-semibold text-sm line-clamp-2">{tr(p.title)}</h2>
                      </div>
                      <span className="font-heading font-bold text-primary whitespace-nowrap">{p.price} €</span>
                      <button type="button" onClick={() => removeProgramme(p.id)} className="p-3 rounded-full border border-border text-muted-foreground hover:text-destructive" aria-label={tr({ fr: `Retirer ${tr(p.title)} du panier`, en: `Remove ${tr(p.title)} from cart`, de: `${tr(p.title)} aus dem Warenkorb entfernen` })}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 border-t border-border pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-muted-foreground">{tr({ fr: "Sous-total indicatif", en: "Indicative subtotal", de: "Voraussichtliche Zwischensumme" })}</span>
                    <span className="text-2xl font-heading font-bold text-primary">{displaySubtotal} €</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{tr({ fr: "Le montant définitif est recalculé côté serveur avant Stripe.", en: "The final amount is recalculated server-side before Stripe.", de: "Der endgültige Betrag wird serverseitig vor Stripe neu berechnet." })}</p>

                  {checkoutError && <div role="alert" className="mt-5 rounded-2xl border border-accent bg-accent/10 p-4 text-sm flex gap-3"><AlertTriangle className="w-5 h-5 shrink-0" />{checkoutError}</div>}

                  <div className="flex flex-wrap gap-3 mt-6">
                    <Button asChild variant="outline" className="rounded-full"><Link to="/programs">{tr({ fr: "Continuer mes achats", en: "Continue shopping", de: "Weiter einkaufen" })}</Link></Button>
                    <Button type="button" variant="ghost" className="rounded-full" onClick={clearCart}>{tr({ fr: "Vider le panier", en: "Clear cart", de: "Warenkorb leeren" })}</Button>
                    {!user ? (
                      <Button asChild className="rounded-full"><Link to="/login?from=/cart">{tr({ fr: "Se connecter pour payer", en: "Log in to pay", de: "Zum Bezahlen anmelden" })}</Link></Button>
                    ) : (
                      <Button type="button" className="rounded-full gap-2" onClick={() => void openTrustedCheckout()} disabled={preparing}>
                        {preparing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                        {tr({ fr: "Continuer vers le paiement", en: "Continue to payment", de: "Weiter zur Zahlung" })}
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

      <Dialog open={checkoutOpen} onOpenChange={(open) => !submitting && setCheckoutOpen(open)}>
        <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{tr({ fr: "Dernière vérification avant paiement", en: "Final check before payment", de: "Letzte Prüfung vor der Zahlung" })}</DialogTitle></DialogHeader>
          {preparation && (
            <div className="space-y-5">
              <p className="text-sm text-muted-foreground">{tr({ fr: "Ces réponses sont utilisées uniquement pour revalider la sécurité du checkout et ne sont pas enregistrées dans votre profil.", en: "These answers are used only to revalidate checkout safety and are not stored in your profile.", de: "Diese Antworten werden nur zur erneuten Sicherheitsprüfung des Checkouts verwendet und nicht in Ihrem Profil gespeichert." })}</p>
              {preparation.questions.map((question) => {
                const selected = safetyAnswers.find((item) => item.questionId === question.id)?.answer;
                return (
                  <div key={question.id} className="rounded-2xl border border-border p-4">
                    <p className="font-semibold text-sm mb-2">{tr(question.question)}</p>
                    {question.help[lang] && <p className="text-xs text-muted-foreground mb-3">{question.help[lang]}</p>}
                    <div className="flex gap-2">
                      {[true, false].map((value) => <button key={String(value)} type="button" onClick={() => setAnswer(question.id, value)} className={`px-4 py-2 rounded-full border text-sm font-semibold ${selected === value ? "bg-primary text-primary-foreground border-primary" : "border-border"}`}>{value ? tr({ fr: "Oui", en: "Yes", de: "Ja" }) : tr({ fr: "Non", en: "No", de: "Nein" })}</button>)}
                    </div>
                  </div>
                );
              })}

              <div className="rounded-2xl bg-secondary/60 p-4 text-sm text-muted-foreground whitespace-pre-line">
                <p className="font-semibold text-foreground mb-2">{tr(preparation.acknowledgement.title)}</p>
                {tr(preparation.acknowledgement.body)}
              </div>
              <label className="flex items-start gap-3 rounded-2xl border border-border p-4 cursor-pointer">
                <input type="checkbox" checked={acknowledged} onChange={(event) => setAcknowledged(event.target.checked)} className="mt-1" />
                <span className="text-sm">{tr(preparation.acknowledgement.checkboxLabel)}</span>
              </label>

              {checkoutError && <div role="alert" className="rounded-2xl border border-accent bg-accent/10 p-4 text-sm">{checkoutError}</div>}

              <Button type="button" className="w-full rounded-full" disabled={!allSafetyAnswered || !acknowledged || submitting} onClick={() => void startPayment()}>
                {submitting ? tr({ fr: "Préparation du paiement…", en: "Preparing payment…", de: "Zahlung wird vorbereitet…" }) : tr({ fr: "Payer avec Stripe", en: "Pay with Stripe", de: "Mit Stripe bezahlen" })}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CartPage;
