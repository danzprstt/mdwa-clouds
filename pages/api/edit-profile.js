import bcrypt from 'bcryptjs';
import { getUserFromReq } from '../../lib/auth';
import { supabaseAdmin } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const user = getUserFromReq(req);
  if (!user) return res.status(401).json({ ok: false });

  const { name, password } = req.body;
  const db = supabaseAdmin();
  const updates = {};
  if (name) updates.name = name;
  if (password && password.length >= 6) updates.password_hash = await bcrypt.hash(password, 10);

  const { error } = await db.from('users').update(updates).eq('id', user.userId);
  if (error) return res.json({ ok: false, error: error.message });
  return res.json({ ok: true });
}
