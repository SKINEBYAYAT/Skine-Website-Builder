import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const BOOKING_URL = 'https://form.jotform.com/261913445488062';

export function Hero() {
  const { t, lang } = useLanguage();
  return (
    <section className="editorial-hero" id="home">
      <div className="container mx-auto max-w-7xl px-5 md:px-8">
        <div className="hero-layout">
          <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .65 }} className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-line" /> SKINÉ BY AYAT / {lang === 'ar' ? 'عناية متخصصة بالبشرة' : 'SKINCARE STUDIO'}</div>
            <h1 className="hero-heading">{lang === 'ar' ? <>عناية تبدأ <em>بفهم بشرتكِ.</em></> : <>Skincare begins with <em>understanding.</em></>}</h1>
            <p className="hero-description">{t('hero.para2')}</p>
            <div className="hero-actions">
              <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer" className="hero-cta">{t('hero.cta.primary')} <ArrowUpRight size={20} aria-hidden="true" /></a>
              <a href="#pricing" className="hero-secondary">{t('nav.pricing')} <span aria-hidden="true">↗</span></a>
            </div>
          </motion.div>
          <motion.aside initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7, delay: .15 }} className="hero-aside">
            <div className="hero-aside-top"><span>SKINÉ</span><span>BY AYAT</span></div>
            <div className="hero-aside-content">
              <span className="hero-aside-index">01 / 03</span>
              <p className="hero-aside-title">{lang === 'ar' ? 'كل بشرة لها قصتها.' : 'Every skin has its own story.'}</p>
              <div className="hero-aside-rule" />
              <p className="hero-aside-desc">{t('hero.tagline')}</p>
            </div>
            <a href="#consultation" className="hero-aside-bottom">{t('nav.consultation')} <ArrowUpRight size={18} aria-hidden="true" /></a>
          </motion.aside>
        </div>
        <div className="hero-baseline"><span>SKINÉ BY AYAT</span><span>{lang === 'ar' ? 'استشارة · عناية · نتائج' : 'CONSULTATION · CARE · RESULTS'}</span><span>SCROLL TO EXPLORE ↓</span></div>
      </div>
    </section>
  );
}
