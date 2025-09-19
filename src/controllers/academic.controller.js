import { AcademicService } from '@services/academic.service.js';
import { jsonResponse, errorResponse } from '@utils/response.utils.js';

/**
 * Academic Controller
 * Handles HTTP requests for academic-related operations
 */
export class AcademicController {
  // ============= ACADEMIC YEARS CONTROLLERS =============

  /**
   * Create a new academic year
   * @param {Object} c - Hono context object
   * @returns {Promise<Response>} JSON response
   */
  static async createAcademicYear(c) {
    try {
      const academic_year_data = c.req.valid('json');
      const response = await AcademicService.createAcademicYear(academic_year_data);
      
      return jsonResponse(response.data, response.status);
    } catch (error) {
      return errorResponse(error.message, 400);
    }
  }

  /**
   * Get all academic years with pagination and filtering
   * @param {Object} c - Hono context object
   * @returns {Promise<Response>} JSON response
   */
  static async getAllAcademicYears(c) {
    try {
      const query_params = c.req.valid('query');
      const response = await AcademicService.getAllAcademicYears(query_params);
      
      return jsonResponse(response.data, response.status, response.pagination);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  /**
   * Get academic year by ID
   * @param {Object} c - Hono context object
   * @returns {Promise<Response>} JSON response
   */
  static async getAcademicYearById(c) {
    try {
      const { id } = c.req.valid('param');
      const response = await AcademicService.getAcademicYearById(id);
      
      if (!response.data) {
        return errorResponse('Academic year not found', 404);
      }

      return jsonResponse(response.data, response.status);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  /**
   * Update academic year by ID
   * @param {Object} c - Hono context object
   * @returns {Promise<Response>} JSON response
   */
  static async updateAcademicYear(c) {
    try {
      const { id } = c.req.valid('param');
      const update_data = c.req.valid('json');
      const response = await AcademicService.updateAcademicYear(id, update_data);
      
      return jsonResponse(response.data, response.status);
    } catch (error) {
      return errorResponse(error.message, 400);
    }
  }

  /**
   * Soft delete academic year by ID
   * @param {Object} c - Hono context object
   * @returns {Promise<Response>} JSON response
   */
  static async deleteAcademicYear(c) {
    try {
      const { id } = c.req.valid('param');
      const response = await AcademicService.deleteAcademicYear(id);
      
      return jsonResponse({ message: response.status === 200 ? "Academic year deleted successfully" : "Failed to delete academic year" }, response.status);
    } catch (error) {
      return errorResponse(error.message, 400);
    }
  }

  /**
   * Restore soft deleted academic year
   * @param {Object} c - Hono context object
   * @returns {Promise<Response>} JSON response
   */
  static async restoreAcademicYear(c) {
    try {
      const { id } = c.req.valid('param');
      const response = await AcademicService.restoreAcademicYear(parseInt(id));
      
      return jsonResponse(response.data, response.status);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  // ============= PRINCIPAL AGENDAS CONTROLLERS =============

  /**
   * Create a new principal agenda
   * @param {Object} c - Hono context object
   * @returns {Promise<Response>} JSON response
   */
  static async createPrincipalAgenda(c) {
    try {
      const agenda_data = c.req.valid('json');
      const response = await AcademicService.createPrincipalAgenda(agenda_data);
      
      return jsonResponse(response.data, response.status);
    } catch (error) {
      return errorResponse(error.message, 400);
    }
  }

  /**
   * Get all principal agendas with pagination and filtering
   * @param {Object} c - Hono context object
   * @returns {Promise<Response>} JSON response
   */
  static async getAllPrincipalAgendas(c) {
    try {
      const query_params = c.req.valid('query');
      const response = await AcademicService.getAllPrincipalAgendas(query_params);
      
      return jsonResponse(response.data, response.status, response.pagination);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  /**
   * Get principal agenda by ID
   * @param {Object} c - Hono context object
   * @returns {Promise<Response>} JSON response
   */
  static async getPrincipalAgendaById(c) {
    try {
      const { id } = c.req.valid('param');
      const response = await AcademicService.getPrincipalAgendaById(id);
      
      if (!response.data) {
        return errorResponse('Principal agenda not found', 404);
      }

      return jsonResponse(response.data, response.status);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  /**
   * Update principal agenda by ID
   * @param {Object} c - Hono context object
   * @returns {Promise<Response>} JSON response
   */
  static async updatePrincipalAgenda(c) {
    try {
      const { id } = c.req.valid('param');
      const update_data = c.req.valid('json');
      const response = await AcademicService.updatePrincipalAgenda(id, update_data);
      
      return jsonResponse(response.data, response.status);
    } catch (error) {
      return errorResponse(error.message, 400);
    }
  }

  /**
   * Soft delete principal agenda by ID
   * @param {Object} c - Hono context object
   * @returns {Promise<Response>} JSON response
   */
  static async deletePrincipalAgenda(c) {
    try {
      const { id } = c.req.valid('param');
      const response = await AcademicService.deletePrincipalAgenda(id);
      
      return jsonResponse({ message: response.status === 200 ? "Principal agenda deleted successfully" : "Failed to delete principal agenda" }, response.status);
    } catch (error) {
      return errorResponse(error.message, 400);
    }
  }

  /**
   * Restore soft deleted principal agenda
   * @param {Object} c - Hono context object
   * @returns {Promise<Response>} JSON response
   */
  static async restorePrincipalAgenda(c) {
    try {
      const { id } = c.req.valid('param');
      const response = await AcademicService.restorePrincipalAgenda(parseInt(id));
      
      return jsonResponse(response.data, response.status);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  // ============= SURVEYS CONTROLLERS =============

  /**
   * Create a new survey
   * @param {Object} c - Hono context object
   * @returns {Promise<Response>} JSON response
   */
  static async createSurvey(c) {
    try {
      const survey_data = c.req.valid('json');
      const response = await AcademicService.createSurvey(survey_data);
      
      return jsonResponse(response.data, response.status);
    } catch (error) {
      return errorResponse(error.message, 400);
    }
  }

  /**
   * Get all surveys with pagination and filtering
   * @param {Object} c - Hono context object
   * @returns {Promise<Response>} JSON response
   */
  static async getAllSurveys(c) {
    try {
      const query_params = c.req.valid('query');
      const response = await AcademicService.getAllSurveys(query_params);
      
      return jsonResponse(response.data, response.status, response.pagination);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  /**
   * Get survey by ID
   * @param {Object} c - Hono context object
   * @returns {Promise<Response>} JSON response
   */
  static async getSurveyById(c) {
    try {
      const { id } = c.req.valid('param');
      const response = await AcademicService.getSurveyById(id);
      
      if (!response.data) {
        return errorResponse('Survey not found', 404);
      }

      return jsonResponse(response.data, response.status);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  /**
   * Update survey by ID
   * @param {Object} c - Hono context object
   * @returns {Promise<Response>} JSON response
   */
  static async updateSurvey(c) {
    try {
      const { id } = c.req.valid('param');
      const update_data = c.req.valid('json');
      const response = await AcademicService.updateSurvey(id, update_data);
      
      return jsonResponse(response.data, response.status);
    } catch (error) {
      return errorResponse(error.message, 400);
    }
  }

  /**
   * Soft delete survey by ID
   * @param {Object} c - Hono context object
   * @returns {Promise<Response>} JSON response
   */
  static async deleteSurvey(c) {
    try {
      const { id } = c.req.valid('param');
      const response = await AcademicService.deleteSurvey(id);
      
      return jsonResponse({ message: response.status === 200 ? "Survey deleted successfully" : "Failed to delete survey" }, response.status);
    } catch (error) {
      return errorResponse(error.message, 400);
    }
  }

  /**
   * Restore soft deleted survey
   * @param {Object} c - Hono context object
   * @returns {Promise<Response>} JSON response
   */
  static async restoreSurvey(c) {
    try {
      const { id } = c.req.valid('param');
      const response = await AcademicService.restoreSurvey(parseInt(id));
      
      return jsonResponse(response.data, response.status);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  // ============= SURVEY QUESTIONS CONTROLLERS =============

  /**
   * Create a new survey question
   * @param {Object} c - Hono context object
   * @returns {Promise<Response>} JSON response
   */
  static async createSurveyQuestion(c) {
    try {
      const question_data = c.req.valid('json');
      const response = await AcademicService.createSurveyQuestion(question_data);
      
      return jsonResponse(response.data, response.status);
    } catch (error) {
      return errorResponse(error.message, 400);
    }
  }

  /**
   * Get all survey questions with pagination and filtering
   * @param {Object} c - Hono context object
   * @returns {Promise<Response>} JSON response
   */
  static async getAllSurveyQuestions(c) {
    try {
      const query_params = c.req.valid('query');
      const response = await AcademicService.getAllSurveyQuestions(query_params);
      
      return jsonResponse(response.data, response.status, response.pagination);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  /**
   * Get survey question by ID
   * @param {Object} c - Hono context object
   * @returns {Promise<Response>} JSON response
   */
  static async getSurveyQuestionById(c) {
    try {
      const { id } = c.req.valid('param');
      const response = await AcademicService.getSurveyQuestionById(id);
      
      if (!response.data) {
        return errorResponse('Survey question not found', 404);
      }

      return jsonResponse(response.data, response.status);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  /**
   * Update survey question by ID
   * @param {Object} c - Hono context object
   * @returns {Promise<Response>} JSON response
   */
  static async updateSurveyQuestion(c) {
    try {
      const { id } = c.req.valid('param');
      const update_data = c.req.valid('json');
      const response = await AcademicService.updateSurveyQuestion(id, update_data);
      
      return jsonResponse(response.data, response.status);
    } catch (error) {
      return errorResponse(error.message, 400);
    }
  }

  /**
   * Soft delete survey question by ID
   * @param {Object} c - Hono context object
   * @returns {Promise<Response>} JSON response
   */
  static async deleteSurveyQuestion(c) {
    try {
      const { id } = c.req.valid('param');
      const response = await AcademicService.deleteSurveyQuestion(id);
      
      return jsonResponse({ message: response.status === 200 ? "Survey question deleted successfully" : "Failed to delete survey question" }, response.status);
    } catch (error) {
      return errorResponse(error.message, 400);
    }
  }

  /**
   * Restore soft deleted survey question
   * @param {Object} c - Hono context object
   * @returns {Promise<Response>} JSON response
   */
  static async restoreSurveyQuestion(c) {
    try {
      const { id } = c.req.valid('param');
      const response = await AcademicService.restoreSurveyQuestion(parseInt(id));
      
      return jsonResponse(response.data, response.status);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  // ============= SURVEY RESPONSES CONTROLLERS =============

  /**
   * Create a new survey response
   * @param {Object} c - Hono context object
   * @returns {Promise<Response>} JSON response
   */
  static async createSurveyResponse(c) {
    try {
      const response_data = c.req.valid('json');
      const response = await AcademicService.createSurveyResponse(response_data);
      
      return jsonResponse(response.data, response.status);
    } catch (error) {
      return errorResponse(error.message, 400);
    }
  }

  /**
   * Create multiple survey responses
   * @param {Object} c - Hono context object
   * @returns {Promise<Response>} JSON response
   */
  static async createBulkSurveyResponses(c) {
    try {
      const bulk_data = c.req.valid('json');
      const response = await AcademicService.createBulkSurveyResponses(bulk_data.responses);
      
      return jsonResponse(response.data, response.status);
    } catch (error) {
      return errorResponse(error.message, 400);
    }
  }

  /**
   * Get all survey responses with pagination and filtering
   * @param {Object} c - Hono context object
   * @returns {Promise<Response>} JSON response
   */
  static async getAllSurveyResponses(c) {
    try {
      const query_params = c.req.valid('query');
      const response = await AcademicService.getAllSurveyResponses(query_params);
      
      return jsonResponse(response.data, response.status, response.pagination);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  /**
   * Get survey response by ID
   * @param {Object} c - Hono context object
   * @returns {Promise<Response>} JSON response
   */
  static async getSurveyResponseById(c) {
    try {
      const { id } = c.req.valid('param');
      const response = await AcademicService.getSurveyResponseById(id);
      
      if (!response.data) {
        return errorResponse('Survey response not found', 404);
      }

      return jsonResponse(response.data, response.status);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  /**
   * Update survey response by ID
   * @param {Object} c - Hono context object
   * @returns {Promise<Response>} JSON response
   */
  static async updateSurveyResponse(c) {
    try {
      const { id } = c.req.valid('param');
      const update_data = c.req.valid('json');
      const response = await AcademicService.updateSurveyResponse(id, update_data);
      
      return jsonResponse(response.data, response.status);
    } catch (error) {
      return errorResponse(error.message, 400);
    }
  }

  /**
   * Soft delete survey response by ID
   * @param {Object} c - Hono context object
   * @returns {Promise<Response>} JSON response
   */
  static async deleteSurveyResponse(c) {
    try {
      const { id } = c.req.valid('param');
      const response = await AcademicService.deleteSurveyResponse(id);
      
      return jsonResponse({ message: response.status === 200 ? "Survey response deleted successfully" : "Failed to delete survey response" }, response.status);
    } catch (error) {
      return errorResponse(error.message, 400);
    }
  }

  /**
   * Restore soft deleted survey response
   * @param {Object} c - Hono context object
   * @returns {Promise<Response>} JSON response
   */
  static async restoreSurveyResponse(c) {
    try {
      const { id } = c.req.valid('param');
      const response = await AcademicService.restoreSurveyResponse(parseInt(id));
      
      return jsonResponse(response.data, response.status);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  // ============= SURVEY SURVEYORS CONTROLLERS =============

  /**
   * Create a new survey surveyor
   * @param {Object} c - Hono context object
   * @returns {Promise<Response>} JSON response
   */
  static async createSurveySurveyor(c) {
    try {
      const surveyor_data = c.req.valid('json');
      const response = await AcademicService.createSurveySurveyor(surveyor_data);
      
      return jsonResponse(response.data, response.status);
    } catch (error) {
      return errorResponse(error.message, 400);
    }
  }

  /**
   * Get all survey surveyors with pagination and filtering
   * @param {Object} c - Hono context object
   * @returns {Promise<Response>} JSON response
   */
  static async getAllSurveySurveyors(c) {
    try {
      const query_params = c.req.valid('query');
      const response = await AcademicService.getAllSurveySurveyors(query_params);
      
      return jsonResponse(response.data, response.status, response.pagination);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  /**
   * Get survey surveyor by ID
   * @param {Object} c - Hono context object
   * @returns {Promise<Response>} JSON response
   */
  static async getSurveySurveyorById(c) {
    try {
      const { id } = c.req.valid('param');
      const response = await AcademicService.getSurveySurveyorById(parseInt(id));
      
      if (!response.data) {
        return errorResponse('Survey surveyor not found', 404);
      }

      return jsonResponse(response.data, response.status);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  /**
   * Update survey surveyor by ID
   * @param {Object} c - Hono context object
   * @returns {Promise<Response>} JSON response
   */
  static async updateSurveySurveyor(c) {
    try {
      const { id } = c.req.valid('param');
      const update_data = c.req.valid('json');
      const response = await AcademicService.updateSurveySurveyor(parseInt(id), update_data);
      
      return jsonResponse(response.data, response.status);
    } catch (error) {
      return errorResponse(error.message, 400);
    }
  }

  /**
   * Soft delete survey surveyor by ID
   * @param {Object} c - Hono context object
   * @returns {Promise<Response>} JSON response
   */
  static async deleteSurveySurveyor(c) {
    try {
      const { id } = c.req.valid('param');
      const response = await AcademicService.deleteSurveySurveyor(parseInt(id));
      
      return jsonResponse({ message: response.status === 200 ? "Survey surveyor deleted successfully" : "Failed to delete survey surveyor" }, response.status);
    } catch (error) {
      return errorResponse(error.message, 400);
    }
  }

  /**
   * Restore soft deleted survey surveyor
   * @param {Object} c - Hono context object
   * @returns {Promise<Response>} JSON response
   */
  static async restoreSurveySurveyor(c) {
    try {
      const { id } = c.req.valid('param');
      const response = await AcademicService.restoreSurveySurveyor(parseInt(id));
      
      return jsonResponse(response.data, response.status);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  // ============= HEALTH CHECK CONTROLLER =============

  /**
   * Health check for academic service
   * GET /academic/health
   */
  static async healthCheck(c) {
    try {
      const response = await AcademicService.healthCheck();
      if (response.status >= 200 && response.status < 300) {
        return jsonResponse(response.data, 200);
      } else {
        throw new Error('Service health check failed');
      }
    } catch (error) {
      console.log("ERROR: ", error);
      return errorResponse(error.message, 503);
    }
  }
}