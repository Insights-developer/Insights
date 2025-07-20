import { Client } from "pg";
import { createClient } from '@/utils/supabase/server';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// Get the current user's notifications
export async function GET(req: Request) {
  const supabase = createClient();

  // 1. Require user
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  // 2. Query only this user's notifications
  const client = new Client({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
  });
  try {
    await client.connect();
    const result = await client.query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC;',
      [user.id]
    );
    await client.end();
    return new Response(
      JSON.stringify({ notifications: result.rows }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// POST: Placeholder (implement creation logic as needed, typically as a server-side event)
export async function POST() {
  return new Response(
    JSON.stringify({ error: "POST (notification creation) not implemented yet." }),
    { status: 501, headers: { "Content-Type": "application/json" } }
  );
}
