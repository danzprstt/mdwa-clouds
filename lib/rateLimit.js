// In-memory rate limiter (works on Vercel serverless)
const store = new Map();

export function rateLimit({ windowMs = 60000, max = 30, keyPrefix = '' } = {}) {
  return function check(req, res) {
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
    const key = `${keyPrefix}:${ip}`;
    const now = Date.now();

    if (!store.has(key)) store.set(key, { count: 1, resetAt: now + windowMs });
    else {
      const entry = store.get(key);
      if (now > entry.resetAt) { entry.count = 1; entry.resetAt = now + windowMs; }
      else entry.count++;
      if (entry.count > max) {
        res.setHeader('Retry-After', Math.ceil((entry.resetAt - now) / 1000));
        res.status(429).json({ ok: false, error: 'Terlalu banyak permintaan. Coba lagi nanti.' });
        return false;
      }
    }
    // Cleanup old entries every 100 requests
    if (Math.random() < 0.01) store.forEach((v, k) => { if (now > v.resetAt) store.delete(k); });
    return true;
  };
}

export function authRateLimit(req, res) {
  return rateLimit({ windowMs: 15 * 60000, max: 10, keyPrefix: 'auth' })(req, res);
}

export function apiRateLimit(req, res) {
  return rateLimit({ windowMs: 60000, max: 60, keyPrefix: 'api' })(req, res);
}

export function downloadRateLimit(req, res) {
  return rateLimit({ windowMs: 60000, max: 15, keyPrefix: 'dl' })(req, res);
}
