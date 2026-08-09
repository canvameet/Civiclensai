/**
 * Demo data for the in-memory dev database, so the dashboards have something
 * to show without a live AI key. Only inserts when the collections are empty.
 */
import Department from './src/models/Department.js';
import Complaint from './src/models/Complaint.js';
import SocialPost from './src/models/SocialPost.js';

const DEPARTMENTS = [
  { name: 'AMC Roads Department', category: 'Roads', city: 'Ahmedabad' },
  { name: 'AMC Water Supply', category: 'Water', city: 'Ahmedabad' },
  { name: 'AMC Sanitation', category: 'Sanitation', city: 'Ahmedabad' },
  { name: 'UGVCL / TORRENT Power', category: 'Electricity', city: 'Ahmedabad' },
];

const COMPLAINTS = [
  {
    source: 'citizen',
    rawText:
      'Large pothole on CG Road near Swaminarayan temple, vehicles getting damaged every day.',
    location: { area: 'Navrangpura', city: 'Ahmedabad' },
    category: 'Roads',
    severity: 'Critical',
    severityReason: 'High-traffic arterial road with active vehicle damage.',
    department: 'AMC Roads Department',
    routingExplanation: 'Keywords: pothole, road. Falls under road maintenance.',
    summary: 'Critical pothole on CG Road near Swaminarayan temple damaging vehicles.',
    status: 'Verified',
    statusHistory: [{ status: 'Submitted' }, { status: 'Verified', note: 'Site inspected' }],
  },
  {
    source: 'citizen',
    rawText: 'Water supply cut in Vastrapur for 2 days, no prior notice from AMC.',
    location: { area: 'Vastrapur', city: 'Ahmedabad' },
    category: 'Water',
    severity: 'High',
    severityReason: 'Extended outage affecting an entire residential block.',
    department: 'AMC Water Supply',
    routingExplanation: 'Keywords: water supply, outage.',
    summary: 'Two-day unannounced water supply outage in Vastrapur.',
    status: 'Assigned',
    statusHistory: [
      { status: 'Submitted' },
      { status: 'Verified' },
      { status: 'Assigned', note: 'Crew dispatched' },
    ],
  },
  {
    source: 'citizen',
    rawText: 'Garbage has not been collected in Bopal society for over a week.',
    location: { area: 'Bopal', city: 'Ahmedabad' },
    category: 'Sanitation',
    severity: 'Medium',
    severityReason: 'Sanitation risk but contained to one society.',
    department: 'AMC Sanitation',
    routingExplanation: 'Keywords: garbage, collection.',
    summary: 'Uncollected garbage accumulating in Bopal for a week.',
    status: 'In Progress',
    statusHistory: [
      { status: 'Submitted' },
      { status: 'Verified' },
      { status: 'Assigned' },
      { status: 'In Progress' },
    ],
  },
  {
    source: 'citizen',
    rawText: 'Streetlight broken near Prahladnagar garden, area completely dark at night.',
    location: { area: 'Prahladnagar', city: 'Ahmedabad' },
    category: 'Electricity',
    severity: 'High',
    severityReason: 'Safety risk after dark in a public area.',
    department: 'UGVCL / TORRENT Power',
    routingExplanation: 'Keywords: streetlight, electricity.',
    summary: 'Broken streetlight leaving Prahladnagar garden unlit at night.',
    status: 'Submitted',
    statusHistory: [{ status: 'Submitted' }],
  },
  {
    source: 'citizen',
    rawText: 'Drainage overflowing on Satellite road after yesterday rain.',
    location: { area: 'Satellite', city: 'Ahmedabad' },
    category: 'Sanitation',
    severity: 'Low',
    severityReason: 'Localised and receding after rainfall.',
    department: 'AMC Sanitation',
    routingExplanation: 'Keywords: drainage, overflow.',
    summary: 'Drainage overflow on Satellite road following rain.',
    status: 'Resolved',
    statusHistory: [
      { status: 'Submitted' },
      { status: 'Verified' },
      { status: 'Assigned' },
      { status: 'In Progress' },
      { status: 'Resolved', note: 'Cleared by sanitation crew' },
    ],
  },
];

const SOCIAL_POSTS = [
  {
    platform: 'twitter',
    postId: 'demo-1',
    text: 'Huge pothole on CG Road, been like this for weeks now @AMC_Ahmedabad do something!',
    author: 'cityuser',
    url: 'https://x.com',
    area: 'Navrangpura',
    isCivicIssue: true,
    category: 'Roads',
  },
  {
    platform: 'twitter',
    postId: 'demo-2',
    text: 'No water in Vastrapur since morning. Third time this month. #AMCFails',
    author: 'ahd_resident',
    url: 'https://x.com',
    area: 'Vastrapur',
    isCivicIssue: true,
    category: 'Water',
  },
  {
    platform: 'twitter',
    postId: 'demo-3',
    text: 'Garbage piling up near Bopal circle, absolutely unbearable smell.',
    author: 'bopal_voice',
    url: 'https://x.com',
    area: 'Bopal',
    isCivicIssue: true,
    category: 'Sanitation',
  },
  {
    platform: 'twitter',
    postId: 'demo-4',
    text: 'Streetlights off on the whole Prahladnagar stretch, unsafe to walk at night.',
    author: 'nightwalker_ahd',
    url: 'https://x.com',
    area: 'Prahladnagar',
    isCivicIssue: true,
    category: 'Electricity',
  },
];

export async function seedDemoData() {
  const existing = await Complaint.estimatedDocumentCount();
  if (existing > 0) {
    console.log('Demo seed skipped — complaints already present.');
    return;
  }

  await Department.insertMany(DEPARTMENTS);
  await Complaint.insertMany(COMPLAINTS);
  await SocialPost.insertMany(SOCIAL_POSTS);

  console.log(
    `Demo seed complete: ${COMPLAINTS.length} complaints, ${SOCIAL_POSTS.length} social posts.`,
  );
}
