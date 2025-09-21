import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

/**
 * Attendance validation schemas
 */
export const attendanceSchema = z.object({
  id_user: z.number()
    .int('User ID must be an integer')
    .positive('User ID must be positive'),

  id_class: z.number()
    .int('Class ID must be an integer')
    .positive('Class ID must be positive')
    .optional().nullable(),

  id_role: z.number()
    .int('Role ID must be an integer')
    .positive('Role ID must be positive'),
    
  date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),

  status: z.array(z.enum(['hadir', 'izin', 'sakit', 'alpha', 'terlambat', 'cuti', 'dinas']))
    .default(['alpha'])
    .refine((arr) => new Set(arr).size === arr.length, {
      message: 'Duplicate status values are not allowed',
    }),

  information: z.string()
    .max(255, 'Information must not exceed 255 characters')
    .transform((val) => val?.trim())
    .optional().nullable(),
});

export const createAttendanceSchema = attendanceSchema;

export const updateAttendanceSchema = attendanceSchema.partial().extend({
  status: z.array(z.enum(['hadir', 'izin', 'sakit', 'alpha', 'terlambat', 'cuti', 'dinas']))
    .optional()
    .refine((arr) => !arr || new Set(arr).size === arr.length, {
      message: 'Duplicate status values are not allowed',
    }),
});

export const attendanceIdSchema = z.object({
  id: z.string().transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, 'Invalid attendance ID WOKKK'),
});

/**
 * Bulk attendance validation schemas
 */
export const attendanceExcelRowSchema = z.object({
  'Nama Lengkap': z.string()
    .min(1, 'Nama Lengkap is required')
    .transform((val) => val?.trim()),
  'nama lengkap': z.string()
    .min(1, 'nama lengkap is required')
    .transform((val) => val?.trim())
    .optional(),

  'Hadir': z.string().optional().nullable(),
  'hadir': z.string().optional().nullable(),

  'Izin': z.string().optional().nullable(),
  'izin': z.string().optional().nullable(),

  'Sakit': z.string().optional().nullable(),
  'sakit': z.string().optional().nullable(),

  'Alpha': z.string().optional().nullable(),
  'alpha': z.string().optional().nullable(),

  'Terlambat': z.string().optional().nullable(),
  'terlambat': z.string().optional().nullable(),

  'Cuti': z.string().optional().nullable(),
  'cuti': z.string().optional().nullable(),

  'Dinas': z.string().optional().nullable(),
  'dinas': z.string().optional().nullable(),

  'Tanggal': z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Tanggal must be in YYYY-MM-DD format'),
  'tanggal': z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'tanggal must be in YYYY-MM-DD format')
    .optional(),

  'Waktu': z.string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, 'Waktu must be in HH:MM or HH:MM:SS format')
    .transform((val) => {
      if (val && val.length === 5) {
        return `${val}:00`;
      }
      return val;
    })
    .optional(),
  'waktu': z.string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, 'waktu must be in HH:MM or HH:MM:SS format')
    .transform((val) => {
      if (val && val.length === 5) {
        return `${val}:00`;
      }
      return val;
    })
    .optional(),

  'Informasi': z.string()
    .max(255, 'Informasi must not exceed 255 characters')
    .transform((val) => val?.trim())
    .optional().nullable(),
  'informasi': z.string()
    .max(255, 'informasi must not exceed 255 characters')
    .transform((val) => val?.trim())
    .optional().nullable(),
}).passthrough(); // Allow additional properties

export const bulkAttendanceSchema = z.union([
  // Excel format
  z.object({
    type: z.literal('excel'),
    data: z.array(attendanceExcelRowSchema)
      .min(1, 'At least one attendance record is required')
      .max(500, 'Cannot process more than 500 attendance records at once'),
  }),
  // Standard format with type field
  z.object({
    type: z.literal('standard'),
    attendances: z.array(attendanceSchema)
      .min(1, 'At least one attendance record is required')
      .max(500, 'Cannot process more than 500 attendance records at once'),
  }),
  // Legacy format without type field
  z.object({
    attendances: z.array(attendanceSchema)
      .min(1, 'At least one attendance record is required')
      .max(500, 'Cannot process more than 500 attendance records at once'),
  }),
]);

/**
 * Attendance query validation schemas
 */
export const attendanceQuerySchema = z.object({
  id_user: z.string().optional().transform((val) => val ? parseInt(val, 10) : undefined)
    .refine((val) => val === undefined || (val > 0), 'User ID must be positive'),

  id_role: z.string().optional().transform((val) => val ? parseInt(val, 10) : undefined)
    .refine((val) => val === undefined || (val > 0), 'Role ID must be positive'),

  id_class: z.string().optional().transform((val) => val ? parseInt(val, 10) : undefined)
    .refine((val) => val === undefined || (val > 0), 'Class ID must be positive'),

  start_date: z.string().optional()
    .refine((date) => !date || /^\d{4}-\d{2}-\d{2}$/.test(date), 'Start date must be in YYYY-MM-DD format'),

  end_date: z.string().optional()
    .refine((date) => !date || /^\d{4}-\d{2}-\d{2}$/.test(date), 'End date must be in YYYY-MM-DD format'),

  status: z.enum(['hadir', 'izin', 'sakit', 'alpha', 'terlambat', 'cuti', 'dinas']).optional(),

  full_name: z.string().optional()
    .transform((val) => val?.trim())
    .refine((val) => !val || val.length >= 2, 'Full name search must be at least 2 characters'),

  page: z.string().optional().transform((val) => val ? parseInt(val, 10) : 1)
    .refine((val) => val > 0, 'Page must be positive'),

  limit: z.string().optional().transform((val) => val ? parseInt(val, 10) : 10)
    .refine((val) => val > 0 && val <= 10000, 'Limit must be between 1 and 100'),
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
 * Attendance statistics validation schemas
 */
export const attendanceStatsSchema = z.object({
  id_user: z.string().optional().transform((val) => val ? parseInt(val, 10) : undefined)
    .refine((val) => val === undefined || (val > 0), 'User ID must be positive'),

  id_role: z.string().optional().transform((val) => val ? parseInt(val, 10) : undefined)
    .refine((val) => val === undefined || (val > 0), 'Role ID must be positive'),

  id_class: z.string().optional().transform((val) => val ? parseInt(val, 10) : undefined)
    .refine((val) => val === undefined || (val > 0), 'Class ID must be positive'),

  start_date: z.string().optional()
    .refine((date) => !date || /^\d{4}-\d{2}-\d{2}$/.test(date), 'Start date must be in YYYY-MM-DD format'),

  end_date: z.string().optional()
    .refine((date) => !date || /^\d{4}-\d{2}-\d{2}$/.test(date), 'End date must be in YYYY-MM-DD format'),
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
 * Attendance by class validation schemas
 */
export const attendanceByClassSchema = z.object({
  start_date: z.string().optional()
    .refine((date) => !date || /^\d{4}-\d{2}-\d{2}$/.test(date), 'Start date must be in YYYY-MM-DD format'),

  end_date: z.string().optional()
    .refine((date) => !date || /^\d{4}-\d{2}-\d{2}$/.test(date), 'End date must be in YYYY-MM-DD format'),

  id_class: z.string().optional().transform((val) => val ? parseInt(val, 10) : undefined)
    .refine((val) => val === undefined || (val > 0), 'Class ID must be positive'),

  include_relations: z.string().optional()
    .transform((val) => val === 'true' || val === '1')
    .default(false),
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
 * Attendance by students validation schemas
 */
export const attendanceByStudentsSchema = z.object({
  page: z.string().optional().transform((val) => val ? parseInt(val, 10) : 1)
    .refine((val) => val > 0, 'Page must be positive'),

  limit: z.string().optional().transform((val) => val ? parseInt(val, 10) : 10)
    .refine((val) => val > 0 && val <= 100, 'Limit must be between 1 and 100'),

  id_class: z.string().optional().transform((val) => val ? parseInt(val, 10) : undefined)
    .refine((val) => val === undefined || (val > 0), 'Class ID must be positive'),

  id_department: z.string().optional().transform((val) => val ? parseInt(val, 10) : undefined)
    .refine((val) => val === undefined || (val > 0), 'Department ID must be positive'),

  id_academic_year: z.string().optional().transform((val) => val ? parseInt(val, 10) : undefined)
    .refine((val) => val === undefined || (val > 0), 'Academic Year ID must be positive'),

  start_date: z.string().optional()
    .refine((date) => !date || /^\d{4}-\d{2}-\d{2}$/.test(date), 'Start date must be in YYYY-MM-DD format'),

  end_date: z.string().optional()
    .refine((date) => !date || /^\d{4}-\d{2}-\d{2}$/.test(date), 'End date must be in YYYY-MM-DD format'),

  include_relations: z.string().optional()
    .transform((val) => val === 'true' || val === '1')
    .default(false),
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
 * Attendance user stats validation schemas
 */
export const attendanceUserStatsSchema = z.object({
  start_date: z.string().optional()
    .refine((date) => !date || /^\d{4}-\d{2}-\d{2}$/.test(date), 'Start date must be in YYYY-MM-DD format'),

  end_date: z.string().optional()
    .refine((date) => !date || /^\d{4}-\d{2}-\d{2}$/.test(date), 'End date must be in YYYY-MM-DD format'),

  id_class: z.string().optional().transform((val) => val ? parseInt(val, 10) : undefined)
    .refine((val) => val === undefined || (val > 0), 'Class ID must be positive'),

  id_role: z.string().optional().transform((val) => val ? parseInt(val, 10) : undefined)
    .refine((val) => val === undefined || (val > 0), 'Role ID must be positive'),

  include_relations: z.string().optional()
    .transform((val) => val === 'true' || val === '1')
    .default(false),

  full_name: z.string().optional()
    .transform((val) => val?.trim())
    .refine((val) => !val || val.length >= 2, 'Full name search must be at least 2 characters'),
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

  signature: z.string()
    .min(5, 'Signature must be at least 5 characters')
    .max(255, 'Signature must not exceed 255 characters')
    .transform((val) => val.trim())
    .optional(),
});

export const createGuestSchema = guestSchema.omit({ signature: true });

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
export const guestQuerySchema = z
  .object({
    start_date: z
      .string()
      .optional()
      .refine(
        (date) => !date || /^\d{4}-\d{2}-\d{2}$/.test(date),
        "Start date must be in YYYY-MM-DD format"
      ),

    end_date: z
      .string()
      .optional()
      .refine(
        (date) => !date || /^\d{4}-\d{2}-\d{2}$/.test(date),
        "End date must be in YYYY-MM-DD format"
      ),

    search: z
      .string()
      .optional()
      .transform((val) => val?.trim())
      .refine(
        (val) => !val || val.length >= 2,
        "Search term must be at least 2 characters"
      ),

    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 1))
      .refine((val) => val > 0, "Page must be positive"),

    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 10))
      .refine(
        (val) => val > 0 && val <= 10000,
        "Limit must be between 1 and 100"
      ),

    // Parameter baru untuk monthly breakdown
    statistics_month: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.start_date && data.end_date) {
        return new Date(data.start_date) <= new Date(data.end_date);
      }
      return true;
    },
    {
      message: "Start date must be before or equal to end date",
      path: ["end_date"],
    }
  );


/**
 * Attendance report validation schemas
 */
export const attendanceReportSchema = z.object({
  start_date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'),

  end_date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format'),

  id_users: z.array(z.number().int().positive()).optional()
    .refine((ids) => !ids || ids.length <= 100, 'Cannot generate report for more than 100 users'),

  id_roles: z.array(z.number().int().positive()).optional()
    .refine((ids) => !ids || ids.length <= 50, 'Cannot generate report for more than 50 roles'),

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
export const validateAttendanceStats = zValidator('query', attendanceStatsSchema);
export const validateBulkAttendance = zValidator('json', bulkAttendanceSchema);

export const validateCreateGuest = zValidator('json', createGuestSchema);
export const validateUpdateGuest = zValidator('json', updateGuestSchema);
export const validateGuestId = zValidator('param', guestIdSchema);
export const validateGuestQuery = zValidator('query', guestQuerySchema);

// Form validators for guest operations (for form-data with file uploads)
export const validateCreateGuestForm = zValidator('form', guestSchema.omit({ signature: true }));
export const validateUpdateGuestForm = zValidator('form', updateGuestSchema.omit({ signature: true }));

export const validateAttendanceReport = zValidator('json', attendanceReportSchema);

export const validateAttendanceByClass = zValidator('query', attendanceByClassSchema);
export const validateAttendanceByStudents = zValidator('query', attendanceByStudentsSchema);
export const validateAttendanceUserStats = zValidator('query', attendanceUserStatsSchema);
