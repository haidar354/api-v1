import { mysqlTable, int, varchar, text, date, datetime, timestamp, customType } from 'drizzle-orm/mysql-core';
import { users } from './users.model.js';

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
  id_user: int('id_user').notNull().references(() => users.id),
  date: date('date').notNull(),
  status: setType('status').notNull().default(['alpha']),
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
  visitDate: datetime('visit_date').notNull(),
  signature: varchar('signature', { length: 255 }),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().onUpdateNow(),
  deleted_at: timestamp('deleted_at'),
});