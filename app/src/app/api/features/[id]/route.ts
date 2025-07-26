import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// GET: Get a single feature by id
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();
    const res = await pool.query('SELECT * FROM features WHERE id = $1', [id]);
    if (res.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(res.rows[0]);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch feature.', details: String(err) }, { status: 500 });
  }
}

// PUT: Update a feature
export async function PUT(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();
    const { name, description, route } = await req.json();
    const res = await pool.query(
      'UPDATE features SET name = $1, description = $2, route = $3, updated_at = NOW() WHERE id = $4 RETURNING *',
      [name, description, route, id]
    );
    if (res.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(res.rows[0]);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update feature.', details: String(err) }, { status: 500 });
  }
}

// DELETE: Delete a feature
export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();
    await pool.query('DELETE FROM features WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete feature.', details: String(err) }, { status: 500 });
  }
}
