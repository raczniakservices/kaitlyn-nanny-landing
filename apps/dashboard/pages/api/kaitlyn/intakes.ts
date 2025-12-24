import type { NextApiRequest, NextApiResponse } from "next";
import { listKaitlynIntakes } from "../../../lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ ok: false, error: "Method not allowed" });

  const limit = Math.min(500, Math.max(1, parseInt(String(req.query.limit || "200"), 10) || 200));
  const rows = await listKaitlynIntakes(limit);
  if (!rows) return res.status(500).json({ ok: false, error: "DATABASE_URL is not configured." });

  return res.status(200).json({ ok: true, intakes: rows });
}



