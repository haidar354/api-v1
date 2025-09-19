import { Hono } from 'hono';
import { RoleController } from '@controllers/role.controller';
import {
  validateCreateRole,
  validateUpdateRole,
  validateRoleId,
  validateRoleQuery,
  validateCreateRolePermission,
  validateUpdateRolePermission,
  validateRolePermissionId,
  validateRolePermissionQuery,
} from '@validation/index.validation';
import { authMiddleware } from "@middlewares/auth.middleware";

const roleRoute = new Hono();

// ==================== ROLE ROUTES ====================

/**
 * Health check endpoint
 * GET /role/health
 */
roleRoute.get('/health', authMiddleware, RoleController.healthCheck);

/**
 * Get all roles with pagination and filtering
 * GET /role?page=1&limit=10&search=admin&sortBy=created_at&sortOrder=desc
 */
roleRoute.get('/', validateRoleQuery, authMiddleware, RoleController.getAllRoles);

// ==================== ROLE PERMISSION ROUTES ====================

/**
 * Get all role permissions with pagination and filtering
 * GET /role/management?page=1&limit=10&search=users&role=1&table_name=users&sortBy=created_at&sortOrder=desc
 */
roleRoute.get('/management', validateRolePermissionQuery, authMiddleware, RoleController.getAllRolePermissions);

/**
 * Create a new role permission
 * POST /role/management
 */
roleRoute.post('/management', validateCreateRolePermission, authMiddleware, RoleController.createRolePermission);

/**
 * Get role permission by ID
 * GET /role/management/:id
 */
roleRoute.get('/management/:id', validateRolePermissionId, authMiddleware, RoleController.getRolePermissionById);

/**
 * Update role permission by ID
 * PUT /role/management/:id
 */
roleRoute.put('/management/:id', validateRolePermissionId, validateUpdateRolePermission, authMiddleware, RoleController.updateRolePermission);

/**
 * Soft delete role permission by ID
 * DELETE /role/management/:id
 */
roleRoute.delete('/management/:id', validateRolePermissionId, authMiddleware, RoleController.deleteRolePermission);

/**
 * Restore soft deleted role permission
 * POST /role/management/:id/restore
 */
roleRoute.post('/management/:id/restore', validateRolePermissionId, authMiddleware, RoleController.restoreRolePermission);

// ==================== DYNAMIC ROLE ROUTES ====================

/**
 * Create a new role
 * POST /role
 */
roleRoute.post('/', validateCreateRole, authMiddleware, RoleController.createRole);

/**
 * Get role by ID
 * GET /role/:id
 */
roleRoute.get('/:id', validateRoleId, authMiddleware, RoleController.getRoleById);

/**
 * Update role by ID
 * PUT /role/:id
 */
roleRoute.put('/:id', validateRoleId, validateUpdateRole, authMiddleware, RoleController.updateRole);

/**
 * Soft delete role by ID
 * DELETE /role/:id
 */
roleRoute.delete('/:id', validateRoleId, authMiddleware, RoleController.deleteRole);

/**
 * Restore soft deleted role
 * POST /role/:id/restore
 */
roleRoute.post('/:id/restore', validateRoleId, authMiddleware, RoleController.restoreRole);

/**
 * Get permissions by role ID
 * GET /role/:id/permissions
 */
roleRoute.get('/:id/permissions', validateRoleId, authMiddleware, RoleController.getPermissionsByRoleId);

export { roleRoute };