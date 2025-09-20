import { ClassesService } from '../services/classes.service.js';
import { jsonResponse, errorResponse } from '../utils/response.util.js';

/**
 * Classes Controller
 * Handles HTTP requests for departments and classes CRUD operations
 */
export class ClassesController {
  /**
   * Create a new department
   * POST /classes/departments
   */
  static async createDepartment(c) {
    try {
      const department_data = c.req.valid('json');

      const response = await ClassesService.createDepartment(department_data);

      return jsonResponse(response.data, response.status);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  /**
   * Get all departments with pagination and filtering
   * GET /classes/departments
   */
  static async getAllDepartments(c) {
    try {
      const query_params = c.req.valid('query');

      const response = await ClassesService.getAllDepartments(query_params);

      return jsonResponse(response.data, response.status, response.pagination);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  /**
   * Get department by ID
   * GET /classes/departments/:id
   */
  static async getDepartmentById(c) {
    try {
      const { id } = c.req.valid('param');

      const response = await ClassesService.getDepartmentById(parseInt(id));

      if (!response.data) {
        return errorResponse('Department not found', 404);
      }

      return jsonResponse(response.data, response.status);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  /**
   * Update department by ID
   * PUT /classes/departments/:id
   */
  static async updateDepartment(c) {
    try {
      const { id } = c.req.valid('param');
      const update_data = c.req.valid('json');

      const response = await ClassesService.updateDepartment(
        parseInt(id),
        update_data
      );

      return jsonResponse(response.data, response.status);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  /**
   * Soft delete department by ID
   * DELETE /classes/departments/:id
   */
  static async deleteDepartment(c) {
    try {
      const { id } = c.req.valid('param');

      const response = await ClassesService.deleteDepartment(parseInt(id));

      return jsonResponse({
        message: response.status === 200 ? "Department berhasil dihapus" : "Department gagal dihapus"
      }, response.status);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  /**
   * Restore soft deleted department by ID
   * POST /classes/departments/:id/restore
   */
  static async restoreDepartment(c) {
    try {
      const { id } = c.req.valid('param');

      const response = await ClassesService.restoreDepartment(parseInt(id));

      return jsonResponse({
        message: "Department berhasil dipulihkan",
        data: response.data
      }, response.status);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  /**
   * Bulk create departments
   * POST /classes/departments/bulk
   */
  static async bulkCreateDepartments(c) {
    try {
      const { departments: departments_data } = c.req.valid('json');

      const response = await ClassesService.bulkCreateDepartments(departments_data);

      return jsonResponse(response.data, response.status);
    } catch (error) {
      return errorResponse(error.message, 400);
    }
  }

  /**
   * Create a new class
   * POST /classes
   */
  static async createClass(c) {
    try {
      const class_data = c.req.valid('json');

      const response = await ClassesService.createClass(class_data);

      return jsonResponse(response.data, response.status);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  /**
   * Get all classes with pagination and filtering
   * GET /classes
   */
  static async getAllClasses(c) {
    try {
      const query_params = c.req.valid('query');

      const response = await ClassesService.getAllClasses(query_params);

      return jsonResponse(response.data, response.status, response.pagination);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  /**
   * Get all classes with formatted department names
   * GET /classes/with-departments
   */
  static async getAllClassWithDepartments(c) {
    try {
      const query_params = c.req.valid('query');

      const response = await ClassesService.getAllClassWithDepartments(query_params);

      return jsonResponse(response.data, response.status, response.pagination);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  /**
   * Get class by ID
   * GET /classes/:id
   */
  static async getClassById(c) {
    try {
      const { id } = c.req.valid('param');
      const { include_relations = 'true' } = c.req.query();

      const response = await ClassesService.getClassById(
        parseInt(id),
        include_relations === 'true'
      );

      if (!response.data) {
        return errorResponse('Class not found', 404);
      }

      return jsonResponse(response.data, response.status);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  /**
   * Update class by ID
   * PUT /classes/:id
   */
  static async updateClass(c) {
    try {
      const { id } = c.req.valid('param');
      const update_data = c.req.valid('json');

      const response = await ClassesService.updateClass(
        parseInt(id),
        update_data
      );

      return jsonResponse(response.data, response.status);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  /**
   * Soft delete class by ID
   * DELETE /classes/:id
   */
  static async deleteClass(c) {
    try {
      const { id } = c.req.valid('param');

      const response = await ClassesService.deleteClass(parseInt(id));

      return jsonResponse({
        message: response.status === 200 ? "Class berhasil dihapus" : "Class gagal dihapus"
      }, response.status);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  /**
   * Bulk create classes
   * POST /classes/bulk
   */
  static async bulkCreateClasses(c) {
    try {
      const { classes: classes_data } = c.req.valid('json');

      const response = await ClassesService.bulkCreateClasses(classes_data);

      return jsonResponse({
        success: response.data.errors.length === 0,
        message: `Bulk operation completed. ${response.data.summary.successful} classes created, ${response.data.summary.failed} failed`,
        data: response.data,
        error: response.data.errors.length > 0 ? 'Some classes failed to create' : null
      }, response.status);
    } catch (error) {
      return errorResponse(error.message, 400);
    }
  }

  /**
   * Get classes statistics by department
   * GET /classes/stats/departments
   */
  static async getClassesStatsByDepartment(c) {
    try {
      const response = await ClassesService.getClassesStatsByDepartment();

      return jsonResponse(response.data, response.status);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  /**
   * Search classes by grade or subgrade
   * GET /classes/search
   */
  static async searchClasses(c) {
    try {
      const { q: query, limit = '10' } = c.req.query();

      if (!query || query.trim().length < 1) {
        return errorResponse('Search query must be at least 1 character', 400);
      }

      const response = await ClassesService.getAllClasses({
        search: query.trim(),
        limit: parseInt(limit),
        page: 1,
        include_relations: true
      });

      return jsonResponse(response.data, response.status, response.pagination);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  /**
   * Get classes by department
   * GET /classes/department/:departmentId
   */
  static async getClassesByDepartment(c) {
    try {
      const { departmentId } = c.req.param();
      const { page = '1', limit = '10' } = c.req.query();

      const response = await ClassesService.getAllClasses({
        departmentId: departmentId,
        page: parseInt(page),
        limit: parseInt(limit),
        include_relations: true
      });

      return jsonResponse(response.data, response.status, response.pagination);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  /**
   * Get classes by academic year
   * GET /classes/academic-year/:academicYearId
   */
  static async getClassesByAcademicYear(c) {
    try {
      const { academicYearId } = c.req.param();
      const { page = '1', limit = '10' } = c.req.query();

      const response = await ClassesService.getAllClasses({
        academicYearId: academicYearId,
        page: parseInt(page),
        limit: parseInt(limit),
        include_relations: true
      });

      return jsonResponse(response.data, response.status, response.pagination);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  /**
   * Health check for classes service
   * GET /classes/health
   */
  static async healthCheck(c) {
    try {
      // Simple health check by counting classes and departments
      const classes_response = await ClassesService.getAllClasses({ limit: 1 });
      const departments_response = await ClassesService.getAllDepartments({ limit: 1 });

      if (classes_response.status >= 200 && classes_response.status < 300 &&
        departments_response.status >= 200 && departments_response.status < 300) {
        return jsonResponse({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          totalClasses: classes_response.pagination?.total_items || 0,
          totalDepartments: departments_response.pagination?.total_items || 0
        }, 200);
      } else {
        throw new Error('Service health check failed');
      }
    } catch (error) {
      console.log("ERROR: ", error);
      return errorResponse(error.message, 503);
    }
  }
}
