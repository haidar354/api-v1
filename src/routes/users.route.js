import { Hono } from 'hono';
import { UsersController } from '@controller/users.controller';
import {
  validateCreateUser,
  validateUpdateUser,
  validateUserId,
  validateUserQuery,
  validateBulkCreateUsers,
} from '@validation/index.validation';
import { authMiddleware } from "@middlewares/auth.middleware";

/**
 * Users Routes
 * Defines all routes for user CRUD operations
 */
const usersRoute = new Hono();

/**
 * Health check endpoint
 * GET /users/health
 */
usersRoute.get('/health', authMiddleware, UsersController.healthCheck);

/**
 * Get users statistics by role
 * GET /users/stats/roles
 */
usersRoute.get('/stats/roles', authMiddleware, UsersController.getUsersStatsByRole);

/**
 * Search users
 * GET /users/search?q=searchTerm&limit=10
 */
usersRoute.get('/search', authMiddleware, UsersController.searchUsers);

/**
 * Bulk create users
 * POST /users/bulk
 */
usersRoute.post('/bulk', validateBulkCreateUsers, authMiddleware, UsersController.bulkCreateUsers);

/**
 * Get users by role
 * GET /users/role/:roleId
 */
usersRoute.get('/role/:roleId', authMiddleware, UsersController.getUsersByRole);

/**
 * Get all users with pagination and filtering
 * GET /users?page=1&limit=10&search=john&role=1&sortBy=created_at&sortOrder=desc
 */
usersRoute.get('/', validateUserQuery, authMiddleware, UsersController.getAllUsers);

/**
 * Create a new user
 * POST /users
 */
usersRoute.post('/', validateCreateUser, authMiddleware, UsersController.createUser);

/**
 * Get user by ID
 * GET /users/:id?include_role=true
 */
usersRoute.get('/:id', validateUserId, authMiddleware, UsersController.getUserById);

/**
 * Update user by ID
 * PUT /users/:id
 */
usersRoute.put('/:id', validateUserId, validateUpdateUser, authMiddleware, UsersController.updateUser);

/**
 * Soft delete user by ID
 * DELETE /users/:id
 */
usersRoute.delete('/:id', validateUserId, authMiddleware, UsersController.deleteUser);

/**
 * Restore soft deleted user
 * POST /users/:id/restore
 */
usersRoute.post('/:id/restore', validateUserId, authMiddleware, UsersController.restoreUser);

export { usersRoute };
