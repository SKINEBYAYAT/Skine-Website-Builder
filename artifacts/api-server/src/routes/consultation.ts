import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONSULTATION_FILE = path.resolve(__dirname, '../../data/consultation.json');

export interface ConsultationItem {
  id: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
}

export interface ConsultationData {
  price: string;
  subtitleAr: string;
  subtitleEn: string;
  headingAr: string;
  headingEn: string;
  items: ConsultationItem[];
}

const DEFAULT_CONSULTATION: ConsultationData = {
  price: '$35',
  subtitleEn: 'Skin consultation and skincare routine planning',
  subtitleAr: 'استشارة جلدية وتخطيط روتين العناية',
  headingEn: "What you'll receive during your consultation ✨",
  headingAr: 'ما ستحصلين عليه خلال استشارتك ✨',
  items: [
    {
      id: 'skin-analysis',
      titleEn: 'Skin Analysis',
      titleAr: 'تحليل البشرة',
      descEn: 'Skin type, tone, concerns, goals, and current routine assessment.',
      descAr: 'تقييم نوع البشرة ودرجة لونها ومشكلاتها وأهدافك وروتينك الحالي.',
    },
    {
      id: 'personalized-routine',
      titleEn: 'Personalized Routine',
      titleAr: 'روتين مخصص',
      descEn: "A skincare plan tailored to your skin's needs.",
      descAr: 'خطة عناية بالبشرة مصممة خصيصاً وفق احتياجاتك.',
    },
    {
      id: 'routine-guide',
      titleEn: 'Routine Guide',
      titleAr: 'دليل الروتين',
      descEn: 'A clear schedule explaining what to use and when.',
      descAr: 'جدول واضح يشرح ما تستخدمينه ومتى.',
    },
    {
      id: 'follow-up',
      titleEn: 'Follow-Up',
      titleAr: 'متابعة مستمرة',
      descEn: 'Follow-up support is provided whenever necessary.',
      descAr: 'يُقدَّم دعم المتابعة كلما دعت الحاجة.',
    },
  ],
};

function readConsultation(): ConsultationData {
  try {
    if (fs.existsSync(CONSULTATION_FILE)) {
      return JSON.parse(fs.readFileSync(CONSULTATION_FILE, 'utf-8')) as ConsultationData;
    }
  } catch {}
  return DEFAULT_CONSULTATION;
}

function writeConsultation(data: ConsultationData): void {
  fs.mkdirSync(path.dirname(CONSULTATION_FILE), { recursive: true });
  fs.writeFileSync(CONSULTATION_FILE, JSON.stringify(data, null, 2));
}

const router = Router();

router.get('/consultation', (_req, res) => {
  res.json(readConsultation());
});

router.put('/consultation', (req, res) => {
  const body = req.body as Partial<ConsultationData>;
  if (
    !body ||
    typeof body.price !== 'string' ||
    typeof body.subtitleEn !== 'string' ||
    typeof body.subtitleAr !== 'string' ||
    typeof body.headingEn !== 'string' ||
    typeof body.headingAr !== 'string' ||
    !Array.isArray(body.items)
  ) {
    return res.status(400).json({ error: 'Invalid consultation data' });
  }
  writeConsultation(body as ConsultationData);
  res.json({ success: true });
});

export default router;
