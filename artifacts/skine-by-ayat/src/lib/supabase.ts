import { createClient } from '@supabase/supabase-js';
import review1 from '@/assets/review1.jpeg';
import review2 from '@/assets/review2.jpeg';
import review3 from '@/assets/review3.jpeg';
import review4 from '@/assets/review4.jpeg';
import review5 from '@/assets/review5.jpeg';
import review6 from '@/assets/review6.jpeg';
import review7 from '@/assets/review7.jpeg';
import ba1Before from '@/assets/ba1-before.jpeg';
import ba1After from '@/assets/ba1-after.jpeg';
import ba2Before from '@/assets/ba2-before.jpeg';
import ba2After from '@/assets/ba2-after.jpeg';
import ba3Before from '@/assets/ba3-before.jpeg';
import ba3After from '@/assets/ba3-after.jpeg';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) throw new Error('Missing Supabase environment variables');

export const supabase = createClient(url, key);
export const imageBucket = 'website-images';

export const publicImageUrl = (path: string) =>
  supabase.storage.from(imageBucket).getPublicUrl(path).data.publicUrl;

const DEFAULT_REVIEW_IMAGES = [review1, review2, review3, review4, review5, review6, review7]
  .map((url, index) => ({ filename: `review${index + 1}.jpeg`, url }));
const DEFAULT_BEFORE_AFTER_PAIRS = [
  { id: 'ba-1', beforeUrl: ba1Before, afterUrl: ba1After },
  { id: 'ba-2', beforeUrl: ba2Before, afterUrl: ba2After },
  { id: 'ba-3', beforeUrl: ba3Before, afterUrl: ba3After },
];
const DEFAULT_MAP_URL = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3313.282134595997!2d35.52329157628517!3d33.85661912803356!2m3!1f0!2f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x151f170038d7e3f7%3A0xdf1878910ef3200c!2sSkin%C3%A9%20By%20Ayat%20Clinic!5e0!3m2!1sen!2slb!4v1784821218341!5m2!1sen!2slb';

async function loadLocalCollection<T>(path: string, key: string): Promise<T[] | null> {
  try {
    const result = await window.fetch(path);
    if (!result.ok) return null;
    const data = await result.json() as Record<string, unknown>;
    return Array.isArray(data[key]) ? data[key] as T[] : [];
  } catch {
    return null;
  }
}

export async function loadReviewImages() {
  const { data, error } = await supabase.from('review_images')
    .select('id, storage_path').order('sort_order');
  if (error || !data?.length) {
    const localImages = await loadLocalCollection<{ filename: string; url: string }>(
      '/api/images/reviews',
      'images',
    );
    if (localImages) return localImages;
    return DEFAULT_REVIEW_IMAGES;
  }
  return (data ?? []).map((row) => ({
    filename: row.id as string,
    storagePath: row.storage_path as string,
    url: publicImageUrl(row.storage_path as string),
  }));
}

export async function loadBeforeAfterPairs() {
  const { data, error } = await supabase.from('before_after_pairs')
    .select('id, before_storage_path, after_storage_path').order('sort_order');
  if (error || !data?.length) {
    const localPairs = await loadLocalCollection<{ id: string; beforeUrl: string; afterUrl: string }>(
      '/api/before-after',
      'pairs',
    );
    if (localPairs) return localPairs;
    return DEFAULT_BEFORE_AFTER_PAIRS;
  }
  return (data ?? []).map((row) => ({
    id: row.id as string,
    beforeUrl: publicImageUrl(row.before_storage_path as string),
    afterUrl: publicImageUrl(row.after_storage_path as string),
  }));
}

export async function loadSiteContent<T>(key: string): Promise<T | null> {
  const { data, error } = await supabase.from('site_content')
    .select('content_value').eq('content_key', key).maybeSingle();
  if (error) throw error;
  return (data?.content_value as T | undefined) ?? null;
}

export async function loadSetting(key: string): Promise<string | null> {
  const { data, error } = await supabase.from('site_settings')
    .select('setting_value').eq('setting_key', key).maybeSingle();
  if (error || !data) {
    try {
      const result = await window.fetch('/api/settings');
      if (result.ok) {
        const localSettings = await result.json() as Record<string, string>;
        if (localSettings[key] !== undefined) return localSettings[key];
      }
    } catch {
      // Fall through to the Supabase error or null value.
    }
    return key === 'maps_url' ? 'https://www.google.com/maps?q=Skin%C3%A9+By+Ayat+Clinic&output=embed' : null;
  }
  const value = data.setting_value as { value?: string; url?: string; cleared?: boolean } | string | undefined;
  if (typeof value === 'string') return value;
  if (value?.cleared) return '';
  return value?.value || value?.url || null;
}

const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json' },
});

async function uploadDefaultAsset(url: string, path: string) {
  const file = await fetch(url).then((result) => result.blob());
  const { error } = await supabase.storage.from(imageBucket).upload(path, file, {
    contentType: file.type || 'image/jpeg',
    upsert: true,
  });
  if (error) throw error;
  return path;
}

export async function migrateDefaultContent() {
  try {
    const [{ count: reviewCount, error: reviewError }, { count: pairCount, error: pairError }] = await Promise.all([
      supabase.from('review_images').select('*', { count: 'exact', head: true }),
      supabase.from('before_after_pairs').select('*', { count: 'exact', head: true }),
    ]);
    if (reviewError || pairError || (reviewCount ?? 0) > 0 || (pairCount ?? 0) > 0) return;

    const reviewRows = await Promise.all(DEFAULT_REVIEW_IMAGES.map(async (image, sort_order) => ({
      storage_path: await uploadDefaultAsset(image.url, `reviews/${image.filename}`),
      sort_order,
    })));
    const { error: reviewsInsertError } = await supabase.from('review_images').insert(reviewRows);
    if (reviewsInsertError) throw reviewsInsertError;

    const pairRows = await Promise.all(DEFAULT_BEFORE_AFTER_PAIRS.map(async (pair, sort_order) => ({
      before_storage_path: await uploadDefaultAsset(pair.beforeUrl, `before-after/${pair.id}-before.jpeg`),
      after_storage_path: await uploadDefaultAsset(pair.afterUrl, `before-after/${pair.id}-after.jpeg`),
      sort_order,
    })));
    const { error: pairsInsertError } = await supabase.from('before_after_pairs').insert(pairRows);
    if (pairsInsertError) throw pairsInsertError;
    await supabase.from('site_settings').upsert({
      setting_key: 'maps_url',
      setting_value: { value: 'https://www.google.com/maps?q=Skin%C3%A9+By+Ayat+Clinic&output=embed' },
      updated_at: new Date().toISOString(),
    });
  } catch {
    // Bundled defaults remain available when migration permissions are missing.
  }
}

async function uploadImage(file: File, folder: string) {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(imageBucket).upload(path, file, { contentType: file.type });
  if (error) throw error;
  return path;
}

// Preserves the existing admin UI while replacing its image API with Supabase.
export async function adminFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const path = typeof input === 'string' ? input : input.toString();
  const method = (init.method || 'GET').toUpperCase();
  if (path === '/api/pricing' || path === '/api/consultation') {
    const key = path.slice('/api/'.length);
    try {
      if (method === 'GET') return response((await loadSiteContent(key)) ?? {});
      if (method === 'PUT') {
        const content_value = JSON.parse(init.body as string);
        const { error } = await supabase.from('site_content').upsert({ content_key: key, content_value, updated_at: new Date().toISOString() });
        if (error) throw error;
        return response({ success: true });
      }
    } catch (error) {
      return response({ error: error instanceof Error ? error.message : 'Supabase request failed' }, 500);
    }
  }
  if (path === '/api/settings' || path.startsWith('/api/settings/')) {
    try {
      if (path === '/api/settings' && method === 'GET') return response({ maps_url: (await loadSetting('maps_url')) ?? '' });
      if (method === 'PUT') {
        const key = path.slice('/api/settings/'.length);
        const value = JSON.parse(init.body as string).value ?? '';
        const { error } = await supabase.from('site_settings').upsert({ setting_key: key, setting_value: { value, cleared: value === '' }, updated_at: new Date().toISOString() });
        if (error) throw error;
        return response({ success: true });
      }
    } catch (error) {
      return response({ error: error instanceof Error ? error.message : 'Supabase request failed' }, 500);
    }
  }
  try {
    if (path === '/api/images/reviews' && method === 'GET') return response({ images: await loadReviewImages() });
    if (path === '/api/images/reviews' && method === 'POST') {
      const storage_path = await uploadImage((init.body as FormData).get('image') as File, 'reviews');
      const { count } = await supabase.from('review_images').select('*', { count: 'exact', head: true });
      const { data, error } = await supabase.from('review_images').insert({ storage_path, sort_order: count ?? 0 }).select('id').single();
      if (error) throw error;
      return response({ filename: data.id, url: publicImageUrl(storage_path) }, 201);
    }
    if (path === '/api/images/reviews/reorder' && method === 'PUT') {
      const ids = JSON.parse(init.body as string).order as string[];
      const changes = await Promise.all(ids.map((id, sort_order) => supabase.from('review_images').update({ sort_order }).eq('id', id)));
      if (changes.find((x) => x.error)?.error) throw changes.find((x) => x.error)!.error;
      return response({ success: true });
    }
    const reviewId = path.match(/^\/api\/images\/reviews\/([^/]+)$/)?.[1];
    if (reviewId && method === 'DELETE') {
      const id = decodeURIComponent(reviewId);
      const { data } = await supabase.from('review_images').select('storage_path').eq('id', id).single();
      if (data) await supabase.storage.from(imageBucket).remove([data.storage_path]);
      const { error } = await supabase.from('review_images').delete().eq('id', id);
      if (error) throw error;
      return response({ success: true });
    }
    if (path === '/api/before-after' && method === 'GET') return response({ pairs: await loadBeforeAfterPairs() });
    if (path === '/api/before-after' && method === 'POST') {
      const form = init.body as FormData;
      const before_storage_path = await uploadImage(form.get('beforeImage') as File, 'before-after');
      const after_storage_path = await uploadImage(form.get('afterImage') as File, 'before-after');
      const { count } = await supabase.from('before_after_pairs').select('*', { count: 'exact', head: true });
      const { data, error } = await supabase.from('before_after_pairs').insert({ before_storage_path, after_storage_path, sort_order: count ?? 0 }).select('id').single();
      if (error) throw error;
      return response({ id: data.id, beforeUrl: publicImageUrl(before_storage_path), afterUrl: publicImageUrl(after_storage_path) }, 201);
    }
    if (path === '/api/before-after/reorder' && method === 'PUT') {
      const ids = JSON.parse(init.body as string).order as string[];
      await Promise.all(ids.map((id, sort_order) => supabase.from('before_after_pairs').update({ sort_order }).eq('id', id)));
      return response({ success: true });
    }
    const side = path.match(/^\/api\/before-after\/([^/]+)\/(before|after)$/);
    if (side && method === 'PUT') {
      const column = side[2] === 'before' ? 'before_storage_path' : 'after_storage_path';
      const storagePath = await uploadImage((init.body as FormData).get('image') as File, 'before-after');
      const { data: old } = await supabase.from('before_after_pairs').select(column).eq('id', side[1]).single();
      const { error } = await supabase.from('before_after_pairs').update({ [column]: storagePath }).eq('id', side[1]);
      if (error) throw error;
      const oldPath = (old as Record<string, string> | null)?.[column];
      if (oldPath) await supabase.storage.from(imageBucket).remove([oldPath]);
      return response({ success: true });
    }
    const pairId = path.match(/^\/api\/before-after\/([^/]+)$/)?.[1];
    if (pairId && method === 'DELETE') {
      const { data } = await supabase.from('before_after_pairs').select('before_storage_path,after_storage_path').eq('id', pairId).single();
      if (data) await supabase.storage.from(imageBucket).remove([data.before_storage_path, data.after_storage_path]);
      const { error } = await supabase.from('before_after_pairs').delete().eq('id', pairId);
      if (error) throw error;
      return response({ success: true });
    }
    return response({ error: 'Unsupported request' }, 404);
  } catch (error) {
    return response({ error: error instanceof Error ? error.message : 'Supabase request failed' }, 500);
  }
}
