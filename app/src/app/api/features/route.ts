import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// GET: List all features
export async function GET() {
  try {
    const res = await pool.query('SELECT * FROM features ORDER BY name');
    return NextResponse.json(res.rows);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch features.', details: String(err) }, { status: 500 });
  }
}

// POST: Create a new feature
export async function POST(req: NextRequest) {
  try {
    const { name, description, route } = await req.json();
    if (!name) return NextResponse.json({ error: 'Name is required.' }, { status: 400 });
    const res = await pool.query(
      'INSERT INTO features (name, description, route) VALUES ($1, $2, $3) RETURNING *',
      [name, description || null, route || null]
    );
    return NextResponse.json(res.rows[0]);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create feature.', details: String(err) }, { status: 500 });
  }
}
