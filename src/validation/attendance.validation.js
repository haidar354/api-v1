import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

/**
 * Attendance validation schemas
 */
export const attendanceSchema = z.object({
  id_user: z.number()
    .int('User ID must be an integer')
    .positive('User ID must be positive'),

  date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .refine((date) => {
      const parsedDate = new Date(date);
      const today = new Date();
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(today.getFullYear() - 1);

      return parsedDate >= oneYearAgo && parsedDate <= today;
    }, 'Date must be within the last year and not in the future'),

  status: z.array(z.enum(['hadir', 'izin', 'sakit', 'alpha', 'terlambat', 'cuti', 'dinas']))
    .default(['alpha'])
    .refine((arr) => new Set(arr).size === arr.length, {
      message: 'Duplicate status values are not allowed',
    }),
});

export const createAttendanceSchema = attendanceSchema;

export const updateAttendanceSchema = attendanceSchema.partial().extend({
  status: z.enum(['hadir', 'izin', 'sakit', 'alpha', 'terlambat'], {
    errorMap: () => ({ message: 'Status must be one of: hadir, izin, sakit, alpha, terlambat' }),
  }).optional(),
});

export const attendanceIdSchema = z.object({
  id: z.string().transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, 'Invalid attendance ID'),
});

/**
 * Bulk attendance validation schemas
 */
export const bulkAttendanceSchema = z.object({
  attendances: z.array(attendanceSchema)
    .min(1, 'At least one attendance record is required')
    .max(500, 'Cannot process more than 500 attendance records at once')
    .refine((attendances) => {
      // Check for duplicate user-date combinations
      const userDateCombos = new Set();
      for (const attendance of attendances) {
        const combo = `${attendance.id_user}-${attendance.date}`;
        if (userDateCombos.has(combo)) {
          return false;
        }
        userDateCombos.add(combo);
      }
      return true;
    }, 'Duplicate user-date combinations are not allowed'),
});

/**
 * Attendance query validation schemas
 */
export const attendanceQuerySchema = z.object({
  user_id: z.string().optional().transform((val) => val ? parseInt(val, 10) : undefined)
    .refine((val) => val === undefined || (val > 0), 'User ID must be positive'),

  start_date: z.string().optional()
    .refine((date) => !date || /^\d{4}-\d{2}-\d{2}$/.test(date), 'Start date must be in YYYY-MM-DD format'),

  end_date: z.string().optional()
    .refine((date) => !date || /^\d{4}-\d{2}-\d{2}$/.test(date), 'End date must be in YYYY-MM-DD format'),

  status: z.enum(['hadir', 'izin', 'sakit', 'alpha', 'terlambat']).optional(),

  page: z.string().optional().transform((val) => val ? parseInt(val, 10) : 1)
    .refine((val) => val > 0, 'Page must be positive'),

  limit: z.string().optional().transform((val) => val ? parseInt(val, 10) : 10)
    .refine((val) => val > 0 && val <= 100, 'Limit must be between 1 and 100'),
}).refine((data) => {
  if (data.start_date && data.end_date) {
    return new Date(data.start_date) <= new Date(data.end_date);
  }
  return true;
}, {
  message: 'Start date must be before or equal to end date',
  path: ['end_date'],
});

/**
 * Guest validation schemas
 */
export const guestSchema = z.object({
  full_name: z.string()
    .min(2, 'Full name must be at least 2 characters')
    .max(255, 'Full name must not exceed 255 characters')
    .regex(/^[a-zA-Z\s.'-]+$/, 'Full name can only contain letters, spaces, dots, apostrophes, and hyphens')
    .transform((val) => val.trim()),

  address: z.string()
    .max(1000, 'Address must not exceed 1000 characters')
    .transform((val) => val?.trim())
    .optional(),

  purpose: z.string()
    .min(5, 'Purpose must be at least 5 characters')
    .max(255, 'Purpose must not exceed 255 characters')
    .transform((val) => val.trim()),
    
    visit_date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/, 'Visit date must be in ISO 8601 format')
    .refine((date) => {
      const parsedDate = new Date(date);
      const now = new Date();
      const oneMonthFromNow = new Date();
      oneMonthFromNow.setMonth(now.getMonth() + 1);
      
      return parsedDate >= now && parsedDate <= oneMonthFromNow;
    }, 'Visit date must be in the future but not more than 1 month ahead'),
    signature: z.string()
      .min(5, 'Signature must be at least 5 characters')
      .max(255, 'Signature must not exceed 255 characters')
      .transform((val) => val.trim()),
});

export const createGuestSchema = guestSchema;

export const updateGuestSchema = guestSchema.partial().extend({
  visit_date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/, 'Visit date must be in ISO 8601 format')
    .refine((date) => {
      const parsedDate = new Date(date);
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      const oneMonthFromNow = new Date();
      oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

      return parsedDate >= oneYearAgo && parsedDate <= oneMonthFromNow;
    }, 'Visit date must be within reasonable range')
    .optional(),
});

export const guestIdSchema = z.object({
  id: z.string().transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, 'Invalid guest ID'),
});

/**
 * Guest query validation schemas
 */
export const guestQuerySchema = z.object({
  start_date: z.string().optional()
    .refine((date) => !date || /^\d{4}-\d{2}-\d{2}$/.test(date), 'Start date must be in YYYY-MM-DD format'),

  end_date: z.string().optional()
    .refine((date) => !date || /^\d{4}-\d{2}-\d{2}$/.test(date), 'End date must be in YYYY-MM-DD format'),

  search: z.string().optional()
    .transform((val) => val?.trim())
    .refine((val) => !val || val.length >= 2, 'Search term must be at least 2 characters'),

  page: z.string().optional().transform((val) => val ? parseInt(val, 10) : 1)
    .refine((val) => val > 0, 'Page must be positive'),

  limit: z.string().optional().transform((val) => val ? parseInt(val, 10) : 10)
    .refine((val) => val > 0 && val <= 100, 'Limit must be between 1 and 100'),
}).refine((data) => {
  if (data.start_date && data.end_date) {
    return new Date(data.start_date) <= new Date(data.end_date);
  }
  return true;
}, {
  message: 'Start date must be before or equal to end date',
  path: ['end_date'],
});

/**
 * Attendance report validation schemas
 */
export const attendanceReportSchema = z.object({
  start_date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'),

  end_date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format'),

  user_ids: z.array(z.number().int().positive()).optional()
    .refine((ids) => !ids || ids.length <= 100, 'Cannot generate report for more than 100 users'),

  include_weekends: z.boolean().default(false),

  format: z.enum(['json', 'csv', 'pdf']).default('json'),
}).refine((data) => {
  const start = new Date(data.start_date);
  const end = new Date(data.end_date);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return start <= end && diffDays <= 365;
}, {
  message: 'Date range must be valid and not exceed 365 days',
  path: ['end_date'],
});

/**
 * Hono validators for easy use in routes
 */
export const validateCreateAttendance = zValidator('json', createAttendanceSchema);
export const validateUpdateAttendance = zValidator('json', updateAttendanceSchema);
export const validateAttendanceId = zValidator('param', attendanceIdSchema);
export const validateAttendanceQuery = zValidator('query', attendanceQuerySchema);
export const validateBulkAttendance = zValidator('json', bulkAttendanceSchema);

export const validateCreateGuest = zValidator('json', createGuestSchema);
export const validateUpdateGuest = zValidator('json', updateGuestSchema);
export const validateGuestId = zValidator('param', guestIdSchema);
export const validateGuestQuery = zValidator('query', guestQuerySchema);

// Form validators for guest operations (for form-data with file uploads)
export const validateCreateGuestForm = zValidator('form', guestSchema.omit({ signature: true }));
export const validateUpdateGuestForm = zValidator('form', updateGuestSchema.omit({ signature: true }));

export const validateAttendanceReport = zValidator('json', attendanceReportSchema);
