// db-test.js

const { Client } = require('pg');

const connectionString = 'postgres://postgres.sjluumboshqxhmnroqxg:GBxSzM6RIcnEouU9@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true';

const client = new Client({ connectionString });

client.connect()
  .then(() => client.query('SELECT NOW();'))
  .then(res => {
    console.log('SUCCESS:', res.rows[0]);
    return client.end();
  })
  .catch(err => {
    console.error('FAIL:', err.message);
    process.exit(1);
  });
