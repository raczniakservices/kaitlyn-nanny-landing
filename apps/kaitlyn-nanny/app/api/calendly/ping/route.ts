import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const token = process.env.CALENDLY_API_TOKEN;
  if (!token) {
    return NextResponse.json(
      { ok: false, error: "Missing CALENDLY_API_TOKEN" },
      { status: 500 }
    );
  }

  try {
    // Calendly API v2
    const res = await fetch("https://api.calendly.com/users/me", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      // avoid caching secrets in edge caches
      cache: "no-store"
    });

    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        { ok: false, status: res.status, body },
        { status: 502 }
      );
    }

    // Return only non-sensitive fields
    const user = (body as any)?.resource ?? {};
    return NextResponse.json({
      ok: true,
      user: {
        uri: user?.uri,
        name: user?.name,
        slug: user?.slug,
        timezone: user?.timezone
      }
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Calendly request failed" },
      { status: 502 }
    );
  }
}




