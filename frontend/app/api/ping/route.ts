process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import { Client } from "pg";
...

import { Client } from "pg";

export async function GET() {
  const client = new Client({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
  });
  try {
    await client.connect();
    const result = await client.query('SELECT NOW();');
    await client.end();
    return new Response(
      JSON.stringify({ connected: true, time: result.rows[0].now }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ connected: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
