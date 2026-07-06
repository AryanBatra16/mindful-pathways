import type { DbType } from "../db/index";
import { getCurrentUser, type AuthUser } from "./auth-actions";

export class UnauthorizedError extends Error {
  constructor(message = "UNAUTHORIZED: Authentication required.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

/**
 * Server Function Authorization Guard.
 * Validates session cookie against Cloudflare D1 database.
 * Throws UnauthorizedError if session is invalid or expired.
 */
export async function requireAuthUser(
  db: DbType,
  cookieHeader: string | null | undefined
): Promise<AuthUser> {
  const user = await getCurrentUser(db, cookieHeader);
  if (!user) {
    throw new UnauthorizedError();
  }
  return user;
}

/**
 * Optional Server Function Authorization Helper.
 * Returns AuthUser if valid session exists, otherwise returns null without throwing.
 */
export async function getOptionalAuthUser(
  db: DbType,
  cookieHeader: string | null | undefined
): Promise<AuthUser | null> {
  return await getCurrentUser(db, cookieHeader);
}
