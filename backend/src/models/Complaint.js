import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
  source: {
    type: String,
    enum: ['citizen', 'reddit', 'twitter'],
    default: 'citizen'
  },
  rawText: { type: String, required: true },
  imageUrl: { type: String, default: null },

  location: {
    area: { type: String, required: true },   // e.g. "Bopal", "Satellite"
    city: { type: String, default: 'Ahmedabad' }
  },

  // AI-generated fields
  category: {
    type: String,
    enum: ['Roads', 'Water', 'Sanitation', 'Electricity', 'Other'],
    default: 'Other'
  },
  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  severityReason: String,
  department: String,
  routingExplanation: String,
  summary: String,

  // Duplicate detection
  duplicateOf: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint', default: null },
  similarityReason: String,

  // Status tracking
  status: {
    type: String,
    enum: ['Submitted', 'Verified', 'Assigned', 'In Progress', 'Resolved'],
    default: 'Submitted'
  },
  statusHistory: [{
    status: String,
    changedAt: { type: Date, default: Date.now },
    note: String
  }],

  // Link to social post if converted
  socialPostRef: { type: mongoose.Schema.Types.ObjectId, ref: 'SocialPost', default: null }
}, { timestamps: true });

// Index for area-based queries
complaintSchema.index({ 'location.area': 1, status: 1, severity: 1 });

export default mongoose.model('Complaint', complaintSchema);
