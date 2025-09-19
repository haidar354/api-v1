import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

/**
 * Student validation schemas
 */
export const studentSchema = z.object({
  id_user: z.number()
    .int('User ID must be an integer')
    .positive('User ID must be positive'),

  id_class: z.number()
    .int('Class ID must be an integer')
    .positive('Class ID must be positive'),

  nis: z.string()
    .min(1, 'NIS is required')
    .max(50, 'NIS must not exceed 50 characters')
    .regex(/^[0-9]+$/, 'NIS can only contain numbers'),
});

export const createStudentSchema = studentSchema;

export const updateStudentSchema = studentSchema.partial();

export const studentIdSchema = z.object({
  id: z.string().transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, 'Invalid student ID'),
});

/**
 * Query parameter schemas
 */
export const studentQuerySchema = z.object({
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
export const bulkCreateStudentsSchema = z.object({
  students: z.array(createStudentSchema)
    .min(1, 'At least one student is required')
    .max(100, 'Cannot create more than 100 students at once'),
});

/**
 * Hono validators for easy use in routes
 */
export const validateCreateStudent = zValidator('json', createStudentSchema);
export const validateUpdateStudent = zValidator('json', updateStudentSchema);
export const validateStudentId = zValidator('param', studentIdSchema);
export const validateStudentQuery = zValidator('query', studentQuerySchema);
export const validateBulkCreateStudents = zValidator('json', bulkCreateStudentsSchema);
