import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Trash2, LogOut, Lock, CheckCircle, AlertCircle,
  ImageIcon, X, GripVertical, Map, ChevronDown, Plus,
  DollarSign, RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { convertToEmbedUrl, isShortLink } from '@/lib/mapsUtils';

// ─── Password ─────────────────────────────────────────────────────────────────
const RAW_PW = import.meta.env.VITE_ADMIN_PASSWORD;
const ADMIN_PASSWORD =
  typeof RAW_PW === 'string' && RAW_PW.trim() !== '' ? RAW_PW.trim() : 'skine2025';

type Collection = 'reviews' | 'before-after';
interface APIImage { filename: string; url: string; }
type Status = { type: 'success' | 'error'; message: string } | null;

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
interface PricingData { packages: PricingPackage[]; }

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
  // Tracks which service is being dragged: { pkgIdx, svcIdx }
  const svcDragSrc = useRef<{ pkgIdx: number; svcIdx: number } | null>(null);
  const [svcDragTarget, setSvcDragTarget] = useState<{ pkgIdx: number; svcIdx: number } | null>(null);

  useEffect(() => {
    fetch('/api/pricing')
      .then((r) => r.json())
      .then((d: PricingData) => setData(d))
      .catch(() => setData({ packages: [] }));
  }, []);

  // ── Persist to API ──────────────────────────────────────────────────────────
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
      setStatus({ type: 'success', message: t('admin.saved') });
    } catch {
      setStatus({ type: 'error', message: 'Save failed' });
    }
    setSaving(false);
  };

  // ── Package helpers ─────────────────────────────────────────────────────────
  const updatePkg = (idx: number, patch: Partial<PricingPackage>) => {
    if (!data) return;
    const pkgs = [...data.packages];
    pkgs[idx] = { ...pkgs[idx], ...patch };
    setData({ packages: pkgs });
  };

  const removePkg = (idx: number) => {
    if (!data) return;
    const updated = { packages: data.packages.filter((_, i) => i !== idx) };
    save(updated);
  };

  const movePkg = (idx: number, dir: -1 | 1) => {
    if (!data) return;
    const pkgs = [...data.packages];
    const target = idx + dir;
    if (target < 0 || target >= pkgs.length) return;
    [pkgs[idx], pkgs[target]] = [pkgs[target], pkgs[idx]];
    setData({ packages: pkgs });
  };

  const addPkg = () => {
    if (!data) return;
    const newPkg: PricingPackage = {
      id: `pkg-${Date.now()}`,
      nameAr: '',
      nameEn: 'New Package',
      price: '$0',
      featured: false,
      services: [],
    };
    setData({ packages: [...data.packages, newPkg] });
  };

  // ── Service helpers ─────────────────────────────────────────────────────────
  const addService = (pkgIdx: number) => {
    if (!data) return;
    const pkgs = [...data.packages];
    pkgs[pkgIdx] = { ...pkgs[pkgIdx], services: [...pkgs[pkgIdx].services, { ar: '', en: '' }] };
    setData({ packages: pkgs });
  };

  const updateService = (pkgIdx: number, svcIdx: number, patch: Partial<PricingService>) => {
    if (!data) return;
    const pkgs = [...data.packages];
    const svcs = [...pkgs[pkgIdx].services];
    svcs[svcIdx] = { ...svcs[svcIdx], ...patch };
    pkgs[pkgIdx] = { ...pkgs[pkgIdx], services: svcs };
    setData({ packages: pkgs });
  };

  // Delete service → auto-save immediately
  const deleteService = (pkgIdx: number, svcIdx: number) => {
    if (!data) return;
    const pkgs = [...data.packages];
    pkgs[pkgIdx] = {
      ...pkgs[pkgIdx],
      services: pkgs[pkgIdx].services.filter((_, i) => i !== svcIdx),
    };
    const updated = { packages: pkgs };
    save(updated);
  };

  // Reorder services via drag-and-drop → auto-save
  const dropService = (toPkgIdx: number, toSvcIdx: number) => {
    const src = svcDragSrc.current;
    setSvcDragTarget(null);
    svcDragSrc.current = null;
    if (!data || !src) return;
    if (src.pkgIdx !== toPkgIdx || src.svcIdx === toSvcIdx) return;
    const pkgs = [...data.packages];
    const svcs = [...pkgs[toPkgIdx].services];
    const [moved] = svcs.splice(src.svcIdx, 1);
    svcs.splice(toSvcIdx, 0, moved);
    pkgs[toPkgIdx] = { ...pkgs[toPkgIdx], services: svcs };
    const updated = { packages: pkgs };
    save(updated);
  };

  if (!data) {
    return <div className="text-center py-8 text-foreground/30 text-sm pt-4">Loading…</div>;
  }

  return (
    <div className="space-y-5 pt-4">
      {data.packages.map((pkg, pkgIdx) => (
        <div key={pkg.id} className="border border-border rounded-2xl overflow-hidden">

          {/* ── Package header ── */}
          <div className="bg-muted/30 px-4 py-4 flex items-start gap-3">
            {/* Up/down reorder */}
            <div className="flex flex-col gap-0.5 pt-1 flex-none">
              <button
                onClick={() => movePkg(pkgIdx, -1)}
                disabled={pkgIdx === 0}
                className="text-foreground/40 hover:text-foreground disabled:opacity-20 transition leading-none text-xs px-1"
                title="Move package up"
              >▲</button>
              <button
                onClick={() => movePkg(pkgIdx, 1)}
                disabled={pkgIdx === data.packages.length - 1}
                className="text-foreground/40 hover:text-foreground disabled:opacity-20 transition leading-none text-xs px-1"
                title="Move package down"
              >▼</button>
            </div>

            {/* Package fields */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                value={pkg.nameEn}
                onChange={(e) => updatePkg(pkgIdx, { nameEn: e.target.value })}
                placeholder="Package name (EN)"
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                dir="ltr"
              />
              <input
                value={pkg.nameAr}
                onChange={(e) => updatePkg(pkgIdx, { nameAr: e.target.value })}
                placeholder="اسم الباقة (AR)"
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                dir="rtl"
              />
              <input
                value={pkg.price}
                onChange={(e) => updatePkg(pkgIdx, { price: e.target.value })}
                placeholder="$40"
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/30"
                dir="ltr"
              />
            </div>

            {/* Featured + delete package */}
            <div className="flex items-center gap-3 flex-none">
              <label className="flex items-center gap-1.5 text-xs text-foreground/50 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={!!pkg.featured}
                  onChange={(e) => updatePkg(pkgIdx, { featured: e.target.checked })}
                  className="rounded accent-primary"
                />
                {t('admin.featured')}
              </label>
              <button
                onClick={() => removePkg(pkgIdx)}
                className="text-red-400 hover:text-red-600 transition"
                title="Delete this package"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {/* ── Services list ── */}
          <div className="p-4 space-y-1.5">
            {pkg.services.length === 0 && (
              <p className="text-xs text-foreground/30 text-center py-2">
                No services yet — add one below.
              </p>
            )}

            {pkg.services.map((svc, svcIdx) => (
              <ServiceRow
                key={`${pkg.id}-${svcIdx}`}
                svc={svc}
                svcIdx={svcIdx}
                pkgIdx={pkgIdx}
                isOnly={pkg.services.length === 1}
                onUpdate={(patch) => updateService(pkgIdx, svcIdx, patch)}
                onDelete={() => deleteService(pkgIdx, svcIdx)}
                dragHandleProps={{
                  onDragStart: () => {
                    svcDragSrc.current = { pkgIdx, svcIdx };
                  },
                  onDragOver: (e) => {
                    e.preventDefault();
                    setSvcDragTarget({ pkgIdx, svcIdx });
                  },
                  onDrop: () => dropService(pkgIdx, svcIdx),
                  isDragTarget:
                    svcDragTarget?.pkgIdx === pkgIdx &&
                    svcDragTarget?.svcIdx === svcIdx,
                }}
              />
            ))}

            {pkg.services.length > 1 && (
              <p className="text-xs text-foreground/30 pt-1 pb-0.5">
                ↕ Drag rows to reorder
              </p>
            )}

            <button
              onClick={() => addService(pkgIdx)}
              className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition mt-2 pt-1"
            >
              <Plus size={14} /> {t('admin.add.service')}
            </button>
          </div>
        </div>
      ))}

      {/* Add package */}
      <button
        onClick={addPkg}
        className="flex items-center gap-2 text-sm text-primary border border-primary/30 hover:border-primary rounded-xl px-4 py-3 transition w-full justify-center"
      >
        <Plus size={15} /> {t('admin.add.package')}
      </button>

      {/* Save all (for package field edits; service changes auto-save) */}
      <div className="flex items-center gap-3 flex-wrap">
        <Button
          onClick={() => data && save(data)}
          disabled={saving}
          className="rounded-full gap-1.5"
        >
          {saving ? t('admin.saving') : t('admin.save.all')}
        </Button>
        <p className="text-xs text-foreground/40">
          Service deletions & reorders save automatically.
        </p>
        <StatusBanner status={status} />
      </div>
    </div>
  );
}

// ─── Login screen ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const { t } = useLanguage();
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');

  const attempt = () => {
    if (pw === ADMIN_PASSWORD) {
      onLogin();
    } else {
      setError(`${t('admin.wrong.password')} — try skine2025`);
    }
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
  const { t } = useLanguage();
  const [authed, setAuthed] = useState(
    () => sessionStorage.getItem('skine-admin-auth') === '1',
  );

  const login = () => { sessionStorage.setItem('skine-admin-auth', '1'); setAuthed(true); };
  const logout = () => { sessionStorage.removeItem('skine-admin-auth'); setAuthed(false); };

  if (!authed) return <LoginScreen onLogin={login} />;

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
          <a href="/" className="text-sm text-foreground/60 hover:text-foreground transition flex items-center gap-1.5">
            <X size={14} /> {t('nav.home')}
          </a>
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

        {/* 2 — Client Reviews */}
        <Section icon={<ImageIcon size={17} />} title={t('admin.reviews')} subtitle="Upload, replace, reorder & delete review screenshots" defaultOpen>
          <CollectionPanel collection="reviews" />
        </Section>

        {/* 3 — Before & After */}
        <Section icon={<ImageIcon size={17} />} title={t('admin.beforeafter')} subtitle="Upload, replace, reorder & delete result photos">
          <CollectionPanel collection="before-after" />
        </Section>

        {/* 4 — Google Maps */}
        <Section icon={<Map size={17} />} title={t('admin.maps')} subtitle="Paste a Google Maps link to show your location">
          <MapsPanel />
        </Section>

      </main>
    </div>
  );
}
