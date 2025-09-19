import { Hono } from 'hono';
import { StudentsController } from '@controllers/students.controller.js';
import {
  validateCreateStudent,
  validateUpdateStudent,
  validateStudentId,
  validateStudentQuery,
  validateBulkCreateStudents,
} from '@validation/index.validation.js';
import { authMiddleware } from "@middlewares/auth.middleware.js";

/**
 * Students Routes
 * Defines all routes for student CRUD operations
 */
const studentsRoute = new Hono();

/**
 * Health check endpoint
 * GET /students/health
 */
studentsRoute.get('/health', authMiddleware, StudentsController.healthCheck);

/**
 * Get students statistics by class
 * GET /students/stats/classes
 */
studentsRoute.get('/stats/classes', authMiddleware, StudentsController.getStudentsStatsByClass);

/**
 * Search students
 * GET /students/search?q=searchTerm&limit=10
 */
studentsRoute.get('/search', authMiddleware, StudentsController.searchStudents);

/**
 * Bulk create students
 * POST /students/bulk
 */
studentsRoute.post('/bulk', validateBulkCreateStudents, authMiddleware, StudentsController.bulkCreateStudents);

/**
 * Get students by class
 * GET /students/class/:id_class
 */
studentsRoute.get('/class/:id_class', authMiddleware, StudentsController.getStudentsByClass);

/**
 * Get all students with pagination and filtering
 * GET /students?page=1&limit=10&search=john&class=1&sortBy=created_at&sortOrder=desc
 */
studentsRoute.get('/', validateStudentQuery, authMiddleware, StudentsController.getAllStudents);

/**
 * Create a new student
 * POST /students
 */
studentsRoute.post('/', validateCreateStudent, authMiddleware, StudentsController.createStudent);

/**
 * Get student by ID
 * GET /students/:id
 */
studentsRoute.get('/:id', validateStudentId, authMiddleware, StudentsController.getStudentById);

/**
 * Update student by ID
 * PUT /students/:id
 */
studentsRoute.put('/:id', validateStudentId, validateUpdateStudent, authMiddleware, StudentsController.updateStudent);

/**
 * Soft delete student by ID
 * DELETE /students/:id
 */
studentsRoute.delete('/:id', validateStudentId, authMiddleware, StudentsController.deleteStudent);

/**
 * Restore soft deleted student
 * POST /students/:id/restore
 */
studentsRoute.post('/:id/restore', validateStudentId, authMiddleware, StudentsController.restoreStudent);

export { studentsRoute };
