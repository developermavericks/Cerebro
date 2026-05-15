const { Client } = require('pg');

const client = new Client({
  user: 'cerebro_admin',
  password: 'password',
  host: '127.0.0.1',
  port: 6543,
  database: 'cerebro_db',
});

client.connect()
  .then(() => {
    console.log('Connected successfully');
    return client.query('SELECT NOW()');
  })
  .then(res => {
    console.log('Query result:', res.rows[0]);
    process.exit(0);
  })
  .catch(err => {
    console.error('Connection error', err.stack);
    process.exit(1);
  });
