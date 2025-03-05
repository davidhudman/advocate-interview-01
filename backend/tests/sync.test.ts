import request from 'supertest';
import app from '../src/app';
import db from '../src/db';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { syncPendingUsers } from '../src/controllers/sync';
import { testSettings } from './testSettings';

// Create a timestamp to ensure unique emails across test runs
const timestamp = Date.now();

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Sync Functionality', () => {
  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
  });

  afterEach(async () => {
    // Clean up users added during tests, but only if persistTestData is false
    if (!testSettings.persistTestData) {
      await db('users').where('email', 'like', `%@synctest.com`).delete();
    }
    // Clear all mocks
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await db.destroy();
  });

  it('should sync a pending user successfully', async () => {
    // Create a pending user
    const userId = uuidv4();
    await db('users').insert({
      id: userId,
      name: 'Sync Test User',
      email: `success-${timestamp}@synctest.com`,
      phone: '111-222-3333',
      sync_status: 'pending',
      crm_id: null,
    });

    // Mock the CRM token endpoint
    mockedAxios.post.mockImplementation((url) => {
      if (url.includes('/crm/token')) {
        return Promise.resolve({
          data: { access_token: 'mock_token', expires_in: 3600 },
        });
      } else if (url.includes('/crm/users')) {
        return Promise.resolve({
          data: { crm_id: 'CRM123' },
        });
      }
      return Promise.reject(new Error('Unexpected URL'));
    });

    // Trigger sync
    const response = await request(app).post('/sync');

    // Verify response
    expect(response.status).toBe(200);
    expect(response.body.synced).toBeGreaterThan(0);
    expect(response.body.failed).toBe(0);

    // Verify user was updated in DB
    const updatedUser = await db('users').where({ id: userId }).first();
    expect(updatedUser.sync_status).toBe('synced');
    expect(updatedUser.crm_id).toBe('CRM123');
  });

  it('should mark user as failed if CRM API fails', async () => {
    // Create a pending user
    const userId = uuidv4();
    await db('users').insert({
      id: userId,
      name: 'Sync Test User',
      email: `fail-${timestamp}@synctest.com`,
      phone: '111-222-4444',
      sync_status: 'pending',
      crm_id: null,
    });

    // Mock the CRM token endpoint success but users endpoint failure
    mockedAxios.post.mockImplementation((url) => {
      if (url.includes('/crm/token')) {
        return Promise.resolve({
          data: { access_token: 'mock_token', expires_in: 3600 },
        });
      } else if (url.includes('/crm/users')) {
        return Promise.reject(new Error('CRM API error'));
      }
      return Promise.reject(new Error('Unexpected URL'));
    });

    // Trigger sync
    const response = await request(app).post('/sync');

    // Verify response
    expect(response.status).toBe(200);
    expect(response.body.failed).toBeGreaterThan(0);

    // Verify user was updated in DB
    const updatedUser = await db('users').where({ id: userId }).first();
    expect(updatedUser.sync_status).toBe('failed');
    expect(updatedUser.crm_id).toBeNull();
  });

  it('should not proceed if OAuth token request fails', async () => {
    // Create a pending user
    const userId = uuidv4();
    await db('users').insert({
      id: userId,
      name: 'Sync Test User',
      email: `oauth-${timestamp}@synctest.com`,
      phone: '111-222-5555',
      sync_status: 'pending',
      crm_id: null,
    });

    // Mock the CRM token endpoint failure
    mockedAxios.post.mockImplementation((url) => {
      if (url.includes('/crm/token')) {
        return Promise.reject(new Error('Authentication failed'));
      }
      return Promise.reject(new Error('Unexpected URL'));
    });

    // Trigger sync
    const response = await request(app).post('/sync');

    // Verify response
    expect(response.status).toBe(200);
    expect(response.body.synced).toBe(0);
    expect(response.body.failed).toBe(0);

    // Verify user was not updated in DB
    const updatedUser = await db('users').where({ id: userId }).first();
    expect(updatedUser.sync_status).toBe('pending');
    expect(updatedUser.crm_id).toBeNull();
  });
});
