import request from 'supertest';
import app from '../src/app';
import { testSettings } from './testSettings';

describe('CRM API Endpoints', () => {
  // Test token generation
  describe('POST /crm/token', () => {
    it('should return a valid access token with correct credentials', async () => {
      const response = await request(app)
        .post('/crm/token')
        .send({ client_id: 'dummy', client_secret: 'dummy' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('access_token', 'mock_token');
      expect(response.body).toHaveProperty('expires_in', 3600);
    });

    it('should return 401 with incorrect credentials', async () => {
      const response = await request(app)
        .post('/crm/token')
        .send({ client_id: 'wrong', client_secret: 'wrong' });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  // Test user creation
  describe('POST /crm/users', () => {
    it('should create a user and return a crm_id with valid token', async () => {
      const userData = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '123-456-7890',
      };

      const response = await request(app)
        .post('/crm/users')
        .set('Authorization', 'Bearer mock_token')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('crm_id');
      expect(response.body.crm_id).toMatch(/^CRM\d+$/);
    });

    it('should return 401 without a token', async () => {
      const userData = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '123-456-7890',
      };

      const response = await request(app).post('/crm/users').send(userData);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 with an invalid token', async () => {
      const userData = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '123-456-7890',
      };

      const response = await request(app)
        .post('/crm/users')
        .set('Authorization', 'Bearer invalid_token')
        .send(userData);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  // Test getting user by ID
  describe('GET /crm/users/:crmId', () => {
    let crmId: string;

    // First create a user to get a valid CRM ID
    beforeAll(async () => {
      const createResponse = await request(app)
        .post('/crm/users')
        .set('Authorization', 'Bearer mock_token')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          phone: '555-123-4567',
        });

      crmId = createResponse.body.crm_id;
    });

    it('should retrieve user details with a valid token and ID', async () => {
      const response = await request(app)
        .get(`/crm/users/${crmId}`)
        .set('Authorization', 'Bearer mock_token');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('crm_id', crmId);
      expect(response.body).toHaveProperty('name', 'Test User');
      expect(response.body).toHaveProperty('email', 'test@example.com');
      expect(response.body).toHaveProperty('phone', '555-123-4567');
    });

    it('should return 401 without a token', async () => {
      const response = await request(app).get(`/crm/users/${crmId}`);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 404 for a non-existent ID', async () => {
      const response = await request(app)
        .get('/crm/users/nonexistent')
        .set('Authorization', 'Bearer mock_token');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'User not found');
    });
  });
});
