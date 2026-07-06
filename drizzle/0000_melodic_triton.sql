CREATE TABLE `chatbot_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`role` text NOT NULL,
	`text` text NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `community_posts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`author_name` text,
	`anon` integer DEFAULT false,
	`category` text NOT NULL,
	`content` text NOT NULL,
	`color` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `mood_history` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`emoji` text NOT NULL,
	`label` text NOT NULL,
	`value` integer NOT NULL,
	`intensity` integer,
	`tags` text,
	`note` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `post_likes` (
	`post_id` text NOT NULL,
	`user_id` text NOT NULL,
	PRIMARY KEY(`post_id`, `user_id`),
	FOREIGN KEY (`post_id`) REFERENCES `community_posts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `saved_quotes` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`quote_id` integer NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`title` text NOT NULL,
	`priority` text DEFAULT 'medium',
	`status` text DEFAULT 'today',
	`due` text,
	`challenge_id` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user_challenges` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`challenge_id` integer NOT NULL,
	`progress` integer DEFAULT 0,
	`status` text DEFAULT 'active',
	`updated_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text,
	`password_hash` text NOT NULL,
	`bio` text,
	`points` integer DEFAULT 0,
	`level` text DEFAULT 'Beginner',
	`theme` text DEFAULT 'light',
	`font_size` integer DEFAULT 16,
	`compact_mode` integer DEFAULT false,
	`reduce_animations` integer DEFAULT false,
	`high_contrast` integer DEFAULT false,
	`default_anonymous` integer DEFAULT false,
	`email_insights` integer DEFAULT true,
	`daily_reminder` text,
	`created_at` integer DEFAULT (strftime('%s', 'now'))
);
