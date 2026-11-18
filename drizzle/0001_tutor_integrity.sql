CREATE TRIGGER lesson_collision_insert BEFORE INSERT ON lessons
WHEN NEW.status <> 'cancelled' AND EXISTS(SELECT 1 FROM lessons WHERE owner=NEW.owner AND status<>'cancelled' AND start<NEW.end AND end>NEW.start)
BEGIN SELECT RAISE(ABORT,'schedule_conflict'); END;
--> statement-breakpoint
CREATE TRIGGER lesson_collision_update BEFORE UPDATE ON lessons
WHEN NEW.status <> 'cancelled' AND EXISTS(SELECT 1 FROM lessons WHERE owner=NEW.owner AND id<>NEW.id AND status<>'cancelled' AND start<NEW.end AND end>NEW.start)
BEGIN SELECT RAISE(ABORT,'schedule_conflict'); END;
--> statement-breakpoint
CREATE TRIGGER lesson_price_lock BEFORE UPDATE ON lessons
WHEN OLD.status='done' AND NEW.price<>OLD.price
BEGIN SELECT RAISE(ABORT,'closed_price_locked'); END;
--> statement-breakpoint
CREATE TRIGGER payment_positive_insert BEFORE INSERT ON payments
WHEN NEW.amount<=0 OR typeof(NEW.amount)<>'integer'
BEGIN SELECT RAISE(ABORT,'invalid_payment'); END;
--> statement-breakpoint
CREATE TRIGGER payment_positive_update BEFORE UPDATE ON payments
WHEN NEW.amount<=0 OR typeof(NEW.amount)<>'integer'
BEGIN SELECT RAISE(ABORT,'invalid_payment'); END;
--> statement-breakpoint
CREATE TRIGGER progress_range_insert BEFORE INSERT ON progress
WHEN NEW.score<0 OR NEW.score>100 OR typeof(NEW.score)<>'integer'
BEGIN SELECT RAISE(ABORT,'invalid_score'); END;
--> statement-breakpoint
CREATE TRIGGER progress_range_update BEFORE UPDATE ON progress
WHEN NEW.score<0 OR NEW.score>100 OR typeof(NEW.score)<>'integer'
BEGIN SELECT RAISE(ABORT,'invalid_score'); END;
--> statement-breakpoint
CREATE TRIGGER homework_validation_insert BEFORE INSERT ON homework
WHEN NEW.due<NEW.created OR (NEW.status='reviewed' AND (length(trim(NEW.review))=0 OR NEW.reviewed IS NULL))
BEGIN SELECT RAISE(ABORT,'invalid_homework'); END;
--> statement-breakpoint
CREATE TRIGGER homework_validation_update BEFORE UPDATE ON homework
WHEN NEW.due<NEW.created OR (NEW.status='reviewed' AND (length(trim(NEW.review))=0 OR NEW.reviewed IS NULL))
BEGIN SELECT RAISE(ABORT,'invalid_homework'); END;
