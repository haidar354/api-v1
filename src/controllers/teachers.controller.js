import { TeachersService } from '@services/teachers.service.js';
import { jsonResponse, errorResponse } from '@utils/response.utils.js';

/**
 * Teachers Controller
 * Handles HTTP requests for teacher CRUD operations
 */
export class TeachersController {
  /**
   * Create a new teacher
   * POST /teachers
   */
  static async createTeacher(c) {
    try {
      const teacher_data = c.req.valid('json');

      const response = await TeachersService.createTeacher(teacher_data);

      return jsonResponse(response.data, response.status);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  /**
   * Get all teachers with pagination and filtering
   * GET /teachers
   */
  static async getAllTeachers(c) {
    try {
      const query_params = c.req.valid('query');

      const response = await TeachersService.getAllTeachers(query_params);

      return jsonResponse(response.data, response.status, response.pagination);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  /**
   * Get teacher by ID
   * GET /teachers/:id
   */
  static async getTeacherById(c) {
    try {
      const { id } = c.req.valid('param');

      const response = await TeachersService.getTeacherById(parseInt(id));

      if (!response.data) {
        return errorResponse('Teacher not found', 404);
      }

      return jsonResponse(response.data, response.status);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  /**
   * Update teacher by ID
   * PUT /teachers/:id
   */
  static async updateTeacher(c) {
    try {
      const { id } = c.req.valid('param');
      const update_data = c.req.valid('json');

      const response = await TeachersService.updateTeacher(
        parseInt(id),
        update_data
      );

      return jsonResponse(response.data, response.status);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  /**
   * Soft delete teacher by ID
   * DELETE /teachers/:id
   */
  static async deleteTeacher(c) {
    try {
      const { id } = c.req.valid('param');

      const response = await TeachersService.deleteTeacher(parseInt(id));

      return jsonResponse(
        { message: response.data ? "Teacher successfully deleted" : "Failed to delete teacher" },
        response.status
      );
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  /**
   * Restore soft deleted teacher
   * POST /teachers/:id/restore
   */
  static async restoreTeacher(c) {
    try {
      const { id } = c.req.valid('param');

      const response = await TeachersService.restoreTeacher(parseInt(id));

      return jsonResponse(response.data, response.status);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  /**
   * Get teachers statistics by class
   * GET /teachers/stats/classes
   */
  static async getTeachersStatsByClass(c) {
    try {
      const response = await TeachersService.getTeachersCountByClass();

      return jsonResponse(response.data, response.status);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  /**
   * Search teachers by NIP or name
   * GET /teachers/search
   */
  static async searchTeachers(c) {
    try {
      const { q: query, limit = '10' } = c.req.query();

      if (!query || query.trim().length < 2) {
        return errorResponse('Search query must be at least 2 characters', 400);
      }

      const response = await TeachersService.getAllTeachers({
        search: query.trim(),
        limit: parseInt(limit),
        page: 1
      });

      return jsonResponse(response.data, response.status, response.pagination);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  /**
   * Get teachers by class
   * GET /teachers/class/:id_class
   */
  static async getTeachersByClass(c) {
    try {
      const { id_class } = c.req.param();
      const { page = '1', limit = '10' } = c.req.query();

      const response = await TeachersService.getAllTeachers({
        class: id_class,
        page: parseInt(page),
        limit: parseInt(limit)
      });

      return jsonResponse(response.data, response.status, response.pagination);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  /**
   * Bulk create teachers
   * POST /teachers/bulk
   */
  static async bulkCreateTeachers(c) {
    try {
      const { teachers: teachers_data } = c.req.valid('json');

      const created_teachers = [];
      const errors = [];

      for (let i = 0; i < teachers_data.length; i++) {
        try {
          const response = await TeachersService.createTeacher(teachers_data[i]);

          if (response.status >= 200 && response.status < 300) {
            created_teachers.push(response.data);
          } else {
            errors.push({
              index: i,
              nip: teachers_data[i].nip,
              error: 'Failed to create teacher'
            });
          }
        } catch (error) {
          errors.push({
            index: i,
            nip: teachers_data[i].nip,
            error: error.message
          });
        }
      }

      return jsonResponse({
        success: errors.length === 0,
        message: `Bulk operation completed. ${created_teachers.length} teachers created, ${errors.length} failed`,
        data: {
          created: created_teachers,
          errors: errors,
          summary: {
            total: teachers_data.length,
            successful: created_teachers.length,
            failed: errors.length
          }
        }
      }, errors.length === 0 ? 201 : 207); // 207 Multi-Status for partial success
    } catch (error) {
      return errorResponse(error.message, 400);
    }
  }

  /**
   * Health check for teachers service
   * GET /teachers/health
   */
  static async healthCheck(c) {
    try {
      const response = await TeachersService.healthCheck();

      return jsonResponse(response.data, response.status);
    } catch (error) {
      console.log("ERROR: ", error);
      return errorResponse(error.message, 503);
    }
  }
}
