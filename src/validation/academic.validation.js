import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

/**
 * Academic year validation schemas
 */
export const academicYearSchema = z.object({
  year: z.string()
    .regex(/^\d{4}\/\d{4}$/, 'Year must be in YYYY/YYYY format (e.g., 2024/2025)')
    .refine((year) => {
      const [startYear, endYear] = year.split('/').map(Number);
      return endYear === startYear + 1;
    }, 'End year must be exactly one year after start year'),

  start_date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format')
    .refine((date) => {
      const parsed_date = new Date(date);
      return !isNaN(parsed_date.getTime());
    }, 'Start date must be a valid date'),

  end_date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format')
    .refine((date) => {
      const parsed_date = new Date(date);
      return !isNaN(parsed_date.getTime());
    }, 'End date must be a valid date'),

  is_active: z.boolean().default(false),
}).refine((data) => {
  const start_date = new Date(data.start_date);
  const end_date = new Date(data.end_date);
  return end_date > start_date;
}, {
  message: 'End date must be after start date',
  path: ['end_date']
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

  id_academic_year: z.number()
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
 * Survey questions validation schemas
 */
export const surveyQuestionSchema = z.object({
  id_survey: z.number()
    .int('Survey ID must be an integer')
    .positive('Survey ID must be positive'),

  question: z.string()
    .min(5, 'Question must be at least 5 characters')
    .max(255, 'Question must not exceed 255 characters')
    .transform((val) => val.trim()),

  description: z.string()
    .max(255, 'Description must not exceed 255 characters')
    .transform((val) => val?.trim())
    .optional(),
});

export const createSurveyQuestionSchema = surveyQuestionSchema;

export const updateSurveyQuestionSchema = surveyQuestionSchema.partial();

export const surveyQuestionIdSchema = z.object({
  id: z.string().transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, 'Invalid survey question ID'),
});

export const surveyQuestionQuerySchema = z.object({
  id_survey: z.string().optional().transform((val) => val ? parseInt(val, 10) : undefined)
    .refine((val) => val === undefined || val > 0, 'Survey ID must be positive'),

  search: z.string().optional()
    .transform((val) => val?.trim())
    .refine((val) => !val || val.length >= 2, 'Search term must be at least 2 characters'),

  page: z.string().optional().transform((val) => val ? parseInt(val, 10) : 1)
    .refine((val) => val > 0, 'Page must be positive'),

  limit: z.string().optional().transform((val) => val ? parseInt(val, 10) : 10)
    .refine((val) => val > 0 && val <= 100, 'Limit must be between 1 and 100'),
});

/**
 * Survey surveyors validation schemas
 */
export const surveySurveyorSchema = z.object({
  id_survey: z.number()
    .int('Survey ID must be an integer')
    .positive('Survey ID must be positive'),

  name: z.string()
    .min(2, 'Surveyor name must be at least 2 characters')
    .max(255, 'Surveyor name must not exceed 255 characters')
    .regex(/^[a-zA-Z\s.'-]+$/, 'Surveyor name can only contain letters, spaces, dots, apostrophes, and hyphens')
    .transform((val) => val.trim()),

  organization: z.string()
    .max(255, 'Organization must not exceed 255 characters')
    .transform((val) => val?.trim())
    .optional(),

  feedback: z.string()
    .max(255, 'Feedback must not exceed 255 characters')
    .transform((val) => val?.trim())
    .optional(),
});

export const createSurveySurveyorSchema = surveySurveyorSchema;

export const updateSurveySurveyorSchema = surveySurveyorSchema.partial();

export const surveySurveyorIdSchema = z.object({
  id: z.string().transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, 'Invalid survey surveyor ID'),
});

export const surveySurveyorQuerySchema = z.object({
  id_survey: z.string().optional().transform((val) => val ? parseInt(val, 10) : undefined)
    .refine((val) => val === undefined || val > 0, 'Survey ID must be positive'),

  search: z.string().optional()
    .transform((val) => val?.trim())
    .refine((val) => !val || val.length >= 2, 'Search term must be at least 2 characters'),

  page: z.string().optional().transform((val) => val ? parseInt(val, 10) : 1)
    .refine((val) => val > 0, 'Page must be positive'),

  limit: z.string().optional().transform((val) => val ? parseInt(val, 10) : 10)
    .refine((val) => val > 0 && val <= 100, 'Limit must be between 1 and 100'),
});

/**
 * Survey response validation schemas
 */
export const surveyResponseSchema = z.object({
  id_survey: z.number()
    .int('Survey ID must be an integer')
    .positive('Survey ID must be positive'),

  id_survey_question: z.number()
    .int('Survey question ID must be an integer')
    .positive('Survey question ID must be positive'),

  id_survey_surveyor: z.number()
    .int('Survey surveyor ID must be an integer')
    .positive('Survey surveyor ID must be positive'),

  score: z.number()
    .int('Score must be an integer')
    .min(1, 'Score must be at least 1')
    .max(5, 'Score must not exceed 5'),
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
      const surveyIds = new Set(responses.map(r => r.id_survey));
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
  id_academic_year: z.string().optional().transform((val) => val ? parseInt(val, 10) : undefined)
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
  id_survey: z.string().optional().transform((val) => val ? parseInt(val, 10) : undefined)
    .refine((val) => val === undefined || val > 0, 'Survey ID must be positive'),

  id_survey_question: z.string().optional().transform((val) => val ? parseInt(val, 10) : undefined)
    .refine((val) => val === undefined || val > 0, 'Survey question ID must be positive'),

  id_survey_surveyor: z.string().optional().transform((val) => val ? parseInt(val, 10) : undefined)
    .refine((val) => val === undefined || val > 0, 'Survey surveyor ID must be positive'),

  score: z.string().optional().transform((val) => val ? parseInt(val, 10) : undefined)
    .refine((val) => val === undefined || (val >= 1 && val <= 5), 'Score must be between 1 and 5'),

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
  id_survey: z.number().int().positive(),
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

export const validateCreateSurveyQuestion = zValidator('json', createSurveyQuestionSchema);
export const validateUpdateSurveyQuestion = zValidator('json', updateSurveyQuestionSchema);
export const validateSurveyQuestionId = zValidator('param', surveyQuestionIdSchema);
export const validateSurveyQuestionQuery = zValidator('query', surveyQuestionQuerySchema);

export const validateCreateSurveyResponse = zValidator('json', createSurveyResponseSchema);
export const validateUpdateSurveyResponse = zValidator('json', updateSurveyResponseSchema);
export const validateSurveyResponseId = zValidator('param', surveyResponseIdSchema);
export const validateSurveyResponseQuery = zValidator('query', surveyResponseQuerySchema);
export const validateBulkSurveyResponse = zValidator('json', bulkSurveyResponseSchema);

export const validateCreateSurveySurveyor = zValidator('json', createSurveySurveyorSchema);
export const validateUpdateSurveySurveyor = zValidator('json', updateSurveySurveyorSchema);
export const validateSurveySurveyorId = zValidator('param', surveySurveyorIdSchema);
export const validateSurveySurveyorQuery = zValidator('query', surveySurveyorQuerySchema);

export const validateSurveyAnalytics = zValidator('json', surveyAnalyticsSchema);
