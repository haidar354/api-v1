import { RoleService } from '@services/role.service.js';
import { jsonResponse, errorResponse } from '@utils/response.utils.js';

/**
 * Role Controller
 * Handles HTTP requests for role and role permission CRUD operations
 */
export class RoleController {
  // ==================== ROLE METHODS ====================

  /**
   * Create a new role
   * POST /role
   */
  static async createRole(c) {
    try {
      const role_data = c.req.valid('json');

      const response = await RoleService.createRole(role_data);

      return jsonResponse(response.data, response.status);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  /**
   * Get all roles with pagination and filtering
   * GET /role
   */
  static async getAllRoles(c) {
    try {
      const query_params = c.req.valid('query');

      const response = await RoleService.getAllRoles(query_params);

      return jsonResponse(response.data, response.status, response.pagination);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  /**
   * Get role by ID
   * GET /role/:id
   */
  static async getRoleById(c) {
    try {
      const { id } = c.req.valid('param');

      const response = await RoleService.getRoleById(parseInt(id));

      if (!response.data) {
        return errorResponse('Role not found', 404);
      }

      return jsonResponse(response.data, response.status);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  /**
   * Update role by ID
   * PUT /role/:id
   */
  static async updateRole(c) {
    try {
      const { id } = c.req.valid('param');
      const update_data = c.req.valid('json');

      const response = await RoleService.updateRole(parseInt(id), update_data);

      return jsonResponse(response.data, response.status);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  /**
   * Soft delete role by ID
   * DELETE /role/:id
   */
  static async deleteRole(c) {
    try {
      const { id } = c.req.valid('param');

      const response = await RoleService.deleteRole(parseInt(id));

      return jsonResponse(
        { message: response.data ? "Role berhasil dihapus" : "Role gagal dihapus" },
        response.status
      );
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  /**
   * Restore soft deleted role
   * POST /role/:id/restore
   */
  static async restoreRole(c) {
    try {
      const { id } = c.req.valid('param');

      const response = await RoleService.restoreRole(parseInt(id));

      return jsonResponse(response.data, response.status);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  /**
   * Get permissions by role ID
   * GET /role/:id/permissions
   */
  static async getPermissionsByRoleId(c) {
    try {
      const { id } = c.req.valid('param');

      const response = await RoleService.getPermissionsByRoleId(parseInt(id));

      return jsonResponse(response.data, response.status);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  // ==================== ROLE PERMISSION METHODS ====================

  /**
   * Create a new role permission
   * POST /role/management
   */
  static async createRolePermission(c) {
    try {
      const permission_data = c.req.valid('json');

      const response = await RoleService.createRolePermission(permission_data);

      return jsonResponse(response.data, response.status);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  /**
   * Get all role permissions with pagination and filtering
   * GET /role/management
   */
  static async getAllRolePermissions(c) {
    try {
      const query_params = c.req.valid('query');
      console.log("QUERY PARAMS: ", query_params);
      const response = await RoleService.getAllRolePermissions(query_params);

      return jsonResponse(response.data, response.status, response.pagination);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  /**
   * Get role permission by ID
   * GET /role/management/:id
   */
  static async getRolePermissionById(c) {
    try {
      const { id } = c.req.valid('param');

      const response = await RoleService.getRolePermissionById(parseInt(id));

      if (!response.data) {
        return errorResponse('Role permission not found', 404);
      }

      return jsonResponse(response.data, response.status);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  /**
   * Update role permission by ID
   * PUT /role/management/:id
   */
  static async updateRolePermission(c) {
    try {
      const { id } = c.req.valid('param');
      const update_data = c.req.valid('json');

      const response = await RoleService.updateRolePermission(parseInt(id), update_data);

      return jsonResponse(response.data, response.status);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  /**
   * Soft delete role permission by ID
   * DELETE /role/management/:id
   */
  static async deleteRolePermission(c) {
    try {
      const { id } = c.req.valid('param');

      const response = await RoleService.deleteRolePermission(parseInt(id));

      return jsonResponse(
        { message: response.data ? "Role permission berhasil dihapus" : "Role permission gagal dihapus" },
        response.status
      );
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  /**
   * Restore soft deleted role permission
   * POST /role/management/:id/restore
   */
  static async restoreRolePermission(c) {
    try {
      const { id } = c.req.valid('param');

      const response = await RoleService.restoreRolePermission(parseInt(id));

      return jsonResponse(response.data, response.status);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  /**
   * Health check for role service
   * GET /role/health
   */
  static async healthCheck(c) {
    try {
      // Simple health check by counting roles
      const response = await RoleService.getAllRoles({ limit: 1 });
      if (response.status >= 200 && response.status < 300) {
        return jsonResponse({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          totalRoles: response.pagination?.total_items || 0
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
