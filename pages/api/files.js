// pages/api/files.js — get user files
import { getUserFromReq } from '../../lib/auth';
import { supabaseAdmin } from '../../lib/supabase';

export default async function handler(req, res) {
  const user = getUserFromReq(req);
  if (!user) return res.status(401).json({ ok: false, error: 'Unauthorized' });

  const db = supabaseAdmin();
  const { data, error } = await db
    .from('files')
    .select('*')
    .eq('user_id', user.userId)
    .order('uploaded_at', { ascending: false });

  if (error) return res.json({ ok: false, error: error.message });
  return res.json({ ok: true, files: data });
}
