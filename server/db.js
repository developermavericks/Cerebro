const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const poolConfig = {
  user: process.env.DB_USER || 'cerebro_admin',
  password: process.env.DB_PASSWORD || '',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'cerebro_db',
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 60000,
  max: 10,
};

if (process.env.DB_PORT) {
  poolConfig.port = parseInt(process.env.DB_PORT, 10);
}

const pool = new Pool(poolConfig);

let isDbDown = false;

pool.on('error', (err) => {
  if (!isDbDown) {
    console.warn('[DB] PostgreSQL unreachable, activating in-memory dev mode fallback:', err.message);
    isDbDown = true;
  }
});

// In-memory fallback database for dev mode when PostgreSQL container is offline
const inMemoryStore = {
  users: new Map(),
  companies: [],
  articles: [],
  licenseKeys: new Set(['MAV-DEMO-KEY']),
  adminKey: 'admin123'
};

async function queryWithFallback(text, params = []) {
  try {
    const result = await pool.query(text, params);
    isDbDown = false;
    return result;
  } catch (err) {
    // Catch connection errors (ECONNREFUSED, ETIMEDOUT, etc.)
    if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT' || err.code === 'ENOTFOUND' || err.message?.includes('connect')) {
      if (!isDbDown) {
        console.warn('[DB Fallback] PostgreSQL offline (ECONNREFUSED). Serving request via in-memory Dev Store.');
        isDbDown = true;
      }
      return handleInMemoryQuery(text, params);
    }
    throw err;
  }
}

function handleInMemoryQuery(text, params) {
  const sql = text.trim().toLowerCase();

  // 1. System Settings / Admin Key
  if (sql.includes('system_settings')) {
    return { rows: [{ key: 'admin_key', value: inMemoryStore.adminKey }] };
  }

  // 2. Users SELECT
  if (sql.includes('select') && sql.includes('from users')) {
    const email = params[0]?.toLowerCase();
    if (email && inMemoryStore.users.has(email)) {
      return { rows: [inMemoryStore.users.get(email)] };
    }
    // Auto-create/accept user in dev fallback mode if email provided
    if (email) {
      const mockUser = {
        id: Math.floor(Math.random() * 9000) + 1000,
        name: email.split('@')[0],
        email: email,
        password: params[1] || 'password'
      };
      inMemoryStore.users.set(email, mockUser);
      return { rows: [mockUser] };
    }
    return { rows: Array.from(inMemoryStore.users.values()) };
  }

  // 3. Users INSERT
  if (sql.includes('insert into users')) {
    const newUser = {
      id: Math.floor(Math.random() * 9000) + 1000,
      name: params[0] || 'User',
      email: params[1]?.toLowerCase(),
      password: params[2] || 'password',
      phone: params[3] || null
    };
    inMemoryStore.users.set(newUser.email, newUser);
    return { rows: [newUser] };
  }

  // 4. License Keys
  if (sql.includes('license_keys')) {
    return {
      rows: Array.from(inMemoryStore.licenseKeys).map(k => ({
        key: k,
        is_used: false,
        is_revoked: false
      }))
    };
  }

  // 5. Companies / Brands
  if (sql.includes('from companies')) {
    return { rows: inMemoryStore.companies };
  }

  if (sql.includes('insert into companies')) {
    const newComp = {
      id: inMemoryStore.companies.length + 1,
      name: params[1],
      region: params[2] || 'Global',
      last_status: 'Active',
      mentions: 0,
      new_mentions: 0
    };
    inMemoryStore.companies.push(newComp);
    return { rows: [newComp] };
  }

  // 6. Generic Fallback
  return { rows: [], rowCount: 0 };
}

module.exports = {
  query: queryWithFallback,
};

