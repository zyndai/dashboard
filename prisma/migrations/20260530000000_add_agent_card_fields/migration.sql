-- AlterTable: add agent-card and registry fields to entities
ALTER TABLE "entities"
  ADD COLUMN IF NOT EXISTS "wallet_address" TEXT,
  ADD COLUMN IF NOT EXISTS "card_synced_at" TIMESTAMPTZ(6),
  ADD COLUMN IF NOT EXISTS "capabilities" JSONB,
  ADD COLUMN IF NOT EXISTS "protocol_version" TEXT,
  ADD COLUMN IF NOT EXISTS "preferred_transport" TEXT,
  ADD COLUMN IF NOT EXISTS "default_input_modes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "default_output_modes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "card_skills" JSONB,
  ADD COLUMN IF NOT EXISTS "input_schema" JSONB,
  ADD COLUMN IF NOT EXISTS "output_schema" JSONB,
  ADD COLUMN IF NOT EXISTS "a2a_url" TEXT,
  ADD COLUMN IF NOT EXISTS "last_heartbeat" TIMESTAMPTZ(6),
  ADD COLUMN IF NOT EXISTS "registered_at" TIMESTAMPTZ(6),
  ADD COLUMN IF NOT EXISTS "home_registry" TEXT,
  ADD COLUMN IF NOT EXISTS "agent_public_key" TEXT;
