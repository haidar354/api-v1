import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

/**
 * Teacher validation schemas
 */
export const teacherSchema = z.object({
  id_user: z.number()
    .int('User ID must be an integer')
    .positive('User ID must be positive'),

  id_class: z.number()
    .int('Class ID must be an integer')
    .positive('Class ID must be positive'),

  nip: z.string()
    .min(1, 'NIP is required')
    .max(50, 'NIP must not exceed 50 characters')
    .regex(/^[0-9]+$/, 'NIP can only contain numbers'),
});

export const createTeacherSchema = teacherSchema;

export const updateTeacherSchema = teacherSchema.partial();

export const teacherIdSchema = z.object({
  id: z.string().transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, 'Invalid teacher ID'),
});

/**
 * Query parameter schemas
 */
export const teacherQuerySchema = z.object({
  page: z.string().optional().transform((val) => val ? parseInt(val, 10) : 1)
    .refine((val) => val > 0, 'Page must be positive'),
  limit: z.string().optional().transform((val) => val ? parseInt(val, 10) : 10)
    .refine((val) => val > 0 && val <= 100, 'Limit must be between 1 and 100'),
  search: z.string().optional().transform((val) => val?.trim()),
  class: z.string().optional().transform((val) => val ? parseInt(val, 10) : undefined)
    .refine((val) => val === undefined || (!isNaN(val) && val > 0), 'Invalid class ID'),
  sortBy: z.string().optional().default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

/**
 * Bulk operations schemas
 */
export const bulkCreateTeachersSchema = z.object({
  teachers: z.array(createTeacherSchema)
    .min(1, 'At least one teacher is required')
    .max(100, 'Cannot create more than 100 teachers at once'),
});

/**
 * Hono validators for easy use in routes
 */
export const validateCreateTeacher = zValidator('json', createTeacherSchema);
export const validateUpdateTeacher = zValidator('json', updateTeacherSchema);
export const validateTeacherId = zValidator('param', teacherIdSchema);
export const validateTeacherQuery = zValidator('query', teacherQuerySchema);
export const validateBulkCreateTeachers = zValidator('json', bulkCreateTeachersSchema);
