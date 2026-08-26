import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useTr } from "@/lib/i18n";

const PatientSessionPlaceholderPage = () => {
  const tr = useTr();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-28 pb-20">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="rounded-3xl border border-border bg-card p-8 text-center">
            <h1 className="text-3xl font-heading font-bold mb-3">
              {tr({ fr: "Votre séance", en: "Your session", de: "Ihre Sitzung" })}
            </h1>
            <p className="font-body text-muted-foreground mb-6">
              {tr({
                fr: "Votre progression et votre séance sont bien protégées dans votre compte. L’expérience guidée vidéo sera activée avec M13.",
                en: "Your progress and session are securely linked to your account. The guided video experience will be activated with M13.",
                de: "Ihr Fortschritt und Ihre Sitzung sind sicher mit Ihrem Konto verknüpft. Das geführte Video-Erlebnis wird mit M13 aktiviert.",
              })}
            </p>
            <Button asChild>
              <Link to="/patient">{tr({ fr: "Retour à mon espace", en: "Back to my space", de: "Zurück zu meinem Bereich" })}</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PatientSessionPlaceholderPage;
