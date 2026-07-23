import { motion } from 'framer-motion';
import {
  Tag,
  CalendarCheck,
  Sparkles,
  MessageSquareQuote,
  MapPin,
  MessageCircle,
  HelpCircle,
  ChevronDown,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const links = [
  { key: 'nav.pricing',      href: '#pricing',      Icon: Tag },
  { key: 'nav.consultation', href: '#consultation', Icon: CalendarCheck },
  { key: 'nav.beforeafter',  href: '#before-after', Icon: Sparkles },
  { key: 'nav.reviews',      href: '#reviews',      Icon: MessageSquareQuote },
  { key: 'nav.location',     href: '#location',     Icon: MapPin },
  { key: 'nav.contact',      href: '#contact',      Icon: MessageCircle },
  { key: 'nav.faq',          href: '#faq',          Icon: HelpCircle },
] as const;

export function SectionNav() {
  const { t } = useLanguage();

  const scrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="py-10 bg-background">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-2.5"
        >
          {links.map(({ key, href, Icon }, i) => (
              <motion.div
                key={href}
                initial={{ opacity: 0, x: 12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
                className="rounded-xl border border-border bg-card overflow-hidden shadow-sm"
              >
                <a
                  href={href}
                  onClick={(e) => scrollTo(e, href)}
                  className="flex items-center justify-between gap-3 px-5 py-3.5 text-sm font-medium text-foreground/80 hover:text-primary hover:bg-primary/5 transition-colors group"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex-none w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Icon size={15} />
                    </span>
                    {t(key as Parameters<typeof t>[0])}
                  </span>
                  <ChevronDown
                    size={15}
                    className="flex-none opacity-40 group-hover:opacity-80 rotate-[-90deg] rtl:rotate-90 transition-transform"
                  />
                </a>
              </motion.div>
            ))}
        </motion.div>
      </div>
    </section>
  );
}
