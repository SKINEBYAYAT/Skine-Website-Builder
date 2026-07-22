import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import logo from '@assets/IMG_7839_1784317781519.jpeg';

export function Hero() {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden bg-background">
      {/* ── Full-width hero image banner ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="w-full"
      >
        <img
          src={logo}
          alt="Skiné by Ayat"
          className="w-full object-cover object-center"
          style={{
            maxHeight: '70vh',
            minHeight: '280px',
            borderBottomLeftRadius: '2rem',
            borderBottomRightRadius: '2rem',
          }}
        />
      </motion.div>

      {/* ── Text content below the image ── */}
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-3xl py-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 }}
          className="text-center"
        >
          {/* Section heading */}
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
            {t('nav.about')}
          </h2>

          {/* About paragraphs */}
          <div className="space-y-5 pb-2 text-right" dir="rtl">
            <p className="text-lg md:text-xl text-foreground/80 leading-relaxed">
              {t('hero.para1')}
            </p>
            <p className="text-lg md:text-xl text-foreground/80 leading-relaxed">
              {t('hero.para2')}
            </p>
            <p className="text-base md:text-lg text-primary font-semibold italic">
              {t('hero.tagline')}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
