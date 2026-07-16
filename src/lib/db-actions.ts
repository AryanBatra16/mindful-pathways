import { eq, and, desc, asc, sql } from "drizzle-orm";
import type { DbType } from "../db/index";
import {
  mood_history,
  tasks,
  community_posts,
  post_likes,
  chatbot_messages,
  users,
  user_challenges,
  saved_quotes,
} from "../db/schema";

/* =========================================================================
   1. MOOD HISTORY ACTIONS
   ========================================================================= */

export async function getMoodHistory(db: DbType, userId: string) {
  return await db
    .select()
    .from(mood_history)
    .where(eq(mood_history.user_id, userId))
    .orderBy(desc(mood_history.created_at))
    .all();
}

export async function addMoodLog(
  db: DbType,
  userId: string,
  data: {
    emoji: string;
    label: string;
    value: number;
    intensity?: number;
    tags?: string;
    note?: string;
  }
) {
  const id = `mood_${crypto.randomUUID()}`;
  await db.insert(mood_history).values({
    id,
    user_id: userId,
    emoji: data.emoji,
    label: data.label,
    value: data.value,
    intensity: data.intensity ?? 3,
    tags: data.tags ?? "",
    note: data.note ?? "",
  });

  return await db
    .select()
    .from(mood_history)
    .where(eq(mood_history.id, id))
    .get();
}

export async function deleteMoodLog(db: DbType, userId: string, moodId: string) {
  await db
    .delete(mood_history)
    .where(and(eq(mood_history.id, moodId), eq(mood_history.user_id, userId)));
  return { success: true };
}

/* =========================================================================
   2. TASK MANAGEMENT ACTIONS
   ========================================================================= */

export async function getTasks(db: DbType, userId: string) {
  return await db
    .select()
    .from(tasks)
    .where(eq(tasks.user_id, userId))
    .orderBy(desc(tasks.created_at))
    .all();
}

export async function addTask(
  db: DbType,
  userId: string,
  data: {
    title: string;
    priority?: string;
    status?: string;
    due?: string;
    challenge_id?: string;
  }
) {
  const id = `task_${crypto.randomUUID()}`;
  await db.insert(tasks).values({
    id,
    user_id: userId,
    title: data.title,
    priority: data.priority ?? "medium",
    status: data.status ?? "today",
    due: data.due ?? "Today",
    challenge_id: data.challenge_id ?? null,
  });

  return await db.select().from(tasks).where(eq(tasks.id, id)).get();
}

export async function updateTaskStatus(
  db: DbType,
  userId: string,
  taskId: string,
  status: string
) {
  await db
    .update(tasks)
    .set({ status })
    .where(and(eq(tasks.id, taskId), eq(tasks.user_id, userId)));

  return { success: true };
}

export async function deleteTask(db: DbType, userId: string, taskId: string) {
  await db
    .delete(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.user_id, userId)));
  return { success: true };
}

/* =========================================================================
   3. COMMUNITY POSTS & LIKES ACTIONS
   ========================================================================= */

export async function getCommunityPosts(db: DbType, currentUserId?: string) {
  const posts = await db
    .select()
    .from(community_posts)
    .orderBy(desc(community_posts.created_at))
    .all();

  const postsWithLikes = await Promise.all(
    posts.map(async (post) => {
      const likesCountResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(post_likes)
        .where(eq(post_likes.post_id, post.id))
        .get();

      let isLiked = false;
      if (currentUserId) {
        const userLike = await db
          .select()
          .from(post_likes)
          .where(
            and(
              eq(post_likes.post_id, post.id),
              eq(post_likes.user_id, currentUserId)
            )
          )
          .get();
        isLiked = !!userLike;
      }

      return {
        ...post,
        likesCount: likesCountResult?.count ?? 0,
        isLiked,
      };
    })
  );

  return postsWithLikes;
}

export async function createCommunityPost(
  db: DbType,
  userId: string,
  data: {
    category: string;
    content: string;
    author_name?: string;
    anon?: boolean;
    color?: string;
  }
) {
  const id = `post_${crypto.randomUUID()}`;
  await db.insert(community_posts).values({
    id,
    user_id: userId,
    category: data.category,
    content: data.content,
    author_name: data.author_name ?? "Anonymous",
    anon: data.anon ?? false,
    color: data.color ?? "coral",
  });

  return await db
    .select()
    .from(community_posts)
    .where(eq(community_posts.id, id))
    .get();
}

export async function togglePostLike(
  db: DbType,
  userId: string,
  postId: string
) {
  const existing = await db
    .select()
    .from(post_likes)
    .where(
      and(eq(post_likes.post_id, postId), eq(post_likes.user_id, userId))
    )
    .get();

  if (existing) {
    await db
      .delete(post_likes)
      .where(
        and(eq(post_likes.post_id, postId), eq(post_likes.user_id, userId))
      );
    return { liked: false };
  } else {
    await db.insert(post_likes).values({
      post_id: postId,
      user_id: userId,
    });
    return { liked: true };
  }
}

/* =========================================================================
   4. CHATBOT MESSAGES ACTIONS
   ========================================================================= */

export async function getChatbotMessages(db: DbType, userId: string) {
  return await db
    .select()
    .from(chatbot_messages)
    .where(eq(chatbot_messages.user_id, userId))
    .orderBy(asc(chatbot_messages.created_at))
    .all();
}

export async function saveChatbotMessage(
  db: DbType,
  userId: string,
  data: { role: string; text: string }
) {
  const id = `chat_${crypto.randomUUID()}`;
  await db.insert(chatbot_messages).values({
    id,
    user_id: userId,
    role: data.role,
    text: data.text,
  });

  return await db
    .select()
    .from(chatbot_messages)
    .where(eq(chatbot_messages.id, id))
    .get();
}

/* =========================================================================
   5. USER PROFILE & PREFERENCES ACTIONS
   ========================================================================= */

export async function updateUserProfile(
  db: DbType,
  userId: string,
  updates: Partial<{
    name: string;
    bio: string;
    theme: string;
    avatar: string;
    points: number;
    level: string;
    font_size: number;
    compact_mode: boolean;
    reduce_animations: boolean;
    high_contrast: boolean;
    default_anonymous: boolean;
    email_insights: boolean;
    daily_reminder: string;
  }>
) {
  await db
    .update(users)
    .set(updates)
    .where(eq(users.id, userId));

  return await db.select().from(users).where(eq(users.id, userId)).get();
}
