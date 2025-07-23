import { Client } from "pg";
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// Read (GET) all groups
export async function GET() {
  const client = new Client({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
  });
  try {
    await client.connect();
    const result = await client.query('SELECT id, name FROM groups ORDER BY name;');
    await client.end();
    return new Response(
      JSON.stringify({ groups: result.rows }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// Placeholder for group creation (POST)
export async function POST() {
  return new Response(
    JSON.stringify({ error: "POST (group creation) not implemented yet." }),
    { status: 501, headers: { "Content-Type": "application/json" } }
  );
}
