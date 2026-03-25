export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { url } = req.body;
  if (!url) return res.json({ ok: false, error: 'URL diperlukan' });
  try {
    // Use TinyURL API (free, no key)
    const r = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
    const short = await r.text();
    if (short.startsWith('https://')) return res.json({ ok: true, shortUrl: short.trim() });
    throw new Error('Invalid response');
  } catch(e) {
    return res.json({ ok: false, error: 'Gagal mempersingkat URL' });
  }
}
