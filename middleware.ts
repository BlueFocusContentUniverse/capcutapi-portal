import { getSessionCookie } from "better-auth/cookies";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Protect routes: redirect to /login when there is no session or it is expired
export const middleware = async (req: NextRequest) => {
  const sessionCookie = getSessionCookie(req);

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
};

export const config = {
  matcher: [
    // Protect all routes except login, auth and public assets
    "/((?!login|signup|api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
