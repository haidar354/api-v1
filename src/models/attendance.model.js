import { mysqlTable, int, varchar, text, date, datetime, timestamp, customType, time } from 'drizzle-orm/mysql-core';
import { users, roles } from './users.model.js';
import { classes } from './classes.model.js';

// Custom SET type for MySQL
const setType = customType({
  dataType() {
    return 'SET("hadir","izin","sakit","alpha","terlambat","cuti","dinas")';
  },
  toDriver(value) {
    return value.join(',');
  },
  fromDriver(value) {
    return value ? value.split(',').filter(Boolean) : [];
  },
});

/**
 * Attendance table schema
 * Tracks daily attendance for users (students/staff)
 */
export const attendance = mysqlTable('attendance', {
  id: int('id').primaryKey().autoincrement(),
  id_role: int('id_role').notNull().references(() => roles.id),
  id_user: int('id_user').notNull().references(() => users.id),
  id_class: int('id_class').references(() => classes.id),
  date: date('date').notNull(),
  status: setType('status').notNull().default(['alpha']),
  information: varchar('information', { length: 255 }),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().onUpdateNow(),
  deleted_at: timestamp('deleted_at'),
});

/**
 * Guests table schema
 * Records visitor information and visit details
 */
export const guests = mysqlTable('guests', {
  id: int('id').primaryKey().autoincrement(),
  full_name: varchar('full_name', { length: 255 }).notNull(),
  address: text('address'),
  purpose: varchar('purpose', { length: 255 }).notNull(),
  visit_date: datetime('visit_date').notNull(),
  signature: varchar('signature', { length: 255 }),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().onUpdateNow(),
  deleted_at: timestamp('deleted_at'),
});