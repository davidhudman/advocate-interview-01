import request from 'supertest';
import app from '../src/app';

describe('Health Endpoint', () => {
  it('/health should return status OK with 200 status code', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'OK' });
  });
});
