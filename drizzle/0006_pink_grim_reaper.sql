DROP INDEX `library_owner_id`;--> statement-breakpoint
CREATE UNIQUE INDEX `library_owner_id` ON `library` (`owner`,`id`);