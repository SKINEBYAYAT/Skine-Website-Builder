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
export interface PricingCategory {
  id: string;
  nameAr: string;
  nameEn: string;
  packages: PricingPackage[];
}
export interface PricingData { categories: PricingCategory[]; }

// Legacy shape (pre-category)
interface LegacyData { packages: PricingPackage[]; }

const DEFAULT_PRICING: PricingData = {
  categories: [
    {
      id: 'facials',
      nameAr: 'الفيشل',
      nameEn: 'Facials',
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
    },
    {
      id: 'bundles',
      nameAr: 'الباقات',
      nameEn: 'Bundles',
      packages: [
        {
          id: 'glow-package',
          nameAr: 'باقة التوهج',
          nameEn: 'Glow Package',
          price: '$45',
          services: [
            { ar: 'فيشل أساسي',      en: 'Basic facial' },
            { ar: 'تقشير ذكي آمن',   en: 'Safe smart peel' },
          ],
        },
        {
          id: 'treatment-package',
          nameAr: 'باقة العلاج',
          nameEn: 'Treatment Package',
          price: '$60',
          services: [
            { ar: 'فيشل أساسي',        en: 'Basic facial' },
            { ar: 'جلسة إبر دقيقة',    en: 'Microneedling session' },
          ],
        },
        {
          id: 'full-care-package',
          nameAr: 'باقة العناية الكاملة',
          nameEn: 'Full Care Package',
          price: '$65',
          services: [
            { ar: 'فيشل أساسي',  en: 'Basic facial' },
            { ar: 'تقشير ذكي',   en: 'Smart peel' },
            { ar: 'إبر دقيقة',   en: 'Microneedling' },
          ],
        },
        {
          id: 'rejuvenating-package',
          nameAr: 'باقة التجديد',
          nameEn: 'Rejuvenating Package',
          price: '$60',
          services: [
            { ar: 'فيشل أساسي',                      en: 'Basic facial' },
            { ar: 'تقشير الفاكهة العميق',              en: 'Hard fruit peel extract' },
            { ar: 'تجديد البشرة',                     en: 'Skin renewal' },
            { ar: 'بشرة أكثر إشراقاً وتوحداً في اللون', en: 'Brighter and more even skin tone' },
            { ar: 'يُحسّن شدّ البشرة ونضارتها',        en: 'Improves skin firmness' },
            { ar: 'ملمس بشرة أكثر نعومة',              en: 'Smooth skin texture' },
            { ar: 'توهج صحي مشرق',                    en: 'Radiant healthy glow' },
          ],
        },
      ],
    },
  ],
};

function readPricing(): PricingData {
  try {
    if (fs.existsSync(PRICING_FILE)) {
      const raw = JSON.parse(fs.readFileSync(PRICING_FILE, 'utf-8')) as PricingData | LegacyData;
      // Migrate legacy flat packages → wrap in first category
      if ('packages' in raw && !('categories' in raw)) {
        return {
          categories: [
            {
              id: 'facials',
              nameAr: 'الفيشل',
              nameEn: 'Facials',
              packages: (raw as LegacyData).packages,
            },
            ...DEFAULT_PRICING.categories.slice(1),
          ],
        };
      }
      return raw as PricingData;
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
  if (!body || !Array.isArray(body.categories)) {
    return res.status(400).json({ error: 'Body must be { categories: [...] }' });
  }
  writePricing(body as PricingData);
  return res.json({ success: true });
});

export default router;
