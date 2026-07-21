import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Store uploads relative to the project root so they survive rebuilds
const UPLOADS_DIR = path.resolve(__dirname, '../../uploads');

const VALID_COLLECTIONS = ['reviews', 'before-after'] as const;
type Collection = (typeof VALID_COLLECTIONS)[number];

function isValidCollection(c: string): c is Collection {
  return (VALID_COLLECTIONS as readonly string[]).includes(c);
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

function collectionDir(collection: Collection): string {
  const dir = path.join(UPLOADS_DIR, collection);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function orderFilePath(dir: string): string {
  return path.join(dir, 'order.json');
}

function readOrder(dir: string): string[] {
  const f = orderFilePath(dir);
  if (fs.existsSync(f)) {
    try {
      return JSON.parse(fs.readFileSync(f, 'utf-8'));
    } catch {
      // fall through
    }
  }
  // Derive order from directory contents
  return fs
    .readdirSync(dir)
    .filter(
      (name) => name !== 'order.json' && /\.(jpe?g|png|webp|gif)$/i.test(name),
    );
}

function writeOrder(dir: string, order: string[]): void {
  fs.writeFileSync(orderFilePath(dir), JSON.stringify(order, null, 2));
}

// Multer storage — file name is timestamp + random suffix
const storage = multer.diskStorage({
  destination(req, _file, cb) {
    const collection = getSingleParam(req.params.collection);
    if (!collection || !isValidCollection(collection)) {
      return cb(new Error('Invalid collection'), '');
    }
    cb(null, collectionDir(collection));
  },
  filename(_req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB
  fileFilter(_req, file, cb) {
    if (/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, WebP or GIF images are allowed'));
    }
  },
});

const router = Router();

// ── Serve a single image file ─────────────────────────────────────────────────
router.get('/images/:collection/file/:filename', (req, res): void => {
  const collection = getSingleParam(req.params.collection);
  const filename = getSingleParam(req.params.filename);

  if (!collection || !isValidCollection(collection)) {
    res.status(400).json({ error: 'Invalid collection' });
    return;
  }

  if (!filename) {
    res.status(400).json({ error: 'Filename is required' });
    return;
  }

  const dir = collectionDir(collection);
  const filePath = path.resolve(dir, filename);

  // Path traversal guard
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

// ── List images ───────────────────────────────────────────────────────────────
router.get('/images/:collection', (req, res): void => {
  const collection = getSingleParam(req.params.collection);
  if (!collection || !isValidCollection(collection)) {
    res.status(400).json({ error: 'Invalid collection' });
    return;
  }

  const dir = collectionDir(collection);
  const order = readOrder(dir);
  const images = order.map((filename) => ({
    filename,
    url: `/api/images/${collection}/file/${encodeURIComponent(filename)}`,
  }));
  res.json({ images });
});

// ── Upload image ──────────────────────────────────────────────────────────────
router.post('/images/:collection', upload.single('image'), (req, res): void => {
  const collection = getSingleParam(req.params.collection);
  if (!collection || !isValidCollection(collection)) {
    res.status(400).json({ error: 'Invalid collection' });
    return;
  }
  if (!req.file) {
    res.status(400).json({ error: 'No file provided' });
    return;
  }

  const dir = collectionDir(collection);
  const order = readOrder(dir);
  order.push(req.file.filename);
  writeOrder(dir, order);

  res.status(201).json({
    filename: req.file.filename,
    url: `/api/images/${collection}/file/${encodeURIComponent(req.file.filename)}`,
  });
});

// ── Delete image ──────────────────────────────────────────────────────────────
router.delete('/images/:collection/:filename', (req, res): void => {
  const collection = getSingleParam(req.params.collection);
  const filename = getSingleParam(req.params.filename);

  if (!collection || !isValidCollection(collection)) {
    res.status(400).json({ error: 'Invalid collection' });
    return;
  }

  if (!filename) {
    res.status(400).json({ error: 'Filename is required' });
    return;
  }

  const dir = collectionDir(collection);
  const filePath = path.resolve(dir, filename);

  if (!filePath.startsWith(dir + path.sep) && filePath !== dir) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  const order = readOrder(dir).filter((f) => f !== filename);
  writeOrder(dir, order);

  res.json({ success: true });
});

// ── Reorder images ────────────────────────────────────────────────────────────
router.put('/images/:collection/reorder', (req, res): void => {
  const collection = getSingleParam(req.params.collection);
  if (!collection || !isValidCollection(collection)) {
    res.status(400).json({ error: 'Invalid collection' });
    return;
  }

  const { order } = req.body as { order?: unknown };
  if (!Array.isArray(order) || !order.every((x) => typeof x === 'string')) {
    res.status(400).json({ error: 'Body must be { order: string[] }' });
    return;
  }

  const dir = collectionDir(collection);
  writeOrder(dir, order);
  res.json({ success: true });
});

export default router;
