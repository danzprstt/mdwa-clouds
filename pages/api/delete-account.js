import { getUserFromReq, clearCookieHeader } from '../../lib/auth';
import { supabaseAdmin } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const user = getUserFromReq(req);
  if (!user) return res.status(401).json({ ok: false });

  const { confirm } = req.body;
  if (confirm !== user.username) return res.json({ ok: false, error: 'Username tidak cocok' });

  const db = supabaseAdmin();

  // Delete all files from storage
  const { data: files } = await db.from('files').select('supabase_url').eq('user_id', user.userId);
  for (const file of (files || [])) {
    if (file.supabase_url) {
      try {
        const url = new URL(file.supabase_url);
        const parts = url.pathname.split('/object/public/mdwa-files/');
        if (parts[1]) await db.storage.from('mdwa-files').remove([decodeURIComponent(parts[1])]);
      } catch(e) {}
    }
  }

  // Delete user (cascade deletes files)
  const { error } = await db.from('users').delete().eq('id', user.userId);
  if (error) return res.json({ ok: false, error: error.message });

  res.setHeader('Set-Cookie', clearCookieHeader());
  return res.json({ ok: true });
}
