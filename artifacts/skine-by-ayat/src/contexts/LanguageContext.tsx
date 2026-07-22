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
  'nav.reviews': { ar: 'آراء العملاء', en: 'Reviews' },

  // Hero
  'hero.title': { ar: 'بشرة صحية تبدأ بالعناية الصحيحة', en: 'Healthy Skin Starts with Proper Care' },
  'hero.subtitle': { ar: 'استشارات احترافية وروتين مخصص للعناية ببشرتك حسب احتياجاتها.', en: 'Professional consultations and a personalized skincare routine tailored to your skin\'s needs.' },
  'hero.cta.primary': { ar: 'احجز استشارة', en: 'Book a Consultation' },
  'hero.cta.secondary': { ar: 'تابعنا على إنستغرام', en: 'Follow us on Instagram' },

  // About
  'about.title': { ar: 'من نحن', en: 'About Us' },
  'about.para1': {
    ar: 'بخبرة تزيد عن خمس سنوات، وتشرفت بكوني أول وأصغر خبيرة في مجال العناية بالبشرة تتم استضافتها على التلفزيون للحديث عن أسس العناية الصحيحة بالبشرة.',
    en: 'With over five years of experience, I was honored to be the first and youngest skincare expert to be hosted on television to speak about the fundamentals of proper skincare.',
  },
  'about.para2': {
    ar: 'أؤمن أن كل بشرة لها احتياجات مختلفة، لذلك لا أعتمد على الحلول العامة، بل أقدم استشارات شخصية وخطط عناية مصممة بما يتناسب مع طبيعة بشرتك ومشكلاتها وأهدافك، لمساعدتك على اتخاذ قرارات صحيحة وبناء روتين فعّال يمنح بشرتك العناية التي تستحقها.',
    en: 'I believe every skin has different needs, so I don\'t rely on generic solutions. Instead, I offer personalized consultations and tailored skincare plans designed to match your skin\'s nature, concerns, and goals — helping you make the right decisions and build an effective routine that gives your skin the care it deserves.',
  },
  'about.para3': {
    ar: 'لأن البشرة الصحية تبدأ بفهمها أولًا.',
    en: 'Because healthy skin starts with understanding it first.',
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

  // Reviews Carousel
  'reviews.title': { ar: 'آراء العملاء', en: 'Client Reviews' },
  'reviews.subtitle': { ar: 'ما يقوله عملاؤنا عن تجربتهم معنا', en: 'What our clients say about their experience with us' },
  'reviews.empty': { ar: 'لا توجد مراجعات حالياً', en: 'No reviews yet' },

  // Before & After
  'beforeafter.title': { ar: 'قبل وبعد', en: 'Before & After' },
  'beforeafter.subtitle': { ar: 'نتائج حقيقية لعملاء حقيقيين', en: 'Real results for real clients' },
  'beforeafter.empty': { ar: 'لا توجد صور حالياً', en: 'No images yet' },

  // FAQ
  'faq.title': { ar: 'الأسئلة الشائعة', en: 'Frequently Asked Questions' },
  'faq.1.q': { ar: 'كيف يتم تقديم الاستشارة؟', en: 'How is the consultation conducted?' },
  'faq.1.a': { ar: 'تتم الاستشارة عبر نموذج الحجز الإلكتروني، ثم نتواصل معك لتحليل بشرتك وتقديم روتين مخصص.', en: 'The consultation is done through our booking form, then we\'ll reach out to analyze your skin and provide a personalized routine.' },
  'faq.2.q': { ar: 'هل الاستشارة مدفوعة؟', en: 'Is the consultation paid?' },
  'faq.2.a': { ar: 'نعم، الاستشارة مدفوعة، لأنها لا تقتصر على التقييم الأولي، بل تشمل تشخيصًا دقيقًا لحالتك ووضع خطة علاجية مخصصة وفقًا لاحتياجاتك، لضمان أفضل النتائج.', en: 'Yes, the consultation is paid because it goes beyond an initial assessment. It includes a thorough evaluation of your skin condition and a personalized treatment plan tailored to your specific needs, ensuring the best possible results.' },
  'faq.3.q': { ar: 'كم يستغرق وقت الاستشارة؟', en: 'How long does a consultation take?' },
  'faq.3.a': { ar: 'تختلف المدة حسب نوع الاستشارة، وسيتم إبلاغك بالوقت المتوقع عند التواصل.', en: 'Duration varies by consultation type — you\'ll be informed of the estimated time when we contact you.' },
  'faq.4.q': { ar: 'هل يمكنني إلغاء موعدي؟', en: 'Can I cancel my appointment?' },
  'faq.4.a': { ar: 'نعم، يمكنك التواصل معنا قبل 24 ساعة من موعدك لإعادة الجدولة أو الإلغاء.', en: 'Yes, you can contact us at least 24 hours before your appointment to reschedule or cancel.' },

  // Contact
  'contact.title': { ar: 'تواصل معنا', en: 'Contact Us' },
  'contact.whatsapp.subtitle': { ar: 'راسلينا مباشرة على واتساب', en: 'Message us directly on WhatsApp' },
  'contact.instagram.subtitle': { ar: 'تابعينا على إنستغرام', en: 'Follow us on Instagram' },
  'contact.location': { ar: 'موقعنا', en: 'Our Location' },

  // Footer
  'footer.privacy': { ar: 'سياسة الخصوصية', en: 'Privacy Policy' },
  'footer.terms': { ar: 'الشروط والأحكام', en: 'Terms of Service' },
  'footer.copyright': { ar: '© 2025 Skiné by Ayat — جميع الحقوق محفوظة', en: '© 2025 Skiné by Ayat — All rights reserved' },

  // Admin
  'admin.title': { ar: 'لوحة الإدارة', en: 'Admin Panel' },
  'admin.reviews': { ar: 'آراء العملاء', en: 'Client Reviews' },
  'admin.beforeafter': { ar: 'قبل وبعد', en: 'Before & After' },
  'admin.upload': { ar: 'رفع صورة', en: 'Upload Image' },
  'admin.delete': { ar: 'حذف', en: 'Delete' },
  'admin.save.order': { ar: 'حفظ الترتيب', en: 'Save Order' },
  'admin.logout': { ar: 'تسجيل الخروج', en: 'Log Out' },
  'admin.password.prompt': { ar: 'أدخلي كلمة المرور', en: 'Enter password' },
  'admin.password.label': { ar: 'كلمة المرور', en: 'Password' },
  'admin.login': { ar: 'دخول', en: 'Login' },
  'admin.wrong.password': { ar: 'كلمة مرور خاطئة', en: 'Incorrect password' },
  'admin.move.up': { ar: 'تحريك لأعلى', en: 'Move Up' },
  'admin.move.down': { ar: 'تحريك لأسفل', en: 'Move Down' },
  'admin.uploading': { ar: 'جارٍ الرفع...', en: 'Uploading...' },
  'admin.saved': { ar: 'تم الحفظ', en: 'Saved' },
  'admin.site.images': { ar: 'صور الموقع', en: 'Website Images' },
  'admin.hero.image': { ar: 'الصورة الرئيسية', en: 'Hero / Main Image' },
  'admin.about.image': { ar: 'صورة التعريف', en: 'About / Profile Image' },
  'admin.maps': { ar: 'موقع على الخريطة', en: 'Google Maps Location' },
  'admin.maps.label': { ar: 'رابط Google Maps', en: 'Google Maps Link' },
  'admin.maps.hint': { ar: 'الصق رابط المشاركة أو رابط التضمين من Google Maps', en: 'Paste the share link or embed URL from Google Maps' },
  'admin.maps.save': { ar: 'حفظ الرابط', en: 'Save Link' },
  'admin.maps.clear': { ar: 'حذف الخريطة', en: 'Clear Map' },
  'admin.replace': { ar: 'استبدال الصورة', en: 'Replace Image' },
  'admin.current': { ar: 'الصورة الحالية', en: 'Current Image' },
  'admin.revert': { ar: 'إعادة الصورة الافتراضية', en: 'Revert to Default' },
  'admin.saving': { ar: 'جارٍ الحفظ...', en: 'Saving...' },
  'admin.pricing': { ar: 'الأسعار', en: 'Pricing' },
  'admin.add.package': { ar: 'إضافة باقة', en: 'Add Package' },
  'admin.add.service': { ar: 'إضافة خدمة', en: 'Add Service' },
  'admin.save.all': { ar: 'حفظ التغييرات', en: 'Save Changes' },
  'admin.featured': { ar: 'مميز', en: 'Featured' },

  // WhatsApp section
  'whatsapp.title': { ar: 'تواصل معنا عبر واتساب', en: 'Chat with Us on WhatsApp' },
  'whatsapp.desc': { ar: 'هل لديك سؤال أو تودين حجز استشارة؟ تواصلي معنا مباشرة عبر واتساب وسنرد عليك في أقرب وقت.', en: 'Have a question or want to book a consultation? Contact us directly on WhatsApp and we\'ll get back to you as soon as possible.' },
  'whatsapp.cta': { ar: 'ابدئي المحادثة', en: 'Chat on WhatsApp' },

  // Pricing section
  'pricing.title': { ar: 'الأسعار', en: 'Pricing' },
  'pricing.subtitle': { ar: 'اختاري الباقة المناسبة لبشرتك', en: 'Choose the package that suits your skin' },
  'pricing.popular': { ar: 'الأكثر طلبًا', en: 'Most Popular' },
  'pricing.session': { ar: 'جلسة', en: 'session' },
  'pricing.cta': { ar: 'احجزي استشارتك', en: 'Book Consultation' },
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
