import { createClient } from '@supabase/supabase-js';
import FormData from 'form-data';
import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const BUCKET = 'mdwa-files';
const MAX_SUPABASE_MB = 50;
const MAX_CATBOX_MB = 200;
const MAX_0X0_MB = 512;

// Upload to Supabase Storage (primary for files < 50MB)
export async function uploadToSupabase(buffer, filename, mimetype, userId) {
  try {
    const ext = filename.split('.').pop() || 'bin';
    const path = `${userId}/${uuidv4()}.${ext}`;
    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(path, buffer, { contentType: mimetype, upsert: false });
    if (error) throw error;
    const { data: { publicUrl } } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);
    return { ok: true, url: publicUrl, provider: 'supabase', path };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// Upload to Catbox (primary for files > 50MB up to 200MB)
export async function uploadToCatbox(buffer, filename, mimetype) {
  try {
    const form = new FormData();
    form.append('reqtype', 'fileupload');
    form.append('userhash', process.env.CATBOX_USERHASH || '');
    form.append('fileToUpload', buffer, { filename, contentType: mimetype });
    const r = await fetch('https://catbox.moe/user/api.php', { method: 'POST', body: form, timeout: 30000 });
    const url = await r.text();
    if (!url.startsWith('https://')) throw new Error('Invalid response: ' + url.slice(0, 100));
    return { ok: true, url: url.trim(), provider: 'catbox' };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// Upload to 0x0.st (backup CDN, up to 512MB, permanent)
export async function uploadTo0x0(buffer, filename, mimetype) {
  try {
    const form = new FormData();
    form.append('file', buffer, { filename, contentType: mimetype });
    const r = await fetch('https://0x0.st', { method: 'POST', body: form, timeout: 60000 });
    const url = await r.text();
    if (!url.startsWith('https://')) throw new Error('Invalid response');
    return { ok: true, url: url.trim(), provider: '0x0' };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// Smart upload: choose provider based on file size, with fallback chain
export async function smartUpload(buffer, filename, mimetype, userId) {
  const sizeMB = buffer.length / (1024 * 1024);

  // Strategy: Supabase (primary) → Catbox (fallback) → 0x0.st (last resort)
  if (sizeMB <= MAX_SUPABASE_MB) {
    const r1 = await uploadToSupabase(buffer, filename, mimetype, userId);
    if (r1.ok) return r1;
    console.warn('Supabase upload failed, trying Catbox:', r1.error);
  }

  if (sizeMB <= MAX_CATBOX_MB) {
    const r2 = await uploadToCatbox(buffer, filename, mimetype);
    if (r2.ok) return r2;
    console.warn('Catbox upload failed, trying 0x0.st:', r2.error);
  }

  if (sizeMB <= MAX_0X0_MB) {
    const r3 = await uploadTo0x0(buffer, filename, mimetype);
    if (r3.ok) return r3;
    return { ok: false, error: `Semua CDN gagal. File terlalu besar atau server error.` };
  }

  return { ok: false, error: `File terlalu besar (max ${MAX_0X0_MB}MB)` };
}
