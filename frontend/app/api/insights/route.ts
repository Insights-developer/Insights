import { Client } from "pg";
import { createClient } from '@/utils/supabase/server';
import { getUserFeatures } from '@/utils/rbac';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// Read (GET) all draws (insights)
export async function GET(req: Request) {
  const supabase = createClient();

  // 1. Require auth
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  // 2. RBAC check: must have 'insights_page' permission
  const features = await getUserFeatures(user.id);
  if (!features.includes("insights_page")) {
    return new Response(
      JSON.stringify({ error: "Forbidden" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  // 3. Serve insights (draws)
  const client = new Client({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
  });
  try {
    await client.connect();
    const result = await client.query('SELECT * FROM draws ORDER BY draw_date DESC;');
    await client.end();
    return new Response(
      JSON.stringify({ draws: result.rows }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// Placeholder for draw creation (POST)
export async function POST() {
  return new Response(
    JSON.stringify({ error: "POST (draw creation) not implemented yet." }),
    { status: 501, headers: { "Content-Type": "application/json" } }
  );
}
