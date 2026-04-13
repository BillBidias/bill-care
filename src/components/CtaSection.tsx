import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useI18n, useTr } from "@/lib/i18n";
import { ArrowRight } from "lucide-react";

const CtaSection = () => {
  const { t } = useI18n();
  const tr = useTr();

  return (
    <section className="py-20 bg-primary relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--accent)/0.2),transparent_60%)]" />
      <div className="container mx-auto px-4 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary-foreground mb-4">
            {tr(t.cta.title)}
          </h2>
          <p className="text-primary-foreground/80 font-body max-w-lg mx-auto mb-8">
            {tr(t.cta.subtitle)}
          </p>
          <Button size="lg" variant="secondary" className="rounded-full px-8 gap-2 font-body font-semibold" asChild>
            <Link to="/programs">
              {tr(t.cta.button)} <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default CtaSection;
