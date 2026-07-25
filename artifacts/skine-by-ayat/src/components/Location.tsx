import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// ─── Static embed URL — extracted from live settings.json maps_url ────────────
const EMBED_URL =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3313.282134595997!2d35.52329157628517!3d33.85661912803356!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x151f170038d7e3f7%3A0xdf1878910ef3200c!2sSkin%C3%A9%20By%20Ayat%20Clinic!5e0!3m2!1sen!2slb!4v1784821218341!5m2!1sen!2slb';

export function Location() {
  const { t } = useLanguage();

  return (
    <section id="location" className="py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-3xl">
        {/* Section header */}
        <div className="text-center mb-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('contact.location')}
            </h2>
            <div className="w-16 h-1 bg-primary mx-auto rounded-full" />
          </motion.div>
        </div>

        {/* Map */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.15 }}
        >
          <div className="flex items-center gap-2 mb-6 justify-center text-foreground/60">
            <MapPin size={18} className="text-primary" />
            <span className="text-sm font-medium">{t('contact.location')}</span>
          </div>
          <div className="rounded-3xl overflow-hidden shadow-lg border border-border">
            <iframe
              src={EMBED_URL}
              width="100%"
              height="420"
              style={{ border: 0, display: 'block' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Our location"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
