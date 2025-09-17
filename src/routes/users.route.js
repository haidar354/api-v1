import { Hono } from 'hono';
import { UsersController } from '@controller/users.controller.js';
import { 
  validateCreateUser,
  validateUpdateUser,
  validateUserId,
  validateUserQuery,
  validateBulkCreateUsers,
  validateCreateDashboardUser,
} from '@validation/index.validation.js';

/**
 * Users Routes
 * Defines all routes for user CRUD operations
 */
const usersRoute = new Hono();

/**
 * Health check endpoint
 * GET /users/health
 */
usersRoute.get('/health', UsersController.healthCheck);

/**
 * Get users statistics by role
 * GET /users/stats/roles
 */
usersRoute.get('/stats/roles', UsersController.getUsersStatsByRole);

/**
 * Search users
 * GET /users/search?q=searchTerm&limit=10
 */
usersRoute.get('/search', UsersController.searchUsers);

/**
 * Bulk create users
 * POST /users/bulk
 */
usersRoute.post('/bulk', validateBulkCreateUsers, UsersController.bulkCreateUsers);

/**
 * Get users by role
 * GET /users/role/:roleId
 */
usersRoute.get('/role/:roleId', UsersController.getUsersByRole);

/**
 * Get all users with pagination and filtering
 * GET /users?page=1&limit=10&search=john&role=1&sortBy=created_at&sortOrder=desc
 */
usersRoute.get('/', validateUserQuery, UsersController.getAllUsers);

/**
 * Create a new user
 * POST /users
 */
usersRoute.post('/', validateCreateUser, UsersController.createUser);

/**
 * Create a new dashboard user
 * POST /users/dashboard
 */
usersRoute.post('/dashboard', validateCreateDashboardUser, UsersController.createDashboardUser);

/**
 * Get user by ID
 * GET /users/:id?include_role=true
 */
usersRoute.get('/:id', validateUserId, UsersController.getUserById);

/**
 * Update user by ID
 * PUT /users/:id
 */
usersRoute.put('/:id', validateUserId, validateUpdateUser, UsersController.updateUser);

/**
 * Soft delete user by ID
 * DELETE /users/:id
 */
usersRoute.delete('/:id', validateUserId, UsersController.deleteUser);

/**
 * Restore soft deleted user
 * POST /users/:id/restore
 */
usersRoute.post('/:id/restore', validateUserId, UsersController.restoreUser);

export { usersRoute };
