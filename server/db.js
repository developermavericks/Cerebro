const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const poolConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || '',
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
  connectionTimeoutMillis: 15000,
  idleTimeoutMillis: 60000,
  max: 10,
};

if (process.env.DB_PORT) {
  poolConfig.port = parseInt(process.env.DB_PORT, 10);
}

const pool = new Pool(poolConfig);

// Prevent unhandled error events from crashing the Node process if the database is unreachable
pool.on('error', (err) => {
  console.error('Unexpected error on idle database client:', err.message || err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
