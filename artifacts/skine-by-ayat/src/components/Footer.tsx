import { Instagram } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import logo from '@assets/IMG_7839_1784317781519.jpeg';

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-background border-t border-border pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8 mb-12">
          <div className="flex flex-col items-center md:items-start gap-4">
            <img src={logo} alt="Skiné by Ayat" className="h-16 w-auto rounded-lg object-cover" />
            <p className="text-muted-foreground text-center md:text-start max-w-xs mt-2">
              {t('hero.subtitle')}
            </p>
          </div>

          <div className="flex flex-col items-center md:items-end gap-6">
            <div className="flex gap-4">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-card border border-card-border flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300"
              >
                <Instagram size={20} />
              </a>
            </div>
            
            <button 
              onClick={() => document.querySelector('#consultation')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-primary font-bold hover:underline underline-offset-4"
            >
              {t('nav.consultation')}
            </button>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>{t('footer.copyright')}</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-primary transition-colors">{t('footer.privacy')}</a>
            <a href="#" className="hover:text-primary transition-colors">{t('footer.terms')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
