import db from '../src/db';
import { Knex } from 'knex';
import { testSettings } from './testSettings';

let knex: Knex;

beforeAll(async () => {
  // Set NODE_ENV to test explicitly to ensure we use the test config
  // process.env.NODE_ENV = 'test';
  knex = db;

  // Log more information about migrations
  console.log('Running migrations...');
  try {
    // Make sure to rollback first to clear any existing data
    // Only do this if persistTestData is false
    if (!testSettings.persistTestData) {
      await knex.migrate.rollback();
      await knex.migrate.latest();
    }
    console.log('Migrations completed successfully');

    // Verify the table exists
    const hasUsers = await knex.schema.hasTable('users');
    console.log(`Users table exists: ${hasUsers}`);
  } catch (migrationError) {
    console.error('Migration error:', migrationError);
    throw migrationError;
  }
});

afterAll(async () => {
  try {
    // Only rollback if persistTestData is false
    if (!testSettings.persistTestData) {
      await knex.migrate.rollback(); // Keep this commented to preserve data
    }
    await knex.destroy(); // This should remain uncommented to close connections
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
});

async function inspectDatabase() {
  console.log('===== DATABASE INSPECTION =====');

  // Check if users table exists
  const hasUsers = await knex.schema.hasTable('users');
  console.log(`Users table exists: ${hasUsers}`);

  if (hasUsers) {
    // Count users
    const count = await knex('users').count('* as count').first();
    console.log(`User count: ${count?.count || 0}`);

    // List all users
    const users = await knex('users').select('*');
    console.log('Users in database:');
    console.table(users);
  }

  console.log('==============================');
}

describe('Database Initialization', () => {
  it('should have a users table', async () => {
    const exists = await knex.schema.hasTable('users');
    console.log(`Test - Users table exists: ${exists}`);
    expect(exists).toBe(true);
  });

  it('should accept only valid enum values for sync_status', async () => {
    const validStatuses = ['pending', 'synced', 'failed'];

    // Add timestamp to make emails unique
    const timestamp = Date.now();

    for (const status of validStatuses) {
      try {
        console.log(`Inserting user with status: ${status}`);
        const result = await knex('users').insert(
          {
            id: `uuid-${status}-${timestamp}`,
            name: 'Test User',
            email: `test-${status}-${timestamp}@example.com`,
            phone: '1234567890',
            sync_status: status,
          },
          ['sync_status'],
        );

        console.log(`Insert result:`, result);
        const insertedUser = result[0];
        expect(insertedUser.sync_status).toBe(status);
      } catch (error) {
        console.error(`Error inserting user with status ${status}:`, error);
        let errorMessage = 'Unknown error';
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        expect(`Failed to insert user with status ${status}: ${errorMessage}`).toBeFalsy();
      }
    }
  });

  it('should allow crm_id to be nullable', async () => {
    try {
      const timestamp = Date.now();
      console.log('Inserting user with nullable crm_id');
      const result = await knex('users').insert(
        {
          id: `uuid-nullable-crm-${timestamp}`,
          name: 'Test User',
          email: `test-nullable-${timestamp}@example.com`,
          phone: '1234567890',
          sync_status: 'pending',
        },
        ['crm_id'],
      );

      console.log(`Insert result for nullable crm_id:`, result);
      const insertedUser = result[0];
      expect(insertedUser.crm_id).toBeNull();
    } catch (error) {
      console.error('Error inserting user with nullable crm_id:', error);
      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      expect(`Failed to insert user with nullable crm_id: ${errorMessage}`).toBeFalsy();
    }
  });
});
