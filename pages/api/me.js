import { getUserFromReq } from '../../lib/auth';
import { supabaseAdmin } from '../../lib/supabase';

export default async function handler(req, res) {
  const user = getUserFromReq(req);
  if (!user) return res.status(401).json({ ok: false });
  const db = supabaseAdmin();
  const { data } = await db.from('users').select('id, name, username, created_at').eq('id', user.userId).single();
  return res.json({ ok: true, user: data });
}
