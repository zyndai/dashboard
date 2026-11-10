// Run with: npx tsx src/lib/n8n/table-ownership.test.ts
// The dashboard and the n8n Gateway share one database but never migrate each other's tables:
// the Gateway owns every `n8n_*` table (and `N8n*` enum), the dashboard owns the rest. The dashboard
// may read Gateway tables (through the Gateway API, or with a read-only query), but its Prisma
// schema must not model them and its migrations must not create, alter or drop them.
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(__dirname, "..", "..", "..", "prisma");
const schema = readFileSync(join(root, "schema.prisma"), "utf8");

assert.ok(!/@@map\(\s*"n8n_/i.test(schema), "schema.prisma maps a model onto an n8n_* table");
assert.ok(!/^\s*(model|enum)\s+N8n/im.test(schema), "schema.prisma declares an N8n* model or enum");

const migrationsDir = join(root, "migrations");
const migrations = readdirSync(migrationsDir, { withFileTypes: true }).filter((d) => d.isDirectory());
assert.ok(migrations.length > 0);
for (const m of migrations) {
  const sql = readFileSync(join(migrationsDir, m.name, "migration.sql"), "utf8");
  assert.ok(!/n8n_|"N8n/i.test(sql), `migration ${m.name} touches a Gateway table or enum`);
}
console.log(`ok: schema.prisma and ${migrations.length} migrations leave the Gateway's tables alone`);
