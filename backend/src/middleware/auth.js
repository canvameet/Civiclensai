import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const TOKEN_TTL = '7d';

function secret() {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error('JWT_SECRET is not set');
  return s;
}

export function signToken(user) {
  return jwt.sign({ sub: String(user._id), role: user.role }, secret(), {
    expiresIn: TOKEN_TTL,
  });
}

/** Rejects the request unless a valid Bearer token is present. */
export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Not signed in' });

    const payload = jwt.verify(token, secret());
    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ error: 'Account no longer exists' });

    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: 'Session expired — sign in again' });
  }
}

/**
 * Rejects the request unless the caller holds a privileged role.
 *
 * Must be mounted *after* requireAuth — it reads req.user rather than the
 * token, so a missing user is a wiring bug, not an anonymous caller.
 * Returns 403 (authenticated but not allowed), never 401.
 */
export function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Not signed in' });
  if (!req.user.isAdmin()) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

/** Attaches req.user when a token is present, but never blocks the request. */
export async function optionalAuth(req, _res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (token) {
      const payload = jwt.verify(token, secret());
      req.user = await User.findById(payload.sub);
    }
  } catch {
    // an invalid token simply means "anonymous" here
  }
  next();
}
