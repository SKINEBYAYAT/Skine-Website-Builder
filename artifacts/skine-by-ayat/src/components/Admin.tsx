import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Trash2, LogOut, Lock, CheckCircle, AlertCircle,
  ImageIcon, X, GripVertical, Map, Image, ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

// ─── Password ─────────────────────────────────────────────────────────────────
const RAW_PW = import.meta.env.VITE_ADMIN_PASSWORD;
const ADMIN_PASSWORD = (typeof RAW_PW === 'string' && RAW_PW.trim() !== '') ? RAW_PW.trim() : 'skine2025';

type Collection = 'reviews' | 'before-after';
interface APIImage { filename: string; url: string; }
type Status = { type: 'success' | 'error'; message: string } | null;

// ─── Shared status banner ─────────────────────────────────────────────────────
function StatusBanner({ status }: { status: Status }) {
  if (!status) return null;
  return (
    <AnimatePresence>
      <motion.div
        key={status.message}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className={`flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl ${
          status.type === 'success'
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}
      >
        {status.type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
        {status.message}
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Accordion section wrapper ────────────────────────────────────────────────
function Section({
  icon,
  title,
  subtitle,
  defaultOpen = false,
  children,
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
          {subtitle && <p className="text-xs text-foreground/50 mt-0.5">{subtitle}</p>}
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
            <div className="px-6 pb-6 pt-1 border-t border-border">
              {children}
            </div>
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

// ─── Upload zone (multi-image collections) ────────────────────────────────────
function UploadZone({ collection, onUploaded }: { collection: Collection; onUploaded: () => void }) {
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
        else throw new Error('Upload failed');
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
          {uploading ? t('admin.uploading') : t('admin.upload')}
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

// ─── Drag-reorderable image grid ──────────────────────────────────────────────
function ImageGrid({
  collection,
  images,
  setImages,
  onDelete,
}: {
  collection: Collection;
  images: APIImage[];
  setImages: React.Dispatch<React.SetStateAction<APIImage[]>>;
  onDelete: (filename: string) => void;
}) {
  const { t } = useLanguage();
  const dragIdx = useRef<number | null>(null);

  const handleDragStart = (i: number) => { dragIdx.current = i; };
  const handleDrop = async (i: number) => {
    if (dragIdx.current === null || dragIdx.current === i) return;
    const next = [...images];
    const [moved] = next.splice(dragIdx.current, 1);
    next.splice(i, 0, moved);
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
        No images yet
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
      {images.map((img, i) => (
        <div
          key={img.filename}
          draggable
          onDragStart={() => handleDragStart(i)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop(i)}
          className="group relative rounded-2xl overflow-hidden bg-muted/40 border border-border shadow-sm cursor-grab active:cursor-grabbing"
        >
          <img
            src={img.url}
            alt={`Image ${i + 1}`}
            className="w-full aspect-[3/4] object-contain bg-[#f9f4ef]"
          />
          <div className="absolute top-2 left-2 bg-background/70 backdrop-blur-sm rounded-lg p-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <GripVertical size={14} className="text-foreground/50" />
          </div>
          <button
            onClick={() => onDelete(img.filename)}
            className="absolute bottom-0 inset-x-0 py-2.5 bg-red-500/90 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 hover:bg-red-600"
          >
            <Trash2 size={13} /> {t('admin.delete')}
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Collection panel (reviews / before-after) ────────────────────────────────
function CollectionPanel({ collection, label }: { collection: Collection; label: string }) {
  const { images, setImages, loading, reload } = useImages(collection);
  const [status, setStatus] = useState<Status>(null);

  const handleDelete = async (filename: string) => {
    try {
      const res = await fetch(`/api/images/${collection}/${encodeURIComponent(filename)}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setStatus({ type: 'success', message: 'Deleted' });
      reload();
    } catch {
      setStatus({ type: 'error', message: 'Delete failed' });
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
        />
      )}
    </div>
  );
}

// ─── Site image panel (hero / about) ─────────────────────────────────────────
type SiteKey = 'hero' | 'about';

function SiteImagePanel({ siteKey, label }: { siteKey: SiteKey; label: string }) {
  const { t } = useLanguage();
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const loadCurrent = useCallback(async () => {
    try {
      const res = await fetch(`/api/site-images/${siteKey}`);
      const data = await res.json();
      setCurrentUrl(data.url ?? null);
    } catch {}
  }, [siteKey]);

  useEffect(() => { loadCurrent(); }, [loadCurrent]);

  const upload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    setStatus(null);
    const fd = new FormData();
    fd.append('image', file);
    try {
      const res = await fetch(`/api/site-images/${siteKey}`, { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setCurrentUrl(data.url);
      setPreview(null);
      setStatus({ type: 'success', message: t('admin.saved') });
    } catch {
      setStatus({ type: 'error', message: 'Upload failed' });
      setPreview(null);
    }
    setUploading(false);
  };

  const revert = async () => {
    try {
      await fetch(`/api/site-images/${siteKey}`, { method: 'DELETE' });
      setCurrentUrl(null);
      setPreview(null);
      setStatus({ type: 'success', message: 'Reverted to default' });
    } catch {
      setStatus({ type: 'error', message: 'Failed' });
    }
  };

  const displayUrl = preview ?? currentUrl;

  return (
    <div className="space-y-4 pt-4">
      <p className="text-sm font-medium text-foreground">{label}</p>

      {/* Current / preview image */}
      {displayUrl ? (
        <div className="relative rounded-2xl overflow-hidden border border-border bg-[#f9f4ef] max-h-64">
          <img src={displayUrl} alt={label} className="w-full h-64 object-contain" />
          {preview && (
            <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
              <span className="text-sm font-medium text-foreground">{t('admin.uploading')}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-border bg-muted/20 h-40 flex items-center justify-center">
          <div className="text-center text-foreground/30">
            <ImageIcon size={28} className="mx-auto mb-2" />
            <p className="text-xs">Using default image</p>
          </div>
        </div>
      )}

      {/* Upload zone */}
      <div
        className={`border-2 border-dashed rounded-2xl p-5 text-center transition-colors duration-200 ${
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
          className="hidden"
          onChange={(e) => upload(e.target.files)}
        />
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="rounded-full gap-1.5"
          >
            <Upload size={14} />
            {uploading ? t('admin.uploading') : t('admin.replace')}
          </Button>
          {currentUrl && (
            <Button
              variant="ghost"
              size="sm"
              onClick={revert}
              disabled={uploading}
              className="rounded-full gap-1.5 text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <Trash2 size={14} />
              {t('admin.revert')}
            </Button>
          )}
        </div>
        <p className="text-foreground/40 text-xs mt-2">JPG, PNG, WebP, GIF · max 25 MB</p>
      </div>

      <StatusBanner status={status} />
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
      .then((data: Record<string, string>) => {
        setValue(data['maps_url'] ?? '');
      })
      .catch(() => {});
  }, []);

  const save = async () => {
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch('/api/settings/maps_url', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value }),
      });
      if (!res.ok) throw new Error('Save failed');
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

      {/* Preview */}
      {value.trim() && (
        <div className="rounded-2xl overflow-hidden border border-border">
          <iframe
            src={(() => {
              const match = value.match(/src=["']([^"']+)["']/);
              return match ? match[1] : value;
            })()}
            width="100%"
            height="240"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Map preview"
          />
        </div>
      )}

      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={save}
          disabled={saving}
          className="rounded-full gap-1.5"
        >
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
            <X size={14} />
            {t('admin.maps.clear')}
          </Button>
        )}
      </div>

      <StatusBanner status={status} />
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

        <form
          onSubmit={(e) => { e.preventDefault(); attempt(); }}
          className="space-y-4"
        >
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
          <Button type="submit" className="w-full rounded-full">
            {t('admin.login')}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Admin page root ──────────────────────────────────────────────────────────
export function Admin() {
  const { t } = useLanguage();
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('skine-admin-auth') === '1');

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
            <X size={14} />
            {t('nav.home')}
          </a>
          <Button variant="outline" size="sm" onClick={logout} className="gap-1.5 rounded-full">
            <LogOut size={14} />
            {t('admin.logout')}
          </Button>
        </div>
      </header>

      {/* Sections */}
      <main className="max-w-3xl mx-auto px-4 md:px-8 py-10">

        {/* 1 — Website Images */}
        <Section
          icon={<Image size={17} />}
          title={t('admin.site.images')}
          subtitle="Hero image & About photo"
          defaultOpen
        >
          <div className="space-y-6 divide-y divide-border">
            <SiteImagePanel siteKey="hero" label={t('admin.hero.image')} />
            <div className="pt-4">
              <SiteImagePanel siteKey="about" label={t('admin.about.image')} />
            </div>
          </div>
        </Section>

        {/* 2 — Client Reviews */}
        <Section
          icon={<ImageIcon size={17} />}
          title={t('admin.reviews')}
          subtitle="Upload, reorder & delete review screenshots"
        >
          <CollectionPanel collection="reviews" label={t('admin.reviews')} />
        </Section>

        {/* 3 — Before & After */}
        <Section
          icon={<ImageIcon size={17} />}
          title={t('admin.beforeafter')}
          subtitle="Upload, reorder & delete result photos"
        >
          <CollectionPanel collection="before-after" label={t('admin.beforeafter')} />
        </Section>

        {/* 4 — Google Maps */}
        <Section
          icon={<Map size={17} />}
          title={t('admin.maps')}
          subtitle="Paste a Google Maps embed link to show your location"
        >
          <MapsPanel />
        </Section>

      </main>
    </div>
  );
}
