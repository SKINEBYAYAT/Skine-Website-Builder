import { motion } from 'framer-motion';
import { 
  ScanSearch, 
  Sparkles, 
  Droplet, 
  Sun, 
  ShieldCheck, 
  Palette, 
  ListChecks, 
  ShoppingBag, 
  LineChart 
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export function Services() {
  const { t } = useLanguage();

  const services = [
    { id: 1, icon: ScanSearch },
    { id: 2, icon: Sparkles },
    { id: 3, icon: Droplet },
    { id: 4, icon: Sun },
    { id: 5, icon: ShieldCheck },
    { id: 6, icon: Palette },
    { id: 7, icon: ListChecks },
    { id: 8, icon: ShoppingBag },
    { id: 9, icon: LineChart },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <section id="services" className="py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('services.title')}
            </h2>
            <div className="w-16 h-1 bg-primary mx-auto rounded-full"></div>
          </motion.div>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.id}
                variants={itemVariants}
                className="group p-8 rounded-2xl bg-card border border-card-border shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-card-foreground mb-3">
                  {t(`service.${service.id}.title`)}
                </h3>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
