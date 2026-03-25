import formidable from 'formidable';
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import { smartUpload } from '../../lib/upload';
import { apiRateLimit } from '../../lib/rateLimit';
import { sanitize } from '../../lib/security';

export const config = { api: { bodyParser: false } };

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const ALLOWED = ['image/','video/','audio/','application/pdf','text/plain','application/zip','application/x-zip'];
function isAllowed(mime) { return ALLOWED.some(t => mime.startsWith(t)); }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (!apiRateLimit(req, res)) return;

  const token = req.cookies?.mdwa_token;
  if (!token) return res.status(401).json({ ok: false, error: 'Login dulu' });
  let userId;
  try { ({ userId } = jwt.verify(token, process.env.JWT_SECRET)); }
  catch { return res.status(401).json({ ok: false, error: 'Sesi tidak valid' }); }

  const form = formidable({ maxFileSize: 512 * 1024 * 1024, keepExtensions: true });
  let fields, files;
  try { [fields, files] = await form.parse(req); }
  catch (e) { return res.json({ ok: false, error: 'Gagal parse: ' + e.message }); }

  const file = Array.isArray(files.file) ? files.file[0] : files.file;
  if (!file) return res.json({ ok: false, error: 'File tidak ditemukan' });

  const mime = file.mimetype || 'application/octet-stream';
  if (!isAllowed(mime)) return res.json({ ok: false, error: 'Tipe file tidak diizinkan' });

  const title = sanitize(fields.title?.[0] || file.originalFilename || 'Untitled');
  const folder = sanitize(fields.folder?.[0] || 'Umum');
  const filename = file.originalFilename || 'upload.bin';

  let buffer;
  try { buffer = fs.readFileSync(file.filepath); }
  catch (e) { return res.json({ ok: false, error: 'Gagal baca file' }); }
  finally { try { fs.unlinkSync(file.filepath); } catch {} }

  // Try smart upload
  const upload = await smartUpload(buffer, filename, mime, userId);

  // Build insert object - only columns that definitely exist in v3/v4 schema
  const insertBase = {
    user_id: userId,
    title,
    filename,
    mimetype: mime,
    folder,
    url: upload.ok ? upload.url : '', // kosong jika gagal
  };

  // Try insert with all new columns first
  const insertFull = {
    ...insertBase,
    size: buffer.length,
    provider: upload.ok ? upload.provider : 'pending',
    supabase_path: upload.ok && upload.path ? upload.path : null,
  };

  let data, dbError;
  ({ data, error: dbError } = await supabase.from('files').insert(insertFull).select().single());

  // Fallback: if column error, retry with minimal columns
  if (dbError && (dbError.code === '42703' || dbError.message?.includes('column'))) {
    console.warn('Column mismatch, retrying minimal insert');
    ({ data, error: dbError } = await supabase.from('files').insert(insertBase).select().single());
  }

  if (dbError) return res.json({ ok: false, error: 'DB error: ' + dbError.message });

  // Return with info
  return res.json({
    ok: true,
    file: data,
    cdnOk: upload.ok,
    provider: upload.ok ? upload.provider : null,
    warning: upload.ok ? (upload.warning || null) : `CDN gagal (${upload.error?.slice(0,80)}), file tersimpan di database tanpa URL.`,
    cdnErrors: upload.ok ? null : upload.errors,
  });
}
