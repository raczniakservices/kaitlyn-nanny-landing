import type { NextApiRequest, NextApiResponse } from "next";
import { getKaitlynIntake } from "../../../../lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ ok: false, error: "Method not allowed" });

  const id = String(req.query.id || "").trim();
  if (!id) return res.status(400).json({ ok: false, error: "Missing id" });

  const row = await getKaitlynIntake(id);
  if (!row) return res.status(404).json({ ok: false, error: "Not found" });

  return res.status(200).json({ ok: true, intake: row });
}



