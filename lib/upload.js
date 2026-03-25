import { createClient } from '@supabase/supabase-js';
import FormData from 'form-data';
import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const BUCKET = 'mdwa-files';

// ── Supabase Storage ─────────────────────────────────────
export async function uploadToSupabase(buffer, filename, mimetype, userId) {
  try {
    const ext = (filename.split('.').pop() || 'bin').toLowerCase().slice(0, 10);
    const path = `${userId}/${uuidv4()}.${ext}`;
    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(path, buffer, { contentType: mimetype, upsert: false });
    if (error) throw new Error(error.message);
    const { data: { publicUrl } } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);
    return { ok: true, url: publicUrl, provider: 'supabase', path };
  } catch (e) {
    return { ok: false, error: 'Supabase: ' + e.message };
  }
}

// ── Catbox (permanent, max 200MB) ────────────────────────
export async function uploadToCatbox(buffer, filename, mimetype) {
  try {
    const form = new FormData();
    form.append('reqtype', 'fileupload');
    form.append('userhash', process.env.CATBOX_USERHASH || '');
    form.append('fileToUpload', buffer, { filename, contentType: mimetype });
    const r = await fetch('https://catbox.moe/user/api.php', {
      method: 'POST', body: form,
      headers: { ...form.getHeaders() },
      timeout: 45000,
      signal: AbortSignal.timeout(45000),
    });
    const url = (await r.text()).trim();
    if (!url.startsWith('https://files.catbox.moe/')) throw new Error('Bad response: ' + url.slice(0,80));
    return { ok: true, url, provider: 'catbox' };
  } catch (e) {
    return { ok: false, error: 'Catbox: ' + e.message };
  }
}

// ── Litterbox (temp 72h, fallback only) ──────────────────
export async function uploadToLitterbox(buffer, filename, mimetype) {
  try {
    const form = new FormData();
    form.append('reqtype', 'fileupload');
    form.append('time', '72h');
    form.append('fileToUpload', buffer, { filename, contentType: mimetype });
    const r = await fetch('https://litterbox.catbox.moe/resources/internals/api.php', {
      method: 'POST', body: form,
      headers: { ...form.getHeaders() },
      timeout: 45000,
      signal: AbortSignal.timeout(45000),
    });
    const url = (await r.text()).trim();
    if (!url.startsWith('https://')) throw new Error('Bad response');
    return { ok: true, url, provider: 'litterbox' };
  } catch (e) {
    return { ok: false, error: 'Litterbox: ' + e.message };
  }
}

// ── Smart upload: Supabase → Catbox → Litterbox ──────────
// Supabase = primary DB storage (permanent)
// Catbox   = backup CDN (permanent, linked to akun userhash)
// Litterbox = last resort (72h, tapi file masih bisa diakses dari Supabase)
export async function smartUpload(buffer, filename, mimetype, userId) {
  const sizeMB = buffer.length / (1024 * 1024);
  const errors = [];

  // 1. Supabase Storage (always try first, up to 50MB free tier)
  if (sizeMB <= 50) {
    const r = await uploadToSupabase(buffer, filename, mimetype, userId);
    if (r.ok) return r;
    errors.push(r.error);
    console.warn('[upload] Supabase failed:', r.error);
  }

  // 2. Catbox (permanent backup, up to 200MB)
  if (sizeMB <= 200) {
    const r = await uploadToCatbox(buffer, filename, mimetype);
    if (r.ok) return r;
    errors.push(r.error);
    console.warn('[upload] Catbox failed:', r.error);
  }

  // 3. Litterbox (temp 72h, last resort up to 1GB)
  if (sizeMB <= 1000) {
    const r = await uploadToLitterbox(buffer, filename, mimetype);
    if (r.ok) return { ...r, warning: 'File tersimpan sementara (72 jam). Supabase & Catbox sedang tidak tersedia.' };
    errors.push(r.error);
    console.warn('[upload] Litterbox failed:', r.error);
  }

  return {
    ok: false,
    error: 'Semua CDN gagal. ' + errors.join(' | '),
    errors,
  };
}
