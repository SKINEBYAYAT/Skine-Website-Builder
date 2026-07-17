import { motion } from 'framer-motion';
import { ArrowRight, Instagram } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import heroImg from '@assets/generated_images/hero_skincare.jpg';

const JOTFORM_URL = 'https://form.jotform.com/261913445488062';
const INSTAGRAM_URL = 'https://instagram.com/skinebyayat';

export function Hero() {
  const { t, dir } = useLanguage();

  return (
    <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 z-0 flex md:flex-row flex-col">
        <div className="w-full md:w-1/2 h-full bg-background relative z-10" />
        <div className="w-full md:w-1/2 h-full relative">
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent md:block hidden z-10" 
               style={{ right: dir === 'rtl' ? 0 : 'auto', left: dir === 'rtl' ? 'auto' : 0, transform: dir === 'rtl' ? 'rotate(180deg)' : 'none' }} />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent md:hidden block z-10" />
          <img 
            src={heroImg} 
            alt="Healthy glowing skin" 
            className="w-full h-full object-cover object-center absolute inset-0"
            loading="lazy"
          />
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl relative z-20">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              Skiné by Ayat
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-[1.2] mb-6">
              {t('hero.title')}
            </h1>
            <p className="text-lg md:text-xl text-foreground/80 mb-10 leading-relaxed max-w-xl">
              {t('hero.subtitle')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
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
