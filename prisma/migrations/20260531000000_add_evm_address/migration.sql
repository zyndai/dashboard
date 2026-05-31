-- AlterTable: add derived EVM address to developer_keys
ALTER TABLE "developer_keys"
  ADD COLUMN "evm_address" TEXT;
