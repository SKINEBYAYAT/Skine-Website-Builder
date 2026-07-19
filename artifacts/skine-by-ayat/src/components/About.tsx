import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import aboutImg from '@assets/generated_images/about_skincare.jpg';

export function About() {
  const { t, dir } = useLanguage();

  return (
    <section id="about" className="py-24 bg-card/30">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Image — left in LTR, right in RTL (CSS order handles it) */}
          <motion.div
            initial={{ opacity: 0, x: dir === 'rtl' ? 30 : -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8 }}
            className="relative h-[420px] md:h-[540px] rounded-3xl overflow-hidden shadow-2xl order-2 md:order-1"
          >
            <img
              src={aboutImg}
              alt="Ayat — Skincare Expert"
              className="w-full h-full object-cover object-top"
            />
            {/* Subtle brand overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent" />

            {/* Floating badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="absolute bottom-6 left-6 right-6 bg-background/90 backdrop-blur-sm rounded-2xl px-5 py-4 shadow-lg"
            >
              <p className="text-sm font-semibold text-primary">Skiné by Ayat</p>
              <p className="text-xs text-foreground/70 mt-0.5">
                {dir === 'rtl' ? 'خبيرة عناية بالبشرة · ٥+ سنوات خبرة' : 'Skincare Expert · 5+ Years Experience'}
              </p>
            </motion.div>
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: dir === 'rtl' ? -30 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="order-1 md:order-2"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              {t('about.title')}
            </h2>
            <div className="w-16 h-1 bg-primary mb-8 rounded-full" />

            <div className="space-y-5 text-foreground/80 leading-relaxed">
              <p className="text-base md:text-lg font-medium">
                {t('about.para1')}
              </p>
              <p className="text-base md:text-lg">
                {t('about.para2')}
              </p>
              <p className="text-base md:text-lg font-semibold text-primary italic">
                {t('about.para3')}
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
