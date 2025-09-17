import { relations } from 'drizzle-orm';
import { users, roles, rolePermissions } from './users.model.js';
import { attendance, guests } from './attendance.model.js';
import { academicYears, principalAgendas, surveys, surveyResponses } from './academic.model.js';
import { departments, classes } from './classes.model.js';

/**
 * User and Role Relations
 */
export const rolesRelations = relations(roles, ({ many }) => ({
  users: many(users),
  rolePermissions: many(rolePermissions),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  role: one(roles, {
    fields: [users.id_role],
    references: [roles.id],
  }),
  attendance: many(attendance),
}));

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  role: one(roles, {
    fields: [rolePermissions.id_role],
    references: [roles.id],
  }),
}));

/**
 * Attendance Relations
 */
export const attendanceRelations = relations(attendance, ({ one }) => ({
  user: one(users, {
    fields: [attendance.id_user],
    references: [users.id],
  }),
}));

/**
 * Academic Year Relations
 */
export const academicYearsRelations = relations(academicYears, ({ many }) => ({
  surveys: many(surveys),
  classes: many(classes),
}));

/**
 * Survey Relations
 */
export const surveysRelations = relations(surveys, ({ one, many }) => ({
  academicYear: one(academicYears, {
    fields: [surveys.id_academic_year],
    references: [academicYears.id],
  }),
  responses: many(surveyResponses),
}));

export const surveyResponsesRelations = relations(surveyResponses, ({ one }) => ({
  survey: one(surveys, {
    fields: [surveyResponses.id_survey],
    references: [surveys.id],
  }),
}));

/**
 * Department and Class Relations
 */
export const departmentsRelations = relations(departments, ({ many }) => ({
  classes: many(classes),
}));

export const classesRelations = relations(classes, ({ one }) => ({
  department: one(departments, {
    fields: [classes.id_department],
    references: [departments.id],
  }),
  academicYear: one(academicYears, {
    fields: [classes.id_academic_year],
    references: [academicYears.id],
  }),
}));

/**
 * Note: Guests table has no relations as it's a standalone table
 * Principal agendas table has no relations as it's a standalone table
 */
