import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Trash2, ChevronUp, ChevronDown, LogOut,
  Lock, CheckCircle, AlertCircle, ImageIcon, X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

// ─── Simple password gate ────────────────────────────────────────────────────
// Change ADMIN_PASSWORD env var (VITE_ADMIN_PASSWORD) or it defaults to 'skine2025'
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD ?? 'skine2025';

type Collection = 'reviews' | 'before-after';
interface APIImage { filename: string; url: string; }
type Status = { type: 'success' | 'error'; message: string } | null;

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

// ─── Upload zone ─────────────────────────────────────────────────────────────
function UploadZone({
  collection, onUploaded,
}: { collection: Collection; onUploaded: () => void }) {
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
      <Upload size={32} className="mx-auto mb-3 text-primary/60" />
      <p className="font-semibold text-foreground mb-1">
        {uploading ? t('admin.uploading') : t('admin.upload')}
      </p>
      <p className="text-foreground/50 text-sm mb-4">JPG, PNG, WebP, GIF · max 25 MB</p>
      <Button
        variant="outline"
        size="sm"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="rounded-full"
      >
        {uploading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            {t('admin.uploading')}
          </span>
        ) : (
          t('admin.upload')
        )}
      </Button>

      {status && (
        <p className={`mt-3 text-sm flex items-center justify-center gap-1.5 ${
          status.type === 'success' ? 'text-green-600' : 'text-destructive'
        }`}>
          {status.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
          {status.message}
        </p>
      )}
    </div>
  );
}

// ─── Image grid with reorder + delete ────────────────────────────────────────
function ImageGrid({
  collection, images, setImages, reload,
}: {
  collection: Collection;
  images: APIImage[];
  setImages: React.Dispatch<React.SetStateAction<APIImage[]>>;
  reload: () => void;
}) {
  const { t } = useLanguage();
  const [saveStatus, setSaveStatus] = useState<Status>(null);
  const [deletingFile, setDeletingFile] = useState<string | null>(null);

  const move = (index: number, direction: -1 | 1) => {
    const newImages = [...images];
    const target = index + direction;
    if (target < 0 || target >= newImages.length) return;
    [newImages[index], newImages[target]] = [newImages[target], newImages[index]];
    setImages(newImages);
  };

  const saveOrder = async () => {
    try {
      const res = await fetch(`/api/images/${collection}/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: images.map((img) => img.filename) }),
      });
      if (res.ok) setSaveStatus({ type: 'success', message: t('admin.saved') });
      else throw new Error();
    } catch {
      setSaveStatus({ type: 'error', message: 'Error saving order' });
    }
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const deleteImage = async (filename: string) => {
    if (!confirm(t('admin.delete') + '?')) return;
    setDeletingFile(filename);
    try {
      await fetch(`/api/images/${collection}/${encodeURIComponent(filename)}`, {
        method: 'DELETE',
      });
      reload();
    } catch {
      // nothing
    } finally {
      setDeletingFile(null);
    }
  };

  if (images.length === 0) {
    return (
      <div className="text-center py-16 text-foreground/40">
        <ImageIcon size={40} className="mx-auto mb-3 opacity-30" />
        <p>{t('reviews.empty')}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-5">
        {images.map((img, index) => (
          <motion.div
            key={img.filename}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative group rounded-xl overflow-hidden border border-border aspect-[3/4] bg-muted"
          >
            <img
              src={img.url}
              alt={`Image ${index + 1}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />

            {/* Order badge */}
            <div className="absolute top-2 start-2 bg-black/60 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
              {index + 1}
            </div>

            {/* Action overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-200 flex flex-col items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100">
              <div className="flex gap-1">
                <button
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  className="p-1.5 bg-white/90 rounded-full hover:bg-white disabled:opacity-30 transition"
                  title={t('admin.move.up')}
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  onClick={() => move(index, 1)}
                  disabled={index === images.length - 1}
                  className="p-1.5 bg-white/90 rounded-full hover:bg-white disabled:opacity-30 transition"
                  title={t('admin.move.down')}
                >
                  <ChevronDown size={14} />
                </button>
              </div>
              <button
                onClick={() => deleteImage(img.filename)}
                disabled={deletingFile === img.filename}
                className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                title={t('admin.delete')}
              >
                {deletingFile === img.filename ? (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                ) : (
                  <Trash2 size={14} />
                )}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <Button size="sm" onClick={saveOrder} className="rounded-full gap-2">
          <CheckCircle size={15} />
          {t('admin.save.order')}
        </Button>
        {saveStatus && (
          <AnimatePresence>
            <motion.p
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className={`text-sm flex items-center gap-1.5 ${
                saveStatus.type === 'success' ? 'text-green-600' : 'text-destructive'
              }`}
            >
              {saveStatus.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
              {saveStatus.message}
            </motion.p>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

// ─── Panel for one collection ─────────────────────────────────────────────────
function CollectionPanel({ collection, label }: { collection: Collection; label: string }) {
  const { images, setImages, loading, reload } = useImages(collection);

  return (
    <section className="mb-12">
      <h3 className="text-xl font-bold text-foreground mb-5 flex items-center gap-2">
        <ImageIcon size={20} className="text-primary" />
        {label}
      </h3>

      <UploadZone collection={collection} onUploaded={reload} />

      <div className="mt-6">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        ) : (
          <ImageGrid
            collection={collection}
            images={images}
            setImages={setImages}
            reload={reload}
          />
        )}
      </div>
    </section>
  );
}

// ─── Login screen ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const { t } = useLanguage();
  const [pw, setPw] = useState('');
  const [error, setError] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw === ADMIN_PASSWORD) {
      onLogin();
    } else {
      setError(true);
      setPw('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-background rounded-3xl shadow-xl border border-border p-10 w-full max-w-sm text-center"
      >
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <Lock size={24} className="text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">{t('admin.title')}</h1>
        <p className="text-foreground/50 text-sm mb-8">Skiné by Ayat</p>

        <form onSubmit={submit} className="text-start space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t('admin.password.label')}
            </label>
            <input
              type="password"
              value={pw}
              onChange={(e) => { setPw(e.target.value); setError(false); }}
              placeholder={t('admin.password.prompt')}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
              autoFocus
            />
            {error && (
              <p className="text-destructive text-xs mt-2 flex items-center gap-1.5">
                <AlertCircle size={12} />
                {t('admin.wrong.password')}
              </p>
            )}
          </div>
          <Button type="submit" className="w-full rounded-xl">
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
  const [authed, setAuthed] = useState(() => {
    return sessionStorage.getItem('skine-admin-auth') === '1';
  });

  const login = () => {
    sessionStorage.setItem('skine-admin-auth', '1');
    setAuthed(true);
  };

  const logout = () => {
    sessionStorage.removeItem('skine-admin-auth');
    setAuthed(false);
  };

  if (!authed) return <LoginScreen onLogin={login} />;

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Admin navbar */}
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
          <a
            href="/"
            className="text-sm text-foreground/60 hover:text-foreground transition flex items-center gap-1.5"
          >
            <X size={14} />
            {t('nav.home')}
          </a>
          <Button variant="outline" size="sm" onClick={logout} className="gap-1.5 rounded-full">
            <LogOut size={14} />
            {t('admin.logout')}
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 md:px-8 py-10">
        <CollectionPanel collection="reviews" label={t('admin.reviews')} />
        <hr className="border-border my-8" />
        <CollectionPanel collection="before-after" label={t('admin.beforeafter')} />
      </main>
    </div>
  );
}
