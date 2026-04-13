import { motion } from "framer-motion";
import { useI18n, useTr } from "@/lib/i18n";
import { Link } from "react-router-dom";

const CategoriesSection = () => {
  const { t } = useI18n();
  const tr = useTr();

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-3">{tr(t.categories.title)}</h2>
          <p className="text-muted-foreground font-body max-w-xl mx-auto">{tr(t.categories.subtitle)}</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {t.categories.items.map((cat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={`/programs?category=${i}`}
                className={`block bg-gradient-to-br ${cat.color} rounded-2xl p-5 text-center hover:shadow-soft transition-all hover:-translate-y-1 group`}
              >
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{cat.icon}</div>
                <h3 className="text-sm font-body font-semibold text-foreground mb-1">{tr(cat.name)}</h3>
                <p className="text-xs text-muted-foreground font-body">{cat.count} {tr(t.nav.programs).toLowerCase()}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
