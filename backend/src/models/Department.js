import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
  name: String,
  category: String,         // Maps to Complaint.category
  contactEmail: String,
  city: String
});

export default mongoose.model('Department', departmentSchema);
