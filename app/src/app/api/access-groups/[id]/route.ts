import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// GET: Get a single access group by id
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();
    const res = await pool.query('SELECT * FROM access_groups WHERE id = $1', [id]);
    if (res.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(res.rows[0]);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch access group.' }, { status: 500 });
  }
}

// PUT: Update an access group
export async function PUT(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();
    const { name, description } = await req.json();
    const res = await pool.query(
      'UPDATE access_groups SET name = $1, description = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
      [name, description, id]
    );
    if (res.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(res.rows[0]);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update access group.' }, { status: 500 });
  }
}

// DELETE: Delete an access group
export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();
    await pool.query('DELETE FROM access_groups WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete access group.' }, { status: 500 });
  }
}
