import { clearCookieHeader } from '../../lib/auth';

export default function handler(req, res) {
  res.setHeader('Set-Cookie', clearCookieHeader());
  return res.json({ ok: true });
}
