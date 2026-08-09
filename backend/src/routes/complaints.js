import express from 'express';
import Complaint from '../models/Complaint.js';
import { classifyComplaint } from '../services/aiService.js';
import { upload, toBase64 } from '../middleware/upload.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

export const router = express.Router();

// POST /api/complaints — submit new complaint
router.post('/', upload.single('image'), async (req, res, next) => {
  try {
    const { rawText, area, city } = req.body;
    if (!rawText || !area) return res.status(400).json({ error: 'rawText and area are required' });

    // Convert uploaded image to base64 for Claude/Gemini Vision
    let imageBase64 = null;
    let imageUrl = null;
    if (req.file) {
      imageBase64 = toBase64(req.file.path);
      imageUrl = `/uploads/${req.file.filename}`;
    }

    // Fetch recent complaints for duplicate detection
    const recentComplaints = await Complaint.find({ 'location.area': area })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('_id summary location');

    // Run AI classification
    const ai = await classifyComplaint(rawText, imageBase64, recentComplaints);

    // Handle duplicate
    let duplicateOf = null;
    if (ai.duplicateIndex >= 0 && recentComplaints[ai.duplicateIndex]) {
      duplicateOf = recentComplaints[ai.duplicateIndex]._id;
    }

    const complaint = await Complaint.create({
      source: 'citizen',
      rawText,
      imageUrl,
      location: { area, city: city || 'Ahmedabad' },
      category: ai.category,
      severity: ai.severity,
      severityReason: ai.severityReason,
      department: ai.department,
      routingExplanation: ai.routingExplanation,
      summary: ai.summary,
      duplicateOf,
      similarityReason: ai.similarityReason,
      statusHistory: [{ status: 'Submitted' }]
    });

    res.status(201).json({ success: true, complaint });
  } catch (err) { next(err); }
});

// GET /api/complaints — list with filters
router.get('/', async (req, res, next) => {
  try {
    const { category, severity, status, area, source } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (severity) filter.severity = severity;
    if (status) filter.status = status;
    if (area) filter['location.area'] = area;
    if (source) filter.source = source;

    const severityOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 };
    const complaints = await Complaint.find(filter)
      .sort({ createdAt: -1 })
      .limit(100);

    // Sort by severity priority
    complaints.sort((a, b) => (severityOrder[a.severity] ?? 4) - (severityOrder[b.severity] ?? 4));

    res.json({ complaints, total: complaints.length });
  } catch (err) { next(err); }
});

// GET /api/complaints/:id
router.get('/:id', async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('duplicateOf', 'summary status category')
      .populate('socialPostRef', 'platform url author');
    if (!complaint) return res.status(404).json({ error: 'Not found' });
    res.json({ complaint });
  } catch (err) { next(err); }
});

// PATCH /api/complaints/:id/status — admin-only; citizens read status, never set it
router.patch('/:id/status', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const validStatuses = ['Submitted', 'Verified', 'Assigned', 'In Progress', 'Resolved'];
    if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' });

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      {
        status,
        $push: { statusHistory: { status, note: note || '', changedAt: new Date() } }
      },
      { new: true }
    );
    if (!complaint) return res.status(404).json({ error: 'Not found' });
    res.json({ complaint });
  } catch (err) { next(err); }
});

// GET /api/complaints/stream/live — Server-Sent Events for real-time updates
router.get('/stream/live', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Watch MongoDB change stream
  const changeStream = Complaint.watch();
  changeStream.on('change', (change) => {
    if (change.operationType === 'insert' || change.operationType === 'update') {
      res.write(`data: ${JSON.stringify(change)}\n\n`);
    }
  });

  req.on('close', () => changeStream.close());
});
