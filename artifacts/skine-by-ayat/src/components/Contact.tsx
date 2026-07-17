import { motion } from 'framer-motion';
import { MessageSquare, Instagram } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const WHATSAPP_URL = 'https://wa.me/96171538316';
const INSTAGRAM_URL = 'https://instagram.com/skinebyayat';

export function Contact() {
  const { t } = useLanguage();

  return (
    <section id="contact" className="py-24 bg-card/30">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-3xl">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('contact.title')}
            </h2>
            <div className="w-16 h-1 bg-primary mx-auto rounded-full" />
          </motion.div>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          {/* WhatsApp */}
          <motion.a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            whileHover={{ y: -6, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 flex flex-col items-center gap-5 bg-card border border-card-border rounded-3xl shadow-md hover:shadow-xl p-10 cursor-pointer transition-shadow duration-300 group"
          >
            <div className="w-20 h-20 rounded-full bg-[#25D366]/10 flex items-center justify-center group-hover:bg-[#25D366]/20 transition-colors duration-300">
              <MessageSquare size={36} className="text-[#25D366]" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-xl mb-1">WhatsApp</h3>
              <p className="text-muted-foreground text-base font-medium" dir="ltr">
                +961 71 538 316
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                {t('contact.whatsapp.subtitle')}
              </p>
            </div>
          </motion.a>

          {/* Instagram */}
          <motion.a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ y: -6, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 flex flex-col items-center gap-5 bg-card border border-card-border rounded-3xl shadow-md hover:shadow-xl p-10 cursor-pointer transition-shadow duration-300 group"
          >
            <div className="w-20 h-20 rounded-full bg-[#E1306C]/10 flex items-center justify-center group-hover:bg-[#E1306C]/20 transition-colors duration-300">
              <Instagram size={36} className="text-[#E1306C]" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-xl mb-1">Instagram</h3>
              <p className="text-muted-foreground text-base font-medium">
                @skinebyayat
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                {t('contact.instagram.subtitle')}
              </p>
            </div>
          </motion.a>
        </div>
      </div>
    </section>
  );
}
