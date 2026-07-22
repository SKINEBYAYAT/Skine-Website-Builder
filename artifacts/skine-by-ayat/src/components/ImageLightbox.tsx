import { useEffect, useCallback, useState } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

interface LightboxProps {
  images: { url: string; filename?: string }[];
  startIndex: number;
  onClose: () => void;
}

export function ImageLightbox({ images, startIndex, onClose }: LightboxProps) {
  const { dir } = useLanguage();
  const isRTL = dir === 'rtl';
  const [index, setIndex] = useState(startIndex);
  const [zoomed, setZoomed] = useState(false);

  const prev = useCallback(() => {
    setZoomed(false);
    setIndex((i) => (i - 1 + images.length) % images.length);
  }, [images.length]);

  const next = useCallback(() => {
    setZoomed(false);
    setIndex((i) => (i + 1) % images.length);
  }, [images.length]);

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

  // Swipe support
  let touchStartX = 0;
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const delta = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) > 50) {
      delta < 0 ? onRightArrow() : onLeftArrow();
    }
  };

  const current = images[index];

  return (
    <AnimatePresence>
      <motion.div
        key="lightbox-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center"
        onClick={onClose}
      >
        {/* Counter */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/70 text-sm font-medium z-10">
          {index + 1} / {images.length}
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/70 hover:text-white z-10 p-2 rounded-full hover:bg-white/10 transition-colors"
          aria-label="Close"
        >
          <X size={24} />
        </button>

        {/* Zoom toggle */}
        <button
          onClick={(e) => { e.stopPropagation(); setZoomed((z) => !z); }}
          className="absolute top-4 right-16 text-white/70 hover:text-white z-10 p-2 rounded-full hover:bg-white/10 transition-colors"
          aria-label={zoomed ? 'Zoom out' : 'Zoom in'}
        >
          {zoomed ? <ZoomOut size={20} /> : <ZoomIn size={20} />}
        </button>

        {/* Prev */}
        {images.length > 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white/70 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft size={32} />
          </button>
        )}

        {/* Next */}
        {images.length > 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white/70 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Next"
          >
            <ChevronRight size={32} />
          </button>
        )}

        {/* Image */}
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.25 }}
          className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <img
            src={current.url}
            alt={`Review ${index + 1}`}
            className={`max-w-[90vw] max-h-[90vh] object-contain rounded-xl shadow-2xl transition-transform duration-300 ${
              zoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
            }`}
            onClick={() => setZoomed((z) => !z)}
          />
        </motion.div>

        {/* Dot indicators */}
        {images.length > 1 && images.length <= 20 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setZoomed(false); setIndex(i); }}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  i === index ? 'bg-white w-4' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
