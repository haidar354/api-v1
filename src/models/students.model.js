import { mysqlTable, int, varchar, json, timestamp, boolean } from 'drizzle-orm/mysql-core';
import { classes } from './classes.model.js';
import { users } from './users.model.js';

/**
 * Students table schema
 * Main students data for the school management system
 */
export const students = mysqlTable('students', {
  id: int('id').primaryKey().autoincrement(),
  id_user: int('id_user').notNull().references(() => users.id),
  id_class: int('id_class').notNull().references(() => classes.id),
  nis: varchar('nis', { length: 50 }).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().onUpdateNow(),
  deleted_at: timestamp('deleted_at'),
});