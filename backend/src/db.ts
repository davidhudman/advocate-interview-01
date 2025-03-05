import knex from 'knex';
import knexConfig from '../knexfile';

const environment = process.env.NODE_ENV || 'test';
const config = knexConfig[environment];

if (!config) {
  throw new Error(`Knex configuration for environment "${environment}" is not defined.`);
}

const db = knex(config);

export default db;
