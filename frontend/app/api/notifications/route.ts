import { Client } from "pg";
import { createClient } from '@/utils/supabase/server';
import { getUserFeatures } from '@/utils/rbac';
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

// POST: Create a new notification
export async function POST(req: Request) {
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

  // 2. RBAC: Admin only for creating notifications
  const features = await getUserFeatures(user.id);
  if (!features.includes("admin_dashboard")) {
    return new Response(
      JSON.stringify({ error: "Forbidden" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }
  
  try {
    // Parse request body
    const { user_id, notif_type, data } = await req.json();
    
    // Validate required fields
    if (!user_id || !notif_type) {
      return new Response(
        JSON.stringify({ error: "User ID and notification type are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    const client = new Client({
      connectionString: process.env.POSTGRES_URL,
      ssl: { rejectUnauthorized: false }
    });
    
    await client.connect();
    const result = await client.query(
      'INSERT INTO notifications (user_id, notif_type, data) VALUES ($1, $2, $3) RETURNING id',
      [user_id, notif_type, data || {}]
    );
    await client.end();
    
    return new Response(
      JSON.stringify({ success: true, notification_id: result.rows[0].id }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
