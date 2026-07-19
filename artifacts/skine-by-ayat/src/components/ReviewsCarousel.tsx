import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, MessageSquareQuote } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ImageLightbox } from './ImageLightbox';

interface ReviewImage {
  filename: string;
  url: string;
}

const AUTOPLAY_INTERVAL = 3500;

export function ReviewsCarousel() {
  const { t, dir } = useLanguage();
  const [images, setImages] = useState<ReviewImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Touch swipe
  const touchStartX = useRef(0);

  const fetchImages = useCallback(async () => {
    try {
      const res = await fetch('/api/images/reviews');
      if (!res.ok) return;
      const data = await res.json();
      setImages(data.images ?? []);
    } catch {
      // silently fail — section shows empty state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchImages(); }, [fetchImages]);

  const count = images.length;

  const prev = useCallback(() => {
    setCurrent((i) => (i - 1 + count) % count);
  }, [count]);

  const next = useCallback(() => {
    setCurrent((i) => (i + 1) % count);
  }, [count]);

  // Autoplay
  useEffect(() => {
    if (count < 2 || isPaused) return;
    timerRef.current = setTimeout(next, AUTOPLAY_INTERVAL);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [current, count, isPaused, next]);

  if (loading) {
    return (
      <section id="reviews" className="py-24 bg-background">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex justify-center gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-64 h-80 bg-muted animate-pulse rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="reviews" className="py-24 bg-background overflow-hidden">
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
            <MessageSquareQuote size={16} />
            <span>{t('reviews.title')}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            {t('reviews.title')}
          </h2>
          <div className="w-16 h-1 bg-primary mx-auto rounded-full mb-4" />
          <p className="text-foreground/60 text-base max-w-xl mx-auto">
            {t('reviews.subtitle')}
          </p>
        </motion.div>

        {count === 0 ? (
          <p className="text-center text-foreground/40 py-12">{t('reviews.empty')}</p>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            {/* Carousel track */}
            <div
              className="relative"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
              onTouchEnd={(e) => {
                const delta = e.changedTouches[0].clientX - touchStartX.current;
                if (Math.abs(delta) > 50) delta < 0 ? next() : prev();
              }}
            >
              {/* Faded edge gradients */}
              <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

              {/* Slides */}
              <div className="overflow-hidden mx-8">
                <motion.div
                  className="flex gap-4"
                  animate={{ x: dir === 'rtl'
                    ? `calc(${current} * (var(--slide-w, 280px) + 16px))`
                    : `calc(-${current} * (var(--slide-w, 280px) + 16px))` }}
                  transition={{ type: 'spring', stiffness: 300, damping: 35 }}
                  style={{ '--slide-w': '280px' } as React.CSSProperties}
                >
                  {/* Infinite: duplicate for loop feel */}
                  {[...images, ...images].map((img, i) => (
                    <div
                      key={`${img.filename}-${i}`}
                      className="flex-none w-[280px] sm:w-[300px] cursor-pointer group"
                      onClick={() => setLightboxIndex(i % count)}
                    >
                      <div className="relative h-[380px] sm:h-[420px] rounded-2xl overflow-hidden shadow-lg ring-1 ring-border/20 group-hover:ring-primary/40 transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
                        <img
                          src={img.url}
                          alt={`Review ${(i % count) + 1}`}
                          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-300 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-background/90 rounded-full p-3 shadow-lg">
                            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              </div>

              {/* Navigation arrows */}
              <button
                onClick={prev}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-background border border-border shadow-md rounded-full p-2.5 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200"
                aria-label="Previous"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={next}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-background border border-border shadow-md rounded-full p-2.5 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200"
                aria-label="Next"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Dot indicators */}
            <div className="flex justify-center gap-2 mt-8">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === current % count
                      ? 'bg-primary w-6'
                      : 'bg-primary/30 w-1.5 hover:bg-primary/60'
                  }`}
                  aria-label={`Go to review ${i + 1}`}
                />
              ))}
            </div>
          </motion.div>
        )}
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
