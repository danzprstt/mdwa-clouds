export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { text, size = 200 } = req.body;
  if (!text) return res.json({ ok: false, error: 'Text diperlukan' });
  // Use QR Server API (free, no key)
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&format=png&margin=10`;
  return res.json({ ok: true, url: qrUrl });
}
