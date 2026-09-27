import { navigateToSection } from '@/lib/sectionNavigation';
import { ArrowDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const links = [
  { key: 'nav.about', href: '#about' },
  { key: 'nav.pricing', href: '#pricing' },
  { key: 'nav.consultation', href: '#consultation' },
  { key: 'nav.beforeafter', href: '#before-after' },
  { key: 'nav.reviews', href: '#reviews' },
  { key: 'nav.location', href: '#location' },
  { key: 'nav.contact', href: '#contact' },
  { key: 'nav.faq', href: '#faq' },
] as const;

export function SectionNav() {
  const { t } = useLanguage();
  return (
    <nav aria-label="Explore sections" className="section-index">
      <div className="container mx-auto max-w-7xl px-5 md:px-8">
        <ul className="section-index-grid">
          {links.map(({ key, href }) => (
            <li key={href}><a href={href} onClick={(event) => { event.preventDefault(); navigateToSection(href); }}>{t(key)}<ArrowDown className="section-index-arrow" size={16} aria-hidden="true" /></a></li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
