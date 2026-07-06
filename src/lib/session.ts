export const SESSION_COOKIE_NAME = "session";

/** Session default validity duration: 30 days */
export const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Generates a cryptographically secure random session token.
 */
export function generateSessionToken(): string {
  return crypto.randomUUID();
}

/**
 * Calculates the expiration date for a new session.
 */
export function getSessionExpirationDate(): Date {
  return new Date(Date.now() + SESSION_DURATION_MS);
}

/**
 * Formats a Set-Cookie header string for setting a secure session cookie.
 */
export function createSessionCookie(token: string, expiresAt: Date): string {
  const isProduction = process.env.NODE_ENV === "production";
  const secureFlag = isProduction ? "Secure; " : "";
  return `${SESSION_COOKIE_NAME}=${token}; Path=/; HttpOnly; ${secureFlag}SameSite=Lax; Expires=${expiresAt.toUTCString()}`;
}

/**
 * Formats a Set-Cookie header string for deleting/clearing the session cookie.
 */
export function createBlankSessionCookie(): string {
  return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

/**
 * Parses a session token from an incoming HTTP request Cookie header string.
 */
export function parseSessionTokenFromCookie(
  cookieHeader: string | null | undefined
): string | null {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";");
  for (const cookie of cookies) {
    const [name, ...valueParts] = cookie.trim().split("=");
    if (name === SESSION_COOKIE_NAME) {
      return valueParts.join("=");
    }
  }

  return null;
}
