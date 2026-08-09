import request from 'supertest';
import app from '../../src/app.js';
import Complaint from '../../src/models/Complaint.js';
import '../setup.js';

describe('Analytics API', () => {
  beforeEach(async () => {
    await Complaint.insertMany([
      { rawText: '1', location: { area: 'A1' }, category: 'Roads', severity: 'High', status: 'Submitted' },
      { rawText: '2', location: { area: 'A1' }, category: 'Water', severity: 'Medium', status: 'Resolved' },
      { rawText: '3', location: { area: 'A2' }, category: 'Roads', severity: 'High', status: 'In Progress' }
    ]);
  });

  it('GET /api/analytics - should return correct stats', async () => {
    const res = await request(app).get('/api/analytics');
    expect(res.statusCode).toEqual(200);
    expect(res.body.total).toBe(3);
    expect(res.body.resolved).toBe(1);
    expect(res.body.open).toBe(2);
    expect(res.body.byCategory.length).toBe(2);
  });

  it('GET /api/analytics/area - should return hotspots', async () => {
    const res = await request(app).get('/api/analytics/area');
    expect(res.statusCode).toEqual(200);
    expect(res.body.hotspots.length).toBe(2);
    const a1 = res.body.hotspots.find(h => h._id === 'A1');
    expect(a1.count).toBe(2);
    expect(a1.open).toBe(1);
  });
});
