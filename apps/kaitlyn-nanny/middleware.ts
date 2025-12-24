import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

function unauthorized() {
  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Admin"'
    }
  });
}

const COOKIE_NAME = "kaitlyn_admin_auth";
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

function createAuthToken(user: string, pass: string) {
  // Simple token: base64(user:pass) - not super secure but fine for this use case
  return Buffer.from(`${user}:${pass}`).toString("base64");
}

function verifyAuthToken(token: string, expectedUser: string, expectedPass: string) {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const [u, p] = decoded.split(":");
    return u === expectedUser && p === expectedPass;
  } catch {
    return false;
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
  if (!isAdminRoute) return NextResponse.next();

  // Allow unprotected admin in dev if creds aren't configured.
  const user = process.env.ADMIN_BASIC_USER || "";
  const pass = process.env.ADMIN_BASIC_PASS || "";
  if (process.env.NODE_ENV !== "production" && (!user || !pass)) return NextResponse.next();

  if (!user || !pass) return unauthorized();

  // Check for persistent auth cookie first
  const authCookie = req.cookies.get(COOKIE_NAME)?.value;
  if (authCookie && verifyAuthToken(authCookie, user, pass)) {
    // Valid cookie - allow access and refresh cookie expiry
    const response = NextResponse.next();
    response.cookies.set(COOKIE_NAME, authCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/"
    });
    return response;
  }

  // No valid cookie - check HTTP Basic Auth
  const auth = req.headers.get("authorization") || "";
  if (!auth.toLowerCase().startsWith("basic ")) return unauthorized();

  let decoded = "";
  try {
    decoded = atob(auth.slice(6));
  } catch {
    return unauthorized();
  }

  const [u, p] = decoded.split(":");
  if (u !== user || p !== pass) return unauthorized();

  // Valid credentials - set persistent cookie and allow access
  const response = NextResponse.next();
  const token = createAuthToken(user, pass);
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/"
  });

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"]
};


