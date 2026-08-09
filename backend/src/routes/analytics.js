import express from 'express';
import Complaint from '../models/Complaint.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

export const router = express.Router();

// City-wide stats and hotspots back the authority dashboard only.
router.use(requireAuth, requireAdmin);

// GET /api/analytics — overall stats
router.get('/', async (req, res, next) => {
  try {
    const [byCategory, bySeverity, byStatus, total, resolved] = await Promise.all([
      Complaint.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
      Complaint.aggregate([{ $group: { _id: '$severity', count: { $sum: 1 } } }]),
      Complaint.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: 'Resolved' })
    ]);

    res.json({ byCategory, bySeverity, byStatus, total, resolved, open: total - resolved });
  } catch (err) { next(err); }
});

// GET /api/analytics/area — hotspot detection
router.get('/area', async (req, res, next) => {
  try {
    const hotspots = await Complaint.aggregate([
      { $group: { _id: '$location.area', count: { $sum: 1 }, open: {
        $sum: { $cond: [{ $ne: ['$status', 'Resolved'] }, 1, 0] }
      }}},
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    res.json({ hotspots });
  } catch (err) { next(err); }
});
