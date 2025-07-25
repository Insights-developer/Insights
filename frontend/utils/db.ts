// Direct database connection utility
// File: /utils/db.ts

import { Pool } from 'pg';

// Configure PostgreSQL connection pool
export const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: true, // Always use SSL with Supabase
  // Use connection options to force IPv4
  connectionTimeoutMillis: 15000, // Extended timeout
  options: '-c statement_timeout=15000',
  max: 10, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000 // How long a client is allowed to remain idle before being closed
});

/**
 * Execute a database query with proper error handling
 * @param text SQL query text with parameterized values
 * @param params Query parameters
 * @returns Query result
 */
export async function query(text: string, params?: any[]) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error', { text, error });
    throw error;
  }
}

/**
 * Execute a transaction with multiple operations
 * @param callback Function containing transaction operations
 * @returns Transaction result
 */
export async function transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Transaction error', error);
    throw error;
  } finally {
    client.release();
  }
}
