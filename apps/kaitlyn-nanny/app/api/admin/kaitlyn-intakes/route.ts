import { NextResponse } from "next/server";
import { clearKaitlynIntakesWithMeta, listKaitlynIntakesWithMeta } from "../../../../lib/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const limit = Math.min(500, Math.max(1, parseInt(url.searchParams.get("limit") || "200", 10) || 200));

  const { rows, meta } = await listKaitlynIntakesWithMeta(limit);
  return NextResponse.json(
    { ok: true, intakes: rows || [], meta },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
        Pragma: "no-cache"
      }
    }
  );
}

export async function DELETE() {
  const res = await clearKaitlynIntakesWithMeta();
  if (!res.ok) {
    return NextResponse.json({ ok: false, error: res.error || "Failed to clear" }, { status: 500 });
  }
  return NextResponse.json(
    { ok: true, meta: res.meta },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
        Pragma: "no-cache"
      }
    }
  );
}



