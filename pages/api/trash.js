import { getUserFromReq } from '../../lib/auth';
import { supabaseAdmin } from '../../lib/supabase';

export default async function handler(req, res) {
  const user = getUserFromReq(req);
  if (!user) return res.status(401).json({ ok: false });
  const db = supabaseAdmin();

  // GET — list trash
  if (req.method === 'GET') {
    const { data, error } = await db.from('files').select('*').eq('user_id', user.userId).not('deleted_at', 'is', null).order('deleted_at', { ascending: false });
    if (error) return res.json({ ok: false, error: error.message });
    return res.json({ ok: true, files: data });
  }

  // POST — trash/restore/delete/empty
  if (req.method === 'POST') {
    const { id, action } = req.body;

    if (action === 'trash') {
      const { error } = await db.from('files').update({ deleted_at: new Date().toISOString() }).eq('id', id).eq('user_id', user.userId);
      if (error) return res.json({ ok: false, error: error.message });
      return res.json({ ok: true });
    }

    if (action === 'restore') {
      const { error } = await db.from('files').update({ deleted_at: null }).eq('id', id).eq('user_id', user.userId);
      if (error) return res.json({ ok: false, error: error.message });
      return res.json({ ok: true });
    }

    if (action === 'delete') {
      const { data: file } = await db.from('files').select('*').eq('id', id).eq('user_id', user.userId).single();
      if (file?.supabase_url) {
        try {
          const url = new URL(file.supabase_url);
          const parts = url.pathname.split('/object/public/mdwa-files/');
          if (parts[1]) await db.storage.from('mdwa-files').remove([decodeURIComponent(parts[1])]);
        } catch(e) {}
      }
      const { error } = await db.from('files').delete().eq('id', id).eq('user_id', user.userId);
      if (error) return res.json({ ok: false, error: error.message });
      return res.json({ ok: true });
    }

    if (action === 'empty') {
      const { data: trashFiles } = await db.from('files').select('*').eq('user_id', user.userId).not('deleted_at', 'is', null);
      for (const file of (trashFiles || [])) {
        if (file.supabase_url) {
          try {
            const url = new URL(file.supabase_url);
            const parts = url.pathname.split('/object/public/mdwa-files/');
            if (parts[1]) await db.storage.from('mdwa-files').remove([decodeURIComponent(parts[1])]);
          } catch(e) {}
        }
      }
      const { error } = await db.from('files').delete().eq('user_id', user.userId).not('deleted_at', 'is', null);
      if (error) return res.json({ ok: false, error: error.message });
      return res.json({ ok: true });
    }

    return res.json({ ok: false, error: 'Unknown action' });
  }

  return res.status(405).end();
}
