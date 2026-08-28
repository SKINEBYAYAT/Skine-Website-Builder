import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) throw new Error('Missing Supabase environment variables');

export const supabase = createClient(url, key);
export const imageBucket = 'website-images';

export const publicImageUrl = (path: string) =>
  supabase.storage.from(imageBucket).getPublicUrl(path).data.publicUrl;

export async function loadReviewImages() {
  const { data, error } = await supabase.from('review_images')
    .select('id, storage_path').order('sort_order');
  if (error) throw error;
  return (data ?? []).map((row) => ({
    filename: row.id as string,
    storagePath: row.storage_path as string,
    url: publicImageUrl(row.storage_path as string),
  }));
}

export async function loadBeforeAfterPairs() {
  const { data, error } = await supabase.from('before_after_pairs')
    .select('id, before_storage_path, after_storage_path').order('sort_order');
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id as string,
    beforeUrl: publicImageUrl(row.before_storage_path as string),
    afterUrl: publicImageUrl(row.after_storage_path as string),
  }));
}

const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json' },
});

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
  if (!path.startsWith('/api/images/reviews') && !path.startsWith('/api/before-after')) {
    return window.fetch(input, init);
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
