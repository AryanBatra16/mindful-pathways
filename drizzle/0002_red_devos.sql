PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_chatbot_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`role` text NOT NULL,
	`text` text NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_chatbot_messages`("id", "user_id", "role", "text", "created_at") SELECT "id", "user_id", "role", "text", "created_at" FROM `chatbot_messages`;--> statement-breakpoint
DROP TABLE `chatbot_messages`;--> statement-breakpoint
ALTER TABLE `__new_chatbot_messages` RENAME TO `chatbot_messages`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `idx_chatbot_messages_user_id` ON `chatbot_messages` (`user_id`);--> statement-breakpoint
CREATE TABLE `__new_community_posts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`author_name` text,
	`anon` integer DEFAULT false,
	`category` text NOT NULL,
	`content` text NOT NULL,
	`color` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_community_posts`("id", "user_id", "author_name", "anon", "category", "content", "color", "created_at") SELECT "id", "user_id", "author_name", "anon", "category", "content", "color", "created_at" FROM `community_posts`;--> statement-breakpoint
DROP TABLE `community_posts`;--> statement-breakpoint
ALTER TABLE `__new_community_posts` RENAME TO `community_posts`;--> statement-breakpoint
CREATE INDEX `idx_community_posts_user_id` ON `community_posts` (`user_id`);--> statement-breakpoint
CREATE TABLE `__new_mood_history` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`emoji` text NOT NULL,
	`label` text NOT NULL,
	`value` integer NOT NULL,
	`intensity` integer,
	`tags` text,
	`note` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_mood_history`("id", "user_id", "emoji", "label", "value", "intensity", "tags", "note", "created_at") SELECT "id", "user_id", "emoji", "label", "value", "intensity", "tags", "note", "created_at" FROM `mood_history`;--> statement-breakpoint
DROP TABLE `mood_history`;--> statement-breakpoint
ALTER TABLE `__new_mood_history` RENAME TO `mood_history`;--> statement-breakpoint
CREATE INDEX `idx_mood_history_user_id` ON `mood_history` (`user_id`);--> statement-breakpoint
CREATE TABLE `__new_post_likes` (
	`post_id` text NOT NULL,
	`user_id` text NOT NULL,
	PRIMARY KEY(`post_id`, `user_id`),
	FOREIGN KEY (`post_id`) REFERENCES `community_posts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_post_likes`("post_id", "user_id") SELECT "post_id", "user_id" FROM `post_likes`;--> statement-breakpoint
DROP TABLE `post_likes`;--> statement-breakpoint
ALTER TABLE `__new_post_likes` RENAME TO `post_likes`;--> statement-breakpoint
CREATE INDEX `idx_post_likes_user_id` ON `post_likes` (`user_id`);--> statement-breakpoint
CREATE TABLE `__new_saved_quotes` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`quote_id` integer NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_saved_quotes`("id", "user_id", "quote_id", "created_at") SELECT "id", "user_id", "quote_id", "created_at" FROM `saved_quotes`;--> statement-breakpoint
DROP TABLE `saved_quotes`;--> statement-breakpoint
ALTER TABLE `__new_saved_quotes` RENAME TO `saved_quotes`;--> statement-breakpoint
CREATE INDEX `idx_saved_quotes_user_id` ON `saved_quotes` (`user_id`);--> statement-breakpoint
CREATE TABLE `__new_tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`title` text NOT NULL,
	`priority` text DEFAULT 'medium',
	`status` text DEFAULT 'today',
	`due` text,
	`challenge_id` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_tasks`("id", "user_id", "title", "priority", "status", "due", "challenge_id", "created_at") SELECT "id", "user_id", "title", "priority", "status", "due", "challenge_id", "created_at" FROM `tasks`;--> statement-breakpoint
DROP TABLE `tasks`;--> statement-breakpoint
ALTER TABLE `__new_tasks` RENAME TO `tasks`;--> statement-breakpoint
CREATE INDEX `idx_tasks_user_id` ON `tasks` (`user_id`);--> statement-breakpoint
CREATE TABLE `__new_user_challenges` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`challenge_id` integer NOT NULL,
	`progress` integer DEFAULT 0,
	`status` text DEFAULT 'active',
	`updated_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_user_challenges`("id", "user_id", "challenge_id", "progress", "status", "updated_at") SELECT "id", "user_id", "challenge_id", "progress", "status", "updated_at" FROM `user_challenges`;--> statement-breakpoint
DROP TABLE `user_challenges`;--> statement-breakpoint
ALTER TABLE `__new_user_challenges` RENAME TO `user_challenges`;--> statement-breakpoint
CREATE INDEX `idx_user_challenges_user_id` ON `user_challenges` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_sessions_user_id` ON `sessions` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `idx_users_email` ON `users` (`email`);