import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

export function Consultation() {
  const { t } = useLanguage();

  return (
    <section id="consultation" className="py-24 bg-card/50">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-4xl">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('consultation.title')}
            </h2>
            <div className="w-16 h-1 bg-primary mx-auto rounded-full"></div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-card rounded-3xl shadow-lg border border-card-border overflow-hidden"
        >
          <iframe 
            src="https://form.jotform.com/261913445488062" 
            width="100%" 
            height="700" 
            style={{ border: 'none' }} 
            title="Consultation Form" 
            loading="lazy"
            className="w-full bg-transparent"
          ></iframe>
        </motion.div>
      </div>
    </section>
  );
}
