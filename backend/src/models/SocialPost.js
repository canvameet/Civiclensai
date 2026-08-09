import mongoose from 'mongoose';

const socialPostSchema = new mongoose.Schema({
  platform: { type: String, enum: ['reddit', 'twitter'], required: true },
  postId: { type: String, required: true, unique: true },  // dedup key
  text: { type: String, required: true },
  author: String,
  url: String,
  area: String,
  imageUrl: String,

  // AI classification (lightweight)
  isCivicIssue: { type: Boolean, default: false },
  category: String,

  // Conversion tracking
  convertedToComplaint: { type: Boolean, default: false },
  linkedComplaint: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint', default: null },

  scrapedAt: { type: Date, default: Date.now }
});

socialPostSchema.index({ platform: 1, area: 1 });

export default mongoose.model('SocialPost', socialPostSchema);
