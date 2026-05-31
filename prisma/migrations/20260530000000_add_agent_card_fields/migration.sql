-- AlterTable: add agent-card and registry fields to entities
ALTER TABLE "entities"
  ADD COLUMN "wallet_address" TEXT,
  ADD COLUMN "card_synced_at" TIMESTAMPTZ(6),
  ADD COLUMN "capabilities" JSONB,
  ADD COLUMN "protocol_version" TEXT,
  ADD COLUMN "preferred_transport" TEXT,
  ADD COLUMN "default_input_modes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "default_output_modes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "card_skills" JSONB,
  ADD COLUMN "input_schema" JSONB,
  ADD COLUMN "output_schema" JSONB,
  ADD COLUMN "a2a_url" TEXT,
  ADD COLUMN "last_heartbeat" TIMESTAMPTZ(6),
  ADD COLUMN "registered_at" TIMESTAMPTZ(6),
  ADD COLUMN "home_registry" TEXT,
  ADD COLUMN "agent_public_key" TEXT;
