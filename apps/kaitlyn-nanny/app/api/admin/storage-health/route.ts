import { NextResponse } from "next/server";
import { getKaitlynStorageHealth } from "../../../../lib/db";

export async function GET(req: Request) {
  const health = await getKaitlynStorageHealth();
  return NextResponse.json(
    { ok: true, health },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
        Pragma: "no-cache"
      }
    }
  );
}


