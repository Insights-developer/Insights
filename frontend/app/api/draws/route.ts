import { Client } from "pg";
import { createClient } from '@/utils/supabase/server';
import { getUserFeatures } from '@/utils/rbac';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// Read (GET) all draws
export async function GET() {
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

// Create a new draw (POST)
export async function POST(req: Request) {
  const supabase = createClient();
  
  // Authenticate
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }
  
  // RBAC: Must have admin permissions or equivalent
  const features = await getUserFeatures(user.id);
  if (!features.includes("admin_dashboard")) {
    return new Response(
      JSON.stringify({ error: "Forbidden" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }
  
  try {
    // Parse the request body
    const { game_id, draw_date, results, bonus } = await req.json();
    
    // Validate required fields
    if (!game_id || !draw_date || !results || !Array.isArray(results)) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    const client = new Client({
      connectionString: process.env.POSTGRES_URL,
      ssl: { rejectUnauthorized: false }
    });
    
    await client.connect();
    const result = await client.query(
      'INSERT INTO draws (game_id, draw_date, results, bonus, uploaded_by) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [game_id, draw_date, results, bonus || null, user.id]
    );
    await client.end();
    
    return new Response(
      JSON.stringify({ success: true, draw_id: result.rows[0].id }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
