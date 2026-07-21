import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

export function About() {
  const { t, dir } = useLanguage();

  return (
    <section id="about" className="py-24 bg-card/30">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('about.title')}
            </h2>
            <div className="w-16 h-1 bg-primary mx-auto rounded-full" />
          </div>

          <div className="space-y-5 text-foreground/80 leading-relaxed">
            <p className="text-base md:text-lg font-medium">{t('about.para1')}</p>
            <p className="text-base md:text-lg">{t('about.para2')}</p>
            <p className="text-base md:text-lg font-semibold text-primary italic">{t('about.para3')}</p>
          </div>

          {/* Credential badge */}
          <div className="mt-8 flex justify-center">
            <div className="inline-flex items-center gap-3 bg-background border border-border rounded-2xl px-5 py-3 shadow-sm">
              <p className="text-sm font-semibold text-primary">Skiné by Ayat</p>
              <span className="text-border select-none">·</span>
              <p className="text-xs text-foreground/60">
                {dir === 'rtl'
                  ? 'خبيرة عناية بالبشرة · ٥+ سنوات خبرة'
                  : 'Skincare Expert · 5+ Years Experience'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
