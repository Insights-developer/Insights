// In Next.js App Router, this is a route handler for /api/users
import { NextResponse } from 'next/server';

export async function GET() {
  // Wire up Supabase fetch here later
  return NextResponse.json({ message: "User list endpoint" });
}
