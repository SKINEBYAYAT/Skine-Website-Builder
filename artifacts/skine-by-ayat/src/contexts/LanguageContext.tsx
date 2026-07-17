import { createContext, useContext, useEffect, useState } from 'react';

type Language = 'ar' | 'en';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
  dir: 'rtl' | 'ltr';
}

const translations: Record<string, Record<Language, string>> = {
  // Nav
  'nav.home': { ar: 'الرئيسية', en: 'Home' },
  'nav.about': { ar: 'من نحن', en: 'About' },
  'nav.services': { ar: 'الخدمات', en: 'Services' },
  'nav.consultation': { ar: 'الاستشارة', en: 'Consultation' },
  'nav.faq': { ar: 'الأسئلة الشائعة', en: 'FAQ' },
  'nav.contact': { ar: 'تواصل معنا', en: 'Contact' },
  
  // Hero
  'hero.title': { ar: 'بشرة صحية تبدأ بالعناية الصحيحة', en: 'Healthy Skin Starts with Proper Care' },
  'hero.subtitle': { ar: 'استشارات احترافية وروتين مخصص للعناية ببشرتك حسب احتياجاتها.', en: 'Professional consultations and a personalized skincare routine tailored to your skin\'s needs.' },
  'hero.cta.primary': { ar: 'احجز استشارة', en: 'Book a Consultation' },
  'hero.cta.secondary': { ar: 'تابعنا على إنستغرام', en: 'Follow us on Instagram' },
  
  // About
  'about.title': { ar: 'من نحن', en: 'About Us' },
  'about.content': { 
    ar: 'Skiné by Ayat هي مبادرة متخصصة في الاستشارات الجلدية الاحترافية. نؤمن أن كل بشرة فريدة وتستحق عناية مخصصة. هدفنا مساعدتك في فهم بشرتك وبناء روتين يناسب احتياجاتها الفعلية.', 
    en: 'Skiné by Ayat is a specialized platform for professional skincare consultations. We believe every skin is unique and deserves personalized care. Our goal is to help you understand your skin and build a routine that truly meets its needs.' 
  },
  
  // Services
  'services.title': { ar: 'خدماتنا', en: 'Our Services' },
  'service.1.title': { ar: 'تحليل البشرة', en: 'Skin Analysis' },
  'service.2.title': { ar: 'علاج حب الشباب', en: 'Acne Treatment' },
  'service.3.title': { ar: 'البشرة الدهنية', en: 'Oily Skin Care' },
  'service.4.title': { ar: 'البشرة الجافة', en: 'Dry Skin Care' },
  'service.5.title': { ar: 'البشرة الحساسة', en: 'Sensitive Skin Care' },
  'service.6.title': { ar: 'التصبغات', en: 'Pigmentation Treatment' },
  'service.7.title': { ar: 'روتين العناية بالبشرة', en: 'Skincare Routine' },
  'service.8.title': { ar: 'توصيات المنتجات', en: 'Product Recommendations' },
  'service.9.title': { ar: 'متابعة النتائج', en: 'Progress Tracking' },
  
  // Consultation
  'consultation.title': { ar: 'احجزي استشارتك', en: 'Book Your Consultation' },
  'consultation.cta.desc': { ar: 'انقري على الزر أدناه لحجز استشارتك الجلدية المخصصة مع Skiné by Ayat.', en: 'Click the button below to book your personalized skincare consultation with Skiné by Ayat.' },
  
  // FAQ
  'faq.title': { ar: 'الأسئلة الشائعة', en: 'Frequently Asked Questions' },
  'faq.1.q': { ar: 'كيف يتم تقديم الاستشارة؟', en: 'How is the consultation conducted?' },
  'faq.1.a': { ar: 'تتم الاستشارة عبر نموذج الحجز الإلكتروني، ثم نتواصل معك لتحليل بشرتك وتقديم روتين مخصص.', en: 'The consultation is done through our booking form, then we\'ll reach out to analyze your skin and provide a personalized routine.' },
  'faq.2.q': { ar: 'هل الاستشارة مدفوعة؟', en: 'Is the consultation paid?' },
  'faq.2.a': { ar: 'يرجى التواصل معنا لمعرفة تفاصيل الأسعار المتاحة حالياً.', en: 'Please contact us for current pricing details.' },
  'faq.3.q': { ar: 'كم يستغرق وقت الاستشارة؟', en: 'How long does a consultation take?' },
  'faq.3.a': { ar: 'تختلف المدة حسب نوع الاستشارة، وسيتم إبلاغك بالوقت المتوقع عند التواصل.', en: 'Duration varies by consultation type — you\'ll be informed of the estimated time when we contact you.' },
  'faq.4.q': { ar: 'هل يمكنني إلغاء موعدي؟', en: 'Can I cancel my appointment?' },
  'faq.4.a': { ar: 'نعم، يمكنك التواصل معنا قبل 24 ساعة من موعدك لإعادة الجدولة أو الإلغاء.', en: 'Yes, you can contact us at least 24 hours before your appointment to reschedule or cancel.' },
  
  // Contact
  'contact.title': { ar: 'تواصل معنا', en: 'Contact Us' },
  'contact.whatsapp.subtitle': { ar: 'راسلينا مباشرة على واتساب', en: 'Message us directly on WhatsApp' },
  'contact.instagram.subtitle': { ar: 'تابعينا على إنستغرام', en: 'Follow us on Instagram' },
  
  // Footer
  'footer.privacy': { ar: 'سياسة الخصوصية', en: 'Privacy Policy' },
  'footer.terms': { ar: 'الشروط والأحكام', en: 'Terms of Service' },
  'footer.copyright': { ar: '© 2025 Skiné by Ayat — جميع الحقوق محفوظة', en: '© 2025 Skiné by Ayat — All rights reserved' }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('ar');

  useEffect(() => {
    const savedLang = localStorage.getItem('skine-lang') as Language;
    if (savedLang && (savedLang === 'ar' || savedLang === 'en')) {
      setLangState(savedLang);
      document.documentElement.lang = savedLang;
      document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
    } else {
      document.documentElement.lang = 'ar';
      document.documentElement.dir = 'rtl';
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('skine-lang', newLang);
    document.documentElement.lang = newLang;
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  };

  const t = (key: string): string => {
    if (!translations[key]) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
    return translations[key][lang];
  };

  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
