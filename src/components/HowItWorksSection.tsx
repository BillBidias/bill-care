import { motion } from "framer-motion";
import { useI18n, useTr } from "@/lib/i18n";

const HowItWorksSection = () => {
  const { t } = useI18n();
  const tr = useTr();

  return (
    <section className="py-20 bg-gradient-section">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-3">{tr(t.howItWorks.title)}</h2>
          <p className="text-muted-foreground font-body max-w-xl mx-auto">{tr(t.howItWorks.subtitle)}</p>
        </div>
        <div className="grid md:grid-cols-4 gap-6">
          {t.howItWorks.steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="text-center relative"
            >
              {i < 3 && (
                <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-border" />
              )}
              <div className="relative z-10 inline-flex w-16 h-16 items-center justify-center bg-primary/10 rounded-2xl text-2xl mb-4">
                {step.icon}
              </div>
              <div className="bg-card rounded-2xl p-5 shadow-card">
                <span className="text-xs font-body font-bold text-primary mb-1 block">0{i + 1}</span>
                <h3 className="text-lg font-heading font-semibold mb-2">{tr(step.title)}</h3>
                <p className="text-sm text-muted-foreground font-body">{tr(step.desc)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
