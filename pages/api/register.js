import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authRateLimit } from '../../lib/rateLimit';
import { sanitize, checkOrigin } from '../../lib/security';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (!authRateLimit(req, res)) return;
  if (!checkOrigin(req)) return res.status(403).json({ ok: false, error: 'Forbidden' });

  const name = sanitize(req.body?.name || '');
  const username = sanitize(req.body?.username || '').toLowerCase().replace(/[^a-z0-9_]/g, '');
  const password = req.body?.password || '';

  if (!name || !username || !password) return res.json({ ok: false, error: 'Semua field wajib diisi' });
  if (username.length < 3 || username.length > 20) return res.json({ ok: false, error: 'Username 3-20 karakter' });
  if (password.length < 6 || password.length > 100) return res.json({ ok: false, error: 'Password minimal 6 karakter' });
  if (name.length > 50) return res.json({ ok: false, error: 'Nama terlalu panjang' });

  // Check existing
  const { data: existing } = await supabase.from('users').select('id').eq('username', username).single();
  if (existing) return res.json({ ok: false, error: 'Username sudah dipakai' });

  const password_hash = await bcrypt.hash(password, 12);
  const { data: user, error } = await supabase.from('users').insert({ name, username, password_hash }).select().single();
  if (error) return res.json({ ok: false, error: 'Gagal membuat akun' });

  const token = jwt.sign({ userId: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.setHeader('Set-Cookie', `mdwa_token=${token}; HttpOnly; Path=/; Max-Age=${7*24*3600}; SameSite=Strict${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);
  return res.json({ ok: true, user: { id: user.id, name: user.name, username: user.username } });
}
