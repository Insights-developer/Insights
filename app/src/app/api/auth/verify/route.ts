import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();
    if (!email || !code) {
      return NextResponse.json({ error: "Missing email or code." }, { status: 400 });
    }
    // Find user
    const userRes = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userRes.rows.length === 0) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }
    const userId = userRes.rows[0].id;
    // Find verification token
    const verRes = await pool.query(
      `SELECT id, expires_at FROM verification_tokens WHERE user_id = $1 AND token = $2 AND type = 'email'`,
      [userId, code]
    );
    if (verRes.rows.length === 0) {
      return NextResponse.json({ error: "Invalid code." }, { status: 400 });
    }
    const ver = verRes.rows[0];
    if (new Date(ver.expires_at) < new Date()) {
      return NextResponse.json({ error: "Code expired." }, { status: 400 });
    }
    // Delete used token and mark user as verified
    await pool.query('DELETE FROM verification_tokens WHERE id = $1', [ver.id]);
    await pool.query('UPDATE users SET is_verified = true WHERE id = $1', [userId]);
    return NextResponse.json({ message: "Email verified. You can now sign in." });
  } catch (error) {
    return NextResponse.json({ error: "Verification failed." }, { status: 500 });
  }
}
