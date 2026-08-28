import { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ImageLightbox } from './ImageLightbox';
import { loadReviewImages } from '@/lib/supabase';

// ─── Static assets — images baked in at build time (ordered as in admin) ──────
import review1 from '@/assets/review1.jpeg';
import review2 from '@/assets/review2.jpeg';
import review3 from '@/assets/review3.jpeg';
import review4 from '@/assets/review4.jpeg';
import review5 from '@/assets/review5.jpeg';
import review6 from '@/assets/review6.jpeg';
import review7 from '@/assets/review7.jpeg';

interface ReviewImage {
  filename: string;
  url: string;
}

const DEFAULT_IMAGES: ReviewImage[] = [
  { filename: 'review1.jpeg', url: review1 },
  { filename: 'review2.jpeg', url: review2 },
  { filename: 'review3.jpeg', url: review3 },
  { filename: 'review4.jpeg', url: review4 },
  { filename: 'review5.jpeg', url: review5 },
  { filename: 'review6.jpeg', url: review6 },
  { filename: 'review7.jpeg', url: review7 },
];

const AUTOPLAY_INTERVAL = 4000;

export function ReviewsCarousel() {
  const { t, dir } = useLanguage();
  const isRTL = dir === 'rtl';
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [images, setImages] = useState<ReviewImage[]>(DEFAULT_IMAGES);
  const touchStartX = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const count = images.length;

  useEffect(() => {
    loadReviewImages()
      .then((uploaded) => { if (uploaded.length) setImages(uploaded); })
      .catch(() => { /* Keep built-in images when Supabase is unavailable. */ });
  }, []);

  const prev = useCallback(() => {
    setDirection(isRTL ? 1 : -1);
    setCurrent((i) => (i - 1 + count) % count);
  }, [count, isRTL]);

  const next = useCallback(() => {
    setDirection(isRTL ? -1 : 1);
    setCurrent((i) => (i + 1) % count);
  }, [count, isRTL]);

  const onLeftArrow  = isRTL ? next : prev;
  const onRightArrow = isRTL ? prev : next;

  useEffect(() => {
    if (count < 2 || isPaused) return;
    timerRef.current = setTimeout(() => {
      setDirection(isRTL ? -1 : 1);
      setCurrent((i) => (i + 1) % count);
    }, AUTOPLAY_INTERVAL);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [current, count, isPaused, isRTL]);

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? 300 : -300, opacity: 0, scale: 0.85 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (d: number) => ({ x: d > 0 ? -300 : 300, opacity: 0, scale: 0.85 }),
  };

  return (
    <section
      id="reviews"
      className="py-24 bg-background overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            {t('reviews.title')}
          </h2>
          <div className="w-16 h-1 bg-primary mx-auto rounded-full mb-4" />
          <p className="text-foreground/60 text-base max-w-xl mx-auto">
            {t('reviews.subtitle')}
          </p>
        </motion.div>

        <div
          onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
          onTouchEnd={(e) => {
            const delta = e.changedTouches[0].clientX - touchStartX.current;
            if (Math.abs(delta) > 50) delta < 0 ? onRightArrow() : onLeftArrow();
          }}
        >
          {/* Single-card display */}
          <div className="relative flex items-center justify-center gap-4" dir="ltr">
            {count > 1 && (
              <button
                onClick={onLeftArrow}
                className="flex-none z-20 bg-background border border-border shadow-md rounded-full p-2.5 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200"
                aria-label="Previous"
              >
                <ChevronLeft size={20} />
              </button>
            )}

            {/* Card */}
            <div className="relative overflow-hidden flex-1 max-w-sm mx-auto">
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={current}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: 'spring', stiffness: 350, damping: 35 }}
                  className="cursor-pointer"
                  onClick={() => setLightboxIndex(current)}
                >
                  <div className="rounded-3xl overflow-hidden shadow-xl ring-1 ring-border/20 hover:ring-primary/40 hover:shadow-2xl transition-all duration-300 bg-[#f9f4ef] group">
                    <img
                      src={images[current].url}
                      alt={`Review ${current + 1}`}
                      className="w-full h-auto object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                      style={{ maxHeight: '70vh' }}
                    />
                    <div className="px-4 py-3 text-center">
                      <span className="text-foreground/40 text-xs">
                        {t('reviews.title')} {current + 1} / {count}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {count > 1 && (
              <button
                onClick={onRightArrow}
                className="flex-none z-20 bg-background border border-border shadow-md rounded-full p-2.5 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200"
                aria-label="Next"
              >
                <ChevronRight size={20} />
              </button>
            )}
          </div>

          {/* Thumbnail strip */}
          {count > 1 && (
            <div className="flex justify-center gap-2 mt-6 flex-wrap">
              {images.map((img, i) => (
                <button
                  key={img.filename}
                  onClick={() => { setDirection((i > current ? 1 : -1) * (isRTL ? -1 : 1)); setCurrent(i); }}
                  className={`relative w-12 h-12 rounded-xl overflow-hidden border-2 transition-all duration-200 flex-none ${
                    i === current
                      ? 'border-primary shadow-md scale-110'
                      : 'border-border/40 opacity-60 hover:opacity-100 hover:border-primary/50'
                  }`}
                  aria-label={`Go to review ${i + 1}`}
                >
                  <img
                    src={img.url}
                    alt={`Thumbnail ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <ImageLightbox
          images={images}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </section>
  );
}
