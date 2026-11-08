import { Pool } from "pg";
import { resolveDatabaseUrl } from "./db.js";

// Module-level singleton - this runs as a real, long-lived `next start`
// process inside the workspace's own microVM (not a serverless function),
// so one pool for the process lifetime is correct here.
let pool;
let poolInfo;

export function getPool() {
  if (pool) return { pool, info: poolInfo };

  const resolved = resolveDatabaseUrl();
  poolInfo = resolved;
  if (!resolved.url) return { pool: null, info: resolved };

  pool = new Pool({ connectionString: resolved.url, max: 3 });
  return { pool, info: poolInfo };
}

let ensured = false;
export async function ensureTable(client) {
  if (ensured) return;
  await client.query(
    `CREATE TABLE IF NOT EXISTS db_test_rows (
       id SERIAL PRIMARY KEY,
       created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
       note TEXT NOT NULL
     )`,
  );
  ensured = true;
}
