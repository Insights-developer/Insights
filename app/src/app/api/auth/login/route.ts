import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Missing email or password." }, { status: 400 });
    }
    // Find user
    const userRes = await pool.query('SELECT id, password_hash, is_verified, role FROM users WHERE email = $1', [email]);
    if (userRes.rows.length === 0) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }
    const user = userRes.rows[0];
    if (!user.is_verified) {
      return NextResponse.json({ error: "Email not verified." }, { status: 403 });
    }
    // Check password
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }
    // Issue JWT
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return NextResponse.json({ error: "JWT secret not configured." }, { status: 500 });
    }
    const payload: { userId: number; email: string; role?: string } = { userId: user.id, email, role: user.role };
    let expiresIn: string | number = "24h";
    if (process.env.JWT_EXPIRY) {
      const val = process.env.JWT_EXPIRY;
      expiresIn = isNaN(Number(val)) ? val : Number(val);
    }
    // Bypass type error for expiresIn (runtime is correct)
    const options: jwt.SignOptions = { expiresIn: expiresIn as unknown as string & number };
    const token = jwt.sign(payload, jwtSecret as string, options);
    return NextResponse.json({ token });
  } catch {
    return NextResponse.json({ error: "Login failed." }, { status: 500 });
  }
}
