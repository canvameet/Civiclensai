import express from 'express';
import User from '../models/User.js';
import { requireAuth, signToken } from '../middleware/auth.js';

export const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;

/**
 * POST /api/auth/register — citizen self-signup.
 *
 * Role is hard-coded to 'citizen': authority accounts are provisioned
 * internally and must never be creatable from the public form.
 */
router.post('/register', async (req, res, next) => {
  try {
    const name = (req.body.name || '').trim();
    const email = (req.body.email || '').trim().toLowerCase();
    const { password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ error: 'Enter a valid email address' });
    }
    if (password.length < MIN_PASSWORD) {
      return res
        .status(400)
        .json({ error: `Password must be at least ${MIN_PASSWORD} characters` });
    }

    if (await User.exists({ email })) {
      return res
        .status(409)
        .json({ error: 'An account with that email already exists' });
    }

    const user = await User.create({
      name,
      email,
      passwordHash: await User.hashPassword(password),
      role: 'citizen',
    });

    res.status(201).json({ token: signToken(user), user: user.toPublic() });
  } catch (err) {
    next(err);
  }
});

/**
 * Shared credential check for both login doors.
 *
 * Resolves to the user on success, or null on any failure — the caller sends
 * one generic message either way so neither door reveals which emails exist.
 */
async function authenticate(email, password) {
  // passwordHash is select:false, so ask for it explicitly
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user) return null;
  return (await user.verifyPassword(password)) ? user : null;
}

/** POST /api/auth/login — citizen door. Privileged roles must use /admin/login. */
router.post('/login', async (req, res, next) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    const { password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await authenticate(email, password);
    if (!user) return res.status(401).json({ error: 'Incorrect email or password' });

    // Correct credentials, wrong door — point them at the admin login rather
    // than issuing a token here, so the two portals stay genuinely separate.
    if (user.isAdmin()) {
      return res
        .status(403)
        .json({ error: 'Admin accounts must sign in through the admin portal' });
    }

    res.json({ token: signToken(user), user: user.toPublic() });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/admin/login — admin door.
 *
 * A citizen with valid credentials gets the same generic rejection as a bad
 * password: this endpoint must not confirm that an email is a real account.
 */
router.post('/admin/login', async (req, res, next) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    const { password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await authenticate(email, password);
    if (!user || !user.isAdmin()) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    res.json({ token: signToken(user), user: user.toPublic() });
  } catch (err) {
    next(err);
  }
});

/** GET /api/auth/me — resolve the current session. */
router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user.toPublic() });
});
