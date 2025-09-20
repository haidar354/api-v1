import { Hono } from 'hono';
import { ClassesController } from "../controllers/classes.controller.js";
import {
  validateCreateDepartment,
  validateUpdateDepartment,
  validateDepartmentId,
  validateDepartmentQuery,
  validateBulkCreateDepartments,
  validateCreateClass,
  validateUpdateClass,
  validateClassId,
  validateClassQuery,
  validateBulkCreateClasses,
  validateClassWithDepartmentsQuery,
} from '../validation/index.validation.js';
import { authMiddleware } from "../middlewares/auth.middleware.js";

/**
 * Classes Routes
 * Defines all routes for departments and classes CRUD operations
 */
const classesRoute = new Hono();

/**
 * Health check endpoint
 * GET /classes/health
 */
classesRoute.get('/health', authMiddleware, ClassesController.healthCheck);

/**
 * Get classes statistics by department
 * GET /classes/stats/departments
 */
classesRoute.get('/stats/departments', authMiddleware, ClassesController.getClassesStatsByDepartment);

/**
 * Search classes
 * GET /classes/search?q=searchTerm&limit=10
 */
classesRoute.get('/search', authMiddleware, ClassesController.searchClasses);

/**
 * Get all classes with formatted department names
 * GET /classes/with-departments?page=1&limit=10&id_academic_year=1&include_relations=true
 */
classesRoute.get('/with-departments', validateClassWithDepartmentsQuery, authMiddleware, ClassesController.getAllClassWithDepartments);

/**
 * Bulk create departments
 * POST /classes/departments/bulk
 */
classesRoute.post('/departments/bulk', validateBulkCreateDepartments, authMiddleware, ClassesController.bulkCreateDepartments);

/**
 * Get all departments with pagination and filtering
 * GET /classes/departments?page=1&limit=10&search=name&sortBy=created_at&sortOrder=desc
 */
classesRoute.get('/departments', validateDepartmentQuery, authMiddleware, ClassesController.getAllDepartments);

/**
 * Create a new department
 * POST /classes/departments
 */
classesRoute.post('/departments', validateCreateDepartment, authMiddleware, ClassesController.createDepartment);

/**
 * Get department by ID
 * GET /classes/departments/:id
 */
classesRoute.get('/departments/:id', validateDepartmentId, authMiddleware, ClassesController.getDepartmentById);

/**
 * Update department by ID
 * PUT /classes/departments/:id
 */
classesRoute.put('/departments/:id', validateDepartmentId, validateUpdateDepartment, authMiddleware, ClassesController.updateDepartment);

/**
 * Soft delete department by ID
 * DELETE /classes/departments/:id
 */
classesRoute.delete('/departments/:id', validateDepartmentId, authMiddleware, ClassesController.deleteDepartment);

/**
 * Restore soft deleted department by ID
 * POST /classes/departments/:id/restore
 */
classesRoute.post('/departments/:id/restore', validateDepartmentId, authMiddleware, ClassesController.restoreDepartment);

/**
 * Bulk create classes
 * POST /classes/bulk
 */
classesRoute.post('/bulk', validateBulkCreateClasses, authMiddleware, ClassesController.bulkCreateClasses);

/**
 * Get classes by department
 * GET /classes/department/:departmentId
 */
classesRoute.get('/department/:departmentId', authMiddleware, ClassesController.getClassesByDepartment);

/**
 * Get classes by academic year
 * GET /classes/academic-year/:academicYearId
 */
classesRoute.get('/academic-year/:academicYearId', authMiddleware, ClassesController.getClassesByAcademicYear);

/**
 * Get all classes with pagination and filtering
 * GET /classes?page=1&limit=10&search=grade&departmentId=1&academicYearId=1&grade=X&subgrade=A&sortBy=created_at&sortOrder=desc
 */
classesRoute.get('/', validateClassQuery, authMiddleware, ClassesController.getAllClasses);

/**
 * Create a new class
 * POST /classes
 */
classesRoute.post('/', validateCreateClass, authMiddleware, ClassesController.createClass);

/**
 * Get class by ID
 * GET /classes/:id?include_relations=true
 */
classesRoute.get('/:id', validateClassId, authMiddleware, ClassesController.getClassById);

/**
 * Update class by ID
 * PUT /classes/:id
 */
classesRoute.put('/:id', validateClassId, validateUpdateClass, authMiddleware, ClassesController.updateClass);

/**
 * Soft delete class by ID
 * DELETE /classes/:id
 */
classesRoute.delete('/:id', validateClassId, authMiddleware, ClassesController.deleteClass);

/**
 * Restore soft deleted class by ID
 * POST /classes/:id/restore
 */
classesRoute.post('/:id/restore', validateClassId, authMiddleware, ClassesController.restoreClass);

export { classesRoute };
