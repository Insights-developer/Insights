import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // Expire all known auth/session cookies
  const response = NextResponse.json({ success: true });
  // List of cookies to clear (add more if needed)
  const cookiesToClear = [
    "token",
    "stack-access",
    "stack-refresh",
    "stack-refresh-a9785d22-54d2-41eb-8538-5ed599c06125", // example, clear all stack-refresh-*
    // Add more patterns if you see more cookies in debug
  ];
  cookiesToClear.forEach((cookie) => {
    response.headers.append(
      "Set-Cookie",
      `${cookie}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`
    );
  });
  return response;
}
