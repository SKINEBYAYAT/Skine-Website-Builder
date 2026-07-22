import { motion } from 'framer-motion';
import { ArrowRight, Instagram } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import logo from '@assets/IMG_7839_1784317781519.jpeg';

const JOTFORM_URL = 'https://form.jotform.com/261913445488062';
const INSTAGRAM_URL = 'https://instagram.com/skinebyayat';

export function Hero() {
  const { t, dir } = useLanguage();

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
          {/* Brand label */}
          <span className="inline-block py-1.5 px-4 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
            Skiné by Ayat
          </span>

          {/* About paragraphs */}
          <div className="space-y-5 mb-10 text-right" dir="rtl">
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

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="rounded-full text-base gap-2 group"
              onClick={() => window.open(JOTFORM_URL, '_blank', 'noopener,noreferrer')}
            >
              {t('hero.cta.primary')}
              <ArrowRight className={dir === 'rtl' ? 'rotate-180' : ''} size={18} />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="rounded-full text-base gap-2"
              asChild
            >
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
                <Instagram size={18} />
                {t('hero.cta.secondary')}
              </a>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
