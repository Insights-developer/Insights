import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// POST: Assign an access group to a user
export async function POST(req: NextRequest) {
  try {
    const { user_id, access_group_id } = await req.json();
    if (!user_id || !access_group_id) {
      return NextResponse.json({ error: 'user_id and access_group_id are required.' }, { status: 400 });
    }
    await pool.query(
      'UPDATE users SET access_group_id = $1 WHERE id = $2',
      [access_group_id, user_id]
    );
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to assign access group.' }, { status: 500 });
  }
}
