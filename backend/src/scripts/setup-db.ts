import db from '../db';

async function setupDatabase() {
  console.log('Setting up database...');

  try {
    // Run migrations
    await db.migrate.latest();
    console.log('Migrations completed successfully');

    // Check if users table exists
    const hasUsers = await db.schema.hasTable('users');
    console.log(`Users table exists: ${hasUsers}`);

    if (hasUsers) {
      // Show table structure
      const tableInfo = await db.raw('PRAGMA table_info(users)');
      console.log('Users table structure:');
      console.table(tableInfo);
    }

    console.log('Database setup complete');
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    await db.destroy();
  }
}

setupDatabase();
