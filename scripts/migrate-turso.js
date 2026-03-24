/**
 * Applies Prisma migrations to Turso (production SQLite).
 * Runs on every Vercel build — reads all SQL migration files
 * and applies any that haven't been run yet.
 */

import { createClient } from "@libsql/client";
import { readdir, readFile } from "fs/promises";
import { join } from "path";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.log("No Turso credentials found — skipping migration (local dev).");
  process.exit(0);
}

const client = createClient({ url, authToken });

async function migrate() {
  // Create tracking table if it doesn't exist
  await client.execute(`
    CREATE TABLE IF NOT EXISTS _prisma_migrations (
      id TEXT PRIMARY KEY,
      migration_name TEXT NOT NULL UNIQUE,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // Get already-applied migrations
  const applied = await client.execute(
    "SELECT migration_name FROM _prisma_migrations"
  );
  const appliedSet = new Set(applied.rows.map((r) => r.migration_name));

  // Read migration directories
  const migrationsDir = join(process.cwd(), "prisma", "migrations");
  let entries;
  try {
    entries = await readdir(migrationsDir, { withFileTypes: true });
  } catch {
    console.log("No migrations directory found — skipping.");
    process.exit(0);
  }

  const dirs = entries
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();

  let count = 0;
  for (const dir of dirs) {
    if (appliedSet.has(dir)) continue;

    const sqlPath = join(migrationsDir, dir, "migration.sql");
    let sql;
    try {
      sql = await readFile(sqlPath, "utf-8");
    } catch {
      continue; // No SQL file in this directory
    }

    console.log(`Applying migration: ${dir}`);

    // Split on semicolons and execute each statement
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const stmt of statements) {
      await client.execute(stmt);
    }

    // Mark as applied
    await client.execute({
      sql: "INSERT INTO _prisma_migrations (id, migration_name) VALUES (?, ?)",
      args: [crypto.randomUUID(), dir],
    });

    count++;
  }

  console.log(
    count > 0
      ? `Applied ${count} migration(s).`
      : "All migrations already applied."
  );
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
