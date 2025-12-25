import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const COOKIE_NAME = "kaitlyn_admin_auth";
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

function createAuthToken(user: string, pass: string) {
  return Buffer.from(`${user}:${pass}`).toString("base64");
}

export async function POST(req: Request) {
  const user = process.env.ADMIN_BASIC_USER || "";
  const pass = process.env.ADMIN_BASIC_PASS || "";

  if (!user || !pass) {
    return NextResponse.json(
      { ok: false, error: "Admin credentials not configured" },
      { status: 500 }
    );
  }

  let body: { username?: string; password?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request" },
      { status: 400 }
    );
  }

  if (body.username !== user || body.password !== pass) {
    return NextResponse.json(
      { ok: false, error: "Invalid credentials" },
      { status: 401 }
    );
  }

  // Valid credentials - set cookie
  const token = createAuthToken(user, pass);
  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/"
  });

  return NextResponse.json({ ok: true });
}

