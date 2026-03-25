import crypto from 'crypto';

// Sanitize string input
export function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/<[^>]*>/g, '').slice(0, 2000);
}

// Validate URL
export function isValidUrl(url) {
  try {
    const u = new URL(url);
    return ['http:', 'https:'].includes(u.protocol);
  } catch { return false; }
}

// Generate CSRF token
export function generateCsrf() {
  return crypto.randomBytes(32).toString('hex');
}

// Validate origin
export function checkOrigin(req) {
  const origin = req.headers.origin || req.headers.referer || '';
  const host = req.headers.host || '';
  if (!origin) return true; // Same-origin requests have no origin
  try {
    const originHost = new URL(origin).host;
    return originHost === host || originHost.endsWith('.vercel.app') || process.env.NODE_ENV === 'development';
  } catch { return false; }
}

// Hash sensitive data for logging (never log raw passwords/tokens)
export function safeLog(data) {
  const safe = { ...data };
  ['password', 'token', 'secret', 'key'].forEach(k => { if (safe[k]) safe[k] = '[REDACTED]'; });
  return safe;
}
