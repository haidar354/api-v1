import {
  mysqlTable,
  int,
  varchar,
  text,
  datetime,
  timestamp,
  boolean,
  date,
  mysqlEnum,
} from "drizzle-orm/mysql-core";
import { users } from "./users.model.js";

/**
 * Academic years table schema
 * Defines school academic years (e.g., 2024/2025)
 */
export const academicYears = mysqlTable("academic_years", {
  id: int("id").primaryKey().autoincrement(),
  year: varchar("year", { length: 9 }).notNull(), // Format: "2024/2025"
  start_date: date("start_date").notNull(), // Academic year start date
  end_date: date("end_date").notNull(), // Academic year end date
  is_active: boolean("is_active").notNull().default(false),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().onUpdateNow(),
  deleted_at: timestamp("deleted_at"),
});

/**
 * Principal agendas table schema
 * Stores principal's scheduled events and activities
 */
export const principalAgendas = mysqlTable("principal_agendas", {
  id: int("id").primaryKey().autoincrement(),
  event_name: varchar("event_name", { length: 255 }).notNull(),
  description: text("description"),
  event_date: datetime("event_date").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().onUpdateNow(),
  deleted_at: timestamp("deleted_at"),
});

/**
 * Surveys table schema
 * Defines survey forms for academic years
 */
export const surveys = mysqlTable("surveys", {
  id: int("id").primaryKey().autoincrement(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  id_academic_year: int("id_academic_year")
    .notNull()
    .references(() => academicYears.id),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().onUpdateNow(),
  deleted_at: timestamp("deleted_at"),
});

/**
 * Survey questions table schema
 * Stores individual responses to survey questions
 */
export const surveyQuestions = mysqlTable("survey_questions", {
  id: int("id").primaryKey().autoincrement(),
  id_survey: int("id_survey")
    .notNull()
    .references(() => surveys.id),
  question: varchar("question", { length: 255 }).notNull(),
  description: varchar("description", { length: 255 }),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().onUpdateNow(),
  deleted_at: timestamp("deleted_at"),
});

/**
 * Survey responses table schema
 * Stores individual responses to survey questions
 */
export const surveySurveyors = mysqlTable("survey_surveyors", {
  id: int("id").primaryKey().autoincrement(),
  id_survey: int("id_survey")
    .notNull()
    .references(() => surveys.id),
  name: varchar("name", { length: 255 }).notNull(),
  organization: varchar("organization", { length: 255 }),
  feedback: varchar("feedback", { length: 255 }),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().onUpdateNow(),
  deleted_at: timestamp("deleted_at"),
});

/**
 * Survey responses table schema
 * Stores individual responses to survey questions
 */
export const surveyResponses = mysqlTable("survey_responses", {
  id: int("id").primaryKey().autoincrement(),
  id_survey: int("id_survey")
    .notNull()
    .references(() => surveys.id),
  id_survey_question: int("id_survey_question")
    .notNull()
    .references(() => surveyQuestions.id),
  id_survey_surveyor: int("id_survey_surveyor")
    .notNull()
    .references(() => surveySurveyors.id),
  score: int("score").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().onUpdateNow(),
  deleted_at: timestamp("deleted_at"),
});

/**
 * Letters table schema
 * Stores letters's incoming and outgoing
 */
export const letters = mysqlTable("letters", {
  id: int("id").autoincrement().primaryKey(),
  id_user: int("id_user")
    .notNull()
    .notNull()
    .references(() => users.id),
  letter_number: varchar("letter_number", { length: 100 }).notNull(),
  letter_type: mysqlEnum("letter_type", ["incoming", "outgoing"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  sender: varchar("sender", { length: 255 }),
  recipient: varchar("recipient", { length: 255 }),
  date_received: date("date_received"),
  date_sent: date("date_sent"),
  file_path: varchar("file_path", { length: 255 }),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow().onUpdateNow(),
  deleted_at: timestamp("deleted_at"),
});
