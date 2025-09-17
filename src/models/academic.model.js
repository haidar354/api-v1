import { mysqlTable, int, varchar, text, datetime, timestamp, boolean } from 'drizzle-orm/mysql-core';

/**
 * Academic years table schema
 * Defines school academic years (e.g., 2024/2025)
 */
export const academicYears = mysqlTable('academic_years', {
  id: int('id').primaryKey().autoincrement(),
  year: varchar('year', { length: 9 }).notNull(), // Format: "2024/2025"
  isActive: boolean('is_active').notNull().default(false),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().onUpdateNow(),
  deleted_at: timestamp('deleted_at'),
});

/**
 * Principal agendas table schema
 * Stores principal's scheduled events and activities
 */
export const principalAgendas = mysqlTable('principal_agendas', {
  id: int('id').primaryKey().autoincrement(),
  eventName: varchar('event_name', { length: 255 }).notNull(),
  description: text('description'),
  eventDate: datetime('event_date').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().onUpdateNow(),
  deleted_at: timestamp('deleted_at'),
});

/**
 * Surveys table schema
 * Defines survey forms for academic years
 */
export const surveys = mysqlTable('surveys', {
  id: int('id').primaryKey().autoincrement(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  id_academic_year: int('id_academic_year').notNull().references(() => academicYears.id),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().onUpdateNow(),
  deleted_at: timestamp('deleted_at'),
});

/**
 * Survey responses table schema
 * Stores individual responses to survey questions
 */
export const surveyResponses = mysqlTable('survey_responses', {
  id: int('id').primaryKey().autoincrement(),
  id_survey: int('id_survey').notNull().references(() => surveys.id),
  question: varchar('question', { length: 255 }).notNull(),
  score: int('score').notNull(),
  surveyorName: varchar('surveyor_name', { length: 255 }).notNull(),
  surveyorDetails: text('surveyor_details'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().onUpdateNow(),
  deleted_at: timestamp('deleted_at'),
});
