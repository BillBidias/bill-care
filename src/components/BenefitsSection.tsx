import { motion } from "framer-motion";
import { useI18n, useTr } from "@/lib/i18n";

const BenefitsSection = () => {
  const { t } = useI18n();
  const tr = useTr();

  return (
    <section className="py-20 bg-gradient-section">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-3">{tr(t.benefits.title)}</h2>
          <p className="text-muted-foreground font-body max-w-xl mx-auto">{tr(t.benefits.subtitle)}</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {t.benefits.items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-2xl p-6 shadow-card hover:shadow-soft transition-shadow group"
            >
              <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">{item.icon}</div>
              <h3 className="text-lg font-heading font-semibold mb-2">{tr(item.title)}</h3>
              <p className="text-sm text-muted-foreground font-body leading-relaxed">{tr(item.desc)}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
