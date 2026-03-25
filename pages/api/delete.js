import { getUserFromReq } from '../../lib/auth';
import { supabaseAdmin } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const user = getUserFromReq(req);
  if (!user) return res.status(401).json({ ok: false, error: 'Unauthorized' });

  const { id } = req.body;
  const db = supabaseAdmin();

  // Verify ownership
  const { data: file } = await db.from('files').select('*').eq('id', id).eq('user_id', user.userId).single();
  if (!file) return res.json({ ok: false, error: 'File tidak ditemukan' });

  // Delete from Supabase Storage if exists
  if (file.supabase_url) {
    try {
      const url = new URL(file.supabase_url);
      const pathParts = url.pathname.split('/object/public/mdwa-files/');
      if (pathParts[1]) {
        await db.storage.from('mdwa-files').remove([decodeURIComponent(pathParts[1])]);
      }
    } catch (e) { console.log('Storage delete error:', e.message); }
  }

  // Delete from DB
  const { error } = await db.from('files').delete().eq('id', id).eq('user_id', user.userId);
  if (error) return res.json({ ok: false, error: error.message });

  return res.json({ ok: true });
}
