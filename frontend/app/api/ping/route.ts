import { NextRequest } from "next/server";

// Import pg
const { Client } = require("pg");

// WARNING: For debugging only. Never hardcode secrets long-term.
const connectionString = 'postgres://postgres.sjluumboshqxhmnroqxg:GBxSzM6RIcnEouU9@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true';

export async function GET(req: NextRequest) {
  const client = new Client({ connectionString });
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
