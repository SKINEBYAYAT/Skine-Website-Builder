import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export function Hero() {
  const { lang } = useLanguage();
  return (
    <section className="editorial-hero" id="home">
      <div className="container mx-auto max-w-7xl px-5 md:px-8">
        <div className="hero-layout">
          <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .65 }} className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-line" /> SKINÉ BY AYAT / {lang === 'ar' ? 'عناية متخصصة بالبشرة' : 'SKINCARE STUDIO'}</div>
            <h1 className="hero-heading">{lang === 'ar' ? <>عناية تبدأ <em>بفهم بشرتكِ.</em></> : <>Skincare begins with <em>understanding.</em></>}</h1>

          </motion.div>

        </div>
        <div className="hero-baseline"><span>SKINÉ BY AYAT</span><span>{lang === 'ar' ? 'استشارة · عناية · نتائج' : 'CONSULTATION · CARE · RESULTS'}</span><span className="flex items-center gap-2">SCROLL TO EXPLORE <ArrowDown size={13} aria-hidden="true" /></span></div>
      </div>
    </section>
  );
}
