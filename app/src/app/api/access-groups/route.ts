import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// GET: List all access groups
export async function GET() {
  try {
    const res = await pool.query('SELECT * FROM access_groups ORDER BY name');
    return NextResponse.json(res.rows);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch access groups.' }, { status: 500 });
  }
}

// POST: Create a new access group
export async function POST(req: NextRequest) {
  try {
    const { name, description } = await req.json();
    if (!name) return NextResponse.json({ error: 'Name is required.' }, { status: 400 });
    const res = await pool.query(
      'INSERT INTO access_groups (name, description) VALUES ($1, $2) RETURNING *',
      [name, description || null]
    );
    return NextResponse.json(res.rows[0]);
  } catch {
    return NextResponse.json({ error: 'Failed to create access group.' }, { status: 500 });
  }
}
