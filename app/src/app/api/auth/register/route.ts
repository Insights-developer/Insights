
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import cryptoRandomString from "crypto-random-string";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();
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

    // Create user (is_verified false) - removed phone since it's not in schema
    const userRes = await pool.query(
      `INSERT INTO users (email, password_hash, full_name, is_verified) VALUES ($1, $2, $3, false) RETURNING id`,
      [email, password_hash, name]
    );
    const userId = userRes.rows[0].id;

    // Generate verification token (6 chars alphanumeric)
    const token = cryptoRandomString({ length: 6, type: 'alphanumeric' });
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 min
    await pool.query(
      `INSERT INTO verification_tokens (user_id, token, type, expires_at) VALUES ($1, $2, 'email', $3)`,
      [userId, token, expires]
    );

    // Send verification email
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: email,
      subject: "Verify your email",
      html: `<p>Your verification code is: <b>${token}</b></p><p>This code expires in 15 minutes.</p>`
    });

    return NextResponse.json({ message: "Registration successful. Verification email sent." });
  } catch (error) {
    return NextResponse.json({ error: "Registration failed." }, { status: 500 });
  }
}
