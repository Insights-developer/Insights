import { NextResponse } from 'next/server';

export async function GET() {
  // This endpoint will help debug Supabase configuration
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hasAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return NextResponse.json({
    supabaseUrl: supabaseUrl ? `${supabaseUrl.substring(0, 8)}...` : null, // Show only first part for security
    hasAnonKey,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
}
