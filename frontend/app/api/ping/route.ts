import { Client } from "pg";

export async function GET() {
  const connectionString = process.env.POSTGRES_URL;
  const client = new Client({ connectionString });
  try {
    await client.connect();
    const result = await client.query('SELECT NOW();');
    await client.end();
    return new Response(
      JSON.stringify({ connected: true, time: result.rows[0].now, used: connectionString }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ connected: false, error: error.message, used: connectionString }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
