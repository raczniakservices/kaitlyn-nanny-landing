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

export async function listKaitlynIntakes(limit: number) {
  const p = getPool();
  if (!p) return null;
  await ensureSchema(p);
  const lim = Math.min(500, Math.max(1, limit || 100));
  const { rows } = await p.query(
    `SELECT id, created_at, parent_name, email, phone, care_type, one_time_date
     FROM kaitlyn_intakes
     ORDER BY created_at DESC
     LIMIT $1`,
    [lim]
  );
  return rows;
}

export async function getKaitlynIntake(id: string) {
  const p = getPool();
  if (!p) return null;
  await ensureSchema(p);
  const { rows } = await p.query(
    `SELECT id, created_at, parent_name, email, phone, care_type, one_time_date, payload
     FROM kaitlyn_intakes
     WHERE id = $1
     LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}




