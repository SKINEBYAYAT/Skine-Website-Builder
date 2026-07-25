import { motion } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

const JOTFORM_URL = 'https://form.jotform.com/261913445488062';

// ─── Static data — mirrors live consultation data ─────────────────────────────
const data = {
  price: '$35',
  subtitleEn: 'Skin consultation and skincare routine planning',
  subtitleAr: 'استشارة جلدية وتخطيط روتين العناية',
  items: [
    {
      id: 'skin-analysis',
      titleEn: 'Skin Analysis',
      titleAr: 'تحليل البشرة',
      descEn: 'Skin type, tone, concerns, goals, and current routine assessment.',
      descAr: 'تقييم نوع البشرة ودرجة لونها ومشكلاتها وأهدافك وروتينك الحالي.',
    },
    {
      id: 'personalized-routine',
      titleEn: 'Personalized Routine',
      titleAr: 'روتين مخصص',
      descEn: "A skincare plan tailored to your skin's needs.",
      descAr: 'خطة عناية بالبشرة مصممة خصيصاً وفق احتياجاتك.',
    },
    {
      id: 'routine-guide',
      titleEn: 'Routine Guide',
      titleAr: 'دليل الروتين',
      descEn: 'A clear schedule explaining what to use and when.',
      descAr: 'جدول واضح يشرح ما تستخدمينه ومتى.',
    },
    {
      id: 'follow-up',
      titleEn: 'Follow-Up',
      titleAr: 'متابعة مستمرة',
      descEn: 'Follow-up support is provided whenever necessary.',
      descAr: 'يُقدَّم دعم المتابعة كلما دعت الحاجة.',
    },
  ],
};

export function Consultation() {
  const { t, lang, dir } = useLanguage();

  const isRTL   = dir === 'rtl';
  const tagline = lang === 'ar' ? data.subtitleAr : data.subtitleEn;

  return (
    <section id="consultation" className="py-24 bg-card/50">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-2xl">

        {/* Section header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('consultation.title')}
            </h2>
            <div className="w-16 h-1 bg-primary mx-auto rounded-full" />
          </motion.div>
        </div>

        {/* Card — matching Pricing card style exactly */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          whileHover={{ y: -6, transition: { duration: 0.2 } }}
          className="relative flex flex-col rounded-3xl border border-border bg-card shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300"
        >
          {/* Card header: tagline + price */}
          <div className="p-8 pb-6">
            {tagline && (
              <h3 className="text-xl font-bold text-foreground leading-snug mb-5">
                {tagline}
              </h3>
            )}
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-extrabold tracking-tight text-foreground">
                {data.price}
              </span>
              <span className="text-sm ms-1 text-foreground/50">
                / {t('pricing.session')}
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="mx-8 h-px bg-border" />

          {/* Checklist + CTA */}
          <div className="p-8 flex-1 flex flex-col">
            <ul className="space-y-4 flex-1">
              {data.items.map((item) => {
                const title = lang === 'ar' ? item.titleAr : item.titleEn;
                const desc  = lang === 'ar' ? item.descAr  : item.descEn;
                return (
                  <li key={item.id} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center flex-none bg-primary/10 mt-0.5">
                      <Check size={11} className="text-primary" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground leading-snug">{title}</p>
                      {desc && (
                        <p className="text-xs text-foreground/55 mt-0.5 leading-relaxed">{desc}</p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>

            <Button
              onClick={() => window.open(
                `${JOTFORM_URL}?input26=${encodeURIComponent('Consultation')}&price=${encodeURIComponent(data.price)}`,
                '_blank',
                'noopener,noreferrer'
              )}
              className="w-full mt-8 rounded-full font-semibold text-base gap-2"
              variant="outline"
              size="lg"
            >
              {t('hero.cta.primary')}
              <ArrowRight className={isRTL ? 'rotate-180' : ''} size={18} />
            </Button>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
