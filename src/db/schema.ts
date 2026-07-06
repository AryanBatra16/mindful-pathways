import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  name: text("name"),
  password_hash: text("password_hash").notNull(),
  bio: text("bio"),
  points: integer("points").default(0),
  level: text("level").default("Beginner"),
  theme: text("theme").default("light"),
  font_size: integer("font_size").default(16),
  compact_mode: integer("compact_mode", { mode: "boolean" }).default(false),
  reduce_animations: integer("reduce_animations", { mode: "boolean" }).default(false),
  high_contrast: integer("high_contrast", { mode: "boolean" }).default(false),
  default_anonymous: integer("default_anonymous", { mode: "boolean" }).default(false),
  email_insights: integer("email_insights", { mode: "boolean" }).default(true),
  daily_reminder: text("daily_reminder"),
  created_at: integer("created_at").default(sql`(strftime('%s', 'now'))`),
});

export const mood_history = sqliteTable("mood_history", {
  id: text("id").primaryKey(),
  user_id: text("user_id").references(() => users.id),
  emoji: text("emoji").notNull(),
  label: text("label").notNull(),
  value: integer("value").notNull(),
  intensity: integer("intensity"),
  tags: text("tags"),
  note: text("note"),
  created_at: integer("created_at").default(sql`(strftime('%s', 'now'))`),
});

export const user_challenges = sqliteTable("user_challenges", {
  id: text("id").primaryKey(),
  user_id: text("user_id").references(() => users.id),
  challenge_id: integer("challenge_id").notNull(),
  progress: integer("progress").default(0),
  status: text("status").default("active"),
  updated_at: integer("updated_at").default(sql`(strftime('%s', 'now'))`),
});

export const tasks = sqliteTable("tasks", {
  id: text("id").primaryKey(),
  user_id: text("user_id").references(() => users.id),
  title: text("title").notNull(),
  priority: text("priority").default("medium"),
  status: text("status").default("today"),
  due: text("due"),
  challenge_id: text("challenge_id"),
  created_at: integer("created_at").default(sql`(strftime('%s', 'now'))`),
});

export const community_posts = sqliteTable("community_posts", {
  id: text("id").primaryKey(),
  user_id: text("user_id").references(() => users.id),
  author_name: text("author_name"),
  anon: integer("anon", { mode: "boolean" }).default(false),
  category: text("category").notNull(),
  content: text("content").notNull(),
  color: text("color"),
  created_at: integer("created_at").default(sql`(strftime('%s', 'now'))`),
});

export const post_likes = sqliteTable(
  "post_likes",
  {
    post_id: text("post_id")
      .notNull()
      .references(() => community_posts.id),
    user_id: text("user_id")
      .notNull()
      .references(() => users.id),
  },
  (table) => [
    primaryKey({ columns: [table.post_id, table.user_id] }),
  ]
);

export const saved_quotes = sqliteTable("saved_quotes", {
  id: text("id").primaryKey(),
  user_id: text("user_id").references(() => users.id),
  quote_id: integer("quote_id").notNull(),
  created_at: integer("created_at").default(sql`(strftime('%s', 'now'))`),
});

export const chatbot_messages = sqliteTable("chatbot_messages", {
  id: text("id").primaryKey(),
  user_id: text("user_id").references(() => users.id),
  role: text("role").notNull(),
  text: text("text").notNull(),
  created_at: integer("created_at").default(sql`(strftime('%s', 'now'))`),
});
