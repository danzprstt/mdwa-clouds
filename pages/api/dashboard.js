import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import { apiRateLimit } from '../../lib/rateLimit';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  if (!apiRateLimit(req, res)) return;

  const token = req.cookies?.mdwa_token;
  if (!token) return res.status(401).json({ ok: false, error: 'Unauthorized' });
  let userId;
  try { ({ userId } = jwt.verify(token, process.env.JWT_SECRET)); }
  catch { return res.status(401).json({ ok: false, error: 'Invalid token' }); }

  try {
    // All files (not deleted) - use OR for deleted_at null compatibility
    const { data: allFiles, error: e1 } = await supabase
      .from('files')
      .select('*')
      .eq('user_id', userId)
      .or('deleted_at.is.null,deleted_at.eq.NULL');

    if (e1) throw new Error('files query: ' + e1.message);

    const activeFiles = (allFiles || []).filter(f => !f.deleted_at);
    const trashFiles  = (allFiles || []).filter(f =>  f.deleted_at);

    // Total stats
    const totalFiles = activeFiles.length;
    const totalSize  = activeFiles.reduce((s, f) => s + (Number(f.size) || 0), 0);

    // Provider breakdown (handle missing provider column)
    const providers = {};
    activeFiles.forEach(f => {
      const p = f.provider || 'catbox';
      if (!providers[p]) providers[p] = { count: 0, size: 0 };
      providers[p].count++;
      providers[p].size += Number(f.size) || 0;
    });

    // File type breakdown
    const types = { image: 0, video: 0, audio: 0, document: 0, other: 0 };
    activeFiles.forEach(f => {
      const m = f.mimetype || '';
      if (m.startsWith('image/')) types.image++;
      else if (m.startsWith('video/')) types.video++;
      else if (m.startsWith('audio/')) types.audio++;
      else if (m.startsWith('application/pdf') || m.startsWith('text/')) types.document++;
      else types.other++;
    });

    // Upload activity last 30 days
    const since = new Date(Date.now() - 30 * 24 * 3600 * 1000);
    const recentActivity = activeFiles
      .filter(f => new Date(f.created_at) >= since)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    const activityMap = {};
    recentActivity.forEach(f => {
      const date = f.created_at.slice(0, 10);
      if (!activityMap[date]) activityMap[date] = { date, uploads: 0, size: 0 };
      activityMap[date].uploads++;
      activityMap[date].size += Number(f.size) || 0;
    });
    const activity = Object.values(activityMap);

    // Recent uploads
    const recentUploads = [...activeFiles]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);

    // Folder breakdown
    const folders = {};
    activeFiles.forEach(f => {
      const folder = f.folder || 'Umum';
      if (!folders[folder]) folders[folder] = 0;
      folders[folder]++;
    });

    return res.json({
      ok: true,
      stats: {
        totalFiles,
        totalSize,
        trashCount: trashFiles.length,
      },
      providers,
      types,
      folders,
      recentUploads,
      activity,
    });

  } catch (e) {
    console.error('[dashboard]', e.message);
    return res.status(500).json({ ok: false, error: e.message });
  }
}
