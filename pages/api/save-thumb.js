import formidable from 'formidable';
import fs from 'fs';
import { getUserFromReq } from '../../lib/auth';
import { supabaseAdmin } from '../../lib/supabase';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const user = getUserFromReq(req);
  if (!user) return res.status(401).json({ ok: false });

  const form = formidable({ maxFileSize: 2 * 1024 * 1024 });
  const [fields, files] = await form.parse(req);

  const fileId = fields.fileId?.[0];
  const thumbFile = files.thumb?.[0];
  if (!fileId || !thumbFile) return res.json({ ok: false, error: 'Missing data' });

  const db = supabaseAdmin();
  const buffer = fs.readFileSync(thumbFile.filepath);

  const storagePath = `thumbs/${user.userId}/${fileId}.jpg`;
  const { error } = await db.storage
    .from('mdwa-files')
    .upload(storagePath, buffer, { contentType: 'image/jpeg', upsert: true });

  if (error) return res.json({ ok: false, error: error.message });

  const { data: urlData } = db.storage.from('mdwa-files').getPublicUrl(storagePath);
  const thumbUrl = urlData.publicUrl;

  await db.from('files').update({ thumb_url: thumbUrl }).eq('id', fileId).eq('user_id', user.userId);

  try { fs.unlinkSync(thumbFile.filepath); } catch(_) {}

  return res.json({ ok: true, thumbUrl });
}
