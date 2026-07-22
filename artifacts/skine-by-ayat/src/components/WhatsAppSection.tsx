import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

const WHATSAPP_NUMBER_DISPLAY = '+961 71 538 316';
const WHATSAPP_URL = 'https://wa.me/96171538316';

// Official WhatsApp SVG icon
function WhatsAppIcon({ size = 40 }: { size?: number }) {
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

export function WhatsAppSection() {
  const { t } = useLanguage();

  return (
    <section id="whatsapp" className="py-24 bg-card/30">
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
              {t('whatsapp.title')}
            </h2>
            <div className="w-16 h-1 bg-[#25D366] mx-auto rounded-full" />
          </motion.div>
        </div>

        {/* Main card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="bg-card rounded-3xl border border-card-border shadow-lg p-10 md:p-14 flex flex-col items-center gap-8 text-center"
        >
          {/* Icon */}
          <div className="w-24 h-24 rounded-full bg-[#25D366]/10 flex items-center justify-center">
            <WhatsAppIcon size={48} />
          </div>

          {/* Text */}
          <div className="space-y-3 max-w-md">
            <p className="text-lg text-foreground/80 leading-relaxed">
              {t('whatsapp.desc')}
            </p>
            <p
              className="text-2xl font-bold text-foreground tracking-wide"
              dir="ltr"
            >
              {WHATSAPP_NUMBER_DISPLAY}
            </p>
          </div>

          {/* CTA button */}
          <motion.a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#20bb5a] text-white font-semibold text-lg px-10 py-5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <WhatsAppIcon size={26} />
            {t('whatsapp.cta')}
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
