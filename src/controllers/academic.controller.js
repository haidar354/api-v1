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
      
      return jsonResponse({ message: response.data ? "Academic year deleted successfully" : "Failed to delete academic year" }, response.status);
    } catch (error) {
      return errorResponse(error.message, 400);
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
      
      return jsonResponse({ message: response.data ? "Principal agenda deleted successfully" : "Failed to delete principal agenda" }, response.status);
    } catch (error) {
      return errorResponse(error.message, 400);
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
      
      return jsonResponse({ message: response.data ? "Survey deleted successfully" : "Failed to delete survey" }, response.status);
    } catch (error) {
      return errorResponse(error.message, 400);
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
      
      return jsonResponse({ message: response.data ? "Survey response deleted successfully" : "Failed to delete survey response" }, response.status);
    } catch (error) {
      return errorResponse(error.message, 400);
    }
  }
}