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
  validateCreateSurveyResponse,
  validateUpdateSurveyResponse,
  validateSurveyResponseId,
  validateSurveyResponseQuery,
  validateBulkSurveyResponse
} from '@validation/academic.validation.js';

const academicRoute = new Hono();

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

// ============= SURVEYS ROUTES =============

// GET /academic/surveys - Get all surveys with pagination and filtering
academicRoute.get('/surveys', authMiddleware, validateSurveyQuery, AcademicController.getAllSurveys);

// GET /academic/surveys/:id - Get survey by ID
academicRoute.get('/surveys/:id', authMiddleware, validateSurveyId, AcademicController.getSurveyById);

// POST /academic/surveys - Create new survey
academicRoute.post('/surveys', authMiddleware, validateCreateSurvey, AcademicController.createSurvey);

// PUT /academic/surveys/:id - Update survey by ID
academicRoute.put('/surveys/:id', authMiddleware, validateSurveyId, validateUpdateSurvey, AcademicController.updateSurvey);

// DELETE /academic/surveys/:id - Soft delete survey by ID
academicRoute.delete('/surveys/:id', authMiddleware, validateSurveyId, AcademicController.deleteSurvey);

// ============= SURVEY RESPONSES ROUTES =============

// GET /academic/responses - Get all survey responses with pagination and filtering
academicRoute.get('/responses', authMiddleware, validateSurveyResponseQuery, AcademicController.getAllSurveyResponses);

// GET /academic/responses/:id - Get survey response by ID
academicRoute.get('/responses/:id', authMiddleware, validateSurveyResponseId, AcademicController.getSurveyResponseById);

// POST /academic/responses - Create new survey response
academicRoute.post('/responses', authMiddleware, validateCreateSurveyResponse, AcademicController.createSurveyResponse);

// POST /academic/responses/bulk - Create multiple survey responses
academicRoute.post('/responses/bulk', authMiddleware, validateBulkSurveyResponse, AcademicController.createBulkSurveyResponses);

// PUT /academic/responses/:id - Update survey response by ID
academicRoute.put('/responses/:id', authMiddleware, validateSurveyResponseId, validateUpdateSurveyResponse, AcademicController.updateSurveyResponse);

// DELETE /academic/responses/:id - Soft delete survey response by ID
academicRoute.delete('/responses/:id', authMiddleware, validateSurveyResponseId, AcademicController.deleteSurveyResponse);

export { academicRoute };