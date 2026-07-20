import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ImageLightbox } from './ImageLightbox';

interface BAImage {
  filename: string;
  url: string;
}

const AUTOPLAY_INTERVAL = 4500;

export function BeforeAfter() {
  const { t } = useLanguage();
  const [images, setImages] = useState<BAImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);

  const fetchImages = useCallback(async () => {
    try {
      const res = await fetch('/api/images/before-after');
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

  const prev = useCallback(() => { setDirection(-1); setCurrent((i) => (i - 1 + count) % count); }, [count]);
  const next = useCallback(() => { setDirection(1);  setCurrent((i) => (i + 1) % count); }, [count]);

  useEffect(() => {
    if (count < 2 || isPaused) return;
    const id = setTimeout(() => { setDirection(1); setCurrent((i) => (i + 1) % count); }, AUTOPLAY_INTERVAL);
    return () => clearTimeout(id);
  }, [current, count, isPaused]);

  if (loading) {
    return (
      <section id="before-after" className="py-24 bg-muted/30">
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

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? 320 : -320, opacity: 0, scale: 0.88 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit:  (d: number) => ({ x: d > 0 ? -320 : 320, opacity: 0, scale: 0.88 }),
  };

  return (
    <section
      id="before-after"
      className="py-24 bg-muted/30 overflow-hidden"
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
            <Sparkles size={16} />
            <span>{t('beforeafter.title')}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            {t('beforeafter.title')}
          </h2>
          <div className="w-16 h-1 bg-primary mx-auto rounded-full mb-4" />
          <p className="text-foreground/60 text-base max-w-xl mx-auto">
            {t('beforeafter.subtitle')}
          </p>
        </motion.div>

        {count === 0 ? (
          <p className="text-center text-foreground/40 py-12">{t('beforeafter.empty')}</p>
        ) : (
          <div
            onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
            onTouchEnd={(e) => {
              const delta = e.changedTouches[0].clientX - touchStartX.current;
              if (Math.abs(delta) > 50) delta < 0 ? next() : prev();
            }}
          >
            <div className="relative flex items-center justify-center gap-4" dir="ltr">
              {count > 1 && (
                <button
                  onClick={prev}
                  className="flex-none z-20 bg-background border border-border shadow-lg rounded-full p-3 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200"
                  aria-label="Previous"
                >
                  <ChevronLeft size={22} />
                </button>
              )}

              <div className="flex-1 max-w-md mx-auto overflow-hidden">
                <AnimatePresence initial={false} custom={direction} mode="wait">
                  <motion.div
                    key={current}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ type: 'spring', stiffness: 320, damping: 35 }}
                    className="cursor-pointer group"
                    onClick={() => setLightboxIndex(current)}
                  >
                    <div className="rounded-3xl overflow-hidden shadow-2xl ring-1 ring-border/20 group-hover:ring-primary/40 group-hover:shadow-2xl transition-all duration-300 bg-[#f9f4ef]">
                      <img
                        src={images[current].url}
                        alt={`Result ${current + 1}`}
                        className="w-full h-auto object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                        style={{ maxHeight: '72vh' }}
                        loading="lazy"
                      />
                      <div className="px-4 py-3 text-center">
                        <span className="text-foreground/40 text-xs">
                          {current + 1} / {count} — {t('beforeafter.title')}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {count > 1 && (
                <button
                  onClick={next}
                  className="flex-none z-20 bg-background border border-border shadow-lg rounded-full p-3 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200"
                  aria-label="Next"
                >
                  <ChevronRight size={22} />
                </button>
              )}
            </div>

            {/* Thumbnail strip */}
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
                    aria-label={`Go to image ${i + 1}`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

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
