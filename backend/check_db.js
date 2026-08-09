import mongoose from 'mongoose';
import 'dotenv/config';
import Complaint from './src/models/Complaint.js';
import SocialPost from './src/models/SocialPost.js';

async function checkDatabase() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected successfully!\n');

  console.log('--- 📋 LATEST COMPLAINTS IN DATABASE ---');
  const complaints = await Complaint.find().sort({ createdAt: -1 }).limit(3);
  complaints.forEach((c, index) => {
    console.log(`\nComplaint #${index + 1} (ID: ${c._id})`);
    console.log(`  Source:     ${c.source}`);
    console.log(`  Area:       ${c.location?.area}`);
    console.log(`  Status:     ${c.status}`);
    console.log(`  Category:   ${c.category}`);
    console.log(`  Department: ${c.department}`);
    console.log(`  Severity:   ${c.severity}`);
    console.log(`  Summary:    ${c.summary}`);
    console.log(`  Image URL:  ${c.imageUrl || 'None'}`);
    console.log(`  Status Hist:${c.statusHistory.map(h => h.status).join(' -> ')}`);
  });

  console.log('\n--- 🐦 LATEST SOCIAL POSTS IN DATABASE ---');
  const posts = await SocialPost.find().sort({ scrapedAt: -1 }).limit(2);
  posts.forEach((p, index) => {
    console.log(`\nPost #${index + 1} (Platform: ${p.platform})`);
    console.log(`  Area:        ${p.area}`);
    console.log(`  Is Civic?:   ${p.isCivicIssue}`);
    console.log(`  Converted?:  ${p.convertedToComplaint}`);
    console.log(`  Text:        "${p.text.substring(0, 80)}..."`);
  });

  console.log('\n✅ Database verification complete. Closing connection.');
  await mongoose.disconnect();
}

checkDatabase().catch(err => {
  console.error(err);
  process.exit(1);
});
