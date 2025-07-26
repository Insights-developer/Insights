import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// PUT: Update a user
export async function PUT(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();
    const { full_name, email, access_group_id } = await req.json();
    const res = await pool.query(
      'UPDATE users SET full_name = $1, email = $2, access_group_id = $3, updated_at = NOW() WHERE id = $4 RETURNING *',
      [full_name, email, access_group_id, id]
    );
    if (res.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(res.rows[0]);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update user.' }, { status: 500 });
  }
}

// DELETE: Delete a user
export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete user.' }, { status: 500 });
  }
}
