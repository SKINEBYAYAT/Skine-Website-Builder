import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { randomBytes } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BA_DIR = path.resolve(__dirname, '../../uploads/before-after');
const PAIRS_FILE = path.join(BA_DIR, 'pairs.json');

export interface BAPair {
  id: string;
  beforeFilename: string;
  afterFilename: string;
}

export interface BAPairWithUrls extends BAPair {
  beforeUrl: string;
  afterUrl: string;
}

function ensureDir() {
  fs.mkdirSync(BA_DIR, { recursive: true });
}

function readPairs(): BAPair[] {
  ensureDir();
  if (!fs.existsSync(PAIRS_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(PAIRS_FILE, 'utf-8')) as BAPair[];
  } catch {
    return [];
  }
}

function writePairs(pairs: BAPair[]) {
  ensureDir();
  fs.writeFileSync(PAIRS_FILE, JSON.stringify(pairs, null, 2));
}

function fileUrl(filename: string): string {
  return `/api/images/before-after/file/${encodeURIComponent(filename)}`;
}

function pairWithUrls(pair: BAPair): BAPairWithUrls {
  return { ...pair, beforeUrl: fileUrl(pair.beforeFilename), afterUrl: fileUrl(pair.afterFilename) };
}

function safeDelete(filename: string) {
  const fp = path.resolve(BA_DIR, filename);
  if (fp.startsWith(BA_DIR + path.sep) && fs.existsSync(fp)) {
    try { fs.unlinkSync(fp); } catch { /* ignore */ }
  }
}

const storage = multer.diskStorage({
  destination(_req, _file, cb) { ensureDir(); cb(null, BA_DIR); },
  filename(_req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `${Date.now()}-${randomBytes(4).toString('hex')}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    /^image\/(jpeg|png|webp|gif)$/.test(file.mimetype) ? cb(null, true) : cb(new Error('Images only'));
  },
});

const router = Router();

// ── GET all pairs ─────────────────────────────────────────────────────────────
router.get('/before-after', (_req, res) => {
  res.json({ pairs: readPairs().map(pairWithUrls) });
});

// ── POST new pair (beforeImage + afterImage) ──────────────────────────────────
router.post(
  '/before-after',
  upload.fields([
    { name: 'beforeImage', maxCount: 1 },
    { name: 'afterImage',  maxCount: 1 },
  ]),
  (req, res) => {
    const files = req.files as Record<string, Express.Multer.File[]> | undefined;
    const beforeFile = files?.['beforeImage']?.[0];
    const afterFile  = files?.['afterImage']?.[0];
    if (!beforeFile || !afterFile) {
      return res.status(400).json({ error: 'Both beforeImage and afterImage are required' });
    }
    const pair: BAPair = {
      id: `ba-${Date.now()}-${randomBytes(4).toString('hex')}`,
      beforeFilename: beforeFile.filename,
      afterFilename:  afterFile.filename,
    };
    const pairs = readPairs();
    pairs.push(pair);
    writePairs(pairs);
    res.status(201).json(pairWithUrls(pair));
  },
);

// ── PUT reorder (must come before /:id routes) ────────────────────────────────
router.put('/before-after/reorder', (req, res) => {
  const { order } = req.body as { order?: unknown };
  if (!Array.isArray(order) || !order.every((x) => typeof x === 'string')) {
    return res.status(400).json({ error: 'Body must be { order: string[] }' });
  }
  const pairs = readPairs();
  const map = new Map(pairs.map((p) => [p.id, p]));
  const reordered = (order as string[]).map((id) => map.get(id)).filter(Boolean) as BAPair[];
  writePairs(reordered);
  res.json({ success: true });
});

// ── PUT replace before image ──────────────────────────────────────────────────
router.put('/before-after/:id/before', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file provided' });
  const pairs = readPairs();
  const idx = pairs.findIndex((p) => p.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: 'Pair not found' });
  safeDelete(pairs[idx].beforeFilename);
  pairs[idx].beforeFilename = req.file.filename;
  writePairs(pairs);
  res.json(pairWithUrls(pairs[idx]));
});

// ── PUT replace after image ───────────────────────────────────────────────────
router.put('/before-after/:id/after', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file provided' });
  const pairs = readPairs();
  const idx = pairs.findIndex((p) => p.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: 'Pair not found' });
  safeDelete(pairs[idx].afterFilename);
  pairs[idx].afterFilename = req.file.filename;
  writePairs(pairs);
  res.json(pairWithUrls(pairs[idx]));
});

// ── DELETE pair ───────────────────────────────────────────────────────────────
router.delete('/before-after/:id', (req, res) => {
  const pairs = readPairs();
  const idx = pairs.findIndex((p) => p.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: 'Pair not found' });
  safeDelete(pairs[idx].beforeFilename);
  safeDelete(pairs[idx].afterFilename);
  pairs.splice(idx, 1);
  writePairs(pairs);
  res.json({ success: true });
});

export default router;
