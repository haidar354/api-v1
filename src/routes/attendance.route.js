import { Hono } from 'hono';
import { AttendanceController } from '../controllers/attendance.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import {
  validateCreateAttendance,
  validateUpdateAttendance,
  validateAttendanceId,
  validateAttendanceQuery,
  validateBulkAttendance,
  validateCreateGuestForm,
  validateUpdateGuestForm,
  validateGuestId,
  validateGuestQuery,
  validateAttendanceByClass,
  validateAttendanceByStudents,
} from '../validation/attendance.validation.js';


/**
 * Attendance Routes
 * Defines all routes related to attendance and guest management
 */
const attendanceRoute = new Hono();

// ==================== GUEST ROUTES ====================

/**
 * POST /attendance/guests
 * Create new guest record with signature upload
 * Uses form-data for signature file upload
 */
attendanceRoute.post('/guests',
  validateCreateGuestForm,
  AttendanceController.createGuest
);

/**
 * GET /attendance/guests
 * Get guest records with filtering and pagination
 */
attendanceRoute.get('/guests',
  validateGuestQuery,
  AttendanceController.getGuests
);

/**
 * GET /attendance/guests/:id
 * Get guest record by ID
 */
attendanceRoute.get('/guests/:id',
  validateGuestId,
  AttendanceController.getGuestById
);

/**
 * PUT /attendance/guests/:id
 * Update guest record with optional signature upload
 * Uses form-data for signature file upload
 */
attendanceRoute.put('/guests/:id',
  authMiddleware,
  validateGuestId,
  validateUpdateGuestForm,
  AttendanceController.updateGuest
);

/**
 * DELETE /attendance/guests/:id
 * Delete guest record
 */
attendanceRoute.delete('/guests/:id',
  authMiddleware,
  validateGuestId,
  AttendanceController.deleteGuest
);

/**
 * POST /attendance/guests/:id/restore
 * Restore guest record
 */
attendanceRoute.post('/guests/:id/restore',
  authMiddleware,
  validateGuestId,
  AttendanceController.restoreGuest
);

// ==================== ATTENDANCE ROUTES ====================

/**
 * POST /attendance
 * Create new attendance record
 */
attendanceRoute.post('/',
  authMiddleware,
  validateCreateAttendance,
  AttendanceController.createAttendance
);

/**
 * GET /attendance
 * Get attendance records with filtering and pagination
 */
attendanceRoute.get('/',
  validateAttendanceQuery,
  AttendanceController.getAttendances
);

/**
 * GET /attendance/class
 * Get attendance statistics by class
 */
attendanceRoute.get('/class',
  validateAttendanceByClass,
  AttendanceController.getAttendanceByClass
);

/**
 * GET /attendance/students
 * Get attendance statistics by students
 */
attendanceRoute.get('/students',
  validateAttendanceByStudents,
  AttendanceController.getAttendanceByStudents
);

/**
 * GET /attendance/stats
 * Get attendance statistics
 */
attendanceRoute.get('/stats',
  AttendanceController.getAttendanceStats
);

/**
 * GET /attendance/info
 * Get attendance module information
 */
attendanceRoute.get('/info',
  authMiddleware,
  AttendanceController.getAttendanceInfo
);

/**
 * POST /attendance/bulk
 * Create multiple attendance records
 */
attendanceRoute.post('/bulk',
  authMiddleware,
  validateBulkAttendance,
  AttendanceController.createBulkAttendance
);

/**
 * GET /attendance/:id
 * Get attendance record by ID
 */
attendanceRoute.get('/:id',
  authMiddleware,
  validateAttendanceId,
  AttendanceController.getAttendanceById
);

/**
 * PUT /attendance/:id
 * Update attendance record
 */
attendanceRoute.put('/:id',
  authMiddleware,
  validateAttendanceId,
  validateUpdateAttendance,
  AttendanceController.updateAttendance
);

/**
 * DELETE /attendance/:id
 * Delete attendance record
 */
attendanceRoute.delete('/:id',
  authMiddleware,
  validateAttendanceId,
  AttendanceController.deleteAttendance
);

/**
 * POST /attendance/:id/restore
 * Restore attendance record
 */
attendanceRoute.post('/:id/restore',
  authMiddleware,
  validateAttendanceId,
  AttendanceController.restoreAttendance
);

export { attendanceRoute };
