import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ImageLightbox } from './ImageLightbox';

interface BAImage {
  filename: string;
  url: string;
}

const AUTOPLAY_INTERVAL = 4000;

export function BeforeAfter() {
  const { t, dir } = useLanguage();
  const [images, setImages] = useState<BAImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
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

  const prev = useCallback(() => setCurrent((i) => (i - 1 + count) % count), [count]);
  const next = useCallback(() => setCurrent((i) => (i + 1) % count), [count]);

  useEffect(() => {
    if (count < 2 || isPaused) return;
    const t = setTimeout(next, AUTOPLAY_INTERVAL);
    return () => clearTimeout(t);
  }, [current, count, isPaused, next]);

  if (loading) {
    return (
      <section id="before-after" className="py-24 bg-background">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex justify-center gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-72 h-[440px] bg-muted animate-pulse rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="before-after" className="py-24 bg-muted/30 overflow-hidden">
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
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
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
              {/* Edge fade */}
              <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-muted/30 to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-muted/30 to-transparent z-10 pointer-events-none" />

              {/* Slides */}
              <div className="overflow-hidden mx-8">
                <motion.div
                  className="flex gap-5"
                  animate={{
                    x: dir === 'rtl'
                      ? `calc(${current} * (var(--slide-w, 300px) + 20px))`
                      : `calc(-${current} * (var(--slide-w, 300px) + 20px))`,
                  }}
                  transition={{ type: 'spring', stiffness: 280, damping: 35 }}
                  style={{ '--slide-w': '300px' } as React.CSSProperties}
                >
                  {[...images, ...images].map((img, i) => (
                    <div
                      key={`${img.filename}-${i}`}
                      className="flex-none w-[300px] sm:w-[320px] cursor-pointer group"
                      onClick={() => setLightboxIndex(i % count)}
                    >
                      <div className="relative rounded-3xl overflow-hidden shadow-lg ring-1 ring-border/20 group-hover:ring-primary/40 group-hover:shadow-2xl group-hover:-translate-y-1.5 transition-all duration-300">
                        {/* Image */}
                        <div className="h-[460px]">
                          <img
                            src={img.url}
                            alt={`Result ${(i % count) + 1}`}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                          />
                        </div>

                        {/* Zoom hint overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                          <span className="text-white text-sm font-medium bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full">
                            {dir === 'rtl' ? 'اضغط للتكبير' : 'Click to enlarge'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              </div>

              {/* Arrows */}
              <button
                onClick={prev}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-background border border-border shadow-lg rounded-full p-3 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200"
                aria-label="Previous"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                onClick={next}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-background border border-border shadow-lg rounded-full p-3 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200"
                aria-label="Next"
              >
                <ChevronRight size={22} />
              </button>
            </div>

            {/* Dots */}
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
                  aria-label={`Go to image ${i + 1}`}
                />
              ))}
            </div>
          </motion.div>
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
