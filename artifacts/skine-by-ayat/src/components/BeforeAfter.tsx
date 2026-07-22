import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles, X, ZoomIn } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface BAPair {
  id: string;
  beforeUrl: string;
  afterUrl: string;
}

const AUTOPLAY_INTERVAL = 5000;

// ─── Split-view lightbox ───────────────────────────────────────────────────────
function PairLightbox({
  pairs,
  startIndex,
  onClose,
}: {
  pairs: BAPair[];
  startIndex: number;
  onClose: () => void;
}) {
  const { t, dir } = useLanguage();
  const isRTL = dir === 'rtl';
  const [index, setIndex] = useState(startIndex);
  const touchStartX = useRef(0);

  const prev = useCallback(() => setIndex((i) => (i - 1 + pairs.length) % pairs.length), [pairs.length]);
  const next = useCallback(() => setIndex((i) => (i + 1) % pairs.length), [pairs.length]);

  // RTL-aware arrow handlers: physical left = next in RTL, physical right = prev in RTL
  const onLeftArrow  = isRTL ? next : prev;
  const onRightArrow = isRTL ? prev : next;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft')  isRTL ? next() : prev();
      if (e.key === 'ArrowRight') isRTL ? prev() : next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, prev, next, isRTL]);

  const pair = pairs[index];

  return (
    <AnimatePresence>
      <motion.div
        key="lb-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-black/95 flex flex-col items-center justify-center"
        onClick={onClose}
        onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          const d = e.changedTouches[0].clientX - touchStartX.current;
          // Swipe left (d<0) → advance forward; in RTL forward = prev() since index direction is flipped
          if (Math.abs(d) > 50) d < 0 ? onRightArrow() : onLeftArrow();
        }}
      >
        {/* Counter */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/60 text-sm z-10">
          {index + 1} / {pairs.length}
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/70 hover:text-white z-10 p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <X size={24} />
        </button>

        {/* Left arrow — prev in LTR, next in RTL */}
        {pairs.length > 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); onLeftArrow(); }}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 text-white/70 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors"
          >
            <ChevronLeft size={32} />
          </button>
        )}
        {/* Right arrow — next in LTR, prev in RTL */}
        {pairs.length > 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); onRightArrow(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 text-white/70 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors"
          >
            <ChevronRight size={32} />
          </button>
        )}

        {/* Side-by-side pair */}
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="flex gap-1 max-w-[92vw] max-h-[85vh] items-end"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Before */}
          <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
            <span className="text-white/70 text-xs font-semibold uppercase tracking-widest">
              {t('beforeafter.before')}
            </span>
            <img
              src={pair.beforeUrl}
              alt="Before"
              className="max-h-[78vh] max-w-full object-contain rounded-xl shadow-2xl"
            />
          </div>

          {/* Divider */}
          <div className="w-px self-stretch bg-white/20 flex-none mx-1" />

          {/* After */}
          <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
            <span className="text-white/70 text-xs font-semibold uppercase tracking-widest">
              {t('beforeafter.after')}
            </span>
            <img
              src={pair.afterUrl}
              alt="After"
              className="max-h-[78vh] max-w-full object-contain rounded-xl shadow-2xl"
            />
          </div>
        </motion.div>

        {/* Dot indicators */}
        {pairs.length > 1 && pairs.length <= 20 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {pairs.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setIndex(i); }}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? 'bg-white w-4' : 'bg-white/40 w-1.5'
                }`}
              />
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Public section ───────────────────────────────────────────────────────────
export function BeforeAfter() {
  const { t, dir } = useLanguage();
  const isRTL = dir === 'rtl';
  const [pairs, setPairs] = useState<BAPair[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);

  useEffect(() => {
    fetch('/api/before-after')
      .then((r) => r.json())
      .then((d) => setPairs(d.pairs ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const count = pairs.length;
  const prev = useCallback(() => { setDirection(isRTL ? 1 : -1); setCurrent((i) => (i - 1 + count) % count); }, [count, isRTL]);
  const next = useCallback(() => { setDirection(isRTL ? -1 : 1); setCurrent((i) => (i + 1) % count); }, [count, isRTL]);
  const onLeftArrow  = isRTL ? next : prev;
  const onRightArrow = isRTL ? prev : next;

  useEffect(() => {
    if (count < 2 || isPaused) return;
    const id = setTimeout(() => { setDirection(isRTL ? -1 : 1); setCurrent((i) => (i + 1) % count); }, AUTOPLAY_INTERVAL);
    return () => clearTimeout(id);
  }, [current, count, isPaused, isRTL]);

  if (loading) {
    return (
      <section id="before-after" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 max-w-5xl flex justify-center gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex gap-2">
              <div className="w-36 h-64 bg-muted animate-pulse rounded-2xl" />
              <div className="w-36 h-64 bg-muted animate-pulse rounded-2xl" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? 360 : -360, opacity: 0, scale: 0.9 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit:  (d: number) => ({ x: d > 0 ? -360 : 360, opacity: 0, scale: 0.9 }),
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
              if (Math.abs(delta) > 50) delta < 0 ? onRightArrow() : onLeftArrow();
            }}
          >
            <div className="relative flex items-center justify-center gap-4" dir="ltr">
              {count > 1 && (
                <button
                  onClick={onLeftArrow}
                  className="flex-none z-20 bg-background border border-border shadow-lg rounded-full p-3 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200"
                  aria-label="Previous"
                >
                  <ChevronLeft size={22} />
                </button>
              )}

              <div className="flex-1 max-w-2xl mx-auto overflow-hidden">
                <AnimatePresence initial={false} custom={direction} mode="wait">
                  <motion.div
                    key={current}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ type: 'spring', stiffness: 300, damping: 32 }}
                    className="cursor-pointer group"
                    onClick={() => setLightboxIndex(current)}
                  >
                    <div className="rounded-3xl overflow-hidden shadow-2xl ring-1 ring-border/20 group-hover:ring-primary/40 transition-all duration-300 bg-[#f9f4ef]">
                      {/* Split view */}
                      <div className="flex">
                        {/* Before half */}
                        <div className="flex-1 min-w-0 relative">
                          <img
                            src={pairs[current].beforeUrl}
                            alt="Before"
                            className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                            style={{ maxHeight: '68vh', objectPosition: 'center top' }}
                            loading="lazy"
                          />
                          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent py-3 px-3">
                            <span className="text-white text-xs font-semibold uppercase tracking-widest">
                              {t('beforeafter.before')}
                            </span>
                          </div>
                        </div>

                        {/* Divider */}
                        <div className="w-0.5 bg-white/80 flex-none self-stretch z-10" />

                        {/* After half */}
                        <div className="flex-1 min-w-0 relative">
                          <img
                            src={pairs[current].afterUrl}
                            alt="After"
                            className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                            style={{ maxHeight: '68vh', objectPosition: 'center top' }}
                            loading="lazy"
                          />
                          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent py-3 px-3 text-right">
                            <span className="text-white text-xs font-semibold uppercase tracking-widest">
                              {t('beforeafter.after')}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="px-4 py-3 flex items-center justify-between">
                        <span className="text-foreground/40 text-xs">
                          {current + 1} / {count}
                        </span>
                        <span className="flex items-center gap-1 text-primary/60 text-xs">
                          <ZoomIn size={12} /> {t('beforeafter.title')}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {count > 1 && (
                <button
                  onClick={onRightArrow}
                  className="flex-none z-20 bg-background border border-border shadow-lg rounded-full p-3 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200"
                  aria-label="Next"
                >
                  <ChevronRight size={22} />
                </button>
              )}
            </div>

            {/* Dot strip */}
            {count > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                {pairs.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setDirection((i > current ? 1 : -1) * (isRTL ? -1 : 1)); setCurrent(i); }}
                    className={`h-1.5 rounded-full transition-all duration-200 ${
                      i === current ? 'bg-primary w-6' : 'bg-border w-1.5 hover:bg-primary/40'
                    }`}
                    aria-label={`Go to pair ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {lightboxIndex !== null && (
        <PairLightbox
          pairs={pairs}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </section>
  );
}
