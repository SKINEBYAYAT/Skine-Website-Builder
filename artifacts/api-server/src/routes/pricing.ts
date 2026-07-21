import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PRICING_FILE = path.resolve(__dirname, '../../data/pricing.json');

export interface PricingService { ar: string; en: string; }
export interface PricingPackage {
  id: string;
  nameAr: string;
  nameEn: string;
  price: string;
  featured?: boolean;
  services: PricingService[];
}
export interface PricingData { packages: PricingPackage[]; }

const DEFAULT_PRICING: PricingData = {
  packages: [
    {
      id: 'basic-facial',
      nameAr: 'فيشل أساسي',
      nameEn: 'Basic Facial',
      price: '$40',
      services: [
        { ar: 'تنظيف عميق',       en: 'Deep Cleansing' },
        { ar: 'تقشير لطيف',       en: 'Gentle Exfoliation' },
        { ar: 'علاج الإنزيم',     en: 'Enzyme Therapy' },
        { ar: 'استخراج عميق',     en: 'Deep Extraction' },
        { ar: 'تدليك لمفاوي',     en: 'Lymphatic Massage' },
        { ar: 'قناع مخصص',        en: 'Customized Mask' },
        { ar: 'العناية النهائية', en: 'Finishing Care' },
      ],
    },
    {
      id: 'hydrafacial',
      nameAr: 'هيدرافيشل',
      nameEn: 'Hydrafacial',
      price: '$45',
      featured: true,
      services: [
        { ar: 'تنظيف عميق',        en: 'Deep Cleansing' },
        { ar: 'تقشير لطيف',        en: 'Gentle Exfoliation' },
        { ar: 'علاج الإنزيم',      en: 'Enzyme Therapy' },
        { ar: 'استخراج عميق',      en: 'Deep Extraction' },
        { ar: 'هيدرا ديرمابريجن', en: 'Hydra Dermabrasion' },
        { ar: 'حقن الأكسجين',      en: 'Oxygen Infusion' },
        { ar: 'تدليك لمفاوي',      en: 'Lymphatic Massage' },
        { ar: 'قناع مخصص',         en: 'Customized Mask' },
        { ar: 'العناية النهائية',  en: 'Finishing Care' },
      ],
    },
  ],
};

function readPricing(): PricingData {
  try {
    if (fs.existsSync(PRICING_FILE)) {
      return JSON.parse(fs.readFileSync(PRICING_FILE, 'utf-8')) as PricingData;
    }
  } catch {}
  return DEFAULT_PRICING;
}

function writePricing(data: PricingData): void {
  fs.mkdirSync(path.dirname(PRICING_FILE), { recursive: true });
  fs.writeFileSync(PRICING_FILE, JSON.stringify(data, null, 2));
}

const router = Router();

router.get('/pricing', (_req, res) => {
  res.json(readPricing());
});

router.put('/pricing', (req, res) => {
  const body = req.body as Partial<PricingData>;
  if (!body || !Array.isArray(body.packages)) {
    return res.status(400).json({ error: 'Body must be { packages: [...] }' });
  }
  writePricing(body as PricingData);
  res.json({ success: true });
});

export default router;
