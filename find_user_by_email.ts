const pool = require("./app/src/lib/db.ts");

async function findUserByEmail(email) {
  try {
    const res = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (res.rows.length === 0) {
      console.log('User not found.');
    } else {
      console.log('User record:', res.rows[0]);
    }
  } catch (err) {
    console.error('Error querying user:', err);
  } finally {
    await pool.end();
  }
}

findUserByEmail('developer@lotteryanalytics.app');
