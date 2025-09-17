/**
 * Drizzle ORM Models Index
 * Central export file for all database schemas and relations
 */

// Export all table schemas
export {
  users,
  roles,
  rolePermissions,
} from '@models/users.model.js';

export {
  attendance,
  guests,
} from '@models/attendance.model.js';

export {
  academicYears,
  principalAgendas,
  surveys,
  surveyResponses,
} from '@models/academic.model.js';

export {
  departments,
  classes,
} from '@models/classes.model.js';

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
} from '@models/relations.model.js';

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
import { users, roles, rolePermissions } from '@models/users.model.js';
import { attendance, guests } from '@models/attendance.model.js';
import { academicYears, principalAgendas, surveys, surveyResponses } from '@models/academic.model.js';
import { departments, classes } from '@models/classes.model.js';
import { rolesRelations, usersRelations, rolePermissionsRelations, attendanceRelations, academicYearsRelations, surveysRelations, surveyResponsesRelations, departmentsRelations, classesRelations } from '@models/relations.model.js';
