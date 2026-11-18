ALTER TABLE `lessons` ADD `plan_key` text;--> statement-breakpoint
ALTER TABLE `lessons` ADD `plan_index` integer;--> statement-breakpoint
ALTER TABLE `students` ADD `plan_key` text DEFAULT '' NOT NULL;