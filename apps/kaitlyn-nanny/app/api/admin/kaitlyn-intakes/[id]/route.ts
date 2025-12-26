import { NextResponse } from "next/server";
import { getKaitlynIntakeWithMeta, deleteKaitlynIntake } from "../../../../../lib/db";

export async function GET(_req: Request, ctx: { params: { id: string } }) {
  const id = String(ctx?.params?.id || "");
  if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });

  const { row, meta } = await getKaitlynIntakeWithMeta(id);
  if (!row) {
    return NextResponse.json({ ok: false, error: "Not found." }, { status: 404 });
  }

  return NextResponse.json(
    { ok: true, intake: row, meta },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
        Pragma: "no-cache"
      }
    }
  );
}

export async function DELETE(_req: Request, ctx: { params: { id: string } }) {
  const id = String(ctx?.params?.id || "");
  if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });

  const result = await deleteKaitlynIntake(id);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 404 });
  }

  return NextResponse.json(
    { ok: true },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
        Pragma: "no-cache"
      }
    }
  );
}



