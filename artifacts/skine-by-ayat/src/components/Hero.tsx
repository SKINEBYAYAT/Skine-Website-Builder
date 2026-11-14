import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

export function Hero() {
  const { lang } = useLanguage();
  return (
    <section className="editorial-hero" id="home">
      <div className="hero-organic-shape hero-organic-shape-one" aria-hidden="true" />
      <div className="hero-organic-shape hero-organic-shape-two" aria-hidden="true" />
      <div className="container mx-auto max-w-7xl px-5 md:px-8">
        <div className="hero-layout">
          <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .65 }} className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-line" /> SKINÉ BY AYAT / {lang === 'ar' ? 'عناية متخصصة بالبشرة' : 'SKINCARE STUDIO'}</div>
            <h1 className="hero-heading">{lang === 'ar' ? <>عناية تبدأ <em>بفهم بشرتكِ.</em></> : <>Skincare begins with <em>understanding.</em></>}</h1>
          </motion.div>
        </div>
      </div>
      <div className="hero-botanical" aria-hidden="true"><span /><span /><span /></div>
    </section>
  );
}
