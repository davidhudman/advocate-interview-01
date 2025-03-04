import express from 'express';
import knex from 'knex';
import knexConfig from '../../knexfile';

const router = express.Router();

router.get('/db-info', async (req, res) => {
  try {
    const env = req.query.env as string;

    // If no specific environment is requested, show both databases
    if (!env) {
      const environments = ['prod', 'test'];
      const result: any = {};

      for (const environment of environments) {
        const connection = knex(knexConfig[environment]);

        try {
          const tables = await connection.raw("SELECT name FROM sqlite_master WHERE type='table'");
          const tableNames = tables
            .map((t: any) => t.name)
            .filter((name: string) => name !== 'sqlite_sequence');

          result[environment] = {
            filename:
              typeof knexConfig[environment].connection === 'object'
                ? (knexConfig[environment].connection as any).filename
                : String(knexConfig[environment].connection),
            tables: {},
          };

          for (const tableName of tableNames) {
            const schema = await connection.raw(`PRAGMA table_info(${tableName})`);
            const records = await connection(tableName).select('*');

            result[environment].tables[tableName] = {
              schema,
              recordCount: records.length,
              records,
            };
          }
        } finally {
          // Always close connections to non-current environments
          if (environment !== (process.env.NODE_ENV || 'prod')) {
            await connection.destroy();
          }
        }
      }

      return res.json(result);
    }

    // Single environment case (existing code)
    const connection = knex(knexConfig[env]);
    console.log(`Fetching database info for environment: ${env}`);

    const tables = await connection.raw("SELECT name FROM sqlite_master WHERE type='table'");
    const tableNames = tables
      .map((t: any) => t.name)
      .filter((name: string) => name !== 'sqlite_sequence');

    const dbInfo: any = {
      environment: env,
      filename:
        typeof knexConfig[env].connection === 'object'
          ? (knexConfig[env].connection as any).filename
          : String(knexConfig[env].connection),
      tables: {},
    };

    for (const tableName of tableNames) {
      const schema = await connection.raw(`PRAGMA table_info(${tableName})`);
      const records = await connection(tableName).select('*');

      dbInfo.tables[tableName] = {
        schema,
        recordCount: records.length,
        records,
      };
    }

    // Close the connection if it's not the default one
    if (env !== (process.env.NODE_ENV || 'prod')) {
      await connection.destroy();
    }

    res.json(dbInfo);
  } catch (error) {
    console.error('Error fetching database info:', error);
    res.status(500).json({ error: String(error) });
  }
});

export default router;
