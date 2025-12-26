import { Pool } from "pg";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

let pool: Pool | null = null;
let schemaEnsured = false;

function getPool() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;

  if (!pool) {
    pool = new Pool({
      connectionString: url,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined
    });
  }
  return pool;
}

function genId() {
  return `k_intake_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

async function resolveKaitlynDataDir() {
  // Optional override (useful on Render if you want persistence via a disk mount).
  const override = String(process.env.KAITLYN_DATA_DIR || "").trim();
  if (override) return override;

  const isProd = process.env.NODE_ENV === "production";
  if (isProd) return os.tmpdir();

  // Monorepo-friendly default: prefer apps/kaitlyn-nanny/data if it exists.
  const candidate = path.join(process.cwd(), "apps", "kaitlyn-nanny", "data");
  try {
    const st = await fs.stat(candidate);
    if (st.isDirectory()) return candidate;
  } catch {
    // ignore
  }

  // Fallback: <cwd>/data
  return path.join(process.cwd(), "data");
}

async function fallbackFilePath() {
  const dir = await resolveKaitlynDataDir();
  await fs.mkdir(dir, { recursive: true });
  return path.join(dir, "kaitlyn-intakes.json");
}

type FileStoredIntake = {
  id: string;
  createdAt: string;
  submission: Record<string, unknown>;
};

export type KaitlynStorageMeta =
  | { source: "postgres"; usedFallback: false }
  | { source: "file"; usedFallback: false; reason: "DATABASE_URL not set" }
  | { source: "file"; usedFallback: true; reason: "postgres error" };

async function readFallbackIntakes(): Promise<FileStoredIntake[]> {
  const filePath = await fallbackFilePath();
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as FileStoredIntake[];
  } catch {
    // first run / unreadable
  }
  return [];
}

async function writeFallbackIntakes(intakes: FileStoredIntake[]) {
  const filePath = await fallbackFilePath();
  await fs.writeFile(filePath, JSON.stringify(intakes, null, 2), "utf8");
}

async function ensureSchema(p: Pool) {
  if (schemaEnsured) return;
  await p.query(`
    CREATE TABLE IF NOT EXISTS kaitlyn_intakes (
      id TEXT PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      parent_name TEXT,
      email TEXT,
      phone TEXT,
      care_type TEXT,
      one_time_date TEXT,
      payload JSONB NOT NULL
    );
  `);
  schemaEnsured = true;
}

export async function saveKaitlynIntake(payload: Record<string, unknown>) {
  const p = getPool();
  const id = genId();
  
  // Always save to file backup first (guaranteed persistence)
  try {
    const existing = await readFallbackIntakes();
    existing.push({ id, createdAt: new Date().toISOString(), submission: payload });
    await writeFallbackIntakes(existing);
  } catch (err) {
    console.error("Failed to save to file backup:", err);
    // Continue - still try to save to Postgres
  }
  
  // Then try to save to Postgres (primary storage if available)
  if (!p) {
    console.log("DATABASE_URL not set - submission saved to file backup only");
    return id;
  }

  try {
    await ensureSchema(p);
    await p.query(
      `INSERT INTO kaitlyn_intakes (id, parent_name, email, phone, care_type, one_time_date, payload)
       VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)`,
      [
        id,
        String(payload.parentName ?? "") || null,
        String(payload.email ?? "") || null,
        String(payload.phone ?? "") || null,
        String(payload.careType ?? "") || null,
        payload.careType === "One-time" ? String((payload as any).oneTimeDate ?? "") || null : null,
        JSON.stringify(payload)
      ]
    );
  } catch (err) {
    console.error("Failed to save to Postgres (but saved to file backup):", err);
    // Don't throw - file backup is already saved
  }

  return id;
}

export async function saveKaitlynIntakeFallback(payload: Record<string, unknown>) {
  // Used when DATABASE_URL isn't configured. This is still useful for dev/demo,
  // but note: in production (Render) this uses an ephemeral filesystem unless you mount a disk.
  const id = genId();
  const existing = await readFallbackIntakes();
  existing.push({ id, createdAt: new Date().toISOString(), submission: payload });
  await writeFallbackIntakes(existing);
  return id;
}

export async function clearKaitlynIntakesWithMeta(): Promise<{ ok: true; meta: KaitlynStorageMeta } | { ok: false; error: string }> {
  const p = getPool();
  let postgresSuccess = false;
  let fileSuccess = false;

  // Try to delete from both storages
  if (p) {
    try {
      await ensureSchema(p);
      await p.query(`DELETE FROM kaitlyn_intakes;`);
      postgresSuccess = true;
    } catch (err) {
      console.error("Failed to clear Postgres:", err);
    }
  }

  try {
    await clearKaitlynIntakesFile();
    fileSuccess = true;
  } catch (err) {
    console.error("Failed to clear file backup:", err);
  }

  if (!postgresSuccess && !fileSuccess) {
    return { ok: false, error: "Failed to clear from both Postgres and file backup" };
  }

  // Return success with appropriate metadata
  if (postgresSuccess) {
    return { ok: true, meta: { source: "postgres", usedFallback: false } };
  } else if (p) {
    // Postgres was configured but failed, fell back to file
    return { ok: true, meta: { source: "file", usedFallback: true, reason: "postgres error" } };
  } else {
    // No postgres configured, using file by design
    return { ok: true, meta: { source: "file", usedFallback: false, reason: "DATABASE_URL not set" } };
  }
}

async function clearKaitlynIntakesFile() {
  const filePath = await fallbackFilePath();
  // If file doesn't exist yet, treat as already empty.
  try {
    await fs.unlink(filePath);
  } catch (err: any) {
    if (err?.code === "ENOENT") return;
    throw err;
  }
}

export async function deleteKaitlynIntake(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const p = getPool();
  let postgresDeleted = false;
  let fileDeleted = false;

  // Try to delete from Postgres
  if (p) {
    try {
      await ensureSchema(p);
      const result = await p.query(`DELETE FROM kaitlyn_intakes WHERE id = $1`, [id]);
      postgresDeleted = result.rowCount ? result.rowCount > 0 : false;
    } catch (err) {
      console.error("Failed to delete from Postgres:", err);
    }
  }

  // Try to delete from file backup
  try {
    const existing = await readFallbackIntakes();
    const filtered = existing.filter((x) => x.id !== id);
    fileDeleted = filtered.length < existing.length;
    if (fileDeleted) {
      await writeFallbackIntakes(filtered);
    }
  } catch (err) {
    console.error("Failed to delete from file backup:", err);
  }

  // If not found in either storage, return error
  if (!postgresDeleted && !fileDeleted) {
    return { ok: false, error: "Submission not found" };
  }

  return { ok: true };
}

export async function listKaitlynIntakes(limit: number) {
  return (await listKaitlynIntakesWithMeta(limit)).rows;
}

export async function listKaitlynIntakesWithMeta(limit: number): Promise<{ rows: any[]; meta: KaitlynStorageMeta }> {
  const p = getPool();
  const lim = Math.min(500, Math.max(1, limit || 100));

  if (p) {
    try {
      await ensureSchema(p);
      const { rows } = await p.query(
        `SELECT id, created_at, parent_name, email, phone, care_type, one_time_date
         FROM kaitlyn_intakes
         ORDER BY created_at DESC
         LIMIT $1`,
        [lim]
      );
      return { rows, meta: { source: "postgres", usedFallback: false } };
    } catch {
      // If Postgres is temporarily unreachable, fall back to the same local storage
      // used by the form submit action (best-effort admin UX).
      const rows = await listKaitlynIntakesFromFile(lim);
      return { rows, meta: { source: "file", usedFallback: true, reason: "postgres error" } };
    }
  }

  const rows = await listKaitlynIntakesFromFile(lim);
  return { rows, meta: { source: "file", usedFallback: false, reason: "DATABASE_URL not set" } };
}

export async function getKaitlynIntake(id: string) {
  return (await getKaitlynIntakeWithMeta(id)).row;
}

export async function getKaitlynIntakeWithMeta(
  id: string
): Promise<{ row: any | null; meta: KaitlynStorageMeta }> {
  const p = getPool();
  if (p) {
    try {
      await ensureSchema(p);
      const { rows } = await p.query(
        `SELECT id, created_at, parent_name, email, phone, care_type, one_time_date, payload
         FROM kaitlyn_intakes
         WHERE id = $1
         LIMIT 1`,
        [id]
      );
      return { row: rows[0] || null, meta: { source: "postgres", usedFallback: false } };
    } catch {
      // fall back to file storage below
      const row = await getKaitlynIntakeFromFile(id);
      return row
        ? { row, meta: { source: "file", usedFallback: true, reason: "postgres error" } }
        : { row: null, meta: { source: "file", usedFallback: true, reason: "postgres error" } };
    }
  }

  const row = await getKaitlynIntakeFromFile(id);
  return row
    ? { row, meta: { source: "file", usedFallback: false, reason: "DATABASE_URL not set" } }
    : { row: null, meta: { source: "file", usedFallback: false, reason: "DATABASE_URL not set" } };
}

async function listKaitlynIntakesFromFile(lim: number) {
  const stored = await readFallbackIntakes();
  // newest first
  const sliced = stored
    .slice()
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
    .slice(0, lim);

  return sliced.map((r) => {
    const pld: any = r.submission || {};
    return {
      id: r.id,
      created_at: r.createdAt,
      parent_name: String(pld.parentName || "") || null,
      email: String(pld.email || "") || null,
      phone: String(pld.phone || "") || null,
      care_type: String(pld.careType || "") || null,
      one_time_date: pld.careType === "One-time" ? String(pld.oneTimeDate || "") || null : null
    };
  });
}

async function getKaitlynIntakeFromFile(id: string) {
  const stored = await readFallbackIntakes();
  const found = stored.find((x) => x.id === id);
  if (!found) return null;
  return {
    id: found.id,
    created_at: found.createdAt,
    payload: found.submission
  };
}


