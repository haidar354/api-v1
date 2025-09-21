import { Hono } from "hono";
import { TeachersController } from "../controllers/teachers.controller.js";
import {
  validateCreateTeacher,
  validateUpdateTeacher,
  validateTeacherId,
  validateTeacherQuery,
} from "../validation/index.validation.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

/**
 * Teachers Routes
 * Defines all routes for teacher CRUD operations
 */
const teachersRoute = new Hono();

/**
 * Export teachers data
 * GET /teachers/export?format=xlsx&startDate=2024-01-01&endDate=2024-12-31
 */
teachersRoute.get("/export", authMiddleware, TeachersController.exportTeachers);

/**
 * Health check endpoint
 * GET /teachers/health
 */
teachersRoute.get("/health", authMiddleware, TeachersController.healthCheck);

/**
 * Get teachers statistics by class
 * GET /teachers/stats/classes
 */
teachersRoute.get(
  "/stats/classes",
  authMiddleware,
  TeachersController.getTeachersStatsByClass
);

/**
 * Search teachers
 * GET /teachers/search?q=searchTerm&limit=10
 */
teachersRoute.get("/search", authMiddleware, TeachersController.searchTeachers);

/**
 * Bulk create teachers from uploaded file
 * POST /teachers/bulk (with FormData file upload)
 */
teachersRoute.post(
  "/bulk",
  authMiddleware,
  TeachersController.bulkCreateTeachersFromFile
);

/**
 * Get teachers by class
 * GET /teachers/class/:id_class
 */
teachersRoute.get(
  "/class/:id_class",
  authMiddleware,
  TeachersController.getTeachersByClass
);

/**
 * Get all teachers with pagination and filtering
 * GET /teachers?page=1&limit=10&search=john&class=1&sortBy=created_at&sortOrder=desc
 */
teachersRoute.get(
  "/",
  validateTeacherQuery,
  authMiddleware,
  TeachersController.getAllTeachers
);

/**
 * Create a new teacher
 * POST /teachers
 */
teachersRoute.post(
  "/",
  validateCreateTeacher,
  authMiddleware,
  TeachersController.createTeacher
);

/**
 * Get teacher by ID
 * GET /teachers/:id
 */
teachersRoute.get(
  "/:id",
  validateTeacherId,
  authMiddleware,
  TeachersController.getTeacherById
);

/**
 * Update teacher by ID
 * PUT /teachers/:id
 */
teachersRoute.put(
  "/:id",
  validateTeacherId,
  validateUpdateTeacher,
  authMiddleware,
  TeachersController.updateTeacher
);

/**
 * Soft delete teacher by ID
 * DELETE /teachers/:id
 */
teachersRoute.delete(
  "/:id",
  validateTeacherId,
  authMiddleware,
  TeachersController.deleteTeacher
);

/**
 * Restore soft deleted teacher
 * POST /teachers/:id/restore
 */
teachersRoute.post(
  "/:id/restore",
  validateTeacherId,
  authMiddleware,
  TeachersController.restoreTeacher
);

export { teachersRoute };
