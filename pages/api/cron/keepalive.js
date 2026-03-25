// Called by Vercel Cron every 5 days to prevent Supabase from pausing
// Add to vercel.json: { "crons": [{ "path": "/api/cron/keepalive", "schedule": "0 0 */5 * *" }] }
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Only allow GET from Vercel Cron (has authorization header)
  const authHeader = req.headers.authorization;
  if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ ok: false });
  }
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    // Lightweight ping — just count users
    const { count } = await supabase.from('users').select('id', { count: 'exact', head: true });
    return res.json({ ok: true, pinged: true, users: count, ts: new Date().toISOString() });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
}
