import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'mdwa_fallback_secret';

export function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch (e) {
    return null;
  }
}

export function getTokenFromReq(req) {
  const cookie = req.headers.cookie || '';
  const match = cookie.match(/mdwa_token=([^;]+)/);
  return match ? match[1] : null;
}

export function getUserFromReq(req) {
  const token = getTokenFromReq(req);
  if (!token) return null;
  return verifyToken(token);
}

export function setCookieHeader(token) {
  return `mdwa_token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${60 * 60 * 24 * 7}`;
}

export function clearCookieHeader() {
  return `mdwa_token=; Path=/; HttpOnly; Max-Age=0`;
}
