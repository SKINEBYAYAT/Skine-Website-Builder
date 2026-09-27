import { useLanguage } from '@/contexts/LanguageContext';

const links = [
  { key: 'nav.pricing', href: '#pricing', number: '01' },
  { key: 'nav.consultation', href: '#consultation', number: '02' },
  { key: 'nav.beforeafter', href: '#before-after', number: '03' },
  { key: 'nav.reviews', href: '#reviews', number: '04' },
] as const;

export function SectionNav() {
  const { t } = useLanguage();
  return (
    <nav aria-label="Explore sections" className="section-index">
      <div className="container mx-auto max-w-7xl px-5 md:px-8">
        <ul className="section-index-grid">
          {links.map(({ key, href, number }) => (
            <li key={href}><a href={href}><span>{number} /</span>{t(key)}<span className="section-index-arrow" aria-hidden="true">↗</span></a></li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
