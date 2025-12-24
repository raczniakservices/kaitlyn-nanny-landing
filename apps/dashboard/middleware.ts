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

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith("/admin")) return NextResponse.next();

  // Allow unprotected admin in dev if creds aren't configured.
  const user = process.env.ADMIN_BASIC_USER || "";
  const pass = process.env.ADMIN_BASIC_PASS || "";
  if (process.env.NODE_ENV !== "production" && (!user || !pass)) return NextResponse.next();

  if (!user || !pass) return unauthorized();

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

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"]
};


