import formidable from 'formidable';
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import { smartUpload } from '../../lib/upload';
import { apiRateLimit } from '../../lib/rateLimit';
import { sanitize } from '../../lib/security';

export const config = { api: { bodyParser: false } };

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const ALLOWED_TYPES = ['image/','video/','audio/','application/pdf','text/plain','application/zip','application/x-zip'];

function isAllowed(mime) { return ALLOWED_TYPES.some(t => mime.startsWith(t)); }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (!apiRateLimit(req, res)) return;

  // Auth
  const token = req.cookies?.mdwa_token;
  if (!token) return res.status(401).json({ ok: false, error: 'Login dulu' });
  let userId;
  try { ({ userId } = jwt.verify(token, process.env.JWT_SECRET)); }
  catch { return res.status(401).json({ ok: false, error: 'Sesi tidak valid' }); }

  const form = formidable({ maxFileSize: 512 * 1024 * 1024, keepExtensions: true });
  const [fields, files] = await form.parse(req);
  const file = Array.isArray(files.file) ? files.file[0] : files.file;
  if (!file) return res.json({ ok: false, error: 'File tidak ditemukan' });

  const mime = file.mimetype || 'application/octet-stream';
  if (!isAllowed(mime)) return res.json({ ok: false, error: 'Tipe file tidak diizinkan' });

  const title = sanitize(fields.title?.[0] || file.originalFilename || 'Untitled');
  const buffer = fs.readFileSync(file.filepath);
  const filename = file.originalFilename || 'upload.bin';

  // Smart upload with fallback chain
  const upload = await smartUpload(buffer, filename, mime, userId);
  fs.unlinkSync(file.filepath);

  if (!upload.ok) return res.json({ ok: false, error: upload.error });

  // Save to DB with both URLs
  const { data, error } = await supabase.from('files').insert({
    user_id: userId,
    title,
    filename,
    mimetype: mime,
    size: buffer.length,
    url: upload.url,
    provider: upload.provider,
    supabase_path: upload.path || null,
  }).select().single();

  if (error) return res.json({ ok: false, error: 'Gagal menyimpan ke database' });
  return res.json({ ok: true, file: data });
}
