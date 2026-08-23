/**
 * P14 — Shared layout for legal documents.
 * Renders the document status banner (draft) + version metadata.
 */
import type { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useTr } from "@/lib/i18n";
import { legalDocuments, type LegalDocumentKey } from "@/legal/documents";

export type LegalSection = { heading: string; body: ReactNode };

type Props = {
  docKey: LegalDocumentKey;
  title: string;
  intro?: ReactNode;
  sections: LegalSection[];
};

const LegalLayout = ({ docKey, title, intro, sections }: Props) => {
  const tr = useTr();
  const meta = legalDocuments[docKey];

  const statusLabel = tr({
    fr: "Projet de document — en attente d’informations opérateur et de revue juridique professionnelle. Ce texte n’est pas un conseil juridique et n’est pas approuvé.",
    en: "Draft document — pending operator information and professional legal review. This text is not legal advice and is not approved.",
    de: "Entwurf – ausstehend: Betreiberangaben und professionelle juristische Prüfung. Dieser Text ist keine Rechtsberatung und nicht freigegeben.",
  });

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-20">
        <article className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-heading font-bold mb-3">{title}</h1>
          <p className="text-xs font-body text-muted-foreground mb-4">
            {tr({ fr: "Version", en: "Version", de: "Version" })} {meta.version} ·{" "}
            {tr({ fr: "Date", en: "Date", de: "Datum" })} {meta.effectiveDate} ·{" "}
            {tr({ fr: "Statut", en: "Status", de: "Status" })}:{" "}
            <span data-testid={`doc-status-${docKey}`}>{meta.status}</span>
          </p>
          <p
            role="note"
            className="text-sm font-body bg-secondary text-foreground/80 border border-border rounded-xl p-4 mb-8"
          >
            {statusLabel}
          </p>

          {intro && <div className="text-base font-body text-muted-foreground mb-8">{intro}</div>}

          <div className="space-y-8">
            {sections.map((s, i) => (
              <section key={`${s.heading}-${i}`}>
                <h2 className="text-xl font-heading font-bold mb-2">{s.heading}</h2>
                <div className="text-sm font-body text-muted-foreground space-y-2">{s.body}</div>
              </section>
            ))}
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
};

export default LegalLayout;
