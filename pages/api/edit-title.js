// pages/api/edit-title.js
import { getUserFromReq } from '../../lib/auth';
import { supabaseAdmin } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const user = getUserFromReq(req);
  if (!user) return res.status(401).json({ ok: false });
  const { id, title } = req.body;
  const db = supabaseAdmin();
  const { error } = await db.from('files').update({ title }).eq('id', id).eq('user_id', user.userId);
  if (error) return res.json({ ok: false, error: error.message });
  return res.json({ ok: true });
}
