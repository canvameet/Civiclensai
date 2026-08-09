import express from 'express';
import Complaint from '../models/Complaint.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

export const router = express.Router();

// City-wide stats and hotspots back the authority dashboard only.
router.use(requireAuth, requireAdmin);

// GET /api/analytics — overall stats, scoped to admin's area/dept if set
router.get('/', async (req, res, next) => {
  try {
    const scopedArea = req.user?.assignedArea || null;
    const scopedDept = req.user?.assignedDept || null;

    // Build a base match stage for the aggregation pipeline
    const baseMatch = {};
    if (scopedArea) baseMatch['location.area'] = scopedArea;
    if (scopedDept) baseMatch['department'] = scopedDept;

    const matchStage = Object.keys(baseMatch).length ? [{ $match: baseMatch }] : [];

    const [byCategory, bySeverity, byStatus, total, resolved] = await Promise.all([
      Complaint.aggregate([...matchStage, { $group: { _id: '$category', count: { $sum: 1 } } }]),
      Complaint.aggregate([...matchStage, { $group: { _id: '$severity', count: { $sum: 1 } } }]),
      Complaint.aggregate([...matchStage, { $group: { _id: '$status', count: { $sum: 1 } } }]),
      Complaint.countDocuments(baseMatch),
      Complaint.countDocuments({ ...baseMatch, status: 'Resolved' }),
    ]);

    res.json({ byCategory, bySeverity, byStatus, total, resolved, open: total - resolved });
  } catch (err) { next(err); }
});

// GET /api/analytics/area — hotspot detection, scoped to admin's dept if set
router.get('/area', async (req, res, next) => {
  try {
    const scopedArea = req.user?.assignedArea || null;
    const scopedDept = req.user?.assignedDept || null;

    const baseMatch = {};
    if (scopedArea) baseMatch['location.area'] = scopedArea;
    if (scopedDept) baseMatch['department'] = scopedDept;

    const matchStage = Object.keys(baseMatch).length ? [{ $match: baseMatch }] : [];

    const hotspots = await Complaint.aggregate([
      ...matchStage,
      { $group: { _id: '$location.area', count: { $sum: 1 }, open: {
        $sum: { $cond: [{ $ne: ['$status', 'Resolved'] }, 1, 0] }
      }}},
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    res.json({ hotspots });
  } catch (err) { next(err); }
});
