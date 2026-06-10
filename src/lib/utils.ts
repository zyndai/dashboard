import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export async function sha256Hash(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}

export function formatAddress(
  address: string | undefined,
  firstChars: number = 6,
  lastChars: number = 4
): string {
  if (!address) return "";

  if (address.length < firstChars + lastChars) {
    return address;
  }

  const start = address.substring(0, firstChars);
  const end = address.substring(address.length - lastChars);

  return `${start}...${end}`;
}
