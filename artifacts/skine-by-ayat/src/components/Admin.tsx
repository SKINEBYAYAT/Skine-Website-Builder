import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Trash2, LogOut, Lock, CheckCircle, AlertCircle,
  ImageIcon, X, GripVertical, Map, ChevronDown, Plus,
  DollarSign, RefreshCw, CalendarCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { convertToEmbedUrl, isShortLink } from '@/lib/mapsUtils';
import { adminFetch as fetch, migrateDefaultContent, supabase } from '@/lib/supabase';
import { STATIC_CATEGORIES } from '@/components/Pricing';
import { DEFAULT_CONSULTATION_DATA } from '@/components/Consultation';

// ─── Password ─────────────────────────────────────────────────────────────────
const RAW_PW = import.meta.env.VITE_ADMIN_PASSWORD;
const ADMIN_PASSWORD =
  typeof RAW_PW === 'string' && RAW_PW.trim() !== '' ? RAW_PW.trim() : 'skine2025';

type Collection = 'reviews' | 'before-after';
interface APIImage { filename: string; url: string; }
type Status = { type: 'success' | 'error'; message: string } | null;

// ─── Before & After types ─────────────────────────────────────────────────────
interface BAPair {
  id: string;
  beforeFilename: string;
  afterFilename: string;
  beforeUrl: string;
  afterUrl: string;
}

// ─── Pricing types ────────────────────────────────────────────────────────────
interface PricingService { ar: string; en: string; }
interface PricingPackage {
  id: string;
  nameAr: string;
  nameEn: string;
  price: string;
  featured?: boolean;
  services: PricingService[];
}
interface PricingCategory {
  id: string;
  nameAr: string;
  nameEn: string;
  packages: PricingPackage[];
}
interface PricingData { categories: PricingCategory[]; }

// ─── Consultation types ───────────────────────────────────────────────────────
interface ConsultationItem {
  id: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
}
interface ConsultationData {
  price: string;
  subtitleAr: string;
  subtitleEn: string;
  items: ConsultationItem[];
}

// ─── Confirmation dialog ──────────────────────────────────────────────────────
function ConfirmDialog({
  message,
  onConfirm,
  onCancel,
}: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-background rounded-2xl border border-border shadow-2xl p-6 w-full max-w-sm z-10"
      >
        <div className="flex items-start gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center flex-none">
            <Trash2 size={16} className="text-red-600" />
          </div>
          <p className="text-sm text-foreground leading-relaxed pt-1.5">{message}</p>
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" className="rounded-full" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            size="sm"
            className="rounded-full bg-red-500 hover:bg-red-600 text-white border-0"
            onClick={onConfirm}
          >
            Delete
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Shared status banner ─────────────────────────────────────────────────────
function StatusBanner({ status }: { status: Status }) {
  if (!status) return null;
  return (
    <AnimatePresence>
      <motion.div
        key={status.message + status.type}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className={`flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl ${
          status.type === 'success'
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}
      >
        {status.type === 'success' ? (
          <CheckCircle size={15} />
        ) : (
          <AlertCircle size={15} />
        )}
        {status.message}
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Accordion section wrapper ────────────────────────────────────────────────
function Section({
  icon, title, subtitle, defaultOpen = false, children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-background rounded-2xl border border-border shadow-sm overflow-hidden mb-4">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-4 px-6 py-5 text-left hover:bg-muted/30 transition-colors"
      >
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-none text-primary">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground">{title}</p>
          {subtitle && (
            <p className="text-xs text-foreground/50 mt-0.5">{subtitle}</p>
          )}
        </div>
        <ChevronDown
          size={18}
          className={`text-foreground/40 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-6 pb-6 pt-1 border-t border-border">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Collection image hook ────────────────────────────────────────────────────
function useImages(collection: Collection) {
  const [images, setImages] = useState<APIImage[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/images/${collection}`);
      const data = await res.json();
      setImages(data.images ?? []);
    } catch {
      setImages([]);
    } finally {
      setLoading(false);
    }
  }, [collection]);

  useEffect(() => { reload(); }, [reload]);
  return { images, setImages, loading, reload };
}

// ─── Upload zone ──────────────────────────────────────────────────────────────
function UploadZone({
  collection,
  onUploaded,
  compact = false,
}: {
  collection: Collection;
  onUploaded: () => void;
  compact?: boolean;
}) {
  const { t } = useLanguage();
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const upload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setStatus(null);
    let succeeded = 0;
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append('image', file);
      try {
        const res = await fetch(`/api/images/${collection}`, { method: 'POST', body: fd });
        if (res.ok) succeeded++;
        else throw new Error();
      } catch {
        setStatus({ type: 'error', message: `Failed: ${file.name}` });
      }
    }
    if (succeeded) {
      setStatus({ type: 'success', message: t('admin.saved') });
      onUploaded();
    }
    setUploading(false);
  };

  if (compact) {
    return (
      <>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={(e) => upload(e.target.files)}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="rounded-full gap-1.5 w-full"
        >
          <Upload size={14} />
          {uploading ? t('admin.uploading') : 'Upload Images'}
        </Button>
        <StatusBanner status={status} />
      </>
    );
  }

  return (
    <div className="space-y-3">
      <div
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors duration-200 ${
          dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); upload(e.dataTransfer.files); }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={(e) => upload(e.target.files)}
        />
        <Upload size={28} className="mx-auto mb-3 text-primary/60" />
        <p className="font-semibold text-foreground mb-1 text-sm">
          {uploading ? t('admin.uploading') : 'Drop images here or click to upload'}
        </p>
        <p className="text-foreground/50 text-xs mb-4">JPG, PNG, WebP, GIF · max 25 MB</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="rounded-full"
        >
          {uploading ? t('admin.uploading') : t('admin.upload')}
        </Button>
      </div>
      <StatusBanner status={status} />
    </div>
  );
}

// ─── Image card (preview + actions) ──────────────────────────────────────────
function ImageCard({
  image,
  index,
  collection,
  onDelete,
  onReplaced,
  dragHandleProps,
}: {
  image: APIImage;
  index: number;
  collection: Collection;
  onDelete: (filename: string) => void;
  onReplaced: () => void;
  dragHandleProps: {
    onDragStart: () => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: () => void;
  };
}) {
  const { t } = useLanguage();
  const [confirm, setConfirm] = useState(false);
  const [replacing, setReplacing] = useState(false);
  const replaceRef = useRef<HTMLInputElement>(null);

  const handleReplace = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setReplacing(true);
    const fd = new FormData();
    fd.append('image', files[0]);
    try {
      // Upload new image first
      const uploadRes = await fetch(`/api/images/${collection}`, { method: 'POST', body: fd });
      if (!uploadRes.ok) throw new Error();
      // Then delete the old one
      await fetch(`/api/images/${collection}/${encodeURIComponent(image.filename)}`, { method: 'DELETE' });
      onReplaced();
    } catch {
      // still refresh to avoid inconsistent state
      onReplaced();
    }
    setReplacing(false);
  };

  return (
    <>
      {confirm && (
        <ConfirmDialog
          message="Are you sure you want to delete this image? This cannot be undone."
          onConfirm={() => { setConfirm(false); onDelete(image.filename); }}
          onCancel={() => setConfirm(false)}
        />
      )}

      <div
        draggable
        onDragStart={dragHandleProps.onDragStart}
        onDragOver={dragHandleProps.onDragOver}
        onDrop={dragHandleProps.onDrop}
        className="group bg-background border border-border rounded-2xl overflow-hidden shadow-sm flex flex-col"
      >
        {/* Image preview */}
        <div className="relative bg-muted/30 aspect-[3/4] overflow-hidden">
          <img
            src={image.url}
            alt={`Image ${index + 1}`}
            className="w-full h-full object-contain"
          />
          {/* Drag handle overlay */}
          <div className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm rounded-lg p-1.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing shadow-sm">
            <GripVertical size={14} className="text-foreground/50" />
          </div>
          {/* Image number badge */}
          <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-lg px-2 py-0.5 text-xs font-medium text-foreground/60">
            #{index + 1}
          </div>
        </div>

        {/* Action buttons */}
        <div className="p-3 flex gap-2">
          {/* Replace */}
          <input
            ref={replaceRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => handleReplace(e.target.files)}
          />
          <button
            onClick={() => replaceRef.current?.click()}
            disabled={replacing}
            title="Replace image"
            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-foreground/60 hover:text-primary border border-border rounded-xl py-2 transition-colors hover:border-primary/40 hover:bg-primary/5 disabled:opacity-50"
          >
            <RefreshCw size={13} className={replacing ? 'animate-spin' : ''} />
            {replacing ? 'Replacing…' : 'Replace'}
          </button>

          {/* Delete */}
          <button
            onClick={() => setConfirm(true)}
            title="Delete image"
            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-red-400 hover:text-red-600 border border-border rounded-xl py-2 transition-colors hover:border-red-200 hover:bg-red-50"
          >
            <Trash2 size={13} />
            Delete
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Drag-reorderable image grid (card-based) ─────────────────────────────────
function ImageGrid({
  collection,
  images,
  setImages,
  onDelete,
  onReplaced,
}: {
  collection: Collection;
  images: APIImage[];
  setImages: React.Dispatch<React.SetStateAction<APIImage[]>>;
  onDelete: (filename: string) => void;
  onReplaced: () => void;
}) {
  const dragIdx = useRef<number | null>(null);

  const handleDrop = async (targetIdx: number) => {
    if (dragIdx.current === null || dragIdx.current === targetIdx) return;
    const next = [...images];
    const [moved] = next.splice(dragIdx.current, 1);
    next.splice(targetIdx, 0, moved);
    dragIdx.current = null;
    setImages(next);
    await fetch(`/api/images/${collection}/reorder`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: next.map((img) => img.filename) }),
    });
  };

  if (images.length === 0) {
    return (
      <div className="text-center py-10 text-foreground/30 text-sm">
        <ImageIcon size={32} className="mx-auto mb-2 opacity-30" />
        No images yet — upload some above.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
      {images.map((img, i) => (
        <ImageCard
          key={img.filename}
          image={img}
          index={i}
          collection={collection}
          onDelete={onDelete}
          onReplaced={onReplaced}
          dragHandleProps={{
            onDragStart: () => { dragIdx.current = i; },
            onDragOver: (e) => e.preventDefault(),
            onDrop: () => handleDrop(i),
          }}
        />
      ))}
    </div>
  );
}

// ─── Before & After panel ─────────────────────────────────────────────────────
function BeforeAfterPanel() {
  const [pairs, setPairs] = useState<BAPair[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<Status>(null);

  // Add-pair form state
  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [afterFile, setAfterFile] = useState<File | null>(null);
  const [beforePreview, setBeforePreview] = useState<string | null>(null);
  const [afterPreview, setAfterPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const beforeInputRef = useRef<HTMLInputElement>(null);
  const afterInputRef  = useRef<HTMLInputElement>(null);
  const dragIdx        = useRef<number | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/before-after');
      const d = await res.json();
      setPairs(d.pairs ?? []);
    } catch { setPairs([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  // Preview helpers
  const pickBefore = (files: FileList | null) => {
    if (!files?.length) return;
    setBeforeFile(files[0]);
    setBeforePreview(URL.createObjectURL(files[0]));
  };
  const pickAfter = (files: FileList | null) => {
    if (!files?.length) return;
    setAfterFile(files[0]);
    setAfterPreview(URL.createObjectURL(files[0]));
  };

  // Submit new pair
  const submitPair = async () => {
    if (!beforeFile || !afterFile) {
      setStatus({ type: 'error', message: 'Please select both a Before and an After photo.' });
      return;
    }
    setUploading(true);
    setStatus(null);
    const fd = new FormData();
    fd.append('beforeImage', beforeFile);
    fd.append('afterImage',  afterFile);
    try {
      const res = await fetch('/api/before-after', { method: 'POST', body: fd });
      if (!res.ok) throw new Error();
      setBeforeFile(null); setAfterFile(null);
      setBeforePreview(null); setAfterPreview(null);
      setStatus({ type: 'success', message: 'Pair added.' });
      reload();
    } catch {
      setStatus({ type: 'error', message: 'Upload failed — try again.' });
    }
    setUploading(false);
  };

  // Replace before or after image of an existing pair
  const replaceSide = async (pairId: string, side: 'before' | 'after', files: FileList | null) => {
    if (!files?.length) return;
    const fd = new FormData();
    fd.append('image', files[0]);
    try {
      const res = await fetch(`/api/before-after/${pairId}/${side}`, { method: 'PUT', body: fd });
      if (!res.ok) throw new Error();
      setStatus({ type: 'success', message: `${side === 'before' ? 'Before' : 'After'} photo replaced.` });
      reload();
    } catch {
      setStatus({ type: 'error', message: 'Replace failed — try again.' });
    }
  };

  // Delete pair
  const deletePair = async (pairId: string) => {
    try {
      const res = await fetch(`/api/before-after/${pairId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setStatus({ type: 'success', message: 'Pair deleted.' });
      reload();
    } catch {
      setStatus({ type: 'error', message: 'Delete failed — try again.' });
    }
  };

  // Reorder pairs via drag
  const handleDrop = async (targetIdx: number) => {
    if (dragIdx.current === null || dragIdx.current === targetIdx) return;
    const next = [...pairs];
    const [moved] = next.splice(dragIdx.current, 1);
    next.splice(targetIdx, 0, moved);
    dragIdx.current = null;
    setPairs(next);
    await fetch('/api/before-after/reorder', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: next.map((p) => p.id) }),
    });
  };

  return (
    <div className="space-y-5 pt-4">

      {/* ── Add new pair ── */}
      <div className="border-2 border-dashed border-border rounded-2xl p-5 space-y-4">
        <p className="text-sm font-semibold text-foreground/80">Add New Before & After Pair</p>

        <div className="grid grid-cols-2 gap-4">
          {/* Before slot */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-foreground/60 uppercase tracking-wide">Before Photo</p>
            <input ref={beforeInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => pickBefore(e.target.files)} />
            <button
              onClick={() => beforeInputRef.current?.click()}
              className={`w-full rounded-xl border-2 transition-all overflow-hidden ${
                beforePreview ? 'border-primary/40' : 'border-border hover:border-primary/50 bg-muted/30'
              }`}
              style={{ minHeight: 120 }}
            >
              {beforePreview ? (
                <img src={beforePreview} alt="Before preview" className="w-full h-auto object-cover" style={{ maxHeight: 180 }} />
              ) : (
                <div className="flex flex-col items-center justify-center py-8 gap-2 text-foreground/30">
                  <ImageIcon size={24} />
                  <span className="text-xs">Click to select</span>
                </div>
              )}
            </button>
            {beforePreview && (
              <button onClick={() => { setBeforeFile(null); setBeforePreview(null); }}
                className="text-xs text-red-400 hover:text-red-600 transition w-full text-center">
                Remove
              </button>
            )}
          </div>

          {/* After slot */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-foreground/60 uppercase tracking-wide">After Photo</p>
            <input ref={afterInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => pickAfter(e.target.files)} />
            <button
              onClick={() => afterInputRef.current?.click()}
              className={`w-full rounded-xl border-2 transition-all overflow-hidden ${
                afterPreview ? 'border-primary/40' : 'border-border hover:border-primary/50 bg-muted/30'
              }`}
              style={{ minHeight: 120 }}
            >
              {afterPreview ? (
                <img src={afterPreview} alt="After preview" className="w-full h-auto object-cover" style={{ maxHeight: 180 }} />
              ) : (
                <div className="flex flex-col items-center justify-center py-8 gap-2 text-foreground/30">
                  <ImageIcon size={24} />
                  <span className="text-xs">Click to select</span>
                </div>
              )}
            </button>
            {afterPreview && (
              <button onClick={() => { setAfterFile(null); setAfterPreview(null); }}
                className="text-xs text-red-400 hover:text-red-600 transition w-full text-center">
                Remove
              </button>
            )}
          </div>
        </div>

        <Button
          onClick={submitPair}
          disabled={uploading || !beforeFile || !afterFile}
          className="rounded-full gap-1.5 w-full"
        >
          <Upload size={14} />
          {uploading ? 'Uploading…' : 'Add Pair'}
        </Button>
      </div>

      <StatusBanner status={status} />

      {/* ── Existing pairs ── */}
      {loading ? (
        <div className="text-center py-8 text-foreground/30 text-sm">Loading…</div>
      ) : pairs.length === 0 ? (
        <div className="text-center py-10 text-foreground/30 text-sm">
          <ImageIcon size={32} className="mx-auto mb-2 opacity-30" />
          No pairs yet — add one above.
        </div>
      ) : (
        <div className="space-y-3">
          {pairs.map((pair, i) => (
            <BAPairCard
              key={pair.id}
              pair={pair}
              index={i}
              onDelete={() => deletePair(pair.id)}
              onReplaceBefore={(files) => replaceSide(pair.id, 'before', files)}
              onReplaceAfter={(files) => replaceSide(pair.id, 'after', files)}
              dragHandleProps={{
                onDragStart: () => { dragIdx.current = i; },
                onDragOver: (e) => e.preventDefault(),
                onDrop: () => handleDrop(i),
              }}
            />
          ))}
          <p className="text-center text-xs text-foreground/30 pt-1">
            ↕ Drag cards to reorder · {pairs.length} pair{pairs.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Before & After pair card ─────────────────────────────────────────────────
function BAPairCard({
  pair,
  index,
  onDelete,
  onReplaceBefore,
  onReplaceAfter,
  dragHandleProps,
}: {
  pair: BAPair;
  index: number;
  onDelete: () => void;
  onReplaceBefore: (files: FileList | null) => void;
  onReplaceAfter:  (files: FileList | null) => void;
  dragHandleProps: {
    onDragStart: () => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: () => void;
  };
}) {
  const [confirm, setConfirm] = useState(false);
  const replaceBeforeRef = useRef<HTMLInputElement>(null);
  const replaceAfterRef  = useRef<HTMLInputElement>(null);

  return (
    <>
      {confirm && (
        <ConfirmDialog
          message="Delete this Before & After pair? Both photos will be removed and this cannot be undone."
          onConfirm={() => { setConfirm(false); onDelete(); }}
          onCancel={() => setConfirm(false)}
        />
      )}

      <div
        draggable
        onDragStart={dragHandleProps.onDragStart}
        onDragOver={dragHandleProps.onDragOver}
        onDrop={dragHandleProps.onDrop}
        className="border border-border rounded-2xl overflow-hidden bg-background"
      >
        <div className="flex items-center gap-3 px-4 py-3 bg-muted/30 border-b border-border">
          <div className="cursor-grab active:cursor-grabbing text-foreground/30 hover:text-foreground/60 transition flex-none">
            <GripVertical size={16} />
          </div>
          <span className="text-xs text-foreground/50 flex-1">Pair {index + 1}</span>
          <button
            onClick={() => setConfirm(true)}
            className="text-red-400 hover:text-red-600 transition flex items-center gap-1 text-xs"
          >
            <Trash2 size={13} /> Delete pair
          </button>
        </div>

        <div className="grid grid-cols-2 gap-0">
          {/* Before */}
          <div className="p-3 space-y-2 border-r border-border">
            <p className="text-xs font-semibold text-foreground/50 uppercase tracking-wide">Before</p>
            <div className="rounded-xl overflow-hidden bg-muted/20">
              <img src={pair.beforeUrl} alt="Before" className="w-full h-auto object-cover" style={{ maxHeight: 200 }} />
            </div>
            <input ref={replaceBeforeRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => onReplaceBefore(e.target.files)} />
            <button
              onClick={() => replaceBeforeRef.current?.click()}
              className="flex items-center gap-1 text-xs text-primary hover:text-primary/70 transition"
            >
              <RefreshCw size={11} /> Replace Before
            </button>
          </div>

          {/* After */}
          <div className="p-3 space-y-2">
            <p className="text-xs font-semibold text-foreground/50 uppercase tracking-wide">After</p>
            <div className="rounded-xl overflow-hidden bg-muted/20">
              <img src={pair.afterUrl} alt="After" className="w-full h-auto object-cover" style={{ maxHeight: 200 }} />
            </div>
            <input ref={replaceAfterRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => onReplaceAfter(e.target.files)} />
            <button
              onClick={() => replaceAfterRef.current?.click()}
              className="flex items-center gap-1 text-xs text-primary hover:text-primary/70 transition"
            >
              <RefreshCw size={11} /> Replace After
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Collection panel (reviews / before-after) ────────────────────────────────
function CollectionPanel({
  collection,
}: {
  collection: Collection;
}) {
  const { images, setImages, loading, reload } = useImages(collection);
  const [status, setStatus] = useState<Status>(null);

  const handleDelete = async (filename: string) => {
    try {
      const res = await fetch(
        `/api/images/${collection}/${encodeURIComponent(filename)}`,
        { method: 'DELETE' },
      );
      if (!res.ok) throw new Error();
      setStatus({ type: 'success', message: 'Image deleted.' });
      reload();
    } catch {
      setStatus({ type: 'error', message: 'Delete failed — please try again.' });
    }
  };

  return (
    <div className="space-y-4 pt-4">
      <UploadZone collection={collection} onUploaded={reload} />
      <StatusBanner status={status} />
      {loading ? (
        <div className="text-center py-8 text-foreground/30 text-sm">Loading…</div>
      ) : (
        <ImageGrid
          collection={collection}
          images={images}
          setImages={setImages}
          onDelete={handleDelete}
          onReplaced={reload}
        />
      )}
      {images.length > 0 && (
        <p className="text-center text-xs text-foreground/30 pt-1">
          Drag cards to reorder · {images.length} image{images.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}

// ─── Google Maps panel ────────────────────────────────────────────────────────
function MapsPanel() {
  const { t } = useLanguage();
  const [value, setValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data: Record<string, string>) => { setValue(data['maps_url'] ?? ''); })
      .catch(() => {});
  }, []);

  const embedPreview = value.trim() ? convertToEmbedUrl(value.trim()) : null;
  const shortLink = value.trim() ? isShortLink(value.trim()) : false;

  const save = async () => {
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch('/api/settings/maps_url', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value }),
      });
      if (!res.ok) throw new Error();
      setStatus({ type: 'success', message: t('admin.saved') });
    } catch {
      setStatus({ type: 'error', message: 'Save failed' });
    }
    setSaving(false);
  };

  const clear = async () => {
    setSaving(true);
    try {
      await fetch('/api/settings/maps_url', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: '' }),
      });
      setValue('');
      setStatus({ type: 'success', message: 'Map cleared' });
    } catch {
      setStatus({ type: 'error', message: 'Failed' });
    }
    setSaving(false);
  };

  return (
    <div className="space-y-4 pt-4">
      <p className="text-xs text-foreground/50 leading-relaxed">{t('admin.maps.hint')}</p>

      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="https://www.google.com/maps/embed?pb=..."
        rows={3}
        className="w-full rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm text-foreground placeholder:text-foreground/30 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 transition font-mono"
        dir="ltr"
      />

      {value.trim() && (
        <div className="text-xs rounded-xl px-4 py-3 border">
          {embedPreview ? (
            <p className="text-green-700 flex items-center gap-1.5">
              <CheckCircle size={13} /> URL converted — map will display on site.
            </p>
          ) : shortLink ? (
            <div className="text-amber-700 space-y-1">
              <p className="font-medium">Short links cannot be auto-converted.</p>
              <p>In Google Maps tap <strong>Share → Embed a map → Copy HTML</strong>, then paste the full <code className="bg-amber-50 px-1 rounded">src="…"</code> URL here.</p>
            </div>
          ) : (
            <div className="text-amber-700 space-y-1">
              <p className="font-medium">Could not convert this URL automatically.</p>
              <p>Open Google Maps → find your location → tap <strong>Share → Embed a map</strong> → copy the <code className="bg-amber-50 px-1 rounded">src</code> URL and paste it here.</p>
            </div>
          )}
        </div>
      )}

      {embedPreview && (
        <div className="rounded-2xl overflow-hidden border border-border">
          <iframe
            src={embedPreview}
            width="100%"
            height="260"
            style={{ border: 0, display: 'block' }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Map preview"
          />
        </div>
      )}

      <div className="flex gap-2 flex-wrap items-center">
        <Button size="sm" onClick={save} disabled={saving} className="rounded-full gap-1.5">
          {saving ? t('admin.saving') : t('admin.maps.save')}
        </Button>
        {value.trim() && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clear}
            disabled={saving}
            className="rounded-full gap-1.5 text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <X size={14} /> {t('admin.maps.clear')}
          </Button>
        )}
        <StatusBanner status={status} />
      </div>
    </div>
  );
}

// ─── Service row (edit + drag + delete with confirm) ─────────────────────────
function ServiceRow({
  svc,
  svcIdx,
  pkgIdx,
  isOnly,
  onUpdate,
  onDelete,
  dragHandleProps,
}: {
  svc: PricingService;
  svcIdx: number;
  pkgIdx: number;
  isOnly: boolean;
  onUpdate: (patch: Partial<PricingService>) => void;
  onDelete: () => void;
  dragHandleProps: {
    onDragStart: () => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: () => void;
    isDragTarget: boolean;
  };
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <>
      {confirmDelete && (
        <ConfirmDialog
          message="Are you sure you want to delete this service? This cannot be undone."
          onConfirm={() => { setConfirmDelete(false); onDelete(); }}
          onCancel={() => setConfirmDelete(false)}
        />
      )}

      <div
        draggable
        onDragStart={dragHandleProps.onDragStart}
        onDragOver={dragHandleProps.onDragOver}
        onDrop={dragHandleProps.onDrop}
        className={`flex items-center gap-2 rounded-xl border transition-colors ${
          dragHandleProps.isDragTarget
            ? 'border-primary/50 bg-primary/5'
            : 'border-border bg-background'
        } px-2 py-1.5 group`}
      >
        {/* Drag handle */}
        <div
          className="cursor-grab active:cursor-grabbing text-foreground/25 hover:text-foreground/50 transition-colors flex-none px-0.5"
          title="Drag to reorder"
        >
          <GripVertical size={15} />
        </div>

        {/* EN input */}
        <input
          value={svc.en}
          onChange={(e) => onUpdate({ en: e.target.value })}
          placeholder="Service name (EN)"
          className="flex-1 min-w-0 bg-transparent text-sm text-foreground placeholder:text-foreground/30 focus:outline-none py-0.5"
          dir="ltr"
        />

        {/* Divider */}
        <div className="w-px h-5 bg-border flex-none" />

        {/* AR input */}
        <input
          value={svc.ar}
          onChange={(e) => onUpdate({ ar: e.target.value })}
          placeholder="اسم الخدمة (AR)"
          className="flex-1 min-w-0 bg-transparent text-sm text-foreground placeholder:text-foreground/30 focus:outline-none py-0.5"
          dir="rtl"
        />

        {/* Delete button — always visible */}
        <button
          onClick={() => setConfirmDelete(true)}
          title="Delete service"
          className="flex-none flex items-center gap-1.5 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-colors"
        >
          <Trash2 size={13} />
          Delete
        </button>
      </div>
    </>
  );
}

// ─── Pricing panel ────────────────────────────────────────────────────────────
function PricingPanel() {
  const { t } = useLanguage();
  const [data, setData] = useState<PricingData | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  const [openCats, setOpenCats] = useState<Record<string, boolean>>({});
  const svcDragSrc = useRef<{ catIdx: number; pkgIdx: number; svcIdx: number } | null>(null);
  const [svcDragTarget, setSvcDragTarget] = useState<{ catIdx: number; pkgIdx: number; svcIdx: number } | null>(null);

  useEffect(() => {
    fetch('/api/pricing')
      .then((r) => r.json())
      .then((d: PricingData) => {
        const next = Array.isArray(d.categories) ? d : { categories: STATIC_CATEGORIES };
        setData(next);
      })
      .catch(() => setData({ categories: [] }));
  }, []);

  // ── Persist ──────────────────────────────────────────────────────────────────
  const save = async (updated: PricingData, silent = false) => {
    setSaving(true);
    if (!silent) setStatus(null);
    try {
      const res = await fetch('/api/pricing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (!res.ok) throw new Error();
      setData(updated);
      if (!silent) setStatus({ type: 'success', message: t('admin.saved') });
    } catch {
      setStatus({ type: 'error', message: 'Save failed' });
    }
    setSaving(false);
  };

  // ── Category helpers ─────────────────────────────────────────────────────────
  const updateCat = (catIdx: number, patch: Partial<PricingCategory>) => {
    if (!data) return;
    const cats = [...data.categories];
    cats[catIdx] = { ...cats[catIdx], ...patch };
    setData({ categories: cats });
  };

  const removeCat = (catIdx: number) => {
    if (!data) return;
    save({ categories: data.categories.filter((_, i) => i !== catIdx) });
  };

  const moveCat = (catIdx: number, dir: -1 | 1) => {
    if (!data) return;
    const cats = [...data.categories];
    const target = catIdx + dir;
    if (target < 0 || target >= cats.length) return;
    [cats[catIdx], cats[target]] = [cats[target], cats[catIdx]];
    setData({ categories: cats });
  };

  const addCat = () => {
    if (!data) return;
    const newCat: PricingCategory = {
      id: `cat-${Date.now()}`,
      nameEn: 'New Category',
      nameAr: 'تصنيف جديد',
      packages: [],
    };
    setData({ categories: [...data.categories, newCat] });
    setOpenCats((prev) => ({ ...prev, [newCat.id]: true }));
  };

  // ── Package helpers ──────────────────────────────────────────────────────────
  const updatePkg = (catIdx: number, pkgIdx: number, patch: Partial<PricingPackage>) => {
    if (!data) return;
    const cats = [...data.categories];
    const pkgs = [...cats[catIdx].packages];
    pkgs[pkgIdx] = { ...pkgs[pkgIdx], ...patch };
    cats[catIdx] = { ...cats[catIdx], packages: pkgs };
    setData({ categories: cats });
  };

  const removePkg = (catIdx: number, pkgIdx: number) => {
    if (!data) return;
    const cats = [...data.categories];
    cats[catIdx] = { ...cats[catIdx], packages: cats[catIdx].packages.filter((_, i) => i !== pkgIdx) };
    save({ categories: cats });
  };

  const movePkg = (catIdx: number, pkgIdx: number, dir: -1 | 1) => {
    if (!data) return;
    const cats = [...data.categories];
    const pkgs = [...cats[catIdx].packages];
    const target = pkgIdx + dir;
    if (target < 0 || target >= pkgs.length) return;
    [pkgs[pkgIdx], pkgs[target]] = [pkgs[target], pkgs[pkgIdx]];
    cats[catIdx] = { ...cats[catIdx], packages: pkgs };
    setData({ categories: cats });
  };

  const addPkg = (catIdx: number) => {
    if (!data) return;
    const cats = [...data.categories];
    cats[catIdx] = {
      ...cats[catIdx],
      packages: [...cats[catIdx].packages, {
        id: `pkg-${Date.now()}`,
        nameAr: '',
        nameEn: 'New Package',
        price: '$0',
        featured: false,
        services: [],
      }],
    };
    setData({ categories: cats });
  };

  // ── Service helpers ──────────────────────────────────────────────────────────
  const addService = (catIdx: number, pkgIdx: number) => {
    if (!data) return;
    const cats = [...data.categories];
    const pkgs = [...cats[catIdx].packages];
    pkgs[pkgIdx] = { ...pkgs[pkgIdx], services: [...pkgs[pkgIdx].services, { ar: '', en: '' }] };
    cats[catIdx] = { ...cats[catIdx], packages: pkgs };
    setData({ categories: cats });
  };

  const updateService = (catIdx: number, pkgIdx: number, svcIdx: number, patch: Partial<PricingService>) => {
    if (!data) return;
    const cats = [...data.categories];
    const pkgs = [...cats[catIdx].packages];
    const svcs = [...pkgs[pkgIdx].services];
    svcs[svcIdx] = { ...svcs[svcIdx], ...patch };
    pkgs[pkgIdx] = { ...pkgs[pkgIdx], services: svcs };
    cats[catIdx] = { ...cats[catIdx], packages: pkgs };
    setData({ categories: cats });
  };

  const deleteService = (catIdx: number, pkgIdx: number, svcIdx: number) => {
    if (!data) return;
    const cats = [...data.categories];
    const pkgs = [...cats[catIdx].packages];
    pkgs[pkgIdx] = { ...pkgs[pkgIdx], services: pkgs[pkgIdx].services.filter((_, i) => i !== svcIdx) };
    cats[catIdx] = { ...cats[catIdx], packages: pkgs };
    save({ categories: cats });
  };

  const dropService = (toCatIdx: number, toPkgIdx: number, toSvcIdx: number) => {
    const src = svcDragSrc.current;
    setSvcDragTarget(null);
    svcDragSrc.current = null;
    if (!data || !src) return;
    if (src.catIdx !== toCatIdx || src.pkgIdx !== toPkgIdx || src.svcIdx === toSvcIdx) return;
    const cats = [...data.categories];
    const pkgs = [...cats[toCatIdx].packages];
    const svcs = [...pkgs[toPkgIdx].services];
    const [moved] = svcs.splice(src.svcIdx, 1);
    svcs.splice(toSvcIdx, 0, moved);
    pkgs[toPkgIdx] = { ...pkgs[toPkgIdx], services: svcs };
    cats[toCatIdx] = { ...cats[toCatIdx], packages: pkgs };
    save({ categories: cats });
  };

  if (!data) {
    return <div className="text-center py-8 text-foreground/30 text-sm pt-4">Loading…</div>;
  }

  return (
    <div className="space-y-4 pt-4">
      {data.categories.map((cat, catIdx) => {
        const isOpen = !!openCats[cat.id];
        return (
          <div key={cat.id} className="border border-border rounded-2xl overflow-hidden">

            {/* ── Category header ── */}
            <div className="bg-primary/5 px-4 py-3 flex items-center gap-3">
              {/* Reorder */}
              <div className="flex flex-col gap-0.5 flex-none">
                <button onClick={() => moveCat(catIdx, -1)} disabled={catIdx === 0}
                  className="text-foreground/40 hover:text-foreground disabled:opacity-20 transition text-xs px-1 leading-none" title="Move category up">▲</button>
                <button onClick={() => moveCat(catIdx, 1)} disabled={catIdx === data.categories.length - 1}
                  className="text-foreground/40 hover:text-foreground disabled:opacity-20 transition text-xs px-1 leading-none" title="Move category down">▼</button>
              </div>

              {/* Name inputs */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input value={cat.nameEn} onChange={(e) => updateCat(catIdx, { nameEn: e.target.value })}
                  placeholder="Category name (EN)"
                  className="rounded-xl border border-border bg-background px-3 py-1.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30" dir="ltr" />
                <input value={cat.nameAr} onChange={(e) => updateCat(catIdx, { nameAr: e.target.value })}
                  placeholder="اسم التصنيف (AR)"
                  className="rounded-xl border border-border bg-background px-3 py-1.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30" dir="rtl" />
              </div>

              {/* Delete + collapse */}
              <div className="flex items-center gap-2 flex-none">
                <button onClick={() => removeCat(catIdx)} className="text-red-400 hover:text-red-600 transition" title="Delete category">
                  <Trash2 size={15} />
                </button>
                <button onClick={() => setOpenCats((prev) => ({ ...prev, [cat.id]: !isOpen }))}
                  className="text-foreground/40 hover:text-foreground transition">
                  <ChevronDown size={17} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>

            {/* ── Packages (collapsible) ── */}
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: 'easeInOut' }}
                  style={{ overflow: 'hidden' }}
                >
                  <div className="p-4 space-y-4 border-t border-border">
                    {cat.packages.length === 0 && (
                      <p className="text-xs text-foreground/30 text-center py-3">No packages yet — add one below.</p>
                    )}

                    {cat.packages.map((pkg, pkgIdx) => (
                      <div key={pkg.id} className="border border-border rounded-2xl overflow-hidden">

                        {/* Package header */}
                        <div className="bg-muted/30 px-4 py-4 flex items-start gap-3">
                          <div className="flex flex-col gap-0.5 pt-1 flex-none">
                            <button onClick={() => movePkg(catIdx, pkgIdx, -1)} disabled={pkgIdx === 0}
                              className="text-foreground/40 hover:text-foreground disabled:opacity-20 transition text-xs px-1 leading-none" title="Move package up">▲</button>
                            <button onClick={() => movePkg(catIdx, pkgIdx, 1)} disabled={pkgIdx === cat.packages.length - 1}
                              className="text-foreground/40 hover:text-foreground disabled:opacity-20 transition text-xs px-1 leading-none" title="Move package down">▼</button>
                          </div>

                          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <input value={pkg.nameEn} onChange={(e) => updatePkg(catIdx, pkgIdx, { nameEn: e.target.value })}
                              placeholder="Package name (EN)"
                              className="rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" dir="ltr" />
                            <input value={pkg.nameAr} onChange={(e) => updatePkg(catIdx, pkgIdx, { nameAr: e.target.value })}
                              placeholder="اسم الباقة (AR)"
                              className="rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" dir="rtl" />
                            <input value={pkg.price} onChange={(e) => updatePkg(catIdx, pkgIdx, { price: e.target.value })}
                              placeholder="$40"
                              className="rounded-xl border border-border bg-background px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/30" dir="ltr" />
                          </div>

                          <div className="flex items-center gap-3 flex-none">
                            <label className="flex items-center gap-1.5 text-xs text-foreground/50 cursor-pointer select-none">
                              <input type="checkbox" checked={!!pkg.featured}
                                onChange={(e) => updatePkg(catIdx, pkgIdx, { featured: e.target.checked })}
                                className="rounded accent-primary" />
                              {t('admin.featured')}
                            </label>
                            <button onClick={() => removePkg(catIdx, pkgIdx)}
                              className="text-red-400 hover:text-red-600 transition" title="Delete package">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        {/* Services list */}
                        <div className="p-4 space-y-1.5">
                          {pkg.services.length === 0 && (
                            <p className="text-xs text-foreground/30 text-center py-2">No services yet — add one below.</p>
                          )}

                          {pkg.services.map((svc, svcIdx) => (
                            <ServiceRow
                              key={`${pkg.id}-${svcIdx}`}
                              svc={svc}
                              svcIdx={svcIdx}
                              pkgIdx={pkgIdx}
                              isOnly={pkg.services.length === 1}
                              onUpdate={(patch) => updateService(catIdx, pkgIdx, svcIdx, patch)}
                              onDelete={() => deleteService(catIdx, pkgIdx, svcIdx)}
                              dragHandleProps={{
                                onDragStart: () => { svcDragSrc.current = { catIdx, pkgIdx, svcIdx }; },
                                onDragOver: (e) => { e.preventDefault(); setSvcDragTarget({ catIdx, pkgIdx, svcIdx }); },
                                onDrop: () => dropService(catIdx, pkgIdx, svcIdx),
                                isDragTarget:
                                  svcDragTarget?.catIdx === catIdx &&
                                  svcDragTarget?.pkgIdx === pkgIdx &&
                                  svcDragTarget?.svcIdx === svcIdx,
                              }}
                            />
                          ))}

                          {pkg.services.length > 1 && (
                            <p className="text-xs text-foreground/30 pt-1 pb-0.5">↕ Drag rows to reorder</p>
                          )}

                          <button onClick={() => addService(catIdx, pkgIdx)}
                            className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition mt-2 pt-1">
                            <Plus size={14} /> {t('admin.add.service')}
                          </button>
                        </div>
                      </div>
                    ))}

                    <button onClick={() => addPkg(catIdx)}
                      className="flex items-center gap-2 text-sm text-primary border border-primary/30 hover:border-primary rounded-xl px-4 py-2.5 transition w-full justify-center">
                      <Plus size={14} /> {t('admin.add.package')}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      {/* Add category */}
      <button onClick={addCat}
        className="flex items-center gap-2 text-sm text-primary border border-dashed border-primary/40 hover:border-primary rounded-xl px-4 py-3 transition w-full justify-center">
        <Plus size={15} /> {t('admin.add.category')}
      </button>

      {/* Save all */}
      <div className="flex items-center gap-3 flex-wrap">
        <Button onClick={() => data && save(data)} disabled={saving} className="rounded-full gap-1.5">
          {saving ? t('admin.saving') : t('admin.save.all')}
        </Button>
        <p className="text-xs text-foreground/40">Service deletions & reorders save automatically.</p>
        <StatusBanner status={status} />
      </div>
    </div>
  );
}

// ─── Consultation item row ────────────────────────────────────────────────────
function ConsultationItemRow({
  item,
  index,
  isOnly,
  onUpdate,
  onDelete,
  dragHandleProps,
}: {
  item: ConsultationItem;
  index: number;
  isOnly: boolean;
  onUpdate: (patch: Partial<ConsultationItem>) => void;
  onDelete: () => void;
  dragHandleProps: {
    onDragStart: () => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: () => void;
    isDragTarget: boolean;
  };
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <>
      {confirmDelete && (
        <ConfirmDialog
          message="Delete this checklist item? This cannot be undone."
          onConfirm={() => { setConfirmDelete(false); onDelete(); }}
          onCancel={() => setConfirmDelete(false)}
        />
      )}

      <div
        draggable
        onDragStart={dragHandleProps.onDragStart}
        onDragOver={dragHandleProps.onDragOver}
        onDrop={dragHandleProps.onDrop}
        className={`rounded-2xl border transition-colors overflow-hidden ${
          dragHandleProps.isDragTarget
            ? 'border-primary/50 bg-primary/5'
            : 'border-border bg-background'
        }`}
      >
        {/* Row header */}
        <div className="flex items-center gap-3 px-4 py-2.5 bg-muted/30 border-b border-border">
          <div
            className="cursor-grab active:cursor-grabbing text-foreground/30 hover:text-foreground/60 transition flex-none"
            title="Drag to reorder"
          >
            <GripVertical size={15} />
          </div>
          <span className="text-xs font-medium text-foreground/50 flex-1">Item {index + 1}</span>
          {!isOnly && (
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 transition"
            >
              <Trash2 size={12} /> Delete
            </button>
          )}
        </div>

        {/* Fields */}
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* English */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-foreground/40 uppercase tracking-wide">English</p>
            <input
              value={item.titleEn}
              onChange={(e) => onUpdate({ titleEn: e.target.value })}
              placeholder="Title (EN)"
              className="w-full rounded-lg border border-border bg-muted/20 px-3 py-1.5 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
              dir="ltr"
            />
            <textarea
              value={item.descEn}
              onChange={(e) => onUpdate({ descEn: e.target.value })}
              placeholder="Description (EN)"
              rows={2}
              className="w-full rounded-lg border border-border bg-muted/20 px-3 py-1.5 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/30 transition resize-none"
              dir="ltr"
            />
          </div>

          {/* Arabic */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-foreground/40 uppercase tracking-wide">Arabic / العربية</p>
            <input
              value={item.titleAr}
              onChange={(e) => onUpdate({ titleAr: e.target.value })}
              placeholder="العنوان (AR)"
              className="w-full rounded-lg border border-border bg-muted/20 px-3 py-1.5 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
              dir="rtl"
            />
            <textarea
              value={item.descAr}
              onChange={(e) => onUpdate({ descAr: e.target.value })}
              placeholder="الوصف (AR)"
              rows={2}
              className="w-full rounded-lg border border-border bg-muted/20 px-3 py-1.5 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/30 transition resize-none"
              dir="rtl"
            />
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Consultation panel ───────────────────────────────────────────────────────
function ConsultationPanel() {
  const { t } = useLanguage();

  const DEFAULT: ConsultationData = DEFAULT_CONSULTATION_DATA;

  const [data, setData] = useState<ConsultationData | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  const dragSrc = useRef<number | null>(null);
  const [dragTarget, setDragTarget] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/consultation')
      .then((r) => r.json())
      .then((d: ConsultationData) => setData(d?.items ? d : DEFAULT))
      .catch(() => setData(DEFAULT));
  }, []);

  const save = async (updated: ConsultationData, silent = false) => {
    setSaving(true);
    if (!silent) setStatus(null);
    try {
      const res = await fetch('/api/consultation', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (!res.ok) throw new Error();
      setData(updated);
      if (!silent) setStatus({ type: 'success', message: t('admin.saved') });
    } catch {
      setStatus({ type: 'error', message: 'Save failed — please try again.' });
    }
    setSaving(false);
  };

  const updateField = (patch: Partial<ConsultationData>) => {
    if (!data) return;
    setData({ ...data, ...patch });
  };

  const updateItem = (idx: number, patch: Partial<ConsultationItem>) => {
    if (!data) return;
    const items = [...data.items];
    items[idx] = { ...items[idx], ...patch };
    setData({ ...data, items });
  };

  const deleteItem = (idx: number) => {
    if (!data) return;
    const updated = { ...data, items: data.items.filter((_, i) => i !== idx) };
    save(updated);
  };

  const addItem = () => {
    if (!data) return;
    const newItem: ConsultationItem = {
      id: `item-${Date.now()}`,
      titleEn: '',
      titleAr: '',
      descEn: '',
      descAr: '',
    };
    setData({ ...data, items: [...data.items, newItem] });
  };

  const dropItem = (toIdx: number) => {
    const fromIdx = dragSrc.current;
    setDragTarget(null);
    dragSrc.current = null;
    if (!data || fromIdx === null || fromIdx === toIdx) return;
    const items = [...data.items];
    const [moved] = items.splice(fromIdx, 1);
    items.splice(toIdx, 0, moved);
    save({ ...data, items });
  };

  if (!data) {
    return <div className="text-center py-8 text-foreground/30 text-sm pt-4">Loading…</div>;
  }

  return (
    <div className="space-y-5 pt-4">
      {/* Settings: price + heading */}
      <div className="rounded-2xl border border-border bg-background p-5 space-y-4">
        <p className="text-xs font-semibold text-foreground/50 uppercase tracking-wide">Settings</p>

        {/* Price */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-foreground w-16 flex-none">Price</label>
          <input
            value={data.price}
            onChange={(e) => updateField({ price: e.target.value })}
            placeholder="$35"
            className="w-32 rounded-xl border border-border bg-muted/20 px-3 py-1.5 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
            dir="ltr"
          />
        </div>

        {/* Tagline EN */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Card Tagline (EN)</label>
          <input
            value={data.subtitleEn}
            onChange={(e) => updateField({ subtitleEn: e.target.value })}
            placeholder="Skin consultation and skincare routine planning"
            className="w-full rounded-xl border border-border bg-muted/20 px-3 py-2 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
            dir="ltr"
          />
        </div>

        {/* Tagline AR */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Card Tagline (AR)</label>
          <input
            value={data.subtitleAr}
            onChange={(e) => updateField({ subtitleAr: e.target.value })}
            placeholder="استشارة جلدية وتخطيط روتين العناية"
            className="w-full rounded-xl border border-border bg-muted/20 px-3 py-2 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
            dir="rtl"
          />
        </div>
      </div>

      {/* Checklist items */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-foreground/50 uppercase tracking-wide">Checklist Items</p>

        {data.items.length === 0 ? (
          <div className="text-center py-8 text-foreground/30 text-sm border border-dashed border-border rounded-2xl">
            No items yet — add one below.
          </div>
        ) : (
          <div className="space-y-3">
            {data.items.map((item, i) => (
              <ConsultationItemRow
                key={item.id}
                item={item}
                index={i}
                isOnly={data.items.length === 1}
                onUpdate={(patch) => updateItem(i, patch)}
                onDelete={() => deleteItem(i)}
                dragHandleProps={{
                  onDragStart: () => { dragSrc.current = i; },
                  onDragOver: (e) => { e.preventDefault(); setDragTarget(i); },
                  onDrop: () => dropItem(i),
                  isDragTarget: dragTarget === i,
                }}
              />
            ))}
            <p className="text-center text-xs text-foreground/30 pt-1">
              ↕ Drag items to reorder · {data.items.length} item{data.items.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        {/* Add item */}
        <button
          onClick={addItem}
          className="flex items-center gap-2 text-sm text-primary border border-dashed border-primary/40 hover:border-primary rounded-xl px-4 py-2.5 transition w-full justify-center"
        >
          <Plus size={14} /> Add Checklist Item
        </button>
      </div>

      {/* Save all */}
      <div className="flex items-center gap-3 flex-wrap">
        <Button onClick={() => data && save(data)} disabled={saving} className="rounded-full gap-1.5">
          {saving ? t('admin.saving') : t('admin.save.all')}
        </Button>
        <p className="text-xs text-foreground/40">Item deletions &amp; reorders save automatically.</p>
        <StatusBanner status={status} />
      </div>
    </div>
  );
}

// ─── Login screen ─────────────────────────────────────────────────────────────
function LoginScreen() {
  const { t } = useLanguage();
  const [pw, setPw] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const attempt = async () => {
    setError('');
    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password: pw });
    if (loginError) setError(loginError.message);
  };

  return (
    <div className="min-h-screen bg-muted/20 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-background rounded-3xl border border-border shadow-xl p-8"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Lock size={24} className="text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground">{t('admin.title')}</h1>
          <p className="text-muted-foreground text-sm mt-1">Skiné by Ayat</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); attempt(); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-border bg-muted/20 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t('admin.password.label')}
            </label>
            <input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder={t('admin.password.prompt')}
              className="w-full rounded-xl border border-border bg-muted/20 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
            />
          </div>
          {error && (
            <p className="text-red-500 text-xs flex items-center gap-1.5">
              <AlertCircle size={13} /> {error}
            </p>
          )}
          <Button type="submit" className="w-full rounded-full">{t('admin.login')}</Button>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Admin page root ──────────────────────────────────────────────────────────
export function Admin() {
  const { t, lang, setLang } = useLanguage();
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session) await migrateDefaultContent();
      setAuthed(Boolean(data.session));
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthed(Boolean(session));
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const logout = () => { void supabase.auth.signOut(); };
  const toggleLang = () => { setLang(lang === 'ar' ? 'en' : 'ar'); };

  if (authed === null) return null;
  if (!authed) return <LoginScreen />;

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Lock size={15} className="text-primary" />
          </div>
          <div>
            <h1 className="font-bold text-foreground leading-none">{t('admin.title')}</h1>
            <p className="text-foreground/50 text-xs mt-0.5">Skiné by Ayat</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="p-2 rounded-full text-foreground/60 hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Refresh admin panel"
            title="Refresh admin panel"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={toggleLang}
            className="text-sm font-semibold px-3 py-1 rounded-full border border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200"
            aria-label="Toggle language"
          >
            {lang === 'ar' ? 'English' : 'العربية'}
          </button>
          <Button variant="outline" size="sm" onClick={logout} className="gap-1.5 rounded-full">
            <LogOut size={14} /> {t('admin.logout')}
          </Button>
        </div>
      </header>

      {/* Sections */}
      <main className="max-w-3xl mx-auto px-4 md:px-8 py-10">

        {/* 1 — Pricing */}
        <Section icon={<DollarSign size={17} />} title={t('admin.pricing')} subtitle="Edit prices, services & packages">
          <PricingPanel />
        </Section>

        {/* 2 — Consultation */}
        <Section icon={<CalendarCheck size={17} />} title="Consultation" subtitle="Edit price, heading & checklist items">
          <ConsultationPanel />
        </Section>

        {/* 3 — Client Reviews */}
        <Section icon={<ImageIcon size={17} />} title={t('admin.reviews')} subtitle="Upload, replace, reorder & delete review screenshots">
          <CollectionPanel collection="reviews" />
        </Section>

        {/* 3 — Before & After */}
        <Section icon={<ImageIcon size={17} />} title={t('admin.beforeafter')} subtitle="Add, replace, reorder & delete before/after pairs">
          <BeforeAfterPanel />
        </Section>

        {/* 4 — Google Maps */}
        <Section icon={<Map size={17} />} title={t('admin.maps')} subtitle="Paste a Google Maps link to show your location">
          <MapsPanel />
        </Section>

      </main>
    </div>
  );
}
