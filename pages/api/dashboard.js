import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import { apiRateLimit } from '../../lib/rateLimit';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  if (!apiRateLimit(req, res)) return;

  const token = req.cookies?.mdwa_token;
  if (!token) return res.status(401).json({ ok: false, error: 'Unauthorized' });
  let userId;
  try { ({ userId } = jwt.verify(token, process.env.JWT_SECRET)); }
  catch { return res.status(401).json({ ok: false, error: 'Invalid token' }); }

  // Run all queries in parallel
  const [filesRes, storageRes, recentRes, activityRes] = await Promise.all([
    // Total file count + size
    supabase.from('files').select('size, provider, mimetype', { count: 'exact' })
      .eq('user_id', userId).is('deleted_at', null),
    // Storage breakdown by provider
    supabase.from('files').select('provider, size').eq('user_id', userId).is('deleted_at', null),
    // Recent 5 uploads
    supabase.from('files').select('id, title, filename, mimetype, size, url, provider, created_at')
      .eq('user_id', userId).is('deleted_at', null)
      .order('created_at', { ascending: false }).limit(5),
    // Upload activity last 30 days
    supabase.from('files').select('created_at, size')
      .eq('user_id', userId).is('deleted_at', null)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 3600000).toISOString())
      .order('created_at', { ascending: true }),
  ]);

  const files = filesRes.data || [];
  const totalFiles = filesRes.count || 0;
  const totalSize = files.reduce((s, f) => s + (f.size || 0), 0);

  // Provider breakdown
  const providers = {};
  (storageRes.data || []).forEach(f => {
    if (!providers[f.provider]) providers[f.provider] = { count: 0, size: 0 };
    providers[f.provider].count++;
    providers[f.provider].size += f.size || 0;
  });

  // File type breakdown
  const types = { image: 0, video: 0, audio: 0, document: 0, other: 0 };
  files.forEach(f => {
    if (f.mimetype?.startsWith('image/')) types.image++;
    else if (f.mimetype?.startsWith('video/')) types.video++;
    else if (f.mimetype?.startsWith('audio/')) types.audio++;
    else if (['application/pdf','text/'].some(t => f.mimetype?.startsWith(t))) types.document++;
    else types.other++;
  });

  // Daily activity (group by date)
  const activityMap = {};
  (activityRes.data || []).forEach(f => {
    const date = f.created_at.slice(0, 10);
    if (!activityMap[date]) activityMap[date] = { date, uploads: 0, size: 0 };
    activityMap[date].uploads++;
    activityMap[date].size += f.size || 0;
  });
  const activity = Object.values(activityMap).slice(-30);

  // Trash count
  const { count: trashCount } = await supabase.from('files')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId).not('deleted_at', 'is', null);

  return res.json({
    ok: true,
    stats: { totalFiles, totalSize, trashCount: trashCount || 0 },
    providers,
    types,
    recentUploads: recentRes.data || [],
    activity,
  });
}
