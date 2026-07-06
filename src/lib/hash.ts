/**
 * Enterprise-Grade PBKDF2 Password Hashing using Web Crypto API
 * Uses SHA-256 with 100,000 iterations and a 16-byte cryptographically random salt.
 * Compatible with Cloudflare Workers, Edge runtimes, Node.js, and Browsers.
 */

const PBKDF2_ITERATIONS = 100_000;
const KEY_LENGTH_BITS = 256; // 32 bytes

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBuffer(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

/**
 * Derives a PBKDF2 key using Web Crypto API.
 */
async function derivePbkdf2Key(
  password: string,
  salt: Uint8Array
): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  const baseKey = await crypto.subtle.importKey(
    "raw",
    passwordBuffer,
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );

  return await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt.buffer as ArrayBuffer,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    baseKey,
    KEY_LENGTH_BITS
  );
}

/**
 * Hashes a plaintext password with PBKDF2 (100,000 iterations + SHA-256 + 16-byte random salt).
 * Returns string formatted as "saltHex:hashHex".
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const derivedBits = await derivePbkdf2Key(password, salt);

  const saltHex = bufferToHex(salt.buffer);
  const hashHex = bufferToHex(derivedBits);

  return `${saltHex}:${hashHex}`;
}

/**
 * Verifies a plaintext password against a stored "saltHex:hashHex" string.
 */
export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  if (!storedHash || !storedHash.includes(":")) {
    return false;
  }

  const [saltHex, originalHashHex] = storedHash.split(":");
  const salt = hexToBuffer(saltHex);

  const derivedBits = await derivePbkdf2Key(password, salt);
  const calculatedHashHex = bufferToHex(derivedBits);

  return calculatedHashHex === originalHashHex;
}
