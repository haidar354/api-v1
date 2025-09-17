/**
 * Validation Index
 * Central export file for all Zod validation schemas and Hono validators
 */

// Export all validation schemas and validators
export * from './auth.validation.js';
export * from './users.validation.js';
export * from './attendance.validation.js';
export * from './academic.validation.js';
export * from './classes.validation.js';

// Re-export commonly used validators for convenience
import {
  validateLogin,
  validateChangePassword,
  validateForgotPassword,
  validateResetPassword,
  validateUpdateProfile,
} from './auth.validation.js';

import {
  validateCreateUser,
  validateUpdateUser,
  validateUserId,
  validateUserQuery,
  validateCreateRole,
  validateUpdateRole,
  validateRoleId,
  validateCreateRolePermission,
  validateUpdateRolePermission,
  validateCreateDashboardUser,
} from './users.validation.js';

import {
  validateCreateAttendance,
  validateUpdateAttendance,
  validateAttendanceId,
  validateAttendanceQuery,
  validateCreateGuest,
  validateUpdateGuest,
  validateGuestId,
  validateGuestQuery,
} from './attendance.validation.js';

import {
  validateCreateAcademicYear,
  validateUpdateAcademicYear,
  validateAcademicYearId,
  validateCreateSurvey,
  validateUpdateSurvey,
  validateSurveyId,
  validateCreateSurveyResponse,
  validateUpdateSurveyResponse,
  validateCreatePrincipalAgenda,
  validateUpdatePrincipalAgenda,
} from './academic.validation.js';

import {
  validateCreateDepartment,
  validateUpdateDepartment,
  validateDepartmentId,
  validateCreateClass,
  validateUpdateClass,
  validateClassId,
  validateClassQuery,
} from './classes.validation.js';

/**
 * Common validators object for easy access
 */
export const validators = {
  // Authentication
  auth: {
    login: validateLogin,
    changePassword: validateChangePassword,
    forgotPassword: validateForgotPassword,
    resetPassword: validateResetPassword,
    updateProfile: validateUpdateProfile,
  },

  // Users and Roles
  users: {
    create: validateCreateUser,
    update: validateUpdateUser,
    id: validateUserId,
    query: validateUserQuery,
    createDashboardUser: validateCreateDashboardUser,
  },

  roles: {
    create: validateCreateRole,
    update: validateUpdateRole,
    id: validateRoleId,
  },

  rolePermissions: {
    create: validateCreateRolePermission,
    update: validateUpdateRolePermission,
  },

  // Attendance and Guests
  attendance: {
    create: validateCreateAttendance,
    update: validateUpdateAttendance,
    id: validateAttendanceId,
    query: validateAttendanceQuery,
  },

  guests: {
    create: validateCreateGuest,
    update: validateUpdateGuest,
    id: validateGuestId,
    query: validateGuestQuery,
  },

  // Academic Management
  academicYears: {
    create: validateCreateAcademicYear,
    update: validateUpdateAcademicYear,
    id: validateAcademicYearId,
  },

  surveys: {
    create: validateCreateSurvey,
    update: validateUpdateSurvey,
    id: validateSurveyId,
  },

  surveyResponses: {
    create: validateCreateSurveyResponse,
    update: validateUpdateSurveyResponse,
  },

  principalAgendas: {
    create: validateCreatePrincipalAgenda,
    update: validateUpdatePrincipalAgenda,
  },

  // Classes and Departments
  departments: {
    create: validateCreateDepartment,
    update: validateUpdateDepartment,
    id: validateDepartmentId,
  },

  classes: {
    create: validateCreateClass,
    update: validateUpdateClass,
    id: validateClassId,
    query: validateClassQuery,
  },
};

/**
 * Validation middleware factory
 * Creates validation middleware for common use cases
 */
export const createValidationMiddleware = {
  /**
   * Create CRUD validation middleware for a resource
   */
  crud: (resourceValidators) => ({
    create: resourceValidators.create,
    update: resourceValidators.update,
    id: resourceValidators.id,
    query: resourceValidators.query || (() => { }),
  }),

  /**
   * Create auth validation middleware
   */
  auth: () => validators.auth,

  /**
   * Create validation middleware for specific operations
   */
  operations: (operations) => {
    const middleware = {};
    for (const [key, validator] of Object.entries(operations)) {
      middleware[key] = validator;
    }
    return middleware;
  },
};

/**
 * Common validation patterns
 */
export const validationPatterns = {
  // ID parameter validation
  id: (name = 'id') => ({
    [name]: z.string().transform((val) => parseInt(val, 10))
      .refine((val) => !isNaN(val) && val > 0, `Invalid ${name}`),
  }),

  // Pagination validation
  pagination: {
    page: z.string().optional().transform((val) => val ? parseInt(val, 10) : 1)
      .refine((val) => val > 0, 'Page must be positive'),
    limit: z.string().optional().transform((val) => val ? parseInt(val, 10) : 10)
      .refine((val) => val > 0 && val <= 100, 'Limit must be between 1 and 100'),
  },

  // Date range validation
  dateRange: {
    startDate: z.string().optional()
      .refine((date) => !date || /^\d{4}-\d{2}-\d{2}$/.test(date), 'Start date must be in YYYY-MM-DD format'),
    endDate: z.string().optional()
      .refine((date) => !date || /^\d{4}-\d{2}-\d{2}$/.test(date), 'End date must be in YYYY-MM-DD format'),
  },

  // Search validation
  search: z.string().optional()
    .transform((val) => val?.trim())
    .refine((val) => !val || val.length >= 2, 'Search term must be at least 2 characters'),
};

// Import z for patterns
import { z } from 'zod';
