import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { auth } from "@/auth";

// Protect routes: redirect to /login when there is no session or it is expired
export const middleware = auth((req: NextRequest) => {
  // "auth" wrapper augments the request with the session on req.auth at runtime
  const session = (
    req as unknown as { auth?: { user?: unknown; expires?: string } }
  ).auth;

  // Allow access to the login page and public assets (matcher already excludes most)
  const { pathname, search } = req.nextUrl;
  if (pathname === "/login") {
    return NextResponse.next();
  }

  // User's request: if session.expires is greater than current date, force login
  // Note: This is inverted from typical logic, but implemented as requested.
  const expiresAt = session?.expires ? new Date(session.expires).getTime() : 0;
  const now = Date.now();
  console.log("Session expires at:", expiresAt, "Current time:", now);
  if (!session || expiresAt < now) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    // Preserve where the user was trying to go
    url.searchParams.set("callbackUrl", pathname + search);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Protect all routes except login, auth and public assets
    "/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
