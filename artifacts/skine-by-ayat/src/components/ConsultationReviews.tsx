import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { consultationReviews } from '@/data/consultationReviews';

function formatDate(iso: string, lang: string): string {
  try {
    return new Date(iso).toLocaleDateString(lang === 'ar' ? 'ar-LB' : 'en-GB', {
      year: 'numeric',
      month: 'long',
    });
  } catch {
    return iso;
  }
}

export function ConsultationReviews() {
  const { t, lang } = useLanguage();

  return (
    <section id="consultation-reviews" className="py-24 bg-card/40">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Quote size={16} />
            <span>{t('consult.reviews.title')}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            {t('consult.reviews.title')}
          </h2>
          <div className="w-16 h-1 bg-primary mx-auto rounded-full mb-4" />
          <p className="text-foreground/60 text-base max-w-xl mx-auto">
            {t('consult.reviews.subtitle')}
          </p>
        </motion.div>

        {/* Cards grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          {consultationReviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative bg-background rounded-3xl p-7 shadow-sm border border-border/50 hover:shadow-xl hover:-translate-y-1 hover:border-primary/30 transition-all duration-300 flex flex-col"
            >
              {/* Large quote decoration */}
              <div className="absolute top-5 end-5 opacity-8">
                <Quote size={48} className="text-primary/15 fill-primary/10" />
              </div>

              {/* Quote icon */}
              <div className="mb-5 inline-flex w-10 h-10 rounded-xl bg-primary/10 items-center justify-center">
                <Quote size={18} className="text-primary fill-primary/20" />
              </div>

              {/* Review text */}
              <blockquote className="flex-1 text-foreground/80 leading-relaxed text-sm md:text-base mb-6">
                {lang === 'ar' ? review.textAr : review.textEn}
              </blockquote>

              {/* Bottom — client info */}
              <div className="flex items-center gap-3 pt-4 border-t border-border/40">
                {/* Avatar placeholder or image */}
                {review.avatar ? (
                  <img
                    src={review.avatar}
                    alt={lang === 'ar' ? review.nameAr : review.nameEn}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/20"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-base select-none">
                    {(lang === 'ar' ? review.nameAr : review.nameEn).charAt(0)}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-foreground text-sm truncate">
                    {lang === 'ar' ? review.nameAr : review.nameEn}
                  </p>
                  {review.date && (
                    <p className="text-foreground/45 text-xs mt-0.5">
                      {formatDate(review.date, lang)}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Edit hint (only in development) */}
        {import.meta.env.DEV && (
          <p className="text-center text-foreground/30 text-xs mt-8">
            {lang === 'ar'
              ? 'لتحديث المراجعات، عدّل ملف src/data/consultationReviews.ts'
              : 'To update reviews, edit src/data/consultationReviews.ts'}
          </p>
        )}
      </div>
    </section>
  );
}
