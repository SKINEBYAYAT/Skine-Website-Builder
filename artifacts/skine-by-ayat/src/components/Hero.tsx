import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import portrait from '@assets/generated_images/hero_skincare.jpg';

const BOOKING_URL = 'https://form.jotform.com/261913445488062';

export function Hero() {
  const { t, lang } = useLanguage();
  return (
    <section className="editorial-hero relative overflow-hidden" id="home">
      <div className="container mx-auto max-w-7xl px-5 md:px-8">
        <div className="editorial-hero-grid grid items-center gap-10 lg:grid-cols-[1.08fr_.92fr] lg:gap-16">
          <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7 }} className="hero-copy relative z-10">
            <div className="eyebrow mb-7">SKINÉ BY AYAT <span /> {lang === 'ar' ? 'عناية متخصصة بالبشرة' : 'PERSONALIZED SKINCARE'}</div>
            <h1 className="hero-heading max-w-[800px]">{lang === 'ar' ? <>بشرتكِ تستحق <em>أن نفهمها.</em></> : <>Your skin deserves to be <em>understood.</em></>}</h1>
            <p className="hero-description mt-7 max-w-[570px]">{t('hero.para2')}</p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer" className="hero-cta inline-flex items-center gap-4 rounded-full px-7 py-4 text-base font-semibold">{t('hero.cta.primary')} <ArrowUpRight size={19} aria-hidden="true" /></a>
              <a href="#pricing" className="hero-secondary inline-flex items-center gap-2 px-3 py-3 text-base font-semibold">{t('nav.pricing')} <span aria-hidden="true">↗</span></a>
            </div>
            <p className="mt-12 border-s-2 border-primary/30 ps-5 text-sm leading-7 text-foreground/65">{t('hero.tagline')}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .9 }} className="hero-image-wrap relative">
            <img src={portrait} alt={lang === 'ar' ? 'صورة عناية بالبشرة' : 'Skincare portrait'} className="hero-image h-full w-full object-cover" />
            <div className="hero-image-label absolute bottom-5 start-5 rounded-full px-5 py-3 text-sm font-medium backdrop-blur-md">{lang === 'ar' ? 'العناية التي تناسب بشرتكِ' : 'Care made for your skin'}</div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
