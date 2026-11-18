ALTER TABLE `preferences` ADD `mode` text DEFAULT 'light' NOT NULL;--> statement-breakpoint
ALTER TABLE `students` ADD `subject` text DEFAULT 'Математика' NOT NULL;
--> statement-breakpoint
-- Retain demonstration history, but stop its lessons blocking the real calendar.
UPDATE lessons SET status='cancelled' WHERE student_id IN (SELECT id FROM students WHERE notes LIKE '[TutorSpace demo]%' OR (name LIKE '%пример%' AND notes LIKE '%Демонстрационный ученик%'));
--> statement-breakpoint
UPDATE students SET archived=1 WHERE notes LIKE '[TutorSpace demo]%' OR (name LIKE '%пример%' AND notes LIKE '%Демонстрационный ученик%');
