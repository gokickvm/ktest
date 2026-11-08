import { getPool, ensureTable } from "../lib/pool.js";
import { maskDatabaseUrl } from "../lib/db.js";

// This is the whole point of the test: force a real DB round-trip on
// EVERY request (insert + read-back), never a statically-generated page.
export const dynamic = "force-dynamic";

async function loadData() {
  const { pool, info } = getPool();
  if (!pool) {
    return { ok: false, error: info.error || "no DATABASE_URL available", source: info.source };
  }

  try {
    await ensureTable(pool);
    const requestedAt = new Date().toISOString();
    const inserted = await pool`
      INSERT INTO db_test_rows (note) VALUES (${`request at ${requestedAt}`})
      RETURNING id, created_at
    `;
    const countRes = await pool`SELECT count(*)::int AS n FROM db_test_rows`;
    const recentRes = await pool`
      SELECT id, created_at, note FROM db_test_rows ORDER BY id DESC LIMIT 10
    `;
    return {
      ok: true,
      source: info.source,
      maskedUrl: maskDatabaseUrl(info.url),
      insertedId: inserted[0].id,
      insertedAt: inserted[0].created_at,
      totalRows: countRes[0].n,
      recent: recentRes,
    };
  } catch (err) {
    return { ok: false, error: err.message, source: info.source };
  }
}

export default async function Page() {
  const data = await loadData();

  return (
    <main>
      <h1>KickVM database attachment — real persistence test</h1>
      <p>Every load of this page inserts one row into this workspace&apos;s own Postgres database, then reads back the most recent rows. Reload to see the count grow.</p>

      {!data.ok && (
        <pre style={{ color: "#ff6b6b", border: "1px solid #ff6b6b", padding: "1rem" }}>
          DATABASE CONNECTION FAILED
          {"\n"}source checked: {data.source || "(none)"}
          {"\n"}error: {data.error}
        </pre>
      )}

      {data.ok && (
        <>
          <dl>
            <dt>Connection string source</dt>
            <dd>{data.source}</dd>
            <dt>Connected to</dt>
            <dd>{data.maskedUrl}</dd>
            <dt>Row just inserted</dt>
            <dd>id={data.insertedId} at {data.insertedAt}</dd>
            <dt>Total rows in table</dt>
            <dd>{data.totalRows}</dd>
          </dl>

          <h2>Most recent rows</h2>
          <table border="1" cellPadding="6">
            <thead>
              <tr><th>id</th><th>created_at</th><th>note</th></tr>
            </thead>
            <tbody>
              {data.recent.map((row) => (
                <tr key={row.id}>
                  <td>{row.id}</td>
                  <td>{row.created_at}</td>
                  <td>{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </main>
  );
}
