import request from 'supertest';
import app from '../src/app';
import db from '../src/db';
import { v4 as uuidv4 } from 'uuid';
import { testSettings } from './testSettings';

const timestamp = Date.now();

describe('User Endpoints', () => {
  beforeAll(async () => {
    // Set NODE_ENV to test explicitly to ensure we use the test database
    // process.env.NODE_ENV = 'test';

    // Make sure migrations are up to date
    if (!testSettings.persistTestData) {
      await db.migrate.rollback();
      await db.migrate.latest();
    }
  });

  afterEach(async () => {
    // Clean up users table after each test, but only if persistTestData is false
    if (!testSettings.persistTestData) {
      // Uncomment the line below to enable cleanup
      await db('users').where('email', 'like', `%${timestamp}%`).delete();
    }
  });

  afterAll(async () => {
    // Close the database connection
    await db.destroy();
  });

  describe('POST /users', () => {
    it('should create a new user with valid data', async () => {
      // unique timestamp for email
      const userData = {
        name: 'Jane Doe',
        email: `jane-${timestamp}@example.com`,
        phone: '123-456-7890',
      };

      const response = await request(app).post('/users').send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(userData.name);
      expect(response.body.email).toBe(userData.email);
      expect(response.body.phone).toBe(userData.phone);
      expect(response.body.sync_status).toBe('pending');
      expect(response.body.crm_id).toBeNull();

      // Verify user was actually stored in the database
      const storedUser = await db('users').where({ id: response.body.id }).first();
      expect(storedUser).toBeTruthy();
      expect(storedUser.name).toBe(userData.name);
    });

    it('should return 400 when required fields are missing', async () => {
      const incompleteData = {
        name: 'Jane Doe',
        // email is missing
        phone: '123-456-7890',
      };

      const response = await request(app).post('/users').send(incompleteData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('"email" is required');
    });

    it('should return 400 when email format is invalid', async () => {
      const invalidEmailData = {
        name: 'Jane Doe',
        email: 'not-an-email',
        phone: '123-456-7890',
      };

      const response = await request(app).post('/users').send(invalidEmailData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('"email" must be a valid email');
    });
  });

  describe('GET /users/:id', () => {
    it('should return a user when given a valid ID', async () => {
      // First, create a user
      const userId = uuidv4();
      await db('users').insert({
        id: userId,
        name: 'Test User',
        email: `test-${timestamp}@example.com`,
        phone: '987-654-3210',
        sync_status: 'pending',
        crm_id: null,
      });

      // Now try to get the user
      const response = await request(app).get(`/users/${userId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', userId);
      expect(response.body.name).toBe('Test User');
      expect(response.body.email).toBe(`test-${timestamp}@example.com`);
    });

    it('should return 404 when user does not exist', async () => {
      const nonExistentId = uuidv4();
      const response = await request(app).get(`/users/${nonExistentId}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('not found');
    });
  });
});
