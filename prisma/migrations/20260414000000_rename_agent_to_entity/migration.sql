-- Migration: full agent → entity rename for dashboard schema.
-- Aligns dashboard tables with the Go backend (agent-dns) after the
-- agent -> entity rename. Safe to run once on an existing database.

BEGIN;

-- Rename the table
ALTER TABLE "agents" RENAME TO "entities";

-- Rename columns
ALTER TABLE "entities" RENAME COLUMN "agent_id"    TO "entity_id";
ALTER TABLE "entities" RENAME COLUMN "agent_index" TO "entity_index";

-- Rename the unique index that had the old column name baked in
ALTER INDEX IF EXISTS "agents_agent_id_key" RENAME TO "entities_entity_id_key";

-- Drop the legacy agent_url column from the initial migration
-- (it's been unused since entity_url was introduced).
ALTER TABLE "entities" DROP COLUMN IF EXISTS "agent_url";

COMMIT;
