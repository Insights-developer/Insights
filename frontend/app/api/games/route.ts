import { Client } from "pg";
import { createClient } from '@/utils/supabase/server';
import { getUserFeatures } from '@/utils/rbac';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// Read (GET) all games
export async function GET(req: Request) {
  const supabase = createClient();
  // 1. Get auth
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  // 2. RBAC: Must have games_page feature
  const features = await getUserFeatures(user.id);
  if (!features.includes("games_page")) {
    return new Response(
      JSON.stringify({ error: "Forbidden" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  // 3. Proceed if allowed
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

// Create a new game (POST)
export async function POST(req: Request) {
  const supabase = createClient();
  
  // 1. Get auth
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  // 2. RBAC: Must have admin_dashboard feature
  const features = await getUserFeatures(user.id);
  if (!features.includes("admin_dashboard")) {
    return new Response(
      JSON.stringify({ error: "Forbidden" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }
  
  try {
    // Parse request body
    const { name, config } = await req.json();
    
    // Validate required fields
    if (!name) {
      return new Response(
        JSON.stringify({ error: "Game name is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    const client = new Client({
      connectionString: process.env.POSTGRES_URL,
      ssl: { rejectUnauthorized: false }
    });
    
    await client.connect();
    const result = await client.query(
      'INSERT INTO games (name, config) VALUES ($1, $2) RETURNING id',
      [name, config || {}]
    );
    await client.end();
    
    return new Response(
      JSON.stringify({ success: true, game_id: result.rows[0].id }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
