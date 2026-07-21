import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SITE_IMAGES_DIR = path.resolve(__dirname, '../../uploads/site-images');

const VALID_KEYS = ['hero', 'about'] as const;
type SiteImageKey = (typeof VALID_KEYS)[number];

function isValidKey(k: string): k is SiteImageKey {
  return (VALID_KEYS as readonly string[]).includes(k);
}

function getSingleParam(value: string | string[] | undefined): string | null {
  if (typeof value === 'string') {
    return value;
  }
  if (Array.isArray(value) && value.length > 0) {
    return value[0];
  }
  return null;
}

function getKeyDir(key: SiteImageKey): string {
  const dir = path.join(SITE_IMAGES_DIR, key);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function getCurrentFile(key: SiteImageKey): string | null {
  const dir = getKeyDir(key);
  const files = fs
    .readdirSync(dir)
    .filter((f) => /\.(jpe?g|png|webp|gif)$/i.test(f));
  return files.length ? files[0] : null;
}

const storage = multer.diskStorage({
  destination(req, _file, cb) {
    const key = getSingleParam(req.params.key);
    if (!key || !isValidKey(key)) return cb(new Error('Invalid key'), '');
    cb(null, getKeyDir(key));
  },
  filename(_req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    if (/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, WebP or GIF images are allowed'));
    }
  },
});

const router = Router();

// GET current image URL for a key
router.get('/site-images/:key', (req, res): void => {
  const key = getSingleParam(req.params.key);
  if (!key || !isValidKey(key)) {
    res.status(400).json({ error: 'Invalid key' });
    return;
  }

  const current = getCurrentFile(key);
  if (!current) {
    res.json({ url: null });
    return;
  }

  res.json({
    url: `/api/site-images/${key}/file/${encodeURIComponent(current)}`,
  });
});

// Serve the actual file
router.get('/site-images/:key/file/:filename', (req, res): void => {
  const key = getSingleParam(req.params.key);
  const filename = getSingleParam(req.params.filename);

  if (!key || !isValidKey(key)) {
    res.status(400).json({ error: 'Invalid key' });
    return;
  }

  if (!filename) {
    res.status(400).json({ error: 'Filename is required' });
    return;
  }

  const dir = getKeyDir(key);
  const filePath = path.resolve(dir, filename);

  if (!filePath.startsWith(dir + path.sep) && filePath !== dir) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }
  if (!fs.existsSync(filePath)) {
    res.status(404).json({ error: 'Not found' });
    return;
  }

  res.sendFile(filePath);
});

// Upload / replace image for a key
router.post('/site-images/:key', upload.single('image'), (req, res): void => {
  const key = getSingleParam(req.params.key);
  if (!key || !isValidKey(key)) {
    res.status(400).json({ error: 'Invalid key' });
    return;
  }
  if (!req.file) {
    res.status(400).json({ error: 'No file provided' });
    return;
  }

  // Remove any previous image(s) for this key
  const file = req.file;
  const dir = getKeyDir(key);
  const oldFiles = fs
    .readdirSync(dir)
    .filter((f) => f !== file.filename && /\.(jpe?g|png|webp|gif)$/i.test(f));
  oldFiles.forEach((f) => {
    try {
      fs.unlinkSync(path.join(dir, f));
    } catch {}
  });

  res.status(201).json({
    url: `/api/site-images/${key}/file/${encodeURIComponent(file.filename)}`,
  });
});

// Delete (revert to default) image for a key
router.delete('/site-images/:key', (req, res): void => {
  const key = getSingleParam(req.params.key);
  if (!key || !isValidKey(key)) {
    res.status(400).json({ error: 'Invalid key' });
    return;
  }

  const dir = getKeyDir(key);
  const files = fs
    .readdirSync(dir)
    .filter((f) => /\.(jpe?g|png|webp|gif)$/i.test(f));
  files.forEach((f) => {
    try {
      fs.unlinkSync(path.join(dir, f));
    } catch {}
  });

  res.json({ success: true });
});

export default router;
