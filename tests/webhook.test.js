const request = require('supertest');
const express = require('express');
jest.mock('../services/mondayClient'); // Mock sendToMonday
const { sendToMonday } = require('../services/mondayClient');

const app = express();
app.use(express.json());
app.post('/hubspot-webhook', (req, res, next) => {
  req.token = 'dummy'; // Mock auth token
  next();
}, require('../index').handler); // Your webhook function

describe('Webhook Handler', () => {
  beforeEach(() => {
    sendToMonday.mockClear();
  });

  it('parses and maps webhook payload correctly', async () => {
    const payload = {
      eventId: '123456',
      eventType: 'deal.propertyChange',
      propertyName: 'dealstage',
      objectId: '56789',
      objectType: 'DEAL',
      propertyValue: 'closedwon',
      dealName: 'Acme Corp Implementation',
      dealAmount: '25000',
      contactEmail: 'john.doe@acme.com'
    };

    sendToMonday.mockResolvedValue({ data: { create_item: { id: '9999' } } });

    const res = await request(app)
      .post('/hubspot-webhook')
      .send(payload)
      .set('Authorization', 'Bearer dummy');

    expect(res.statusCode).toBe(200);
    expect(sendToMonday).toHaveBeenCalledWith({
      dealName: 'Acme Corp Implementation',
      dealStage: 'closedwon',
      dealAmount: '25000',
      contactEmail: 'john.doe@acme.com',
      token: 'dummy'
    });
  });
});







