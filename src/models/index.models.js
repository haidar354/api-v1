/**
 * Drizzle ORM Models Index
 * Central export file for all database schemas and relations
 */

// Export all table schemas
export {
  users,
  roles,
  rolePermissions,
} from './users.model.js';

export {
  attendance,
  guests,
} from './attendance.model.js';

export {
  academicYears,
  principalAgendas,
  surveys,
  surveyResponses,
} from './academic.model.js';

export {
  departments,
  classes,
} from './classes.model.js';

export {
  teachers,
} from './teachers.model.js';

export {
  students,
} from './students.model.js';

// Export all relations
export {
  rolesRelations,
  usersRelations,
  rolePermissionsRelations,
  attendanceRelations,
  academicYearsRelations,
  surveysRelations,
  surveyResponsesRelations,
  departmentsRelations,
  classesRelations,
} from './relations.model.js';

/**
 * Schema object for Drizzle database initialization
 * Use this when initializing Drizzle with relations
 */
export const schema = {
  // Tables
  users,
  roles,
  rolePermissions,
  attendance,
  guests,
  academicYears,
  principalAgendas,
  surveys,
  surveyResponses,
  departments,
  classes,
  teachers,
  students,
  // Relations
  rolesRelations,
  usersRelations,
  rolePermissionsRelations,
  attendanceRelations,
  academicYearsRelations,
  surveysRelations,
  surveyResponsesRelations,
  departmentsRelations,
  classesRelations,
};

// Re-import tables for easier access
import { users, roles, rolePermissions } from './users.model.js';
import { attendance, guests } from './attendance.model.js';
import { academicYears, principalAgendas, surveys, surveyResponses } from './academic.model.js';
import { departments, classes } from './classes.model.js';
import { teachers } from './teachers.model.js';
import { students } from './students.model.js';
import { rolesRelations, usersRelations, rolePermissionsRelations, attendanceRelations, academicYearsRelations, surveysRelations, surveyResponsesRelations, departmentsRelations, classesRelations } from './relations.model.js';
