import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { auth } from "./auth";

// Protect routes: redirect to /login when there is no session or it is expired
export const proxy = async (req: NextRequest) => {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
};

export const config = {
  matcher: [
    // Protect all routes except login, auth, forgot-password and public assets
    "/((?!login|signup|forgot-password|api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
