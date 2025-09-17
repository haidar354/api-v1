import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

/**
 * Academic year validation schemas
 */
export const academicYearSchema = z.object({
  academic_year: z.string()
    .regex(/^\d{4}\/\d{4}$/, 'Year must be in YYYY/YYYY format (e.g., 2024/2025)')
    .refine((year) => {
      const [startYear, endYear] = year.split('/').map(Number);
      return endYear === startYear + 1;
    }, 'End year must be exactly one year after start year')
    .refine((year) => {
      const startYear = parseInt(year.split('/')[0]);
      const currentYear = new Date().getFullYear();
      return startYear >= currentYear - 5 && startYear <= currentYear + 5;
    }, 'Academic year must be within reasonable range (±5 years from current year)'),
  
  is_active: z.boolean().default(false),
});

export const createAcademicYearSchema = academicYearSchema;

export const updateAcademicYearSchema = academicYearSchema.partial();

export const academicYearIdSchema = z.object({
  id: z.string().transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, 'Invalid academic year ID'),
});

/**
 * Principal agenda validation schemas
 */
export const principalAgendaSchema = z.object({
  event_name: z.string()
    .min(3, 'Event name must be at least 3 characters')
    .max(255, 'Event name must not exceed 255 characters')
    .transform((val) => val.trim()),
  
  description: z.string()
    .max(2000, 'Description must not exceed 2000 characters')
    .transform((val) => val?.trim())
    .optional(),
  
  event_date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/, 'Event date must be in ISO 8601 format')
    .refine((date) => {
      const parsedDate = new Date(date);
      const now = new Date();
      const twoYearsFromNow = new Date();
      twoYearsFromNow.setFullYear(now.getFullYear() + 2);
      
      return parsedDate >= now && parsedDate <= twoYearsFromNow;
    }, 'Event date must be in the future but not more than 2 years ahead'),
});

export const createPrincipalAgendaSchema = principalAgendaSchema;

export const updatePrincipalAgendaSchema = principalAgendaSchema.partial().extend({
  event_date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/, 'Event date must be in ISO 8601 format')
    .refine((date) => {
      const parsedDate = new Date(date);
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      const twoYearsFromNow = new Date();
      twoYearsFromNow.setFullYear(twoYearsFromNow.getFullYear() + 2);
      
      return parsedDate >= oneYearAgo && parsedDate <= twoYearsFromNow;
    }, 'Event date must be within reasonable range')
    .optional(),
});

export const principalAgendaIdSchema = z.object({
  id: z.string().transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, 'Invalid principal agenda ID'),
});

/**
 * Survey validation schemas
 */
export const surveySchema = z.object({
  title: z.string()
    .min(5, 'Survey title must be at least 5 characters')
    .max(255, 'Survey title must not exceed 255 characters')
    .transform((val) => val.trim()),
  
  description: z.string()
    .max(2000, 'Survey description must not exceed 2000 characters')
    .transform((val) => val?.trim())
    .optional(),
  
  academic_year_id: z.number()
    .int('Academic year ID must be an integer')
    .positive('Academic year ID must be positive'),
});

export const createSurveySchema = surveySchema;

export const updateSurveySchema = surveySchema.partial();

export const surveyIdSchema = z.object({
  id: z.string().transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, 'Invalid survey ID'),
});

/**
 * Survey response validation schemas
 */
export const surveyResponseSchema = z.object({
  survey_id: z.number()
    .int('Survey ID must be an integer')
    .positive('Survey ID must be positive'),
  
  question: z.string()
    .min(5, 'Question must be at least 5 characters')
    .max(255, 'Question must not exceed 255 characters')
    .transform((val) => val.trim()),
  
  score: z.number()
    .int('Score must be an integer')
    .min(1, 'Score must be at least 1')
    .max(10, 'Score must not exceed 10'),
  
  surveyor_name: z.string()
    .min(2, 'Surveyor name must be at least 2 characters')
    .max(255, 'Surveyor name must not exceed 255 characters')
    .regex(/^[a-zA-Z\s.'-]+$/, 'Surveyor name can only contain letters, spaces, dots, apostrophes, and hyphens')
    .transform((val) => val.trim()),
  
  surveyor_details: z.string()
    .max(1000, 'Surveyor details must not exceed 1000 characters')
    .transform((val) => val?.trim())
    .optional(),
});

export const createSurveyResponseSchema = surveyResponseSchema;

export const updateSurveyResponseSchema = surveyResponseSchema.partial();

export const surveyResponseIdSchema = z.object({
  id: z.string().transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, 'Invalid survey response ID'),
});

/**
 * Bulk survey response validation schemas
 */
export const bulkSurveyResponseSchema = z.object({
  responses: z.array(surveyResponseSchema)
    .min(1, 'At least one survey response is required')
    .max(1000, 'Cannot process more than 1000 survey responses at once')
    .refine((responses) => {
      // Check if all responses belong to the same survey
      const surveyIds = new Set(responses.map(r => r.survey_id));
      return surveyIds.size === 1;
    }, 'All responses must belong to the same survey'),
});

/**
 * Query parameter schemas
 */
export const academicYearQuerySchema = z.object({
  active: z.string().optional()
    .transform((val) => val === 'true' ? true : val === 'false' ? false : undefined),
  
  year: z.string().optional()
    .refine((year) => !year || /^\d{4}\/\d{4}$/.test(year), 'Year must be in YYYY/YYYY format'),
  
  page: z.string().optional().transform((val) => val ? parseInt(val, 10) : 1)
    .refine((val) => val > 0, 'Page must be positive'),
  
  limit: z.string().optional().transform((val) => val ? parseInt(val, 10) : 10)
    .refine((val) => val > 0 && val <= 100, 'Limit must be between 1 and 100'),
});

export const principalAgendaQuerySchema = z.object({
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

export const surveyQuerySchema = z.object({
  academic_year_id: z.string().optional().transform((val) => val ? parseInt(val, 10) : undefined)
    .refine((val) => val === undefined || val > 0, 'Academic year ID must be positive'),
  
  search: z.string().optional()
    .transform((val) => val?.trim())
    .refine((val) => !val || val.length >= 2, 'Search term must be at least 2 characters'),
  
  page: z.string().optional().transform((val) => val ? parseInt(val, 10) : 1)
    .refine((val) => val > 0, 'Page must be positive'),
  
  limit: z.string().optional().transform((val) => val ? parseInt(val, 10) : 10)
    .refine((val) => val > 0 && val <= 100, 'Limit must be between 1 and 100'),
});

export const surveyResponseQuerySchema = z.object({
  survey_id: z.string().optional().transform((val) => val ? parseInt(val, 10) : undefined)
    .refine((val) => val === undefined || val > 0, 'Survey ID must be positive'),
  
  min_score: z.string().optional().transform((val) => val ? parseInt(val, 10) : undefined)
    .refine((val) => val === undefined || (val >= 1 && val <= 10), 'Minimum score must be between 1 and 10'),
  
  max_score: z.string().optional().transform((val) => val ? parseInt(val, 10) : undefined)
    .refine((val) => val === undefined || (val >= 1 && val <= 10), 'Maximum score must be between 1 and 10'),
  
  surveyor_name: z.string().optional()
    .transform((val) => val?.trim()),
  
  page: z.string().optional().transform((val) => val ? parseInt(val, 10) : 1)
    .refine((val) => val > 0, 'Page must be positive'),
  
  limit: z.string().optional().transform((val) => val ? parseInt(val, 10) : 10)
    .refine((val) => val > 0 && val <= 100, 'Limit must be between 1 and 100'),
}).refine((data) => {
  if (data.min_score !== undefined && data.max_score !== undefined) {
    return data.min_score <= data.max_score;
  }
  return true;
}, {
  message: 'Minimum score must be less than or equal to maximum score',
  path: ['max_score'],
});

/**
 * Survey analytics validation schemas
 */
export const surveyAnalyticsSchema = z.object({
  survey_id: z.number().int().positive(),
  include_details: z.boolean().default(false),
  group_by: z.enum(['question', 'score', 'surveyor']).optional(),
});

/**
 * Hono validators for easy use in routes
 */
export const validateCreateAcademicYear = zValidator('json', createAcademicYearSchema);
export const validateUpdateAcademicYear = zValidator('json', updateAcademicYearSchema);
export const validateAcademicYearId = zValidator('param', academicYearIdSchema);
export const validateAcademicYearQuery = zValidator('query', academicYearQuerySchema);

export const validateCreatePrincipalAgenda = zValidator('json', createPrincipalAgendaSchema);
export const validateUpdatePrincipalAgenda = zValidator('json', updatePrincipalAgendaSchema);
export const validatePrincipalAgendaId = zValidator('param', principalAgendaIdSchema);
export const validatePrincipalAgendaQuery = zValidator('query', principalAgendaQuerySchema);

export const validateCreateSurvey = zValidator('json', createSurveySchema);
export const validateUpdateSurvey = zValidator('json', updateSurveySchema);
export const validateSurveyId = zValidator('param', surveyIdSchema);
export const validateSurveyQuery = zValidator('query', surveyQuerySchema);

export const validateCreateSurveyResponse = zValidator('json', createSurveyResponseSchema);
export const validateUpdateSurveyResponse = zValidator('json', updateSurveyResponseSchema);
export const validateSurveyResponseId = zValidator('param', surveyResponseIdSchema);
export const validateSurveyResponseQuery = zValidator('query', surveyResponseQuerySchema);
export const validateBulkSurveyResponse = zValidator('json', bulkSurveyResponseSchema);

export const validateSurveyAnalytics = zValidator('json', surveyAnalyticsSchema);
