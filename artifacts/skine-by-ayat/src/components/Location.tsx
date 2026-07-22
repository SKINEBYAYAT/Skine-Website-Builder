import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { convertToEmbedUrl } from '@/lib/mapsUtils';

export function Location() {
  const { t } = useLanguage();
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data: Record<string, string>) => {
        const raw = data['maps_url'];
        if (raw && raw.trim()) {
          setEmbedUrl(convertToEmbedUrl(raw.trim()));
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  // Hide section entirely if no map is configured
  if (loaded && !embedUrl) return null;

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
        {embedUrl && (
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
                src={embedUrl}
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
        )}
      </div>
    </section>
  );
}
