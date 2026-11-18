import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
export const students = sqliteTable('students', {
 id: text('id').primaryKey(), owner: text('owner').notNull(), name: text('name').notNull(), subject: text('subject').notNull().default('Математика'), phone: text('phone').notNull().default(''), level: text('level').notNull().default(''), goal: text('goal').notNull().default(''), notes: text('notes').notNull().default(''), rate: integer('rate').notNull().default(80000), archived: integer('archived').notNull().default(0), created: text('created').notNull(),
}, t => [index('students_owner').on(t.owner)]);
export const lessons = sqliteTable('lessons', {
 id: text('id').primaryKey(), owner: text('owner').notNull(), studentId: text('student_id').notNull().references(()=>students.id), start: text('start').notNull(), end: text('end').notNull(), duration: integer('duration').notNull(), subject: text('subject').notNull().default('Математика'), topic: text('topic').notNull().default(''), status: text('status').notNull().default('planned'), price: integer('price').notNull(), notes: text('notes').notNull().default(''), series: text('series'), created: text('created').notNull(),
},t=>[index('lessons_owner_start').on(t.owner,t.start)]);
export const homework = sqliteTable('homework', {
 id:text('id').primaryKey(), owner:text('owner').notNull(), studentId:text('student_id').notNull().references(()=>students.id), lessonId:text('lesson_id').references(()=>lessons.id), title:text('title').notNull(), description:text('description').notNull().default(''), due:text('due').notNull(), status:text('status').notNull().default('assigned'), review:text('review').notNull().default(''), reviewed:text('reviewed'), link:text('link').notNull().default(''), created:text('created').notNull(),
},t=>[index('homework_owner_due').on(t.owner,t.due)]);
export const progress = sqliteTable('progress', {
 id:text('id').primaryKey(), owner:text('owner').notNull(), studentId:text('student_id').notNull().references(()=>students.id), date:text('date').notNull(), topic:text('topic').notNull(), type:text('type').notNull(), score:integer('score').notNull(), notes:text('notes').notNull().default(''), created:text('created').notNull(),
},t=>[index('progress_owner').on(t.owner)]);
export const payments = sqliteTable('payments', {
 id:text('id').primaryKey(), owner:text('owner').notNull(), studentId:text('student_id').notNull().references(()=>students.id), date:text('date').notNull(), amount:integer('amount').notNull(), notes:text('notes').notNull().default(''), created:text('created').notNull(),
},t=>[index('payments_owner').on(t.owner)]);
export const attachments = sqliteTable('attachments', {
 id:text('id').primaryKey(), owner:text('owner').notNull(), homeworkId:text('homework_id').notNull().references(()=>homework.id), name:text('name').notNull(), mime:text('mime').notNull(), size:integer('size').notNull(), created:text('created').notNull(),
});
export const preferences = sqliteTable('preferences', {owner:text('owner').primaryKey(), name:text('name').notNull().default('Преподаватель'), rate:integer('rate').notNull().default(80000), accent:text('accent').notNull().default('forest'), font:text('font').notNull().default('sans'), mode:text('mode').notNull().default('light')});
