import { mysqlTable, int, varchar, json, timestamp, boolean } from 'drizzle-orm/mysql-core';

/**
 * Roles table schema
 * Defines user roles in the system (Admin, KepalaSekolah, Staff, Student)
 */
export const roles = mysqlTable('roles', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 50 }).notNull(),
  can_login: boolean('can_login').notNull().default(false),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().onUpdateNow(),
  deleted_at: timestamp('deleted_at'),
});

/**
 * Users table schema
 * Main user accounts for the school management system
 */
export const users = mysqlTable('users', {
  id: int('id').primaryKey().autoincrement(),
  full_name: varchar('full_name', { length: 255 }).notNull(),
  id_role: int('id_role').notNull().references(() => roles.id),
  data: json('data'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().onUpdateNow(),
  deleted_at: timestamp('deleted_at'),
});

/**
 * Role permissions table schema
 * Defines CRUD permissions for each role on different tables
 */
export const rolePermissions = mysqlTable('role_permissions', {
  id: int('id').primaryKey().autoincrement(),
  id_role: int('id_role').notNull().references(() => roles.id),
  table_name: varchar('table_name', { length: 100 }).notNull(),
  can_create: boolean('can_create').notNull().default(false),
  can_read: boolean('can_read').notNull().default(false),
  can_update: boolean('can_update').notNull().default(false),
  can_delete: boolean('can_delete').notNull().default(false),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().onUpdateNow(),
  deleted_at: timestamp('deleted_at'),
});
