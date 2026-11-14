import { useLanguage } from '@/contexts/LanguageContext';
const DEV_URL = 'https://marwan-web-dev.vercel.app';

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-background border-t border-border pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8 mb-12">
          <div className="flex flex-col items-center md:items-start gap-4">
            <a href="#" aria-label="Skiné by Ayat home" className="brand-wordmark">
              <img src="/skine-header.png" alt="Skiné by Ayat" className="brand-logo-image" width="534" height="252" decoding="async" />
            </a>
            <p className="text-muted-foreground text-center md:text-start max-w-xs mt-2">
              {t('hero.tagline')}
            </p>
          </div>

        </div>

        <div className="border-t border-border pt-8 flex flex-col items-center gap-3 text-sm text-muted-foreground">
          <p>{t('footer.copyright')}</p>

          {/* Developer credit */}
          <p className="text-xs text-muted-foreground/60 mt-1">
            Website designed &amp; developed by{' '}
            <a
              href={DEV_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground/80 hover:text-primary transition-colors duration-200 underline underline-offset-2"
            >
              Marwan Web Development
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
