import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

const JOTFORM_URL = 'https://form.jotform.com/261913445488062';

interface PricingService { ar: string; en: string; }
interface PricingPackage {
  id: string;
  nameAr: string;
  nameEn: string;
  price: string;
  featured?: boolean;
  services: PricingService[];
}

const DEFAULT_PACKAGES: PricingPackage[] = [
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
    featured: true,
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
];

export function Pricing() {
  const { t, lang } = useLanguage();
  const [packages, setPackages] = useState<PricingPackage[]>(DEFAULT_PACKAGES);

  useEffect(() => {
    fetch('/api/pricing')
      .then((r) => r.json())
      .then((data: { packages?: PricingPackage[] }) => {
        if (data?.packages?.length) setPackages(data.packages);
      })
      .catch(() => {});
  }, []);

  return (
    <section id="pricing" className="py-24 bg-card/30">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-5xl">
        {/* Heading */}
        <div className="text-center mb-16">
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

        {/* Cards */}
        <div className="grid sm:grid-cols-2 gap-6 items-stretch">
          {packages.map((pkg, i) => {
            const isFeatured = !!pkg.featured;
            return (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
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
                    onClick={() =>
                      window.open(JOTFORM_URL, '_blank', 'noopener,noreferrer')
                    }
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
      </div>
    </section>
  );
}
