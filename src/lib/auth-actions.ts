import { eq } from "drizzle-orm";
import type { DbType } from "../db/index";
import { users, sessions } from "../db/schema";
import { hashPassword, verifyPassword } from "./hash";
import {
  generateSessionToken,
  getSessionExpirationDate,
  createSessionCookie,
  createBlankSessionCookie,
  parseSessionTokenFromCookie,
} from "./session";

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  bio?: string | null;
  points?: number | null;
  level?: string | null;
  theme?: string | null;
  font_size?: number | null;
  compact_mode?: boolean | null;
  reduce_animations?: boolean | null;
  high_contrast?: boolean | null;
  default_anonymous?: boolean | null;
  email_insights?: boolean | null;
  daily_reminder?: string | null;
}

export interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  error?: string;
  cookie?: string;
}

/**
 * Registers a new user, hashes password with PBKDF2, inserts into DB, and creates a session.
 */
export async function signUpUser(
  db: DbType,
  data: { email: string; password: string; name?: string }
): Promise<AuthResponse> {
  const normalizedEmail = data.email.trim().toLowerCase();

  if (!normalizedEmail || !data.password || data.password.length < 6) {
    return {
      success: false,
      error: "Email and password (min 6 characters) are required.",
    };
  }

  // Check existing user
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .get();

  if (existing) {
    return {
      success: false,
      error: "An account with this email already exists.",
    };
  }

  const passwordHash = await hashPassword(data.password);
  const userId = crypto.randomUUID();
  const name = data.name?.trim() || normalizedEmail.split("@")[0];

  await db.insert(users).values({
    id: userId,
    email: normalizedEmail,
    name: name,
    password_hash: passwordHash,
  });

  const token = generateSessionToken();
  const expiresAt = getSessionExpirationDate();
  const expiresTimestamp = Math.floor(expiresAt.getTime() / 1000);

  await db.insert(sessions).values({
    id: token,
    user_id: userId,
    expires_at: expiresTimestamp,
  });

  const userObj: AuthUser = { id: userId, email: normalizedEmail, name };

  return {
    success: true,
    user: userObj,
    cookie: createSessionCookie(token, expiresAt),
  };
}

/**
 * Authenticates a user by email and password, verifies PBKDF2 hash, and issues a session.
 */
export async function signInUser(
  db: DbType,
  data: { email: string; password: string }
): Promise<AuthResponse> {
  const normalizedEmail = data.email.trim().toLowerCase();

  if (!normalizedEmail || !data.password) {
    return {
      success: false,
      error: "Email and password are required.",
    };
  }

  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .get();

  if (!user) {
    return {
      success: false,
      error: "Invalid email or password.",
    };
  }

  const isValidPassword = await verifyPassword(data.password, user.password_hash);
  if (!isValidPassword) {
    return {
      success: false,
      error: "Invalid email or password.",
    };
  }

  const token = generateSessionToken();
  const expiresAt = getSessionExpirationDate();
  const expiresTimestamp = Math.floor(expiresAt.getTime() / 1000);

  await db.insert(sessions).values({
    id: token,
    user_id: user.id,
    expires_at: expiresTimestamp,
  });

  const userObj: AuthUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    bio: user.bio,
    points: user.points,
    level: user.level,
    theme: user.theme,
    font_size: user.font_size,
    compact_mode: user.compact_mode,
    reduce_animations: user.reduce_animations,
    high_contrast: user.high_contrast,
    default_anonymous: user.default_anonymous,
    email_insights: user.email_insights,
    daily_reminder: user.daily_reminder,
  };

  return {
    success: true,
    user: userObj,
    cookie: createSessionCookie(token, expiresAt),
  };
}

/**
 * Signs out a user by deleting their active session token from the DB.
 */
export async function signOutUser(
  db: DbType,
  token: string | null
): Promise<{ success: boolean; cookie: string }> {
  if (token) {
    await db.delete(sessions).where(eq(sessions.id, token));
  }
  return {
    success: true,
    cookie: createBlankSessionCookie(),
  };
}

/**
 * Retrieves the currently authenticated user from a Cookie header string.
 */
export async function getCurrentUser(
  db: DbType,
  cookieHeader: string | null | undefined
): Promise<AuthUser | null> {
  const token = parseSessionTokenFromCookie(cookieHeader);
  if (!token) return null;

  const session = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, token))
    .get();

  if (!session) return null;

  const nowSeconds = Math.floor(Date.now() / 1000);
  if (session.expires_at < nowSeconds) {
    // Expired session -> clean up
    await db.delete(sessions).where(eq(sessions.id, token));
    return null;
  }

  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user_id))
    .get();

  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    bio: user.bio,
    points: user.points,
    level: user.level,
    theme: user.theme,
    font_size: user.font_size,
    compact_mode: user.compact_mode,
    reduce_animations: user.reduce_animations,
    high_contrast: user.high_contrast,
    default_anonymous: user.default_anonymous,
    email_insights: user.email_insights,
    daily_reminder: user.daily_reminder,
  };
}
