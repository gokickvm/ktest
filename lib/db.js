// Resolves this workspace's own Postgres connection string.
//
// KickVM's provisioner injects DATABASE_URL into the guest VM at boot by
// writing a dotenv-style line to /etc/kickvm/database-url (see the main
// app repo's AGENTS.md / ROADMAP.md, items 52-54) - it is NOT guaranteed
// that whatever supervises this process also exports it into
// process.env before exec'ing node. This test deliberately checks both
// paths and reports which one actually worked, rather than assuming
// process.env.DATABASE_URL is populated - that assumption is exactly the
// kind of gap this test exists to catch.
import { readFileSync } from "node:fs";

const INJECTED_PATH = "/etc/kickvm/database-url";

export function resolveDatabaseUrl() {
  if (process.env.DATABASE_URL) {
    return { url: process.env.DATABASE_URL, source: "process.env.DATABASE_URL" };
  }

  try {
    const raw = readFileSync(INJECTED_PATH, "utf8");
    const line = raw.split("\n").find((l) => l.trim().startsWith("DATABASE_URL="));
    if (line) {
      const url = line.trim().slice("DATABASE_URL=".length);
      if (url) {
        return { url, source: `file:${INJECTED_PATH} (NOT exported to process.env — fallback used)` };
      }
    }
  } catch (err) {
    return { url: null, source: null, error: `couldn't read ${INJECTED_PATH}: ${err.message}` };
  }

  return { url: null, source: null, error: "no DATABASE_URL in process.env and no usable file at " + INJECTED_PATH };
}

// Masks the password before this ever gets logged or rendered - this
// page needs to show WHERE the connection string came from for
// diagnostic purposes, never the credential itself.
export function maskDatabaseUrl(url) {
  try {
    const u = new URL(url);
    const host = u.hostname;
    const db = u.pathname.replace(/^\//, "");
    return `postgresql://${u.username}:***@${host}:${u.port || 5432}/${db}`;
  } catch {
    return "(unparseable)";
  }
}
