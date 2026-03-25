import { apiRateLimit } from '../../lib/rateLimit';
import { sanitize } from '../../lib/security';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (!apiRateLimit(req, res)) return;

  const type = sanitize(req.body?.type || '');
  const title = sanitize(req.body?.title || '');
  const description = sanitize(req.body?.description || '');
  const email = sanitize(req.body?.email || '');

  if (!type || !title || !description) return res.json({ ok: false, error: 'Isi semua field yang wajib' });
  if (description.length < 10) return res.json({ ok: false, error: 'Deskripsi terlalu pendek' });

  // Forward to report app webhook (Firebase)
  try {
    const webhookUrl = process.env.REPORT_WEBHOOK_URL;
    if (webhookUrl) {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, title, description, email, source: 'mdwa-cloud', ts: new Date().toISOString() }),
      });
    }
    return res.json({ ok: true, message: 'Laporan berhasil dikirim. Terima kasih!' });
  } catch (e) {
    return res.json({ ok: false, error: 'Gagal mengirim laporan' });
  }
}
