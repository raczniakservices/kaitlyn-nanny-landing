import { NextResponse } from "next/server";
import { getKaitlynIntake } from "../../../../../lib/db";

export async function GET(_req: Request, ctx: { params: { id: string } }) {
  const id = String(ctx?.params?.id || "");
  if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });

  const row = await getKaitlynIntake(id);
  if (!row) {
    // Could be either "not found" or DB not configured; keep it simple.
    return NextResponse.json({ ok: false, error: "Not found (or DATABASE_URL not configured)." }, { status: 404 });
  }

  return NextResponse.json(
    { ok: true, intake: row },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
        Pragma: "no-cache"
      }
    }
  );
}


