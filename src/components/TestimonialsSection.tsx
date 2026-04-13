import { motion } from "framer-motion";
import { useI18n, useTr } from "@/lib/i18n";
import { Star } from "lucide-react";

const TestimonialsSection = () => {
  const { t } = useI18n();
  const tr = useTr();

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-3">{tr(t.testimonials.title)}</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {t.testimonials.items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-2xl p-6 shadow-card"
            >
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-accent text-accent" />
                ))}
              </div>
              <p className="text-sm text-foreground font-body leading-relaxed mb-4">"{tr(item.text)}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-sm font-body font-bold text-primary">
                  {item.name[0]}
                </div>
                <div>
                  <p className="text-sm font-body font-semibold">{item.name}</p>
                  <p className="text-xs text-muted-foreground font-body">{tr(item.role)}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
