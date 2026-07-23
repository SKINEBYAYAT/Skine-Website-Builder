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
  'nav.pricing': { ar: 'الأسعار', en: 'Pricing' },
  'nav.consultation': { ar: 'الاستشارة', en: 'Consultation' },
  'nav.beforeafter': { ar: 'قبل وبعد', en: 'Before & After' },
  'nav.reviews': { ar: 'آراء العملاء', en: 'Feedbacks' },
  'nav.location': { ar: 'الموقع', en: 'Location' },
  'nav.faq': { ar: 'الأسئلة الشائعة', en: 'FAQ' },
  'nav.contact': { ar: 'واتساب', en: 'WhatsApp' },

  // Hero
  'hero.para1': {
    ar: 'بخبرة تزيد عن خمس سنوات، وتشرفت بكوني أول وأصغر خبيرة في مجال العناية بالبشرة تتم استضافتها على التلفزيون للحديث عن أسس العناية الصحيحة بالبشرة.',
    en: 'With over five years of experience, I was honored to be the first and youngest skincare expert to be hosted on television to speak about the fundamentals of proper skincare.',
  },
  'hero.para2': {
    ar: 'أؤمن أن كل بشرة لها احتياجات مختلفة، لذلك لا أعتمد على الحلول العامة، بل أقدم استشارات شخصية وخطط عناية مصممة بما يتناسب مع طبيعة بشرتك ومشكلاتها وأهدافك، لمساعدتك على اتخاذ قرارات صحيحة وبناء روتين فعّال يمنح بشرتك العناية التي تستحقها.',
    en: 'I believe every skin has different needs, so I don\'t rely on generic solutions. Instead, I offer personalized consultations and tailored skincare plans designed to match your skin\'s nature, concerns, and goals — helping you make the right decisions and build an effective routine that gives your skin the care it deserves.',
  },
  'hero.tagline': {
    ar: 'لأن البشرة الصحية تبدأ بفهمها أولًا.',
    en: 'Because healthy skin starts with understanding it first.',
  },
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
  'beforeafter.title':  { ar: 'قبل وبعد', en: 'Before & After' },
  'beforeafter.subtitle': { ar: 'نتائج حقيقية لعملاء حقيقيين', en: 'Real results for real clients' },
  'beforeafter.empty':  { ar: 'لا توجد صور حالياً', en: 'No images yet' },
  'beforeafter.before': { ar: 'قبل', en: 'Before' },
  'beforeafter.after':  { ar: 'بعد', en: 'After' },

  // FAQ
  'faq.title': { ar: 'الأسئلة الشائعة', en: 'Frequently Asked Questions' },

  'faq.1.q': { ar: 'كم مرة يجب أن أحصل على جلسة فيشل؟', en: 'How often should I get a facial?' },
  'faq.1.a': { ar: 'معظم الأشخاص يستفيدون من جلسة فيشل كل 4 إلى 6 أسابيع، لكن التكرار المثالي يعتمد على نوع بشرتك واحتياجاتها.', en: 'Most people benefit from a facial every 4–6 weeks, but the ideal frequency depends on your skin type and concerns.' },

  'faq.2.q': { ar: 'هل الفيشل مناسب للبشرة الحساسة؟', en: 'Is a facial suitable for sensitive skin?' },
  'faq.2.a': { ar: 'نعم. يمكن تخصيص العلاجات باستخدام منتجات وتقنيات لطيفة تناسب البشرة الحساسة.', en: 'Yes. Treatments can be customized using gentle products and techniques to suit sensitive skin.' },

  'faq.3.q': { ar: 'ماذا يجب أن أتجنب بعد جلسة الفيشل؟', en: 'What should I avoid after a facial?' },
  'faq.3.a': { ar: 'تجنبي التعرض المباشر لأشعة الشمس، والسونا، وممارسة الرياضة الشديدة، ومنتجات التقشير، والمكونات الفعّالة كالريتينول والأحماض لمدة 24 إلى 48 ساعة، وفقاً لنوع العلاج.', en: 'Avoid direct sun exposure, saunas, intense workouts, exfoliating products, and active ingredients like retinol or acids for 24–48 hours, depending on your treatment.' },

  'faq.4.q': { ar: 'هل الفيشل مفيد في حالات حب الشباب؟', en: 'Are facials helpful for acne?' },
  'faq.4.a': { ar: 'نعم. يمكن للفيشل الاحترافي المساعدة في تقليل الانسداد وإدارة البثور وتحسين صحة البشرة بشكل عام عند دمجه مع روتين عناية منزلي مناسب.', en: 'Yes. Professional facials can help reduce congestion, manage breakouts, and improve overall skin health when combined with a proper home routine.' },

  'faq.5.q': { ar: 'هل يمكنني الحصول على جلسة فيشل أثناء الحمل؟', en: 'Can I get a facial if I\'m pregnant?' },
  'faq.5.a': { ar: 'كثير من علاجات الفيشل آمنة أثناء الحمل، لكن يجب تجنب بعض المكونات والإجراءات. يُرجى إبلاغ المختصة دائماً إذا كنتِ حاملاً.', en: 'Many facial treatments are pregnancy-safe, but some ingredients and procedures should be avoided. Always let your specialist know if you\'re pregnant.' },

  'faq.6.q': { ar: 'كم تستغرق جلسة الفيشل؟', en: 'How long does a facial take?' },
  'faq.6.a': { ar: 'تستغرق معظم علاجات الفيشل من 60 إلى 90 دقيقة، وقد تستغرق الزيارة الأولى وقتاً أطول إذا تضمنت استشارة تفصيلية.', en: 'Most facial treatments take 60–90 minutes, while the first visit may take longer if it includes a detailed consultation.' },

  'faq.7.q': { ar: 'هل ستحل جلسة فيشل واحدة مشاكل بشرتي؟', en: 'Will one facial solve my skin concerns?' },
  'faq.7.a': { ar: 'يمكن لجلسة فيشل واحدة أن تحسّن مظهر بشرتك، لكن النتائج طويلة الأمد تتطلب الاستمرارية وروتين عناية مخصصاً.', en: 'A single facial can improve your skin\'s appearance, but long-term results require consistency and a personalized skincare routine.' },

  'faq.8.q': { ar: 'كيف أستعد لموعدي؟', en: 'How do I prepare for my appointment?' },
  'faq.8.a': { ar: 'احرصي على الحضور بوجه نظيف إن أمكن، وتجنبي المقشرات القوية والريتينويد لبضعة أيام قبل الجلسة، وأخبري المختصة بأي حساسيات أو أدوية تتناولينها.', en: 'Arrive with clean skin if possible, avoid strong exfoliants or retinoids for a few days beforehand, and let your specialist know about any allergies or medications.' },

  'faq.9.q': { ar: 'هل ستترك عملية استخراج الشوائب علامات؟', en: 'Will extractions leave marks?' },
  'faq.9.a': { ar: 'عند إجرائها بشكل احترافي، يتم الاستخراج بعناية لتقليل التهيج والحدّ من خطر تكوّن الندبات.', en: 'When performed professionally, extractions are done carefully to minimize irritation and reduce the risk of scarring.' },

  'faq.10.q': { ar: 'ماذا لو لم أعرف نوع بشرتي؟', en: 'What if I don\'t know my skin type?' },
  'faq.10.a': { ar: 'لا مشكلة في ذلك. سيتم تقييم نوع بشرتك وحالتها خلال جلسة الاستشارة.', en: 'That\'s completely fine. Your skin type and condition will be assessed during your consultation.' },

  'faq.11.q': { ar: 'هل يمكنني حجز جلسة فيشل حتى لو كان لديّ روتين عناية بالفعل؟', en: 'Can I book a facial even if I already have a skincare routine?' },
  'faq.11.a': { ar: 'نعم. العلاجات الاحترافية تكمل روتينك المنزلي وتساعدك على تحقيق نتائج أفضل وأسرع.', en: 'Yes. Professional treatments complement your home routine and can help you achieve better, faster results.' },

  'faq.12.q': { ar: 'هل يمكنني الحصول على جلسة فيشل أثناء تناول الروأكوتان؟', en: 'Can I get a facial while taking Roaccutane?' },
  'faq.12.a': { ar: 'لا. لا يُنصح بإجراء علاجات الفيشل أثناء العلاج بالإيزوتريتينوين الفموي (الروأكوتان) بسبب زيادة حساسية البشرة. يُرجى حجز جلستك بعد انتهاء العلاج واتباع تقييم متخصص لبشرتك.', en: 'No. Facial treatments are not recommended during oral isotretinoin (Roaccutane) therapy due to increased skin sensitivity. Please book your facial after completing your treatment and following a professional skin assessment.' },

  'faq.13.q': { ar: 'هل يمكنني الحصول على فيشل إذا كنت أعاني من الأكزيما أو الروزيشيا أو الصدفية؟', en: 'Can I get a facial if I have eczema, rosacea, or psoriasis?' },
  'faq.13.a': { ar: 'يعتمد ذلك على حالة بشرتك. يُشترط إجراء تقييم قبل العلاج.', en: 'It depends on your skin condition. An assessment is required before treatment.' },

  'faq.14.q': { ar: 'هل يمكنني الحصول على فيشل بعد البوتوكس أو الفيلر؟', en: 'Can I have a facial after Botox or fillers?' },
  'faq.14.a': { ar: 'يُنصح بالانتظار أسبوعين على الأقل، أو اتباع توصيات طبيبك المعالج.', en: 'It\'s recommended to wait at least 2 weeks, or follow your injector\'s advice.' },

  'faq.15.q': { ar: 'هل يمكنني الحصول على فيشل قبل مناسبة خاصة؟', en: 'Can I get a facial before a special event?' },
  'faq.15.a': { ar: 'نعم. يُفضّل حجز موعدك قبل 5 إلى 7 أيام من المناسبة للحصول على أفضل النتائج.', en: 'Yes. Ideally, book your appointment 5–7 days before your event for the best results.' },

  'faq.16.q': { ar: 'هل يمكنني الحصول على فيشل بعد علاج الليزر؟', en: 'Can I get a facial after laser treatment?' },
  'faq.16.a': { ar: 'لا. يجب أن تتعافى بشرتك بالكامل قبل إجراء جلسة فيشل.', en: 'No. Your skin should be fully healed before having a facial.' },

  'faq.17.q': { ar: 'هل يمكن للمراهقين الحصول على جلسات فيشل؟', en: 'Can teenagers get facials?' },
  'faq.17.a': { ar: 'نعم. يمكن للعلاجات المناسبة للعمر أن تساعد في إدارة حب الشباب والحفاظ على صحة البشرة.', en: 'Yes. Age-appropriate treatments can help manage acne and maintain healthy skin.' },

  'faq.18.q': { ar: 'هل ستُزال جميع الرؤوس السوداء في جلسة واحدة؟', en: 'Will extractions remove all my blackheads in one session?' },
  'faq.18.a': { ar: 'ليس دائماً. بحسب شدة الانسداد، قد تكون هناك حاجة لعدة جلسات.', en: 'Not always. Depending on the severity of congestion, multiple sessions may be needed.' },

  'faq.19.q': { ar: 'هل يمكنني ممارسة الرياضة بعد الفيشل؟', en: 'Can I exercise after a facial?' },
  'faq.19.a': { ar: 'يُنصح بتجنب التمارين الشديدة لمدة 24 ساعة.', en: 'It\'s recommended to avoid intense workouts for 24 hours.' },

  'faq.20.q': { ar: 'هل يمكنني غسل وجهي بعد الفيشل؟', en: 'Can I wash my face after a facial?' },
  'faq.20.a': { ar: 'يُفضّل الانتظار حتى اليوم التالي، أو اتباع تعليمات العناية ما بعد الجلسة الخاصة بك.', en: 'It\'s best to wait until the next day, or follow your specialist\'s aftercare instructions.' },

  'faq.21.q': { ar: 'هل يمكنني الحصول على فيشل إذا كانت بشرتي محترقة بالشمس؟', en: 'Can I get a facial if I have sunburn?' },
  'faq.21.a': { ar: 'لا. انتظري حتى تتعافى بشرتك تماماً.', en: 'No. Wait until your skin has completely healed.' },

  'faq.22.q': { ar: 'هل يجب أن أحضر منتجاتي معي إلى الاستشارة؟', en: 'Do I need to bring my skincare products to the consultation?' },
  'faq.22.a': { ar: 'إن أمكن، نعم. يساعد ذلك على تقييم روتينك الحالي وتقديم أفضل التوصيات.', en: 'If possible, yes. It helps evaluate your current routine and make the best recommendations.' },

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
  'admin.add.category': { ar: 'إضافة تصنيف', en: 'Add Category' },
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
  'pricing.cta': { ar: 'احجز موعدك الآن', en: 'Book Your Appointment Now' },
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
