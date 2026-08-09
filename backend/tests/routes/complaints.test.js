import { jest } from '@jest/globals';
import '../setup.js';

jest.unstable_mockModule('../../src/services/aiService.js', () => ({
  classifyComplaint: jest.fn().mockResolvedValue({
    category: 'Roads',
    severity: 'High',
    severityReason: 'Test reason',
    department: 'Test Dept',
    routingExplanation: 'Test explanation',
    summary: 'Test summary',
    duplicateIndex: -1,
    similarityReason: ''
  }),
  classifySocialPost: jest.fn()
}));

const request = (await import('supertest')).default;
const app = (await import('../../src/app.js')).default;
const Complaint = (await import('../../src/models/Complaint.js')).default;

describe('Complaints API', () => {
  it('POST /api/complaints - should create a complaint', async () => {
    const res = await request(app)
      .post('/api/complaints')
      .send({ rawText: 'Pothole here', area: 'Bopal' });
      
    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.complaint.category).toBe('Roads');
    expect(res.body.complaint.location.area).toBe('Bopal');
  });

  it('GET /api/complaints - should return complaints', async () => {
    await Complaint.create({
      rawText: 'Test text',
      location: { area: 'Bopal' },
      category: 'Water',
      severity: 'High',
      status: 'Submitted',
      statusHistory: [{ status: 'Submitted' }]
    });

    const res = await request(app).get('/api/complaints');
    expect(res.statusCode).toEqual(200);
    expect(res.body.complaints.length).toBe(1);
    expect(res.body.complaints[0].category).toBe('Water');
  });

  it('PATCH /api/complaints/:id/status - should update status', async () => {
    const complaint = await Complaint.create({
      rawText: 'Test text',
      location: { area: 'Bopal' },
      status: 'Submitted',
      statusHistory: [{ status: 'Submitted' }]
    });

    const res = await request(app)
      .patch(`/api/complaints/${complaint._id}/status`)
      .send({ status: 'Verified' });
      
    expect(res.statusCode).toEqual(200);
    expect(res.body.complaint.status).toBe('Verified');
    expect(res.body.complaint.statusHistory.length).toBe(2);
  });
});
