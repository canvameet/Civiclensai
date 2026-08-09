import { jest } from '@jest/globals';
import '../setup.js';

jest.unstable_mockModule('../../src/services/xScraper.js', () => ({
  runXScraper: jest.fn().mockResolvedValue()
}));

jest.unstable_mockModule('../../src/services/aiService.js', () => ({
  classifyComplaint: jest.fn().mockResolvedValue({
    category: 'Water',
    severity: 'Medium',
    department: 'Water Dept',
    summary: 'Water issue'
  }),
  classifySocialPost: jest.fn()
}));

const request = (await import('supertest')).default;
const app = (await import('../../src/app.js')).default;
const SocialPost = (await import('../../src/models/SocialPost.js')).default;

describe('Social API', () => {
  it('GET /api/social/feed - should return social posts', async () => {
    await SocialPost.create({
      platform: 'twitter',
      postId: '123',
      text: 'No water',
      isCivicIssue: true
    });

    const res = await request(app).get('/api/social/feed');
    expect(res.statusCode).toEqual(200);
    expect(res.body.posts.length).toBe(1);
  });

  it('POST /api/social/scrape - should trigger scraping', async () => {
    const res = await request(app).post('/api/social/scrape');
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
  });

  it('POST /api/social/:postId/convert - should convert post to complaint', async () => {
    const post = await SocialPost.create({
      platform: 'twitter',
      postId: 'convert_me',
      text: 'Broken road',
      area: 'Bopal',
      isCivicIssue: true
    });

    const res = await request(app).post(`/api/social/${post.postId}/convert`);
    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.complaint.source).toBe('twitter');

    const updatedPost = await SocialPost.findById(post._id);
    expect(updatedPost.convertedToComplaint).toBe(true);
  });
});
