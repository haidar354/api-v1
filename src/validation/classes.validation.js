import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

/**
 * Department validation schemas
 */
export const departmentSchema = z.object({
  name: z.string()
    .min(2, 'Department name must be at least 2 characters')
    .max(100, 'Department name must not exceed 100 characters')
    .regex(/^[a-zA-Z\s&()-]+$/, 'Department name can only contain letters, spaces, and common symbols (&, -, (), )')
    .transform((val) => val.trim()),
});

export const createDepartmentSchema = departmentSchema;

export const updateDepartmentSchema = departmentSchema.partial();

export const departmentIdSchema = z.object({
  id: z.string().transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, 'Invalid department ID'),
});

/**
 * Class validation schemas
 */
export const classSchema = z.object({
  grade: z.string()
    .min(1, 'Grade is required')
    .max(10, 'Grade must not exceed 10 characters')
    .regex(/^[0-9XII]+$/, 'Grade must contain only numbers or Roman numerals (X, I)')
    .transform((val) => val.trim().toUpperCase()),

  id_department: z.number()
    .int('Department ID must be an integer')
    .positive('Department ID must be positive'),

  subgrade: z.string()
    .max(10, 'Subgrade must not exceed 10 characters')
    .regex(/^[A-Z0-9]*$/, 'Subgrade can only contain uppercase letters and numbers')
    .transform((val) => val?.trim().toUpperCase())
    .optional(),

  id_academic_year: z.number()
    .int('Academic year ID must be an integer')
    .positive('Academic year ID must be positive'),
});

export const createClassSchema = classSchema;

export const updateClassSchema = classSchema.partial();

export const classIdSchema = z.object({
  id: z.string().transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, 'Invalid class ID'),
});

/**
 * Bulk operations schemas
 */
export const bulkCreateClassesSchema = z.object({
  classes: z.array(classSchema)
    .min(1, 'At least one class is required')
    .max(50, 'Cannot create more than 50 classes at once')
    .refine((classes) => {
      // Check for duplicate grade-subgrade-department-academicYear combinations
      const combinations = new Set();
      for (const cls of classes) {
        const combo = `${cls.grade}-${cls.subgrade || 'none'}-${cls.id_department}-${cls.id_academic_year}`;
        if (combinations.has(combo)) {
          return false;
        }
        combinations.add(combo);
      }
      return true;
    }, 'Duplicate class combinations (grade-subgrade-department-academicYear) are not allowed'),
});

export const bulkCreateDepartmentsSchema = z.object({
  departments: z.array(departmentSchema)
    .min(1, 'At least one department is required')
    .max(20, 'Cannot create more than 20 departments at once')
    .refine((departments) => {
      // Check for duplicate department names
      const names = new Set();
      for (const dept of departments) {
        const normalizedName = dept.name.toLowerCase().trim();
        if (names.has(normalizedName)) {
          return false;
        }
        names.add(normalizedName);
      }
      return true;
    }, 'Duplicate department names are not allowed'),
});

/**
 * Query parameter schemas
 */
export const departmentQuerySchema = z.object({
  search: z.string().optional()
    .transform((val) => val?.trim())
    .refine((val) => !val || val.length >= 2, 'Search term must be at least 2 characters'),

  page: z.string().optional().transform((val) => val ? parseInt(val, 10) : 1)
    .refine((val) => val > 0, 'Page must be positive'),

  limit: z.string().optional().transform((val) => val ? parseInt(val, 10) : 10)
    .refine((val) => val > 0 && val <= 100, 'Limit must be between 1 and 100'),
});

export const classQuerySchema = z.object({
  departmentId: z.string().optional().transform((val) => val ? parseInt(val, 10) : undefined)
    .refine((val) => val === undefined || val > 0, 'Department ID must be positive'),

  academicYearId: z.string().optional().transform((val) => val ? parseInt(val, 10) : undefined)
    .refine((val) => val === undefined || val > 0, 'Academic year ID must be positive'),

  gradeSchema: z.string().transform((val) => val.trim().toUpperCase()).refine(
    (val) => /^[0-9]+$/.test(val) && +val >= 1 && +val <= 12 || /^(I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII)$/.test(val),
    { message: "Grade must be a number (1–12) or a Roman numeral (I–XII)" }
  ).optional(),

  subgrade: z.string().transform((val) => val.trim().toUpperCase()).refine(
    (val) => /^[A-Z0-9]*$/.test(val),
    { message: "Subgrade can only contain uppercase letters and numbers" }
  ).optional(),

  search: z.string().optional()
    .transform((val) => val?.trim())
    .refine((val) => !val || val.length >= 1, 'Search term must be at least 1 character'),

  page: z.string().optional().transform((val) => val ? parseInt(val, 10) : 1)
    .refine((val) => val > 0, 'Page must be positive'),

  limit: z.string().optional().transform((val) => val ? parseInt(val, 10) : 10)
    .refine((val) => val > 0 && val <= 100, 'Limit must be between 1 and 100'),
});

/**
 * Class assignment validation schemas
 */
export const classAssignmentSchema = z.object({
  classId: z.number()
    .int('Class ID must be an integer')
    .positive('Class ID must be positive'),

  userId: z.number()
    .int('User ID must be an integer')
    .positive('User ID must be positive'),

  role: z.enum(['teacher', 'student'], {
    errorMap: () => ({ message: 'Role must be either teacher or student' }),
  }),

  subject: z.string()
    .min(2, 'Subject must be at least 2 characters')
    .max(100, 'Subject must not exceed 100 characters')
    .transform((val) => val.trim())
    .optional(), // Only required for teachers
});

export const createClassAssignmentSchema = classAssignmentSchema.refine((data) => {
  if (data.role === 'teacher' && !data.subject) {
    return false;
  }
  return true;
}, {
  message: 'Subject is required for teacher assignments',
  path: ['subject'],
});

export const bulkClassAssignmentSchema = z.object({
  assignments: z.array(createClassAssignmentSchema)
    .min(1, 'At least one assignment is required')
    .max(100, 'Cannot process more than 100 assignments at once')
    .refine((assignments) => {
      // Check for duplicate user-class-role combinations
      const combinations = new Set();
      for (const assignment of assignments) {
        const combo = `${assignment.userId}-${assignment.classId}-${assignment.role}`;
        if (combinations.has(combo)) {
          return false;
        }
        combinations.add(combo);
      }
      return true;
    }, 'Duplicate user-class-role combinations are not allowed'),
});

/**
 * Class statistics validation schemas
 */
export const classStatsSchema = z.object({
  classId: z.number().int().positive(),
  includeAttendance: z.boolean().default(false),
  includeGrades: z.boolean().default(false),
  startDate: z.string().optional()
    .refine((date) => !date || /^\d{4}-\d{2}-\d{2}$/.test(date), 'Start date must be in YYYY-MM-DD format'),
  endDate: z.string().optional()
    .refine((date) => !date || /^\d{4}-\d{2}-\d{2}$/.test(date), 'End date must be in YYYY-MM-DD format'),
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return new Date(data.startDate) <= new Date(data.endDate);
  }
  return true;
}, {
  message: 'Start date must be before or equal to end date',
  path: ['endDate'],
});

/**
 * Class schedule validation schemas
 */
export const classScheduleSchema = z.object({
  classId: z.number()
    .int('Class ID must be an integer')
    .positive('Class ID must be positive'),

  subject: z.string()
    .min(2, 'Subject must be at least 2 characters')
    .max(100, 'Subject must not exceed 100 characters')
    .transform((val) => val.trim()),

  teacherId: z.number()
    .int('Teacher ID must be an integer')
    .positive('Teacher ID must be positive'),

  dayOfWeek: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'], {
    errorMap: () => ({ message: 'Day of week must be a valid day name' }),
  }),

  startTime: z.string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Start time must be in HH:MM format (24-hour)'),

  endTime: z.string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'End time must be in HH:MM format (24-hour)'),

  room: z.string()
    .max(50, 'Room must not exceed 50 characters')
    .transform((val) => val?.trim())
    .optional(),
}).refine((data) => {
  const startTime = new Date(`1970-01-01T${data.startTime}:00`);
  const endTime = new Date(`1970-01-01T${data.endTime}:00`);
  return startTime < endTime;
}, {
  message: 'Start time must be before end time',
  path: ['endTime'],
});

/**
 * Hono validators for easy use in routes
 */
export const validateCreateDepartment = zValidator('json', createDepartmentSchema);
export const validateUpdateDepartment = zValidator('json', updateDepartmentSchema);
export const validateDepartmentId = zValidator('param', departmentIdSchema);
export const validateDepartmentQuery = zValidator('query', departmentQuerySchema);
export const validateBulkCreateDepartments = zValidator('json', bulkCreateDepartmentsSchema);

export const validateCreateClass = zValidator('json', createClassSchema);
export const validateUpdateClass = zValidator('json', updateClassSchema);
export const validateClassId = zValidator('param', classIdSchema);
export const validateClassQuery = zValidator('query', classQuerySchema);
export const validateBulkCreateClasses = zValidator('json', bulkCreateClassesSchema);

export const validateCreateClassAssignment = zValidator('json', createClassAssignmentSchema);
export const validateBulkClassAssignment = zValidator('json', bulkClassAssignmentSchema);

export const validateClassStats = zValidator('json', classStatsSchema);
export const validateClassSchedule = zValidator('json', classScheduleSchema);
