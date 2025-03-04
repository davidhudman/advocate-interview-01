import type { Knex } from 'knex';

const config: { [key: string]: Knex.Config } = {
  prod: {
    client: 'sqlite3',
    connection: {
      filename: './prod.sqlite3',
    },
    useNullAsDefault: true,
    migrations: {
      directory: './migrations',
    },
  },
  test: {
    client: 'sqlite3',
    connection: {
      filename: './test.sqlite3',
    },
    useNullAsDefault: true,
    migrations: {
      directory: './migrations',
    },
  },
};

export default config;
