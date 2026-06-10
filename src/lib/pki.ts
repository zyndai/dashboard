import crypto from "crypto";
import { privateKeyToAddress } from "viem/accounts";

const ALGORITHM = "aes-256-gcm";

function getMasterKey(): Buffer {
  const hex = process.env.PKI_ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error("PKI_ENCRYPTION_KEY must be a 64-character hex string (32 bytes)");
  }
  return Buffer.from(hex, "hex");
}

export function encryptPrivateKey(privateKeyB64: string): string {
  const key = getMasterKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(privateKeyB64, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  // Format: base64(iv + authTag + ciphertext)
  const combined = Buffer.concat([iv, authTag, encrypted]);
  return combined.toString("base64");
}

/**
 * Derives a deterministic EVM address from an Ed25519 private key.
 * Uses HKDF-SHA256 with domain separator to produce a secp256k1 private key
 * from the Ed25519 seed — same approach as multi-chain HD wallets.
 */
export function deriveEvmAddress(ed25519PrivateKeyB64: string): string {
  // Strip "ed25519:" prefix if present, decode base64
  const raw = ed25519PrivateKeyB64.startsWith("ed25519:")
    ? ed25519PrivateKeyB64.slice(8)
    : ed25519PrivateKeyB64;
  const keyBytes = Buffer.from(raw, "base64");

  // Ed25519 keys from NaCl are 64 bytes: first 32 = seed, last 32 = public key
  // If only 32 bytes, the whole thing is the seed
  const seed = keyBytes.length >= 32 ? keyBytes.subarray(0, 32) : keyBytes;

  // HKDF-SHA256 with domain separator → 32-byte secp256k1 private key
  const secp256k1Key = crypto.hkdfSync(
    "sha256",
    seed,
    Buffer.alloc(0),        // salt
    Buffer.from("zynd-evm-wallet-v1"),  // domain separator
    32
  );

  const hexKey = `0x${Buffer.from(secp256k1Key).toString("hex")}` as `0x${string}`;
  return privateKeyToAddress(hexKey);
}

export function decryptPrivateKey(ciphertextB64: string): string {
  const key = getMasterKey();
  const combined = Buffer.from(ciphertextB64, "base64");

  const iv = combined.subarray(0, 12);
  const authTag = combined.subarray(12, 28);
  const encrypted = combined.subarray(28);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}
