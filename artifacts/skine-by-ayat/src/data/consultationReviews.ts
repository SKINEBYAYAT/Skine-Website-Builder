export interface ConsultationReview {
  id: number;
  nameAr: string;
  nameEn: string;
  textAr: string;
  textEn: string;
  date?: string; // ISO date string
  avatar?: string; // URL or import
}

// Edit this file to update consultation reviews.
// Add as many entries as you like.
export const consultationReviews: ConsultationReview[] = [
  {
    id: 1,
    nameAr: 'سارة م.',
    nameEn: 'Sara M.',
    textAr: 'الاستشارة كانت رائعة جداً! آيات شرحت لي بشكل مفصل نوع بشرتي والروتين المناسب. بعد شهر واحد فقط لاحظت فرقاً واضحاً.',
    textEn: 'The consultation was amazing! Ayat explained my skin type and the right routine in detail. After just one month, I noticed a clear difference.',
    date: '2025-03-15',
  },
  {
    id: 2,
    nameAr: 'ريم خ.',
    nameEn: 'Reem K.',
    textAr: 'كنت أعاني من حب الشباب منذ سنوات وجربت كل شيء. بعد استشارة آيات وتطبيق الروتين المخصص، بشرتي تحسّنت بشكل ملحوظ خلال 6 أسابيع.',
    textEn: 'I had been struggling with acne for years and tried everything. After Ayat\'s consultation and following the personalized routine, my skin improved noticeably within 6 weeks.',
    date: '2025-04-02',
  },
  {
    id: 3,
    nameAr: 'نور ع.',
    nameEn: 'Nour A.',
    textAr: 'أفضل استثمار لبشرتي. آيات محترفة ودقيقة في تحليل البشرة. خطة العناية التي أعطتني إياها بسيطة وفعّالة.',
    textEn: 'Best investment for my skin. Ayat is professional and precise in skin analysis. The care plan she gave me is simple and effective.',
    date: '2025-04-20',
  },
  {
    id: 4,
    nameAr: 'لينا ط.',
    nameEn: 'Lena T.',
    textAr: 'ما توقعت يكون الفرق كبير هيك! بشرتي كانت دايماً جافة ومتهيجة، وهلق صارت ناعمة ومشرقة. شكراً آيات!',
    textEn: 'I didn\'t expect such a big difference! My skin was always dry and irritated, now it\'s smooth and glowing. Thank you Ayat!',
    date: '2025-05-10',
  },
];
