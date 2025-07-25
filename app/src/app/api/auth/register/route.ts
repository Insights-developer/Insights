
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import cryptoRandomString from "crypto-random-string";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, phone } = await req.json();
    if (!email || !password || !name) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }
    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Check if user already exists
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: "Email already registered." }, { status: 409 });
    }

    // Create user (email_verified false)
    const userRes = await pool.query(
      `INSERT INTO users (email, password_hash, full_name, phone, is_verified) VALUES ($1, $2, $3, $4, false) RETURNING id`,
      [email, password_hash, name, phone || null]
    );
    const userId = userRes.rows[0].id;

    // Generate verification code
    const code = cryptoRandomString({ length: 6, type: 'alphanumeric' });
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 min
    await pool.query(
      `INSERT INTO verifications (user_id, code, type, expires_at, used) VALUES ($1, $2, 'email', $3, false)`,
      [userId, code, expires]
    );

    // Send verification email
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: email,
      subject: "Verify your email",
      html: `<p>Your verification code is: <b>${code}</b></p><p>This code expires in 15 minutes.</p>`
    });

    return NextResponse.json({ message: "Registration successful. Verification email sent." });
  } catch (error) {
    return NextResponse.json({ error: "Registration failed." }, { status: 500 });
  }
}
