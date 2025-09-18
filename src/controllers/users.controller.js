import { UsersService } from '@services/users.service.js';
import { jsonResponse, errorResponse } from '@utils/response.utils.js';

/**
 * Users Controller
 * Handles HTTP requests for user CRUD operations
 */
export class UsersController {
  /**
   * Create a new user
   * POST /users
   */
  static async createUser(c) {
    try {
      const userData = c.req.valid('json');

      const response = await UsersService.createUser(userData);

      // Return the response directly since it's already a proper Response object
      return jsonResponse(response.data);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  /**
   * Get all users with pagination and filtering
   * GET /users
   */
  static async getAllUsers(c) {
    try {
      const queryParams = c.req.valid('query');

      const response = await UsersService.getAllUsers(queryParams);

      // Return the response directly since it's already a proper Response object
      return jsonResponse(response.data, response.status, response.pagination);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  /**
   * Get user by ID
   * GET /users/:id
   */
  static async getUserById(c) {
    try {
      const { id } = c.req.valid('param');
      const { include_role = 'true' } = c.req.query();

      const response = await UsersService.getUserById(
        parseInt(id),
        include_role === 'true'
      );

      // Return the response directly since it's already a proper Response object
      return jsonResponse(response.data, response.status, response.pagination);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  /**
   * Update user by ID
   * PUT /users/:id
   */
  static async updateUser(c) {
    try {
      const { id } = c.req.valid('param');
      const updateData = c.req.valid('json');

      const response = await UsersService.updateUser(
        parseInt(id),
        updateData
      );

      // Return the response directly since it's already a proper Response object
      return jsonResponse(response.data, response.status);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  /**
   * Soft delete user by ID
   * DELETE /users/:id
   */
  static async deleteUser(c) {
    try {
      const { id } = c.req.valid('param');

      const response = await UsersService.deleteUser(parseInt(id));

      // Return the response directly since it's already a proper Response object
      return jsonResponse({ message: response.data === false ? "Data berhasil dihapus" : "Data gagal dihapus" }, response.status);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  /**
   * Restore soft deleted user
   * POST /users/:id/restore
   */
  static async restoreUser(c) {
    try {
      const { id } = c.req.valid('param');

      const response = await UsersService.restoreUser(parseInt(id));

      // Return the response directly since it's already a proper Response object
      return jsonResponse(response.data, response.status);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  /**
   * Get users statistics by role
   * GET /users/stats/roles
   */
  static async getUsersStatsByRole(c) {
    try {
      const response = await UsersService.getUsersCountByRole();

      // Return the response directly since it's already a proper Response object
      return jsonResponse(response.data, response.status);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  /**
   * Search users by email or name
   * GET /users/search
   */
  static async searchUsers(c) {
    try {
      const { q: query, limit = '10' } = c.req.query();

      if (!query || query.trim().length < 2) {
        return c.json({
          message: 'Search query must be at least 2 characters',
        }, 400);
      }

      const response = await UsersService.getAllUsers({
        search: query.trim(),
        limit: parseInt(limit),
        page: 1,
        include_role: true
      });

      // Return the response directly since it's already a proper Response object
      return jsonResponse(response.data, response.status, response.pagination);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  /**
   * Get users by role
   * GET /users/role/:roleId
   */
  static async getUsersByRole(c) {
    try {
      const { roleId } = c.req.param();
      const { page = '1', limit = '10' } = c.req.query();

      const response = await UsersService.getAllUsers({
        role: roleId,
        page: parseInt(page),
        limit: parseInt(limit),
        include_role: true
      });

      // Return the response directly since it's already a proper Response object
      return jsonResponse(response.data, response.status, response.pagination);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  /**
   * Bulk create users
   * POST /users/bulk
   */
  static async bulkCreateUsers(c) {
    try {
      const { users: usersData } = c.req.valid('json');

      const createdUsers = [];
      const errors = [];

      for (let i = 0; i < usersData.length; i++) {
        try {
          const response = await UsersService.createUser(usersData[i]);

          // Extract data from the response
          if (response.status >= 200 && response.status < 300) {
            const responseData = response.data;
            createdUsers.push(responseData.data);
          } else {
            const errorData = response.data;
            errors.push({
              index: i,
              email: usersData[i].email,
              error: errorData.error
            });
          }
        } catch (error) {
          errors.push({
            index: i,
            email: usersData[i].email,
            error: error.message
          });
        }
      }

      return jsonResponse({
        success: errors.length === 0,
        message: `Bulk operation completed. ${createdUsers.length} users created, ${errors.length} failed`,
        data: {
          created: createdUsers,
          errors: errors,
          summary: {
            total: usersData.length,
            successful: createdUsers.length,
            failed: errors.length
          }
        },
        error: errors.length > 0 ? 'Some users failed to create' : null
      }, errors.length === 0 ? 201 : 207); // 207 Multi-Status for partial success
    } catch (error) {
      return errorResponse(error.message, 400);
    }
  }

  /**
   * Health check for users service
   * GET /users/health
   */
  static async healthCheck(c) {
    try {
      // Simple health check by counting users
      const response = await UsersService.getAllUsers({ limit: 1 });
      if (response.status >= 200 && response.status < 300) {
        return jsonResponse({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          totalUsers: response.pagination?.total_items || 0
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
