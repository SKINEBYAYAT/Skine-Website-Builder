import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SETTINGS_FILE = path.resolve(__dirname, '../../data/settings.json');

function getSingleParam(value: string | string[] | undefined): string | null {
  if (typeof value === 'string') {
    return value;
  }
  if (Array.isArray(value) && value.length > 0) {
    return value[0];
  }
  return null;
}

function readSettings(): Record<string, string> {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      return JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
    }
  } catch {}
  return {};
}

function writeSettings(data: Record<string, string>): void {
  fs.mkdirSync(path.dirname(SETTINGS_FILE), { recursive: true });
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(data, null, 2));
}

const router = Router();

// GET all settings
router.get('/settings', (_req, res): void => {
  res.json(readSettings());
});

// PUT /settings/:key  — body: { value: string }
router.put('/settings/:key', (req, res): void => {
  const key = getSingleParam(req.params.key);
  const { value } = req.body as { value?: unknown };

  if (!key) {
    res.status(400).json({ error: 'Key is required' });
    return;
  }

  if (typeof value !== 'string') {
    res.status(400).json({ error: 'body must be { value: string }' });
    return;
  }

  const settings = readSettings();
  settings[key] = value;
  writeSettings(settings);
  res.json({ success: true, key, value });
});

// DELETE /settings/:key
router.delete('/settings/:key', (req, res): void => {
  const key = getSingleParam(req.params.key);

  if (!key) {
    res.status(400).json({ error: 'Key is required' });
    return;
  }

  const settings = readSettings();
  delete settings[key];
  writeSettings(settings);
  res.json({ success: true });
});

export default router;
