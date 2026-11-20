CREATE TABLE `library` (
	`id` text NOT NULL,
	`owner` text NOT NULL,
	`course_key` text NOT NULL,
	`course_title` text NOT NULL,
	`subject` text NOT NULL,
	`level` text NOT NULL,
	`position` integer NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`lesson_file` text DEFAULT '' NOT NULL,
	`homework_file` text DEFAULT '' NOT NULL,
	`answers_file` text DEFAULT '' NOT NULL,
	`board_link` text DEFAULT '' NOT NULL,
	`starter` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `library_owner_id` ON `library` (`owner`,`id`);--> statement-breakpoint
CREATE TABLE `library_files` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`name` text NOT NULL,
	`mime` text NOT NULL,
	`size` integer NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `telegram_links` (
	`student_id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`invite` text NOT NULL,
	`expires` text NOT NULL,
	`chat_id` text,
	`pending_chat` text,
	`pending_name` text
);
--> statement-breakpoint
ALTER TABLE `homework` ADD `grade` integer;--> statement-breakpoint
ALTER TABLE `homework` ADD `mistakes` integer;--> statement-breakpoint
ALTER TABLE `homework` ADD `total` integer;--> statement-breakpoint
ALTER TABLE `homework` ADD `delivery` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `homework` ADD `delivery_error` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `homework` ADD `message_id` text;--> statement-breakpoint
ALTER TABLE `homework` ADD `library_id` text;