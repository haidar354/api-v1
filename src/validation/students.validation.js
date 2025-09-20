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
 * Excel data validation schema
 * Validates individual Excel row data with case-insensitive key matching
 */
export const excelRowSchema = z.object({
  'Nama Lengkap': z.string().min(1, 'Nama Lengkap is required'),
  'Kelas': z.string().min(1, 'Kelas is required'),
  'Jurusan': z.string().min(1, 'Jurusan is required'),
  'Subkelas': z.union([z.string(), z.number()]).transform((val) => String(val)),
  'NIS': z.union([z.string(), z.number()]).transform((val) => String(val))
    .refine((val) => /^[0-9]+$/.test(val), 'NIS can only contain numbers'),
  'Tahun Ajaran': z.string().min(1, 'Tahun Ajaran is required'),
}).or(z.object({
  'nama lengkap': z.string().min(1, 'Nama Lengkap is required'),
  'kelas': z.string().min(1, 'Kelas is required'),
  'jurusan': z.string().min(1, 'Jurusan is required'),
  'subkelas': z.union([z.string(), z.number()]).transform((val) => String(val)),
  'nis': z.union([z.string(), z.number()]).transform((val) => String(val))
    .refine((val) => /^[0-9]+$/.test(val), 'NIS can only contain numbers'),
  'tahun ajaran': z.string().min(1, 'Tahun Ajaran is required'),
}));

/**
 * Bulk operations schemas
 */
export const bulkCreateStudentsSchema = z.discriminatedUnion('type', [
  // Existing format (no type field or type !== 'excel')
  z.object({
    type: z.literal('standard').optional(),
    students: z.array(createStudentSchema)
      .min(1, 'At least one student is required')
      .max(100, 'Cannot create more than 100 students at once'),
  }),
  // New Excel format
  z.object({
    type: z.literal('excel'),
    data: z.array(excelRowSchema)
      .min(1, 'At least one student record is required')
      .max(100, 'Cannot process more than 100 students at once'),
  }),
]).or(
  // Fallback for existing format without type field
  z.object({
    students: z.array(createStudentSchema)
      .min(1, 'At least one student is required')
      .max(100, 'Cannot create more than 100 students at once'),
  })
);

/**
 * Hono validators for easy use in routes
 */
export const validateCreateStudent = zValidator('json', createStudentSchema);
export const validateUpdateStudent = zValidator('json', updateStudentSchema);
export const validateStudentId = zValidator('param', studentIdSchema);
export const validateStudentQuery = zValidator('query', studentQuerySchema);
export const validateBulkCreateStudents = zValidator('json', bulkCreateStudentsSchema);
