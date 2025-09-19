import { Hono } from 'hono';
import { authMiddleware } from '@middlewares/auth.middleware.js';
import { AcademicController } from '@controllers/academic.controller.js';
import {
  validateCreateAcademicYear,
  validateUpdateAcademicYear,
  validateAcademicYearId,
  validateAcademicYearQuery,
  validateCreatePrincipalAgenda,
  validateUpdatePrincipalAgenda,
  validatePrincipalAgendaId,
  validatePrincipalAgendaQuery,
  validateCreateSurvey,
  validateUpdateSurvey,
  validateSurveyId,
  validateSurveyQuery,
  validateCreateSurveyQuestion,
  validateUpdateSurveyQuestion,
  validateSurveyQuestionId,
  validateSurveyQuestionQuery,
  validateCreateSurveySurveyor,
  validateUpdateSurveySurveyor,
  validateSurveySurveyorId,
  validateSurveySurveyorQuery,
  validateCreateSurveyResponse,
  validateUpdateSurveyResponse,
  validateSurveyResponseId,
  validateSurveyResponseQuery,
  validateBulkSurveyResponse
} from '@validation/academic.validation.js';

const academicRoute = new Hono();

// ============= HEALTH CHECK ROUTE =============

/**
 * Health check endpoint
 * GET /academic/health
 */
academicRoute.get('/health', authMiddleware, AcademicController.healthCheck);

// ============= ACADEMIC YEARS ROUTES =============

// GET /academic/years - Get all academic years with pagination and filtering
academicRoute.get('/years', authMiddleware, validateAcademicYearQuery, AcademicController.getAllAcademicYears);

// GET /academic/years/:id - Get academic year by ID
academicRoute.get('/years/:id', authMiddleware, validateAcademicYearId, AcademicController.getAcademicYearById);

// POST /academic/years - Create new academic year
academicRoute.post('/years', authMiddleware, validateCreateAcademicYear, AcademicController.createAcademicYear);

// PUT /academic/years/:id - Update academic year by ID
academicRoute.put('/years/:id', authMiddleware, validateAcademicYearId, validateUpdateAcademicYear, AcademicController.updateAcademicYear);

// DELETE /academic/years/:id - Soft delete academic year by ID
academicRoute.delete('/years/:id', authMiddleware, validateAcademicYearId, AcademicController.deleteAcademicYear);

// POST /academic/years/:id/restore - Restore soft deleted academic year
academicRoute.post('/years/:id/restore', authMiddleware, validateAcademicYearId, AcademicController.restoreAcademicYear);

// ============= PRINCIPAL AGENDAS ROUTES =============

// GET /academic/agendas - Get all principal agendas with pagination and filtering
academicRoute.get('/agendas', authMiddleware, validatePrincipalAgendaQuery, AcademicController.getAllPrincipalAgendas);

// GET /academic/agendas/:id - Get principal agenda by ID
academicRoute.get('/agendas/:id', authMiddleware, validatePrincipalAgendaId, AcademicController.getPrincipalAgendaById);

// POST /academic/agendas - Create new principal agenda
academicRoute.post('/agendas', authMiddleware, validateCreatePrincipalAgenda, AcademicController.createPrincipalAgenda);

// PUT /academic/agendas/:id - Update principal agenda by ID
academicRoute.put('/agendas/:id', authMiddleware, validatePrincipalAgendaId, validateUpdatePrincipalAgenda, AcademicController.updatePrincipalAgenda);

// DELETE /academic/agendas/:id - Soft delete principal agenda by ID
academicRoute.delete('/agendas/:id', authMiddleware, validatePrincipalAgendaId, AcademicController.deletePrincipalAgenda);

// POST /academic/agendas/:id/restore - Restore soft deleted principal agenda
academicRoute.post('/agendas/:id/restore', authMiddleware, validatePrincipalAgendaId, AcademicController.restorePrincipalAgenda);

// ============= SURVEYS ROUTES =============

// GET /academic/surveys - Get all surveys with pagination and filtering
academicRoute.get('/surveys', validateSurveyQuery, AcademicController.getAllSurveys);

// GET /academic/surveys/:id - Get survey by ID
academicRoute.get('/surveys/:id', validateSurveyId, AcademicController.getSurveyById);

// POST /academic/surveys - Create new survey
academicRoute.post('/surveys', authMiddleware, validateCreateSurvey, AcademicController.createSurvey);

// PUT /academic/surveys/:id - Update survey by ID
academicRoute.put('/surveys/:id', authMiddleware, validateSurveyId, validateUpdateSurvey, AcademicController.updateSurvey);

// DELETE /academic/surveys/:id - Soft delete survey by ID
academicRoute.delete('/surveys/:id', authMiddleware, validateSurveyId, AcademicController.deleteSurvey);

// POST /academic/surveys/:id/restore - Restore soft deleted survey
academicRoute.post('/surveys/:id/restore', authMiddleware, validateSurveyId, AcademicController.restoreSurvey);

// ============= SURVEY QUESTIONS ROUTES =============

// GET /academic/questions - Get all survey questions with pagination and filtering
academicRoute.get('/questions', validateSurveyQuestionQuery, AcademicController.getAllSurveyQuestions);

// GET /academic/questions/:id - Get survey question by ID
academicRoute.get('/questions/:id', validateSurveyQuestionId, AcademicController.getSurveyQuestionById);

// POST /academic/questions - Create new survey question
academicRoute.post('/questions', authMiddleware, validateCreateSurveyQuestion, AcademicController.createSurveyQuestion);

// PUT /academic/questions/:id - Update survey question by ID
academicRoute.put('/questions/:id', authMiddleware, validateSurveyQuestionId, validateUpdateSurveyQuestion, AcademicController.updateSurveyQuestion);

// DELETE /academic/questions/:id - Soft delete survey question by ID
academicRoute.delete('/questions/:id', authMiddleware, validateSurveyQuestionId, AcademicController.deleteSurveyQuestion);

// POST /academic/questions/:id/restore - Restore soft deleted survey question
academicRoute.post('/questions/:id/restore', authMiddleware, validateSurveyQuestionId, AcademicController.restoreSurveyQuestion);

// ============= SURVEY SURVEYORS ROUTES =============

// GET /academic/surveyors - Get all survey surveyors with pagination and filtering
academicRoute.get('/surveyors', validateSurveySurveyorQuery, AcademicController.getAllSurveySurveyors);

// GET /academic/surveyors/:id - Get survey surveyor by ID
academicRoute.get('/surveyors/:id', validateSurveySurveyorId, AcademicController.getSurveySurveyorById);

// POST /academic/surveyors - Create new survey surveyor
academicRoute.post('/surveyors', authMiddleware, validateCreateSurveySurveyor, AcademicController.createSurveySurveyor);

// PUT /academic/surveyors/:id - Update survey surveyor by ID
academicRoute.put('/surveyors/:id', authMiddleware, validateSurveySurveyorId, validateUpdateSurveySurveyor, AcademicController.updateSurveySurveyor);

// DELETE /academic/surveyors/:id - Soft delete survey surveyor by ID
academicRoute.delete('/surveyors/:id', authMiddleware, validateSurveySurveyorId, AcademicController.deleteSurveySurveyor);

// POST /academic/surveyors/:id/restore - Restore soft deleted survey surveyor
academicRoute.post('/surveyors/:id/restore', authMiddleware, validateSurveySurveyorId, AcademicController.restoreSurveySurveyor);

// ============= SURVEY RESPONSES ROUTES =============

// GET /academic/responses - Get all survey responses with pagination and filtering
academicRoute.get('/responses', validateSurveyResponseQuery, AcademicController.getAllSurveyResponses);

// GET /academic/responses/:id - Get survey response by ID
academicRoute.get('/responses/:id', validateSurveyResponseId, AcademicController.getSurveyResponseById);

// POST /academic/responses - Create new survey response
academicRoute.post('/responses', validateCreateSurveyResponse, AcademicController.createSurveyResponse);

// POST /academic/responses/bulk - Create multiple survey responses
academicRoute.post('/responses/bulk', validateBulkSurveyResponse, AcademicController.createBulkSurveyResponses);

// PUT /academic/responses/:id - Update survey response by ID
academicRoute.put('/responses/:id', authMiddleware, validateSurveyResponseId, validateUpdateSurveyResponse, AcademicController.updateSurveyResponse);

// DELETE /academic/responses/:id - Soft delete survey response by ID
academicRoute.delete('/responses/:id', authMiddleware, validateSurveyResponseId, AcademicController.deleteSurveyResponse);

// POST /academic/responses/:id/restore - Restore soft deleted survey response
academicRoute.post('/responses/:id/restore', authMiddleware, validateSurveyResponseId, AcademicController.restoreSurveyResponse);

export { academicRoute };