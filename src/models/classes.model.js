import { mysqlTable, int, varchar, timestamp } from 'drizzle-orm/mysql-core';
import { academicYears } from './academic.model.js';

/**
 * Departments table schema
 * Defines school departments/majors
 */
export const departments = mysqlTable('departments', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 100 }).notNull(),
  short_name: varchar('short_name', { length: 8 }).notNull(),
  code: varchar('code', { length: 10 }).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().onUpdateNow(),
  deleted_at: timestamp('deleted_at'),
});

/**
 * Classes table schema
 * Defines school classes with grade, department, and academic year
 */
export const classes = mysqlTable('classes', {
  id: int('id').primaryKey().autoincrement(),
  grade: varchar('grade', { length: 10 }).notNull(),
  id_department: int('id_department').notNull().references(() => departments.id),
  subgrade: varchar('subgrade', { length: 10 }),
  id_academic_year: int('id_academic_year').notNull().references(() => academicYears.id),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().onUpdateNow(),
  deleted_at: timestamp('deleted_at'),
});
