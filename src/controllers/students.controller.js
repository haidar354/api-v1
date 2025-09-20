import { StudentsService } from '../services/students.service.js';
import { UsersService } from '../services/users.service.js';
import { jsonResponse, errorResponse } from '../utils/response.util.js';

/**
 * Students Controller
 * Handles HTTP requests for student CRUD operations
 */
export class StudentsController {
  /**
   * Create a new student
   * POST /students
   */
  static async createStudent(c) {
    try {
      const student_data = c.req.valid('json');

      const response = await StudentsService.createStudent(student_data);

      return jsonResponse(response.data, response.status);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  /**
   * Get all students with pagination and filtering
   * GET /students
   */
  static async getAllStudents(c) {
    try {
      const query_params = c.req.valid('query');

      const response = await StudentsService.getAllStudents(query_params);

      return jsonResponse(response.data, response.status, response.pagination);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  /**
   * Get student by ID
   * GET /students/:id
   */
  static async getStudentById(c) {
    try {
      const { id } = c.req.valid('param');

      const response = await StudentsService.getStudentById(parseInt(id));

      if (!response.data) {
        return errorResponse('Student not found', 404);
      }

      return jsonResponse(response.data, response.status);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  /**
   * Update student by ID
   * PUT /students/:id
   */
  static async updateStudent(c) {
    try {
      const { id } = c.req.valid('param');
      const update_data = c.req.valid('json');

      const response = await StudentsService.updateStudent(
        parseInt(id),
        update_data
      );

      return jsonResponse(response.data, response.status);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  /**
   * Soft delete student by ID
   * DELETE /students/:id
   */
  static async deleteStudent(c) {
    try {
      const { id } = c.req.valid('param');

      const response = await StudentsService.deleteStudent(parseInt(id));

      return jsonResponse(
        { message: response.data ? "Student successfully deleted" : "Failed to delete student" },
        response.status
      );
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  /**
   * Restore soft deleted student
   * POST /students/:id/restore
   */
  static async restoreStudent(c) {
    try {
      const { id } = c.req.valid('param');

      const response = await StudentsService.restoreStudent(parseInt(id));

      return jsonResponse(response.data, response.status);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  /**
   * Get students statistics by class
   * GET /students/stats/classes
   */
  static async getStudentsStatsByClass(c) {
    try {
      const response = await StudentsService.getStudentsCountByClass();

      return jsonResponse(response.data, response.status);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  /**
   * Search students by NIS or name
   * GET /students/search
   */
  static async searchStudents(c) {
    try {
      const { q: query, limit = '10' } = c.req.query();

      if (!query || query.trim().length < 2) {
        return errorResponse('Search query must be at least 2 characters', 400);
      }

      const response = await StudentsService.getAllStudents({
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
   * Get students by class
   * GET /students/class/:id_class
   */
  static async getStudentsByClass(c) {
    try {
      const { id_class } = c.req.param();
      const { page = '1', limit = '10' } = c.req.query();

      const response = await StudentsService.getAllStudents({
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
   * Bulk create students
   * POST /students/bulk
   */
  static async bulkCreateStudents(c) {
    try {
      const payload = c.req.valid('json');
      let students_data = [];
      let processing_errors = [];

      // Handle Excel format
      if (payload.type === 'excel') {
        try {
          const excel_result = await StudentsService.excelData(payload.data);
          students_data = excel_result.data;
        } catch (error) {
          // Handle Excel processing errors with details
          if (error.details) {
            return jsonResponse({
              success: false,
              message: `Excel processing failed: ${error.message}`,
              data: {
                created: [],
                errors: error.details,
                summary: {
                  total: payload.data.length,
                  successful: 0,
                  failed: error.details.length
                }
              }
            }, 400);
          }
          throw error;
        }
      } else {
        // Handle existing format (with or without type field)
        students_data = payload.students || [];
      }

      if (!students_data || students_data.length === 0) {
        return errorResponse('No student data provided', 400);
      }

      const created_students = [];
      const errors = [];

      // Process each student
      for (let i = 0; i < students_data.length; i++) {
        try {
          let response;
          
          // For Excel format, use UsersService.createUser
          if (payload.type === 'excel') {
            response = await UsersService.createUser(students_data[i]);
          } else {
            // For existing format, use StudentsService.createStudent
            response = await StudentsService.createStudent(students_data[i]);
          }

          if (response.status >= 200 && response.status < 300) {
            created_students.push(response.data);
          } else {
            errors.push({
              index: i,
              nis: students_data[i].data?.nis || students_data[i].nis,
              error: 'Failed to create student'
            });
          }
        } catch (error) {
          errors.push({
            index: i,
            nis: students_data[i].data?.nis || students_data[i].nis,
            error: error.message
          });
        }
      }

      return jsonResponse({
        success: errors.length === 0,
        message: `Bulk operation completed. ${created_students.length} students created, ${errors.length} failed`,
        data: {
          created: created_students,
          errors: errors,
          summary: {
            total: students_data.length,
            successful: created_students.length,
            failed: errors.length
          }
        }
      }, errors.length === 0 ? 201 : 207); // 207 Multi-Status for partial success
    } catch (error) {
      return errorResponse(error.message, 400);
    }
  }

  /**
   * Health check for students service
   * GET /students/health
   */
  static async healthCheck(c) {
    try {
      const response = await StudentsService.healthCheck();

      return jsonResponse(response.data, response.status);
    } catch (error) {
      console.log("ERROR: ", error);
      return errorResponse(error.message, 503);
    }
  }
}
