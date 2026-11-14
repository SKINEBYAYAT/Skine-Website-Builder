import { navigateToSection } from '@/lib/sectionNavigation';
import { Sprout, Tag, CalendarDays, Images, Star, MapPin, MessageCircle, CircleHelp } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const links = [
  { key: 'nav.about', href: '#about', Icon: Sprout },
  { key: 'nav.pricing', href: '#pricing', Icon: Tag },
  { key: 'nav.consultation', href: '#consultation', Icon: CalendarDays },
  { key: 'nav.beforeafter', href: '#before-after', Icon: Images },
  { key: 'nav.reviews', href: '#reviews', Icon: Star },
  { key: 'nav.location', href: '#location', Icon: MapPin },
  { key: 'nav.contact', href: '#contact', Icon: MessageCircle },
  { key: 'nav.faq', href: '#faq', Icon: CircleHelp },
] as const;

export function SectionNav() {
  const { t } = useLanguage();
  return (
    <nav aria-label="Explore sections" className="section-index">
      <div className="container mx-auto max-w-7xl px-5 md:px-8">
        <ul className="section-index-grid">
          {links.map(({ key, href, Icon }) => (
            <li key={href}><a href={href} onClick={(event) => { event.preventDefault(); navigateToSection(href); }}><Icon className="section-index-icon" size={34} strokeWidth={1.7} aria-hidden="true" /><span>{t(key)}</span></a></li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
