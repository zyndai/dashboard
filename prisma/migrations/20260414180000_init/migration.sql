-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";
-- CreateTable
CREATE TABLE "developer_keys" (
    "id" UUID NOT NULL,
    "user_id" TEXT NOT NULL,
    "developer_id" TEXT NOT NULL,
    "public_key" TEXT NOT NULL,
    "private_key_enc" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT,
    "role" TEXT,
    "registration_ip" TEXT,
    "country" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "developer_keys_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "subscribers" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "subscribers_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "entities" (
    "id" UUID NOT NULL,
    "user_id" TEXT NOT NULL,
    "entity_id" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "entity_url" TEXT,
    "category" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "summary" TEXT,
    "entity_index" INTEGER,
    "fqan" TEXT,
    "entity_type" TEXT DEFAULT 'agent',
    "service_endpoint" TEXT,
    "openapi_url" TEXT,
    "entity_pricing" JSONB,
    "status" TEXT NOT NULL DEFAULT 'active',
    "source" TEXT NOT NULL DEFAULT 'dashboard',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "entities_pkey" PRIMARY KEY ("id")
);
-- CreateIndex
CREATE UNIQUE INDEX "developer_keys_user_id_key" ON "developer_keys"("user_id");
-- CreateIndex
CREATE UNIQUE INDEX "developer_keys_developer_id_key" ON "developer_keys"("developer_id");
-- CreateIndex
CREATE UNIQUE INDEX "developer_keys_username_key" ON "developer_keys"("username");
-- CreateIndex
CREATE UNIQUE INDEX "subscribers_email_key" ON "subscribers"("email");
-- CreateIndex
CREATE UNIQUE INDEX "entities_entity_id_key" ON "entities"("entity_id");
