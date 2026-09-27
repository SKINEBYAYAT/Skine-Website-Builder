import { UserRound } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ExpandableSection } from '@/components/ExpandableSection';

export function About() {
  const { t } = useLanguage();
  return (
    <ExpandableSection id="about" title={t('about.title')} icon={UserRound}>
      <div className="space-y-5 text-foreground/80 leading-loose text-base">
        <p>{t('hero.para1')}</p>
        <p>{t('hero.para2')}</p>
        <p className="font-semibold text-foreground">{t('hero.tagline')}</p>
      </div>
    </ExpandableSection>
  );
}
