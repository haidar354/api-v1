import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

/**
 * Role validation schemas
 */
export const roleSchema = z.object({
  name: z.string()
    .min(2, 'Role name must be at least 2 characters')
    .max(50, 'Role name must not exceed 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Role name can only contain letters and spaces'),
});

export const createRoleSchema = roleSchema;

export const updateRoleSchema = roleSchema.partial();

export const roleIdSchema = z.object({
  id: z.string().transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, 'Invalid role ID'),
});

/**
 * User validation schemas
 */
export const userSchema = z.object({
  full_name: z.string()
    .min(2, 'Full name must be at least 2 characters')
    .max(255, 'Full name must not exceed 255 characters')
    .regex(/^[a-zA-Z\s.'-]+$/, 'Full name can only contain letters, spaces, dots, apostrophes, and hyphens'),

  email: z.string()
    .email('Invalid email format')
    .max(255, 'Email must not exceed 255 characters')
    .toLowerCase(),

  id_role: z.number()
    .int('Role ID must be an integer')
    .positive('Role ID must be positive')
    .min(0, 'Role ID must be 0 or greater'),

  data: z.object({
  }).catchall(z.any())
    .refine((val) => {
      if (val && typeof val === 'object') {
        return Object.keys(val).length <= 50; // Reasonable limit for JSON data
      }
      return true;
    }, 'User data object is too large'),
});

/**
 * Dashboard User validation schema (Admin and Principal only)
 */
export const dashboardUserSchema = z.object({
  full_name: z.string()
    .min(2, 'Full name must be at least 2 characters')
    .max(255, 'Full name must not exceed 255 characters')
    .regex(/^[a-zA-Z\s.'-]+$/, 'Full name can only contain letters, spaces, dots, apostrophes, and hyphens'),

  email: z.string()
    .email('Invalid email format')
    .max(255, 'Email must not exceed 255 characters')
    .toLowerCase(),

  id_role: z.number()
    .int('Role ID must be an integer')
    .refine((val) => val === 0 || val === 1, 'Role ID must be 0 (Admin) or 1 (KepalaSekolah) for dashboard users'),

  data: z.object({
    password: z.string()
      .min(6, 'Password must be at least 6 characters')
      .max(100, 'Password must not exceed 100 characters')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  }).catchall(z.any()) // Allow additional fields
    .refine((val) => {
      if (val && typeof val === 'object') {
        return Object.keys(val).length <= 50; // Reasonable limit for JSON data
      }
      return true;
    }, 'User data object is too large'),
});

export const createUserSchema = userSchema;

export const createDashboardUserSchema = dashboardUserSchema;

export const updateUserSchema = userSchema.partial();

export const userIdSchema = z.object({
  id: z.string().transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, 'Invalid user ID'),
});

/**
 * Role permissions validation schemas
 */
export const rolePermissionSchema = z.object({
  id_role: z.number()
    .int('Role ID must be an integer')
    .positive('Role ID must be positive')
    .min(0, 'Role ID must be 0 or greater')
    .max(3, 'Role ID must be between 0-3'),

  table_name: z.string()
    .min(1, 'Table name is required')
    .max(100, 'Table name must not exceed 100 characters')
    .regex(/^[a-z_]+$/, 'Table name can only contain lowercase letters and underscores'),

  can_create: z.boolean().default(false),
  can_read: z.boolean().default(false),
  can_update: z.boolean().default(false),
  can_delete: z.boolean().default(false),
});

export const createRolePermissionSchema = rolePermissionSchema;

export const updateRolePermissionSchema = rolePermissionSchema.partial();

export const rolePermissionIdSchema = z.object({
  id: z.string().transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, 'Invalid role permission ID'),
});

/**
 * Bulk operations schemas
 */
export const bulkCreateUsersSchema = z.object({
  users: z.array(userSchema)
    .min(1, 'At least one user is required')
    .max(100, 'Cannot create more than 100 users at once'),
});

export const bulkUpdateRolePermissionsSchema = z.object({
  permissions: z.array(rolePermissionSchema.extend({
    id: z.number().int().positive(),
  }))
    .min(1, 'At least one permission is required')
    .max(50, 'Cannot update more than 50 permissions at once'),
});

/**
 * Query parameter schemas
 */
export const userQuerySchema = z.object({
  page: z.string().optional().transform((val) => val ? parseInt(val, 10) : 1)
    .refine((val) => val > 0, 'Page must be positive'),
  limit: z.string().optional().transform((val) => val ? parseInt(val, 10) : 10)
    .refine((val) => val > 0 && val <= 100, 'Limit must be between 1 and 100'),
  role: z.string().optional(),
  search: z.string().optional().transform((val) => val?.trim()),
});

/**
 * Hono validators for easy use in routes
 */
export const validateCreateUser = zValidator('json', createUserSchema);
export const validateUpdateUser = zValidator('json', updateUserSchema);
export const validateUserId = zValidator('param', userIdSchema);
export const validateUserQuery = zValidator('query', userQuerySchema);

export const validateCreateRole = zValidator('json', createRoleSchema);
export const validateUpdateRole = zValidator('json', updateRoleSchema);
export const validateRoleId = zValidator('param', roleIdSchema);

export const validateCreateRolePermission = zValidator('json', createRolePermissionSchema);
export const validateUpdateRolePermission = zValidator('json', updateRolePermissionSchema);
export const validateRolePermissionId = zValidator('param', rolePermissionIdSchema);

export const validateBulkCreateUsers = zValidator('json', bulkCreateUsersSchema);
export const validateBulkUpdateRolePermissions = zValidator('json', bulkUpdateRolePermissionsSchema);

export const validateCreateDashboardUser = zValidator('json', createDashboardUserSchema);
