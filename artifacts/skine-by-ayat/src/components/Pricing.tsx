import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

const WA_NUMBER = '96171538316';

function buildWhatsAppUrl(pkgName: string, price: string, lang: 'ar' | 'en') {
  const message =
    lang === 'ar'
      ? `مرحباً، أرغب بحجز باقة ${pkgName} (${price}/جلسة).`
      : `Hi, I'd like to book the ${pkgName} package (${price}/session).`;
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
}

interface PricingService { ar: string; en: string; }
interface PricingPackage {
  id: string;
  nameAr: string;
  nameEn: string;
  price: string;
  featured?: boolean;
  services: PricingService[];
}
interface PricingCategory {
  id: string;
  nameAr: string;
  nameEn: string;
  packages: PricingPackage[];
}

// ─── Static data — mirrors live pricing.json exactly ──────────────────────────
const STATIC_CATEGORIES: PricingCategory[] = [
  {
    id: 'facials',
    nameAr: 'الفيشل',
    nameEn: 'Facials',
    packages: [
      {
        id: 'basic-facial',
        nameAr: 'فيشل أساسي',
        nameEn: 'Basic Facial',
        price: '$40',
        services: [
          { ar: 'تنظيف عميق',       en: 'Deep Cleansing' },
          { ar: 'تقشير لطيف',       en: 'Gentle Exfoliation' },
          { ar: 'علاج الإنزيم',     en: 'Enzyme Therapy' },
          { ar: 'استخراج عميق',     en: 'Deep Extraction' },
          { ar: 'تدليك لمفاوي',     en: 'Lymphatic Massage' },
          { ar: 'قناع مخصص',        en: 'Customized Mask' },
          { ar: 'العناية النهائية', en: 'Finishing Care' },
        ],
      },
      {
        id: 'hydrafacial',
        nameAr: 'هيدرافيشل',
        nameEn: 'Hydrafacial',
        price: '$45',
        featured: false,
        services: [
          { ar: 'تنظيف عميق',        en: 'Deep Cleansing' },
          { ar: 'تقشير لطيف',        en: 'Gentle Exfoliation' },
          { ar: 'علاج الإنزيم',      en: 'Enzyme Therapy' },
          { ar: 'استخراج عميق',      en: 'Deep Extraction' },
          { ar: 'هيدرا ديرمابريجن', en: 'Hydra Dermabrasion' },
          { ar: 'حقن الأكسجين',      en: 'Oxygen Infusion' },
          { ar: 'تدليك لمفاوي',      en: 'Lymphatic Massage' },
          { ar: 'قناع مخصص',         en: 'Customized Mask' },
          { ar: 'العناية النهائية',  en: 'Finishing Care' },
        ],
      },
    ],
  },
  {
    id: 'bundles',
    nameAr: 'الباقات',
    nameEn: 'Bundles',
    packages: [
      {
        id: 'glow-package',
        nameAr: 'باقة التوهج',
        nameEn: 'Glow Package',
        price: '$45',
        services: [
          { ar: 'فيشل أساسي',    en: 'Basic facial' },
          { ar: 'تقشير ذكي آمن', en: 'Safe smart peel' },
        ],
      },
      {
        id: 'treatment-package',
        nameAr: 'باقة العلاج',
        nameEn: 'Treatment Package',
        price: '$60',
        services: [
          { ar: 'فيشل أساسي',     en: 'Basic facial' },
          { ar: 'جلسة إبر دقيقة', en: 'Microneedling session' },
        ],
      },
      {
        id: 'full-care-package',
        nameAr: 'باقة العناية الكاملة',
        nameEn: 'Full Care Package',
        price: '$65',
        services: [
          { ar: 'فيشل أساسي', en: 'Basic facial' },
          { ar: 'تقشير ذكي',  en: 'Smart peel' },
          { ar: 'إبر دقيقة',  en: 'Microneedling' },
        ],
      },
      {
        id: 'rejuvenating-package',
        nameAr: 'باقة التجديد',
        nameEn: 'Rejuvenating Package',
        price: '$65',
        services: [
          { ar: 'فيشل أساسي',                       en: 'Basic facial' },
          { ar: 'تقشير الفاكهة العميق',               en: 'Hard fruit peel extract' },
          { ar: 'تجديد البشرة',                      en: 'Skin renewal' },
          { ar: 'بشرة أكثر إشراقاً وتوحداً في اللون', en: 'Brighter and more even skin tone' },
          { ar: 'يُحسّن شدّ البشرة ونضارتها',         en: 'Improves skin firmness' },
          { ar: 'ملمس بشرة أكثر نعومة',               en: 'Smooth skin texture' },
          { ar: 'توهج صحي مشرق',                     en: 'Radiant healthy glow' },
        ],
      },
    ],
  },
  {
    id: 'cat-1784818858795',
    nameAr: 'عروضات',
    nameEn: 'Offers',
    packages: [
      {
        id: 'pkg-1784818874527',
        nameAr: 'خطة شاملة للعناية بالبشرة',
        nameEn: 'Complete skin plan',
        price: '$60',
        featured: false,
        services: [
          { ar: 'استشارة',                    en: 'consultation' },
          { ar: 'جلسة تنظيف بشرة',            en: 'facial' },
          { ar: 'روتين عناية بالبشرة مُخصّص', en: '⁠personalized skincare routine' },
        ],
      },
      {
        id: 'pkg-1784819097235',
        nameAr: 'سلسلة جلسات الوخز بالإبر الدقيقة',
        nameEn: 'Microneedling Series',
        price: 'Special Offer',
        featured: false,
        services: [
          {
            ar: 'اشترِ 4 جلسات واحصل على الجلسة الخامسة مجاناً.',
            en: 'Buy 4 sessions and get the 5th session free.',
          },
        ],
      },
    ],
  },
];

export function Pricing() {
  const { t, lang } = useLanguage();
  const [activeTab, setActiveTab] = useState(STATIC_CATEGORIES[0].id);

  const activeCategory = STATIC_CATEGORIES.find((c) => c.id === activeTab) ?? STATIC_CATEGORIES[0];

  return (
    <section id="pricing" className="py-24 bg-card/30">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-5xl">

        {/* Heading */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('pricing.title')}
            </h2>
            <div className="w-16 h-1 bg-primary mx-auto rounded-full" />
            <p className="text-foreground/60 mt-5 text-base max-w-xl mx-auto">
              {t('pricing.subtitle')}
            </p>
          </motion.div>
        </div>

        {/* Tab bar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-wrap gap-2 justify-center mb-10"
        >
          {STATIC_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeTab === cat.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-foreground/60 hover:text-foreground hover:bg-muted border border-border bg-card'
              }`}
            >
              {lang === 'ar' ? cat.nameAr : cat.nameEn}
            </button>
          ))}
        </motion.div>

        {/* Cards */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {!activeCategory?.packages.length ? (
              <div className="text-center py-20 text-foreground/30">
                <p className="text-base">{lang === 'ar' ? 'قريباً...' : 'Coming soon…'}</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-6 items-stretch">
                {activeCategory.packages.map((pkg, i) => {
                  const isFeatured = !!pkg.featured;
                  return (
                    <motion.div
                      key={pkg.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                      whileHover={{ y: -6, transition: { duration: 0.2 } }}
                      className="relative flex flex-col rounded-3xl border border-border bg-card shadow-lg overflow-hidden transition-shadow duration-300 hover:shadow-2xl"
                    >
                      {/* Popular badge */}
                      {isFeatured && (
                        <div className="absolute top-5 end-5">
                          <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full tracking-wide">
                            {t('pricing.popular')}
                          </span>
                        </div>
                      )}

                      {/* Header */}
                      <div className="p-8 pb-6">
                        <h3 className="text-xl font-bold text-foreground">
                          {lang === 'ar' ? pkg.nameAr : pkg.nameEn}
                        </h3>
                        <div className="flex items-baseline gap-1 mt-5">
                          <span className="text-5xl font-extrabold tracking-tight text-foreground">
                            {pkg.price}
                          </span>
                          <span className="text-sm ms-1 text-foreground/50">
                            / {t('pricing.session')}
                          </span>
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="mx-8 h-px bg-border" />

                      {/* Services list + CTA */}
                      <div className="p-8 flex-1 flex flex-col">
                        <ul className="space-y-3.5 flex-1">
                          {pkg.services.map((svc, j) => (
                            <li key={j} className="flex items-center gap-3">
                              <span className="w-5 h-5 rounded-full flex items-center justify-center flex-none bg-primary/10">
                                <Check size={11} className="text-primary" />
                              </span>
                              <span className="text-sm text-foreground/80">
                                {lang === 'ar' ? svc.ar : svc.en}
                              </span>
                            </li>
                          ))}
                        </ul>

                        <Button
                          onClick={() => window.open(
                            buildWhatsAppUrl(
                              lang === 'ar' ? pkg.nameAr : pkg.nameEn,
                              pkg.price,
                              lang,
                            ),
                            '_blank',
                            'noopener,noreferrer'
                          )}
                          className="w-full mt-8 rounded-full font-semibold text-base"
                          variant="outline"
                          size="lg"
                        >
                          {t('pricing.cta')}
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

      </div>
    </section>
  );
}
