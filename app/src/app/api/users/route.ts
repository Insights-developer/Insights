import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// GET: List all users (id, email, name, access_group_id)
export async function GET() {
  try {
    const res = await pool.query('SELECT id, email, full_name, access_group_id FROM users ORDER BY email');
    return NextResponse.json(res.rows);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch users.' }, { status: 500 });
  }
}

// POST: Create a new user
export async function POST(req: NextRequest) {
  try {
    const { full_name, email, access_group_id } = await req.json();
    if (!email) return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    const res = await pool.query(
      'INSERT INTO users (email, full_name, access_group_id) VALUES ($1, $2, $3) RETURNING id, email, full_name, access_group_id',
      [email, full_name, access_group_id]
    );
    return NextResponse.json(res.rows[0]);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create user.' }, { status: 500 });
  }
}
