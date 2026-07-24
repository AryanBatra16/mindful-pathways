import { createServerFn } from "@tanstack/react-start";
import { getRequest, setResponseHeader } from "@tanstack/start-server-core";

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

// ─── Helper to retrieve D1 Database from Cloudflare Context ──────────────────
export async function getContextDb() {
  return (await import("../db/index")).db;
}

// ─── Helper to parse session user from request cookie ────────────────────────
export async function getAuthenticatedUser() {
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
      setResponseHeader("Set-Cookie", res.cookie);
    }
    return res;
  });

export const logoutServerFn = createServerFn({ method: "POST" })
  .handler(async () => {
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

export const getGeminiResponseServerFn = createServerFn({ method: "POST" })
  .inputValidator((data: { userMessage: string }) => data)
  .handler(async ({ data: { userMessage } }) => {
    let user: any = null;
    let db: any = null;
    let history: any[] = [];

    try {
      user = await getAuthenticatedUser();
      db = await getContextDb();
      await saveChatbotMessage(db, user.id, { role: "user", text: userMessage }).catch(() => {});
      history = await getChatbotMessages(db, user.id).catch(() => []);
    } catch {
      // Demo / unauthenticated user: gracefully fallback without throwing
    }

    if (history.length === 0) {
      history = [{ role: "user", text: userMessage }];
    }

    // 3. Format history for Gemini API (alternating user and model roles)
    const contents: any[] = [];
    let lastRole: string | null = null;
    for (const msg of history) {
      const geminiRole = msg.role === "assistant" ? "model" : "user";
      if (geminiRole !== lastRole) {
        contents.push({
          role: geminiRole,
          parts: [{ text: msg.text }],
        });
        lastRole = geminiRole;
      }
    }

    // 4. Retrieve API key securely from environment configuration
    const request = getRequest();
    const cloudflare = (request as any)?.runtime?.cloudflare;
    const apiKey = cloudflare?.env?.GEMINI_API_KEY || process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY_HERE") {
      const fallbackMsg = "I'm here for you! (Note: Gemini API Key is not yet configured. Please add it to your environment variables to enable full AI responses.)";
      if (user && db) {
        await saveChatbotMessage(db, user.id, { role: "assistant", text: fallbackMsg }).catch(() => {});
      }
      return fallbackMsg;
    }

    const systemInstruction = {
      parts: [
        {
          text: `You are Dr. Mira, a compassionate licensed therapist and professional clinical psychologist.
Your role is to offer empathetic validation, psychological insight, and evidence-based coping mechanisms (such as CBT techniques, grounding exercises, or reframing).

STRICT DIRECTIVES:
1. NEVER ask any follow-up questions or prompt the user to reply. Provide a self-contained, complete response so the user receives full support in one turn.
2. Keep your response concise (2 to 4 sentences max), warm, professional, and soothing.
3. Validate their feelings, offer clear guidance or reassurance, and conclude gracefully without inviting further conversation.`,
        },
      ],
    };

    // 5. Query Gemini API with automatic retry and model fallback on 503 errors
    const fetchGeminiWithRetry = async () => {
      const models = ["gemini-3.6-flash", "gemini-3.5-flash-lite"];
      let lastRes: Response | null = null;
      let lastErrText = "";

      for (const model of models) {
        for (let attempt = 0; attempt < 2; attempt++) {
          try {
            const res = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contents, systemInstruction }),
              }
            );

            if (res.ok) return { ok: true, response: res };

            lastRes = res;
            lastErrText = await res.text();

            if (res.status === 503 || res.status >= 500) {
              await new Promise((r) => setTimeout(r, 1000));
            } else {
              break;
            }
          } catch (err: any) {
            lastErrText = err?.message || String(err);
            await new Promise((r) => setTimeout(r, 1000));
          }
        }
      }
      return { ok: false, response: lastRes, errorText: lastErrText };
    };

    const apiResult = await fetchGeminiWithRetry();

    if (!apiResult.ok) {
      const status = apiResult.response?.status || 503;
      const errorText = apiResult.errorText;
      console.error("Gemini API Error details:", status, errorText);
      let userFriendlyMsg = `Gemini API Error (Status ${status}): ${errorText}`;
      if (status === 429) {
        userFriendlyMsg = "Quota or rate limit reached for the Gemini API (Status 429). Please wait a moment before trying again.";
      } else if (status === 400 || status === 403) {
        userFriendlyMsg = `Invalid or unauthorized Gemini API key (Status ${status}). Please check your GEMINI_API_KEY environment variable on Render. Details: ${errorText}`;
      } else if (status === 404) {
        userFriendlyMsg = `Model not found (Status 404). Details: ${errorText}`;
      } else if (status >= 500) {
        userFriendlyMsg = `Google Gemini service is temporarily unavailable (Status ${status}). Please try again in a few moments.`;
      }
      if (user && db) {
        await saveChatbotMessage(db, user.id, { role: "assistant", text: userFriendlyMsg }).catch(() => {});
      }
      return userFriendlyMsg;
    }

    const result = (await apiResult.response!.json()) as any;
    const assistantReply =
      result.candidates?.[0]?.content?.parts?.[0]?.text || "I am here to support you.";

    // 6. Save assistant reply to database
    if (user && db) {
      await saveChatbotMessage(db, user.id, { role: "assistant", text: assistantReply }).catch(() => {});
    }

    return assistantReply;
  });

// ─── Saved Quotes Server Functions ───────────────────────────────────────────

export const getSavedQuotesServerFn = createServerFn({ method: "GET" })
  .handler(async () => {
    const user = await getAuthenticatedUser();
    const db = await getContextDb();
    const list = await db.select().from(saved_quotes).where(eq(saved_quotes.user_id, user.id));
    return list.map((q) => q.quote_id);
  });

export const toggleSaveQuoteServerFn = createServerFn({ method: "POST" })
  .inputValidator((data: { quoteId: number }) => data)
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser();
    const db = await getContextDb();
    const [existing] = await db
      .select()
      .from(saved_quotes)
      .where(and(eq(saved_quotes.user_id, user.id), eq(saved_quotes.quote_id, data.quoteId)));

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
    return await db.select().from(user_challenges).where(eq(user_challenges.user_id, user.id));
  });

export const saveUserChallengeServerFn = createServerFn({ method: "POST" })
  .inputValidator((data: { challengeId: number; progress: number; status: "active" | "available" | "completed" }) => data)
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser();
    const db = await getContextDb();
    const [existing] = await db
      .select()
      .from(user_challenges)
      .where(and(eq(user_challenges.user_id, user.id), eq(user_challenges.challenge_id, data.challengeId)));

    if (existing) {
      await db
        .update(user_challenges)
        .set({ progress: data.progress, status: data.status, updated_at: new Date() })
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
