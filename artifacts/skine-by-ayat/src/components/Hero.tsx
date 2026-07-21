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
    <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden bg-background">
      {/* Decorative background blobs */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary/8 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4" />
      </div>

      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-4xl relative z-10 py-16">
        <div className="text-center flex flex-col items-center">

          {/* 1 — Main hero image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            className="mb-10 w-[70vw] sm:w-[45vw] md:w-[38vw] lg:w-[32vw] max-w-sm"
          >
            <img
              src={logo}
              alt="Skiné by Ayat"
              className="w-full h-auto object-contain rounded-3xl"
              style={{
                filter: 'drop-shadow(0 20px 48px rgba(0,0,0,0.12))',
              }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            className="flex flex-col items-center gap-0"
          >
            {/* 2 — Brand label */}
            <span className="inline-block py-1.5 px-4 rounded-full bg-primary/10 text-primary text-sm font-medium mb-7">
              Skiné by Ayat
            </span>

            {/* 3 — Main heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-[1.2] mb-6">
              {t('hero.title')}
            </h1>

            {/* 4 — Description */}
            <p className="text-lg md:text-xl text-foreground/70 mb-10 leading-relaxed max-w-2xl mx-auto">
              {t('hero.subtitle')}
            </p>

            {/* 5 & 6 — CTA buttons */}
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
      </div>
    </section>
  );
}
