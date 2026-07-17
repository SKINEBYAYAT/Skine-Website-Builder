import { motion } from 'framer-motion';
import { ArrowRight, CalendarCheck } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

const JOTFORM_URL = 'https://form.jotform.com/261913445488062';

export function Consultation() {
  const { t, dir } = useLanguage();

  return (
    <section id="consultation" className="py-24 bg-card/50">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-3xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('consultation.title')}
          </h2>
          <div className="w-16 h-1 bg-primary mx-auto rounded-full" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-card rounded-3xl shadow-lg border border-card-border p-12 flex flex-col items-center gap-8"
        >
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <CalendarCheck size={36} className="text-primary" />
          </div>

          <div className="space-y-3 max-w-md">
            <p className="text-lg text-foreground/80 leading-relaxed">
              {t('consultation.cta.desc')}
            </p>
          </div>

          <Button
            size="lg"
            className="rounded-full text-base gap-3 px-10 py-6 text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            onClick={() => window.open(JOTFORM_URL, '_blank', 'noopener,noreferrer')}
          >
            {t('hero.cta.primary')}
            <ArrowRight className={dir === 'rtl' ? 'rotate-180' : ''} size={20} />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
