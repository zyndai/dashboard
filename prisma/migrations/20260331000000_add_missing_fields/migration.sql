-- Add missing columns to developer_keys
ALTER TABLE "developer_keys" ADD COLUMN IF NOT EXISTS "username" TEXT;
ALTER TABLE "developer_keys" ADD COLUMN IF NOT EXISTS "role" TEXT;
ALTER TABLE "developer_keys" ADD COLUMN IF NOT EXISTS "registration_ip" TEXT;
ALTER TABLE "developer_keys" ADD COLUMN IF NOT EXISTS "country" TEXT;

-- Add unique constraint on username if not already present
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'developer_keys_username_key'
  ) THEN
    ALTER TABLE "developer_keys" ADD CONSTRAINT "developer_keys_username_key" UNIQUE ("username");
  END IF;
END $$;

-- Create subscribers table
CREATE TABLE IF NOT EXISTS "subscribers" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "subscribers_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "subscribers_email_key" ON "subscribers"("email");
