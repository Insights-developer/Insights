import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // Expire the token cookie
  const response = NextResponse.json({ success: true });
  response.headers.set(
    "Set-Cookie",
    "token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT"
  );
  return response;
}
