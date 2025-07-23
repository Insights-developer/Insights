import { Client } from "pg";
import { createClient } from '@/utils/supabase/server';
import { getUserFeatures } from '@/utils/rbac';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// Read (GET) all groups
export async function GET() {
  const client = new Client({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
  });
  try {
    await client.connect();
    const result = await client.query('SELECT id, name FROM access_groups ORDER BY name;');
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

// Create a new access group (POST)
export async function POST(req: Request) {
  // Use supabase client for authentication and RBAC
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
  
  // RBAC: Must have admin_dashboard feature
  const features = await getUserFeatures(user.id);
  if (!features.includes("admin_dashboard")) {
    return new Response(
      JSON.stringify({ error: "Forbidden" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }
  
  try {
    // Parse the request body
    const { name, description } = await req.json();
    
    // Validate required fields
    if (!name) {
      return new Response(
        JSON.stringify({ error: "Group name is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    const client = new Client({
      connectionString: process.env.POSTGRES_URL,
      ssl: { rejectUnauthorized: false }
    });
    
    await client.connect();
    const result = await client.query(
      'INSERT INTO access_groups (name, description) VALUES ($1, $2) RETURNING id',
      [name, description || null]
    );
    await client.end();
    
    return new Response(
      JSON.stringify({ success: true, group_id: result.rows[0].id }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
