import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import aboutImg from '@assets/generated_images/about_skincare.jpg';

export function About() {
  const { t } = useLanguage();

  return (
    <section id="about" className="py-24 bg-card/30">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="relative h-[400px] md:h-[500px] rounded-3xl overflow-hidden shadow-xl"
          >
            <img 
              src={aboutImg} 
              alt="Skincare products" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-primary/5 mix-blend-overlay"></div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              {t('about.title')}
            </h2>
            <div className="w-16 h-1 bg-primary mb-8 rounded-full"></div>
            <p className="text-lg text-foreground/80 leading-relaxed font-medium">
              {t('about.content')}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
