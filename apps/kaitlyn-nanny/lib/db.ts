import { Pool } from "pg";

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
  if (!p) return null;

  await ensureSchema(p);

  const id = genId();
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

  return id;
}



