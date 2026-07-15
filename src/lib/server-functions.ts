import { createServerFn } from "@tanstack/react-start";
import { getDb } from "../db/index";
import { signUpUser, signInUser, signOutUser, getCurrentUser } from "./auth-actions";
import {
  getMoodHistory,
  addMoodLog,
  deleteMoodLog,
  getTasks,
  addTask,
  updateTaskStatus,
  deleteTask,
  getCommunityPosts,
  createCommunityPost,
  togglePostLike,
  getChatbotMessages,
  saveChatbotMessage,
  updateUserProfile,
} from "./db-actions";
import { parseSessionTokenFromCookie } from "./session";
import { saved_quotes, user_challenges } from "../db/schema";
import { eq, and } from "drizzle-orm";

// Dynamically import server utilities to bypass client-side build-time import-protection
async function getServerUtilities() {
  if (typeof window === "undefined") {
    return await import("@tanstack/react-start/server");
  }
  return {
    getRequest: () => { throw new Error("getRequest can only be called on the server"); },
    setResponseHeader: () => { throw new Error("setResponseHeader can only be called on the server"); }
  };
}

// ─── Helper to retrieve D1 Database from Cloudflare Context ──────────────────
export async function getContextDb() {
  const { getRequest } = await getServerUtilities();
  const request = getRequest();
  if (!request) {
    throw new Error("No request context found.");
  }
  const cloudflare = (request as any).runtime?.cloudflare;
  const d1 = cloudflare?.env?.DB;
  if (!d1) {
    throw new Error("Cloudflare D1 Database binding 'DB' not found.");
  }
  return getDb(d1);
}

// ─── Helper to parse session user from request cookie ────────────────────────
export async function getAuthenticatedUser() {
  const { getRequest } = await getServerUtilities();
  const request = getRequest();
  const cookieHeader = request.headers.get("cookie") || null;
  const db = await getContextDb();
  const user = await getCurrentUser(db, cookieHeader);
  if (!user) {
    throw new Error("UNAUTHORIZED: Authentication required.");
  }
  return user;
}

// ─── Authentication Server Functions ─────────────────────────────────────────

export const signupServerFn = createServerFn({ method: "POST" })
  .inputValidator((data: { email: string; password: string; name?: string }) => data)
  .handler(async ({ data }) => {
    const db = await getContextDb();
    const res = await signUpUser(db, data);
    if (res.success && res.cookie) {
      const { setResponseHeader } = await getServerUtilities();
      setResponseHeader("Set-Cookie", res.cookie);
    }
    return res;
  });

export const loginServerFn = createServerFn({ method: "POST" })
  .inputValidator((data: { email: string; password: string }) => data)
  .handler(async ({ data }) => {
    const db = await getContextDb();
    const res = await signInUser(db, data);
    if (res.success && res.cookie) {
      const { setResponseHeader } = await getServerUtilities();
      setResponseHeader("Set-Cookie", res.cookie);
    }
    return res;
  });

export const logoutServerFn = createServerFn({ method: "POST" })
  .handler(async () => {
    const { getRequest, setResponseHeader } = await getServerUtilities();
    const request = getRequest();
    const cookieHeader = request.headers.get("cookie") || null;
    const token = parseSessionTokenFromCookie(cookieHeader);
    const db = await getContextDb();
    const res = await signOutUser(db, token);
    setResponseHeader("Set-Cookie", res.cookie);
    return { success: true };
  });

export const getCurrentUserServerFn = createServerFn({ method: "GET" })
  .handler(async () => {
    try {
      return await getAuthenticatedUser();
    } catch {
      return null;
    }
  });

export const updateUserProfileServerFn = createServerFn({ method: "POST" })
  .inputValidator((data: any) => data)
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser();
    const db = await getContextDb();
    return await updateUserProfile(db, user.id, data);
  });

// ─── Mood History Server Functions ───────────────────────────────────────────

export const getMoodHistoryServerFn = createServerFn({ method: "GET" })
  .handler(async () => {
    const user = await getAuthenticatedUser();
    const db = await getContextDb();
    return await getMoodHistory(db, user.id);
  });

export const addMoodLogServerFn = createServerFn({ method: "POST" })
  .inputValidator((data: { emoji: string; label: string; value: number; intensity?: number; tags?: string; note?: string }) => data)
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser();
    const db = await getContextDb();
    return await addMoodLog(db, user.id, data);
  });

export const deleteMoodLogServerFn = createServerFn({ method: "POST" })
  .inputValidator((data: { moodId: string }) => data)
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser();
    const db = await getContextDb();
    return await deleteMoodLog(db, user.id, data.moodId);
  });

// ─── Tasks Server Functions ──────────────────────────────────────────────────

export const getTasksServerFn = createServerFn({ method: "GET" })
  .handler(async () => {
    const user = await getAuthenticatedUser();
    const db = await getContextDb();
    return await getTasks(db, user.id);
  });

export const addTaskServerFn = createServerFn({ method: "POST" })
  .inputValidator((data: { title: string; priority?: string; status?: string; due?: string; challenge_id?: string }) => data)
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser();
    const db = await getContextDb();
    return await addTask(db, user.id, data);
  });

export const updateTaskStatusServerFn = createServerFn({ method: "POST" })
  .inputValidator((data: { taskId: string; status: string }) => data)
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser();
    const db = await getContextDb();
    return await updateTaskStatus(db, user.id, data.taskId, data.status);
  });

export const deleteTaskServerFn = createServerFn({ method: "POST" })
  .inputValidator((data: { taskId: string }) => data)
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser();
    const db = await getContextDb();
    return await deleteTask(db, user.id, data.taskId);
  });

// ─── Community Server Functions ──────────────────────────────────────────────

export const getCommunityPostsServerFn = createServerFn({ method: "GET" })
  .handler(async () => {
    let currentUserId: string | undefined;
    try {
      const user = await getAuthenticatedUser();
      currentUserId = user.id;
    } catch {}
    const db = await getContextDb();
    return await getCommunityPosts(db, currentUserId);
  });

export const createCommunityPostServerFn = createServerFn({ method: "POST" })
  .inputValidator((data: { category: string; content: string; author_name?: string; anon?: boolean; color?: string }) => data)
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser();
    const db = await getContextDb();
    return await createCommunityPost(db, user.id, data);
  });

export const togglePostLikeServerFn = createServerFn({ method: "POST" })
  .inputValidator((data: { postId: string }) => data)
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser();
    const db = await getContextDb();
    return await togglePostLike(db, user.id, data.postId);
  });

// ─── Chatbot Server Functions ────────────────────────────────────────────────

export const getChatbotMessagesServerFn = createServerFn({ method: "GET" })
  .handler(async () => {
    const user = await getAuthenticatedUser();
    const db = await getContextDb();
    return await getChatbotMessages(db, user.id);
  });

export const saveChatbotMessageServerFn = createServerFn({ method: "POST" })
  .inputValidator((data: { role: string; text: string }) => data)
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser();
    const db = await getContextDb();
    return await saveChatbotMessage(db, user.id, data);
  });

// ─── Saved Quotes Server Functions ───────────────────────────────────────────

export const getSavedQuotesServerFn = createServerFn({ method: "GET" })
  .handler(async () => {
    const user = await getAuthenticatedUser();
    const db = await getContextDb();
    const list = await db.select().from(saved_quotes).where(eq(saved_quotes.user_id, user.id)).all();
    return list.map((q) => q.quote_id);
  });

export const toggleSaveQuoteServerFn = createServerFn({ method: "POST" })
  .inputValidator((data: { quoteId: number }) => data)
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser();
    const db = await getContextDb();
    const existing = await db
      .select()
      .from(saved_quotes)
      .where(and(eq(saved_quotes.user_id, user.id), eq(saved_quotes.quote_id, data.quoteId)))
      .get();

    if (existing) {
      await db
        .delete(saved_quotes)
        .where(and(eq(saved_quotes.user_id, user.id), eq(saved_quotes.quote_id, data.quoteId)));
      return { saved: false };
    } else {
      await db.insert(saved_quotes).values({
        id: `sq_${crypto.randomUUID()}`,
        user_id: user.id,
        quote_id: data.quoteId,
      });
      return { saved: true };
    }
  });

// ─── User Challenges Server Functions ────────────────────────────────────────

export const getUserChallengesServerFn = createServerFn({ method: "GET" })
  .handler(async () => {
    const user = await getAuthenticatedUser();
    const db = await getContextDb();
    return await db.select().from(user_challenges).where(eq(user_challenges.user_id, user.id)).all();
  });

export const saveUserChallengeServerFn = createServerFn({ method: "POST" })
  .inputValidator((data: { challengeId: number; progress: number; status: "active" | "available" | "completed" }) => data)
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser();
    const db = await getContextDb();
    const existing = await db
      .select()
      .from(user_challenges)
      .where(and(eq(user_challenges.user_id, user.id), eq(user_challenges.challenge_id, data.challengeId)))
      .get();

    if (existing) {
      await db
        .update(user_challenges)
        .set({ progress: data.progress, status: data.status, updated_at: Math.floor(Date.now() / 1000) })
        .where(eq(user_challenges.id, existing.id));
    } else {
      await db.insert(user_challenges).values({
        id: `uc_${crypto.randomUUID()}`,
        user_id: user.id,
        challenge_id: data.challengeId,
        progress: data.progress,
        status: data.status,
      });
    }
    return { success: true };
  });
