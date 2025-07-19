import { Client } from "pg";
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// Read (GET) all games
export async function GET() {
  const client = new Client({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
  });
  try {
    await client.connect();
    const result = await client.query('SELECT * FROM games ORDER BY created_at DESC;');
    await client.end();
    return new Response(
      JSON.stringify({ games: result.rows }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// Placeholder for game creation (POST)
export async function POST() {
  return new Response(
    JSON.stringify({ error: "POST (game creation) not implemented yet." }),
    { status: 501, headers: { "Content-Type": "application/json" } }
  );
}
