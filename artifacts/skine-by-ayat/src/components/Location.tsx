import { useEffect, useState } from 'react';
import { ExpandableSection } from '@/components/ExpandableSection';
import { MapPin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { loadSetting } from '@/lib/supabase';
import { convertToEmbedUrl } from '@/lib/mapsUtils';

// ─── Static embed URL — extracted from live settings.json maps_url ────────────
const EMBED_URL =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3313.282134595997!2d35.52329157628517!3d33.85661912803356!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x151f170038d7e3f7%3A0xdf1878910ef3200c!2sSkin%C3%A9%20By%20Ayat%20Clinic!5e0!3m2!1sen!2slb!4v1784821218341!5m2!1sen!2slb';

export function Location() {
  const { t } = useLanguage();
  const [embedUrl, setEmbedUrl] = useState(EMBED_URL);

  useEffect(() => {
    loadSetting('maps_url').then((saved) => {
      if (saved === null) return;
      if (saved === '') { setEmbedUrl(''); return; }
      const converted = convertToEmbedUrl(saved);
      if (converted) setEmbedUrl(converted);
    }).catch(() => { /* Keep built-in map URL. */ });
  }, []);

  if (!embedUrl) return null;

  return (
    <ExpandableSection id="location" title={t('contact.location')} icon={MapPin}>
      <div className="rounded-2xl overflow-hidden border border-border">
        <iframe src={embedUrl} width="100%" height="340" className="h-[300px] md:h-[380px]"
          style={{ border: 0, display: 'block' }} allowFullScreen loading="lazy"
          referrerPolicy="no-referrer-when-downgrade" title={t('contact.location')} />
      </div>
    </ExpandableSection>
  );
}
