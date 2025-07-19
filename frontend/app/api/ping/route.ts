import { sql } from '@vercel/postgres';

export async function GET() { 
  try {
    const result = await sql`SELECT NOW() as time;`;
    return new Response(
      JSON.stringify({ connected: true, time: result.rows[0].time }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ connected: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
