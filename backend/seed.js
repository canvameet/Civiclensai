import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Department from './src/models/Department.js';
import Complaint from './src/models/Complaint.js';
import SocialPost from './src/models/SocialPost.js';
dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB for seeding');

    await Department.deleteMany({});
    await Complaint.deleteMany({});
    await SocialPost.deleteMany({});

    await Department.insertMany([
      { name: "AMC Roads Department", category: "Roads", city: "Ahmedabad" },
      { name: "AMC Water Supply", category: "Water", city: "Ahmedabad" },
      { name: "AMC Sanitation", category: "Sanitation", city: "Ahmedabad" },
      { name: "UGVCL / TORRENT Power", category: "Electricity", city: "Ahmedabad" }
    ]);

    console.log('Seed complete');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();
