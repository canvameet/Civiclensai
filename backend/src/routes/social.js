import express from 'express';
import SocialPost from '../models/SocialPost.js';
import Complaint from '../models/Complaint.js';
import { classifyComplaint } from '../services/aiService.js';
import { runXScraper } from '../services/xScraper.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

export const router = express.Router();

// Social intelligence is an admin-only surface — every route below is gated.
router.use(requireAuth, requireAdmin);

// GET /api/social/feed — paginated civic social posts
router.get('/feed', async (req, res, next) => {
  try {
    const { area, platform, page = 1 } = req.query;
    const filter = { isCivicIssue: true };
    if (area) filter.area = new RegExp(area, 'i');
    if (platform) filter.platform = platform;

    const posts = await SocialPost.find(filter)
      .sort({ scrapedAt: -1 })
      .skip((page - 1) * 20)
      .limit(20);

    const total = await SocialPost.countDocuments(filter);
    res.json({ posts, total, page: Number(page) });
  } catch (err) { next(err); }
});

// POST /api/social/scrape — manually trigger scrape
router.post('/scrape', async (req, res, next) => {
  try {
    await runXScraper();
    const count = await SocialPost.countDocuments({ isCivicIssue: true });
    res.json({ success: true, message: 'Scrape complete', civicPostsTotal: count });
  } catch (err) { next(err); }
});

// POST /api/social/:postId/convert — convert social post to formal complaint
router.post('/:postId/convert', async (req, res, next) => {
  try {
    const post = await SocialPost.findOne({ postId: req.params.postId });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.convertedToComplaint) {
      return res.status(400).json({ error: 'Already converted', complaintId: post.linkedComplaint });
    }

    const recentComplaints = await Complaint.find({ 'location.area': post.area })
      .sort({ createdAt: -1 }).limit(20).select('_id summary location');

    const ai = await classifyComplaint(post.text, null, recentComplaints);

    let duplicateOf = null;
    if (ai.duplicateIndex >= 0 && recentComplaints[ai.duplicateIndex]) {
      duplicateOf = recentComplaints[ai.duplicateIndex]._id;
    }

    const complaint = await Complaint.create({
      source: post.platform,
      rawText: post.text,
      location: { area: post.area || 'Ahmedabad' },
      category: ai.category,
      severity: ai.severity,
      severityReason: ai.severityReason,
      department: ai.department,
      routingExplanation: ai.routingExplanation,
      summary: ai.summary,
      image: post.imageUrl || null,
      duplicateOf,
      similarityReason: ai.similarityReason,
      socialPostRef: post._id,
      statusHistory: [{ status: 'Submitted' }]
    });

    // Mark post as converted
    await SocialPost.findByIdAndUpdate(post._id, {
      convertedToComplaint: true,
      linkedComplaint: complaint._id
    });

    res.status(201).json({ success: true, complaint });
  } catch (err) { next(err); }
});
