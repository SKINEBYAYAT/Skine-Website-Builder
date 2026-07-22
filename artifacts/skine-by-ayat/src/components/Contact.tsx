import { motion } from 'framer-motion';
import { Instagram } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const INSTAGRAM_URL = 'https://instagram.com/skinebyayat';
const WHATSAPP_NUMBER_DISPLAY = '+961 71 538 316';
const WHATSAPP_URL = 'https://wa.me/96171538316';

function WhatsAppIcon({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="24" cy="24" r="24" fill="#25D366" />
      <path
        d="M34.5 13.5A14.4 14.4 0 0 0 24 9.6C16.05 9.6 9.6 16.05 9.6 24c0 2.55.675 5.025 1.95 7.2L9.6 38.4l7.35-1.925A14.34 14.34 0 0 0 24 38.4c7.95 0 14.4-6.45 14.4-14.4 0-3.85-1.5-7.45-4.05-10.1 0 .075.15.075.15.075v-.475zM24 36.075a11.94 11.94 0 0 1-6.075-1.65l-.435-.262-4.35 1.137 1.163-4.237-.3-.45A11.92 11.92 0 0 1 12.15 24c0-6.525 5.325-11.85 11.85-11.85 3.15 0 6.15 1.238 8.4 3.488a11.81 11.81 0 0 1 3.45 8.362c0 6.525-5.325 11.85-11.85 11.85v-.075zm6.525-8.887c-.356-.188-2.1-1.038-2.437-1.15-.337-.112-.581-.187-.825.188-.262.375-.975 1.15-1.2 1.387-.225.263-.45.3-.806.113-.356-.188-1.5-.563-2.85-1.763-1.05-.938-1.762-2.1-1.987-2.45-.206-.375 0-.563.169-.75.15-.15.356-.413.525-.62.187-.188.244-.338.375-.563.131-.225.075-.45-.038-.638-.112-.188-1.05-2.512-1.462-3.412-.375-.9-.75-.75-1.013-.75h-.862c-.244 0-.637.075-.975.413-.337.374-1.275 1.274-1.275 3.074 0 1.8 1.313 3.563 1.5 3.787.187.225 2.625 3.975 6.338 5.588.9.375 1.575.6 2.1.788.9.281 1.725.243 2.362.15.713-.112 2.25-.938 2.587-1.838.338-.9.338-1.65.225-1.8-.113-.15-.375-.225-.75-.413z"
        fill="white"
      />
    </svg>
  );
}

export function Contact() {
  const { t } = useLanguage();

  return (
    <section id="contact" className="py-24 bg-card/30">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-3xl">
        {/* Heading */}
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

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Instagram card */}
          <motion.a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            whileHover={{ y: -6, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex flex-col items-center gap-5 bg-card border border-border rounded-3xl shadow-md hover:shadow-xl p-10 cursor-pointer transition-shadow duration-300 group"
          >
            <div className="w-20 h-20 rounded-full bg-[#E1306C]/10 flex items-center justify-center group-hover:bg-[#E1306C]/20 transition-colors duration-300">
              <Instagram size={36} className="text-[#E1306C]" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-xl mb-1">Instagram</h3>
              <p className="text-muted-foreground text-base font-medium">@skinebyayat</p>
              <p className="text-muted-foreground text-sm mt-1">
                {t('contact.instagram.subtitle')}
              </p>
            </div>
          </motion.a>

          {/* WhatsApp card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col items-center gap-5 bg-card border border-border rounded-3xl shadow-md hover:shadow-xl p-10 transition-shadow duration-300"
          >
            <div className="w-20 h-20 rounded-full bg-[#25D366]/10 flex items-center justify-center">
              <WhatsAppIcon size={36} />
            </div>
            <div className="text-center flex-1 flex flex-col gap-3">
              <h3 className="font-bold text-xl">WhatsApp</h3>
              <p className="text-foreground font-semibold text-base" dir="ltr">
                {WHATSAPP_NUMBER_DISPLAY}
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {t('whatsapp.desc')}
              </p>
            </div>
            <motion.a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20bb5a] text-white font-semibold text-sm px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-all duration-300"
            >
              <WhatsAppIcon size={18} />
              {t('whatsapp.cta')}
            </motion.a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
