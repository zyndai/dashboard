-- AlterTable: add derived EVM address to developer_keys
ALTER TABLE "developer_keys"
  ADD COLUMN IF NOT EXISTS "evm_address" TEXT;
