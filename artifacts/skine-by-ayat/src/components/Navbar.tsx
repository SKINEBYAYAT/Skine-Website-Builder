import { useState, useEffect } from 'react';
import { Menu, X, Moon, Sun, Instagram } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import logo from '@assets/IMG_7839_1784317781519.jpeg';

const JOTFORM_URL = 'https://form.jotform.com/261913445488062';
const INSTAGRAM_URL = 'https://instagram.com/skinebyayat';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t, lang, setLang, dir } = useLanguage();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: t('nav.home'), href: '#' },
    { name: t('nav.about'), href: '#about' },
    { name: t('nav.services'), href: '#services' },
    { name: t('nav.consultation'), href: '#consultation' },
    { name: t('nav.reviews'), href: '#reviews' },
    { name: t('nav.faq'), href: '#faq' },
    { name: t('nav.contact'), href: '#contact' },
  ];

  const scrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    if (href === '#') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const toggleLang = () => {
    setLang(lang === 'ar' ? 'en' : 'ar');
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Show the OTHER language label so users know what they're switching TO
  const langLabel = lang === 'ar' ? 'English' : 'العربية';

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent',
        isScrolled
          ? 'bg-background/80 backdrop-blur-md border-border py-3 shadow-sm'
          : 'bg-transparent py-5'
      )}
    >
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl flex items-center justify-between">
        <a href="#" onClick={(e) => scrollTo(e, '#')} className="flex items-center gap-3">
          <img src={logo} alt="Skiné by Ayat" className="h-12 w-auto rounded-md object-cover" />
          <span className="font-bold text-xl tracking-tight hidden sm:block">Skiné by Ayat</span>
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          <ul className="flex items-center gap-6">
            {navLinks.map((link) => (
              <li key={link.name}>
                <a
                  href={link.href}
                  onClick={(e) => scrollTo(e, link.href)}
                  className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
          
          <div className="flex items-center gap-2 border-x border-border px-4 mx-2">
            <button
              onClick={toggleLang}
              className="text-sm font-semibold px-3 py-1 rounded-full border border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200"
              aria-label="Toggle language"
            >
              {langLabel}
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-muted transition-colors text-foreground/80 hover:text-foreground"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full hover:bg-muted transition-colors text-foreground/80 hover:text-foreground"
              aria-label="Instagram"
            >
              <Instagram size={18} />
            </a>
          </div>

          <Button 
            onClick={() => window.open(JOTFORM_URL, '_blank', 'noopener,noreferrer')}
            size="sm"
            className="rounded-full px-6"
          >
            {t('nav.consultation')}
          </Button>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex items-center gap-3 md:hidden">
          <button
            onClick={toggleLang}
            className="text-xs font-semibold px-2 py-1 rounded-full border border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200"
          >
            {langLabel}
          </button>
          <button
            onClick={toggleTheme}
            className="p-2 text-foreground/80"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-foreground/80"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-background border-b border-border shadow-lg p-4 flex flex-col gap-4 animate-in slide-in-from-top-4">
          <ul className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <li key={link.name}>
                <a
                  href={link.href}
                  onClick={(e) => scrollTo(e, link.href)}
                  className="block text-base font-medium p-2 hover:bg-muted rounded-md transition-colors"
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-2 text-foreground/80 hover:text-foreground"
            >
              <Instagram size={20} />
              <span className="text-sm">Instagram</span>
            </a>
            <Button 
              onClick={() => {
                window.open(JOTFORM_URL, '_blank', 'noopener,noreferrer');
                setIsMobileMenuOpen(false);
              }}
              size="sm"
              className="rounded-full"
            >
              {t('nav.consultation')}
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
