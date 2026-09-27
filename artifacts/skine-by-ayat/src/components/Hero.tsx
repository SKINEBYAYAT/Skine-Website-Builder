import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const BOOKING_URL = 'https://form.jotform.com/261913445488062';

export function Hero() {
  const { t, lang } = useLanguage();
  return (
    <section className="editorial-hero relative overflow-hidden" id="home">
      <div className="container mx-auto max-w-7xl px-5 md:px-8">
        <div className="editorial-hero-grid flex items-center justify-center">
          <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7 }} className="hero-copy relative z-10 mx-auto max-w-[900px] text-center">
            <div className="eyebrow mb-7">SKINÉ BY AYAT <span /> {lang === 'ar' ? 'عناية متخصصة بالبشرة' : 'PERSONALIZED SKINCARE'}</div>
            <h1 className="hero-heading mx-auto max-w-[900px]">{lang === 'ar' ? <>بشرتكِ تستحق <em>أن نفهمها.</em></> : <>Your skin deserves to be <em>understood.</em></>}</h1>
            <p className="hero-description mx-auto mt-7 max-w-[660px]">{t('hero.para2')}</p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer" className="hero-cta inline-flex items-center gap-4 rounded-full px-7 py-4 text-base font-semibold">{t('hero.cta.primary')} <ArrowUpRight size={19} aria-hidden="true" /></a>
              <a href="#pricing" className="hero-secondary inline-flex items-center gap-2 px-3 py-3 text-base font-semibold">{t('nav.pricing')} <span aria-hidden="true">↗</span></a>
            </div>
            <p className="mx-auto mt-12 max-w-[520px] border-t border-primary/25 pt-6 text-sm leading-7 text-foreground/65">{t('hero.tagline')}</p>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
