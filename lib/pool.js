import postgres from "postgres";
import { resolveDatabaseUrl } from "./db.js";

// Module-level singleton - this runs as a real, long-lived `next start`
// process inside the workspace's own microVM (not a serverless function),
// so one connection for the process lifetime is correct here.
//
// Uses the `postgres` package rather than `pg` - not a product choice,
// a workaround for a real build-pipeline bug found during this test (see
// session report): Next.js's standalone-output tracer always emits a
// symlink for `pg` (and its optional pg-native-detection require), which
// the provisioner's build sandbox unconditionally rejects (CRITICAL 2
// fix). `postgres` has no such dynamic-require pattern and traces clean.
let sql;
let poolInfo;

export function getPool() {
  if (sql) return { pool: sql, info: poolInfo };

  const resolved = resolveDatabaseUrl();
  poolInfo = resolved;
  if (!resolved.url) return { pool: null, info: resolved };

  sql = postgres(resolved.url, { max: 3 });
  return { pool: sql, info: poolInfo };
}

let ensured = false;
export async function ensureTable(sqlClient) {
  if (ensured) return;
  await sqlClient`
    CREATE TABLE IF NOT EXISTS db_test_rows (
      id SERIAL PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      note TEXT NOT NULL
    )
  `;
  ensured = true;
}
