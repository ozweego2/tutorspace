CREATE TABLE `attachments` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`homework_id` text NOT NULL,
	`name` text NOT NULL,
	`mime` text NOT NULL,
	`size` integer NOT NULL,
	`created` text NOT NULL,
	FOREIGN KEY (`homework_id`) REFERENCES `homework`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `homework` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`student_id` text NOT NULL,
	`lesson_id` text,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`due` text NOT NULL,
	`status` text DEFAULT 'assigned' NOT NULL,
	`review` text DEFAULT '' NOT NULL,
	`reviewed` text,
	`link` text DEFAULT '' NOT NULL,
	`created` text NOT NULL,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`lesson_id`) REFERENCES `lessons`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `homework_owner_due` ON `homework` (`owner`,`due`);--> statement-breakpoint
CREATE TABLE `lessons` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`student_id` text NOT NULL,
	`start` text NOT NULL,
	`end` text NOT NULL,
	`duration` integer NOT NULL,
	`subject` text DEFAULT 'Математика' NOT NULL,
	`topic` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'planned' NOT NULL,
	`price` integer NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`series` text,
	`created` text NOT NULL,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `lessons_owner_start` ON `lessons` (`owner`,`start`);--> statement-breakpoint
CREATE TABLE `payments` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`student_id` text NOT NULL,
	`date` text NOT NULL,
	`amount` integer NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`created` text NOT NULL,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `payments_owner` ON `payments` (`owner`);--> statement-breakpoint
CREATE TABLE `preferences` (
	`owner` text PRIMARY KEY NOT NULL,
	`name` text DEFAULT 'Преподаватель' NOT NULL,
	`rate` integer DEFAULT 80000 NOT NULL,
	`accent` text DEFAULT 'forest' NOT NULL,
	`font` text DEFAULT 'sans' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `progress` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`student_id` text NOT NULL,
	`date` text NOT NULL,
	`topic` text NOT NULL,
	`type` text NOT NULL,
	`score` integer NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`created` text NOT NULL,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `progress_owner` ON `progress` (`owner`);--> statement-breakpoint
CREATE TABLE `students` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`name` text NOT NULL,
	`phone` text DEFAULT '' NOT NULL,
	`level` text DEFAULT '' NOT NULL,
	`goal` text DEFAULT '' NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`rate` integer DEFAULT 80000 NOT NULL,
	`archived` integer DEFAULT 0 NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `students_owner` ON `students` (`owner`);