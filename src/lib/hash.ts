/**
 * Password Hashing & Verification using Web Crypto API (SHA-256 with Salt)
 * Supported in Cloudflare Workers, Edge Runtimes, Node.js, and Browsers.
 */

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
 * Hashes a plaintext password with a randomly generated 16-byte salt using SHA-256.
 * Returns a string formatted as "saltHex:hashHex".
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const passwordBytes = encoder.encode(password);

  const combined = new Uint8Array(salt.length + passwordBytes.length);
  combined.set(salt, 0);
  combined.set(passwordBytes, salt.length);

  const hashBuffer = await crypto.subtle.digest("SHA-256", combined);
  const saltHex = bufferToHex(salt.buffer);
  const hashHex = bufferToHex(hashBuffer);

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
  const encoder = new TextEncoder();
  const passwordBytes = encoder.encode(password);

  const combined = new Uint8Array(salt.length + passwordBytes.length);
  combined.set(salt, 0);
  combined.set(passwordBytes, salt.length);

  const hashBuffer = await crypto.subtle.digest("SHA-256", combined);
  const calculatedHashHex = bufferToHex(hashBuffer);

  return calculatedHashHex === originalHashHex;
}
