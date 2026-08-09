/**
 * Master-admin management routes.
 * Only a master-admin can create, update, or delete other admin accounts.
 *
 * POST   /api/master-admin/users          — create a new admin/authority account
 * GET    /api/master-admin/users          — list all non-citizen users
 * PATCH  /api/master-admin/users/:id      — update name/area/dept/role/password
 * DELETE /api/master-admin/users/:id      — remove an admin account
 */
import express from 'express';
import User from '../models/User.js';
import { requireAuth, requireMasterAdmin } from '../middleware/auth.js';

export const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;
const ALLOWED_ROLES = ['admin', 'authority'];

// All routes require a signed-in master-admin
router.use(requireAuth, requireMasterAdmin);

// GET /api/master-admin/users
router.get('/users', async (req, res, next) => {
  try {
    const users = await User.find({ role: { $in: ['admin', 'authority', 'master-admin'] } })
      .sort({ createdAt: -1 })
      .select('-passwordHash');
    res.json({ users: users.map((u) => u.toPublic()) });
  } catch (err) {
    next(err);
  }
});

// POST /api/master-admin/users
router.post('/users', async (req, res, next) => {
  try {
    const name = (req.body.name || '').trim();
    const email = (req.body.email || '').trim().toLowerCase();
    const { password, role, assignedArea, assignedDept } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ error: 'Enter a valid email address' });
    }
    if (password.length < MIN_PASSWORD) {
      return res.status(400).json({ error: `Password must be at least ${MIN_PASSWORD} characters` });
    }
    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({ error: `Role must be one of: ${ALLOWED_ROLES.join(', ')}` });
    }
    if (await User.exists({ email })) {
      return res.status(409).json({ error: 'An account with that email already exists' });
    }

    const user = await User.create({
      name,
      email,
      passwordHash: await User.hashPassword(password),
      role,
      assignedArea: assignedArea || null,
      assignedDept: assignedDept || null,
    });

    res.status(201).json({ user: user.toPublic() });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/master-admin/users/:id
router.patch('/users/:id', async (req, res, next) => {
  try {
    const { name, role, assignedArea, assignedDept, password } = req.body;

    // Prevent demoting another master-admin
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ error: 'User not found' });
    if (target.role === 'master-admin' && target._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Cannot modify another master admin' });
    }

    const updates = {};
    if (name) updates.name = name.trim();
    if (role && ALLOWED_ROLES.includes(role)) updates.role = role;
    if (assignedArea !== undefined) updates.assignedArea = assignedArea || null;
    if (assignedDept !== undefined) updates.assignedDept = assignedDept || null;
    if (password) {
      if (password.length < MIN_PASSWORD) {
        return res.status(400).json({ error: `Password must be at least ${MIN_PASSWORD} characters` });
      }
      updates.passwordHash = await User.hashPassword(password);
    }

    const updated = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!updated) return res.status(404).json({ error: 'User not found' });

    res.json({ user: updated.toPublic() });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/master-admin/users/:id
router.delete('/users/:id', async (req, res, next) => {
  try {
    // Prevent self-deletion
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ error: 'You cannot delete your own account' });
    }
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ error: 'User not found' });
    if (target.role === 'master-admin') {
      return res.status(403).json({ error: 'Cannot delete another master admin' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});
