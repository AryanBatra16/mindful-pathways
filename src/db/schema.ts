import { pgTable, text, integer, boolean, timestamp, primaryKey, index } from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull().unique(),
    name: text("name"),
    password_hash: text("password_hash").notNull(),
    bio: text("bio"),
    points: integer("points").default(0),
    level: text("level").default("Beginner"),
    theme: text("theme").default("Dark"),
    avatar: text("avatar"),
    font_size: integer("font_size").default(16),
    compact_mode: boolean("compact_mode").default(false),
    reduce_animations: boolean("reduce_animations").default(false),
    high_contrast: boolean("high_contrast").default(false),
    default_anonymous: boolean("default_anonymous").default(false),
    email_insights: boolean("email_insights").default(true),
    daily_reminder: text("daily_reminder"),
    created_at: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("idx_users_email").on(table.email),
  ]
);

export const mood_history = pgTable(
  "mood_history",
  {
    id: text("id").primaryKey(),
    user_id: text("user_id").references(() => users.id, { onDelete: "cascade" }),
    emoji: text("emoji").notNull(),
    label: text("label").notNull(),
    value: integer("value").notNull(),
    intensity: integer("intensity"),
    tags: text("tags"),
    note: text("note"),
    created_at: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("idx_mood_history_user_id").on(table.user_id),
  ]
);

export const user_challenges = pgTable(
  "user_challenges",
  {
    id: text("id").primaryKey(),
    user_id: text("user_id").references(() => users.id, { onDelete: "cascade" }),
    challenge_id: integer("challenge_id").notNull(),
    progress: integer("progress").default(0),
    status: text("status").default("active"),
    updated_at: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("idx_user_challenges_user_id").on(table.user_id),
  ]
);

export const tasks = pgTable(
  "tasks",
  {
    id: text("id").primaryKey(),
    user_id: text("user_id").references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    priority: text("priority").default("medium"),
    status: text("status").default("today"),
    due: text("due"),
    challenge_id: text("challenge_id"),
    created_at: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("idx_tasks_user_id").on(table.user_id),
  ]
);

export const community_posts = pgTable(
  "community_posts",
  {
    id: text("id").primaryKey(),
    user_id: text("user_id").references(() => users.id, { onDelete: "cascade" }),
    author_name: text("author_name"),
    anon: boolean("anon").default(false),
    category: text("category").notNull(),
    content: text("content").notNull(),
    color: text("color"),
    created_at: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("idx_community_posts_user_id").on(table.user_id),
  ]
);

export const post_likes = pgTable(
  "post_likes",
  {
    post_id: text("post_id")
      .notNull()
      .references(() => community_posts.id, { onDelete: "cascade" }),
    user_id: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.post_id, table.user_id] }),
    index("idx_post_likes_user_id").on(table.user_id),
  ]
);

export const saved_quotes = pgTable(
  "saved_quotes",
  {
    id: text("id").primaryKey(),
    user_id: text("user_id").references(() => users.id, { onDelete: "cascade" }),
    quote_id: integer("quote_id").notNull(),
    created_at: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("idx_saved_quotes_user_id").on(table.user_id),
  ]
);

export const chatbot_messages = pgTable(
  "chatbot_messages",
  {
    id: text("id").primaryKey(),
    user_id: text("user_id").references(() => users.id, { onDelete: "cascade" }),
    role: text("role").notNull(),
    text: text("text").notNull(),
    created_at: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("idx_chatbot_messages_user_id").on(table.user_id),
  ]
);

export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    user_id: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expires_at: timestamp("expires_at").notNull(),
    created_at: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("idx_sessions_user_id").on(table.user_id),
  ]
);
