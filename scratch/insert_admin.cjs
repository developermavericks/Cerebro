const { Client } = require('../server/node_modules/pg');

const client = new Client({
  host: '34.14.165.206',
  user: 'postgres',
  password: 'Developer@mavs321',
  database: 'cerebro',
  port: 5432
});

async function main() {
  try {
    await client.connect();
    console.log('Connected to Cloud SQL database!');
    
    const insertQuery = `
      INSERT INTO users (name, email, password)
      VALUES ('Admin User', 'admin@themavericksindia.com', 'password123')
      ON CONFLICT (email) DO NOTHING
      RETURNING id, name, email;
    `;
    const res = await client.query(insertQuery);
    if (res.rows.length > 0) {
      console.log('Inserted admin user:', res.rows[0]);
    } else {
      console.log('Admin user already exists or could not be inserted.');
    }
  } catch (err) {
    console.error('Error inserting admin user:', err.message);
  } finally {
    await client.end();
  }
}

main();
