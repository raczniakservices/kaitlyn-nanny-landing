import { NextResponse } from "next/server";
import { listKaitlynIntakes } from "../../../../lib/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const limit = Math.min(500, Math.max(1, parseInt(url.searchParams.get("limit") || "200", 10) || 200));

  const rows = await listKaitlynIntakes(limit);
  if (!rows) {
    return NextResponse.json({ ok: false, error: "DATABASE_URL is not configured." }, { status: 500 });
  }

  return NextResponse.json(
    { ok: true, intakes: rows },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
        Pragma: "no-cache"
      }
    }
  );
}


