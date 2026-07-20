import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, MessageSquareQuote } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ImageLightbox } from './ImageLightbox';

interface ReviewImage {
  filename: string;
  url: string;
}

const AUTOPLAY_INTERVAL = 4000;

export function ReviewsCarousel() {
  const { t } = useLanguage();
  const [images, setImages] = useState<ReviewImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchImages = useCallback(async () => {
    try {
      const res = await fetch('/api/images/reviews');
      if (!res.ok) return;
      const data = await res.json();
      setImages(data.images ?? []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchImages(); }, [fetchImages]);

  const count = images.length;

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent((i) => (i - 1 + count) % count);
  }, [count]);

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((i) => (i + 1) % count);
  }, [count]);

  // Autoplay
  useEffect(() => {
    if (count < 2 || isPaused) return;
    timerRef.current = setTimeout(() => { setDirection(1); setCurrent((i) => (i + 1) % count); }, AUTOPLAY_INTERVAL);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [current, count, isPaused]);

  if (loading) {
    return (
      <section id="reviews" className="py-24 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex justify-center gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-64 h-96 bg-muted animate-pulse rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Visible window: show up to 3 cards (center + neighbors) on desktop, 1 on mobile
  const getVisible = () => {
    if (count === 0) return [];
    if (count === 1) return [{ img: images[0], idx: 0, pos: 0 }];
    const items = [];
    for (let offset = -1; offset <= 1; offset++) {
      const idx = (current + offset + count) % count;
      items.push({ img: images[idx], idx, pos: offset });
    }
    return items;
  };

  const visible = getVisible();

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
          <div
            onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
            onTouchEnd={(e) => {
              const delta = e.changedTouches[0].clientX - touchStartX.current;
              if (Math.abs(delta) > 50) delta < 0 ? next() : prev();
            }}
          >
            {/* Single-card display — full image, no cropping */}
            <div className="relative flex items-center justify-center gap-4" dir="ltr">
              {/* Prev arrow */}
              {count > 1 && (
                <button
                  onClick={prev}
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
                    {/* Card wrapper — lets image dictate height */}
                    <div className="rounded-3xl overflow-hidden shadow-xl ring-1 ring-border/20 hover:ring-primary/40 hover:shadow-2xl transition-all duration-300 bg-[#f9f4ef] group">
                      <img
                        src={images[current].url}
                        alt={`Review ${current + 1}`}
                        className="w-full h-auto object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                        style={{ maxHeight: '70vh' }}
                        loading="lazy"
                      />
                      {/* Click-to-expand hint */}
                      <div className="px-4 py-3 text-center">
                        <span className="text-foreground/40 text-xs">
                          {t('reviews.title')} {current + 1} / {count}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Next arrow */}
              {count > 1 && (
                <button
                  onClick={next}
                  className="flex-none z-20 bg-background border border-border shadow-md rounded-full p-2.5 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200"
                  aria-label="Next"
                >
                  <ChevronRight size={20} />
                </button>
              )}
            </div>

            {/* Thumbnail strip (if multiple images) */}
            {count > 1 && (
              <div className="flex justify-center gap-2 mt-6 flex-wrap">
                {images.map((img, i) => (
                  <button
                    key={img.filename}
                    onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
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
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
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
