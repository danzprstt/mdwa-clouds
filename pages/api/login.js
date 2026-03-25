import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authRateLimit } from '../../lib/rateLimit';
import { sanitize, checkOrigin } from '../../lib/security';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Brute force tracking
const failStore = new Map();
const MAX_FAILS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (!authRateLimit(req, res)) return;
  if (!checkOrigin(req)) return res.status(403).json({ ok: false, error: 'Forbidden' });

  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown';
  const now = Date.now();

  // Check lockout
  const fail = failStore.get(ip) || { count: 0, lockedUntil: 0 };
  if (fail.lockedUntil > now) {
    const mins = Math.ceil((fail.lockedUntil - now) / 60000);
    return res.status(429).json({ ok: false, error: `Akun dikunci ${mins} menit lagi. Terlalu banyak percobaan login gagal.` });
  }

  const username = sanitize(req.body?.username || '');
  const password = req.body?.password || '';

  if (!username || !password) return res.json({ ok: false, error: 'Username dan password wajib diisi' });
  if (username.length > 50 || password.length > 200) return res.json({ ok: false, error: 'Input tidak valid' });

  const { data: user, error } = await supabase
    .from('users').select('*').eq('username', username).single();

  if (error || !user) {
    fail.count++;
    if (fail.count >= MAX_FAILS) { fail.lockedUntil = now + LOCKOUT_MS; fail.count = 0; }
    failStore.set(ip, fail);
    return res.json({ ok: false, error: 'Username atau password salah' });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    fail.count++;
    if (fail.count >= MAX_FAILS) { fail.lockedUntil = now + LOCKOUT_MS; fail.count = 0; }
    failStore.set(ip, fail);
    const remaining = MAX_FAILS - fail.count;
    return res.json({ ok: false, error: `Password salah. ${remaining} percobaan tersisa.` });
  }

  // Reset fail counter on success
  failStore.delete(ip);

  const token = jwt.sign({ userId: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.setHeader('Set-Cookie', `mdwa_token=${token}; HttpOnly; Path=/; Max-Age=${7*24*3600}; SameSite=Strict${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);
  return res.json({ ok: true, user: { id: user.id, name: user.name, username: user.username } });
}
