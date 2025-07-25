// Database connection test  
require('dotenv').config();
const { Pool } = require('pg');

// Create pool with same config as the app
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
});

async function testDatabaseConnection() {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    const result = await pool.query('SELECT NOW() as current_time');
    console.log('✅ Database connected successfully!');
    console.log('Current time from DB:', result.rows[0].current_time);
    
    // Test if users table exists
    const tableCheck = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'verification_tokens')
    `);
    
    console.log('✅ Tables found:', tableCheck.rows.map(row => row.table_name));
    
    // Test users table structure
    const userColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    
    console.log('✅ Users table structure:');
    userColumns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(required)'}`);
    });
    
    // Test verification_tokens table structure
    const verificationColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'verification_tokens' 
      ORDER BY ordinal_position
    `);
    
    console.log('✅ Verification_tokens table structure:');
    verificationColumns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(required)'}`);
    });
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
  } finally {
    await pool.end();
  }
}

testDatabaseConnection();
