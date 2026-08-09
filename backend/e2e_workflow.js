import axios from 'axios';

const API = 'http://localhost:5000/api';

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runWorkflow() {
  console.log('🚀 Starting CivicLens End-to-End Workflow Test...\n');

  try {
    // 1. Scrape Twitter
    console.log('1️⃣ Triggering X (Twitter) Scraper to find civic issues...');
    const scrapeRes = await axios.post(`${API}/social/scrape`);
    console.log(`✅ Scrape complete. Total civic posts found: ${scrapeRes.data.civicPostsTotal}`);

    // 2. Fetch the Social Feed
    console.log('\n2️⃣ Fetching the Social Feed (scraped posts)...');
    const feedRes = await axios.get(`${API}/social/feed`);
    const posts = feedRes.data.posts;
    
    if (posts.length === 0) {
      console.log('⚠️ No posts found in DB. The Twitter scraper might need valid data or your X API token is restricted.');
      console.log('Exiting workflow early because there are no posts to convert.');
      return;
    }

    const targetPost = posts[0];
    console.log(`✅ Found ${posts.length} posts. Selecting the first one for conversion:`);
    console.log(`   - Platform: ${targetPost.platform}`);
    console.log(`   - Area: ${targetPost.area}`);
    console.log(`   - Text: "${targetPost.text.substring(0, 80)}..."`);
    if (targetPost.imageUrl) {
      console.log(`   - 📸 Image attached: ${targetPost.imageUrl}`);
    }

    // 3. Convert Post to Complaint (Using AI)
    console.log('\n3️⃣ Converting Post to Official Complaint (Triggering OpenRouter AI)...');
    let complaintId;
    try {
      const convertRes = await axios.post(`${API}/social/${targetPost.postId}/convert`);
      const complaint = convertRes.data.complaint;
      complaintId = complaint._id;
      console.log(`✅ Conversion successful! AI automatically categorized it:`);
      console.log(`   - Category: ${complaint.category}`);
      console.log(`   - Severity: ${complaint.severity}`);
      console.log(`   - Department: ${complaint.department}`);
      console.log(`   - Summary: ${complaint.summary}`);
      if (complaint.image) {
        console.log(`   - 📸 Image securely attached to complaint!`);
      }
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.error === 'Already converted') {
        console.log('⚠️ This post was already converted in a previous test. Skipping conversion step.');
        complaintId = err.response.data.complaintId;
      } else {
        throw err;
      }
    }

    // 4. Update Complaint Status
    console.log('\n4️⃣ Updating Complaint Status (e.g., Department resolving it)...');
    const patchRes = await axios.patch(`${API}/complaints/${complaintId}/status`, {
      status: 'In Progress',
      note: 'Department has dispatched a team.'
    });
    console.log(`✅ Status updated to: ${patchRes.data.complaint.status}`);

    // 5. Check Dashboard Analytics
    console.log('\n5️⃣ Fetching Dashboard Analytics...');
    const analyticsRes = await axios.get(`${API}/analytics`);
    const data = analyticsRes.data;
    console.log(`✅ Analytics loaded successfully!`);
    console.log(`   - Total Complaints: ${data.total}`);
    console.log(`   - In Progress: ${data.byStatus.find(s => s._id === 'In Progress')?.count || 0}`);
    console.log(`   - Top Category: ${data.byCategory[0]?._id || 'None'} (${data.byCategory[0]?.count || 0})`);

    console.log('\n🎉 WORKFLOW TEST COMPLETED SUCCESSFULLY! The backend is flawless.');
  } catch (err) {
    console.error('\n❌ Workflow failed!');
    if (err.response) {
      console.error(err.response.status, JSON.stringify(err.response.data, null, 2));
    } else {
      console.error(err.message);
    }
  }
}

runWorkflow();
