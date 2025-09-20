import attendanceService from '../services/attendance.service.js';
import { jsonResponse, errorResponse } from '../utils/response.util.js';

/**
 * Attendance Controller
 * Handles HTTP requests for attendance and guest management
 */
export class AttendanceController {

  // ==================== ATTENDANCE CRUD OPERATIONS ====================

  /**
   * Create new attendance record
   * @param {Object} c - Hono context object
   * @returns {Promise<Response>} JSON response with created attendance
   */
  static async createAttendance(c) {
    try {
      // Get validated data from middleware
      const attendanceData = c.req.valid('json');

      // Create attendance record
      const result = await attendanceService.createAttendance(attendanceData);

      return jsonResponse(result.data, result.status);

    } catch (error) {
      console.error('Create attendance error:', error);
      return errorResponse(error.message || 'Failed to create attendance record', 500);
    }
  }

  /**
   * Get attendance record by ID
   * @param {Object} c - Hono context object
   * @returns {Promise<Response>} JSON response with attendance record
   */
  static async getAttendanceById(c) {
    try {
      // Get validated ID from middleware
      const { id } = c.req.valid('param');

      // Fetch attendance record
      const attendance = await attendanceService.getAttendanceById(id);

      return jsonResponse(attendance.data, attendance.status, attendance.pagination);

    } catch (error) {
      console.error('Get attendance by ID error:', error);

      if (error.message.includes('not found')) {
        return errorResponse(error.message, 404);
      }

      return errorResponse(error.message || 'Failed to fetch attendance record', 500);
    }
  }

  /**
   * Get attendance records with filtering and pagination
   * @param {Object} c - Hono context object
   * @returns {Promise<Response>} JSON response with paginated attendance records
   */
  static async getAttendances(c) {
    try {
      // Get validated query parameters from middleware
      const filters = c.req.valid('query');

      // Fetch attendance records
      const result = await attendanceService.getAllAttendances(filters);

      return jsonResponse(result.data, result.status);

    } catch (error) {
      console.error('Get attendances error:', error);
      return errorResponse(error.message || 'Failed to fetch attendance records', 500);
    }
  }

  /**
   * Get attendance records by class
   * @param {Object} c - Hono context object
   * @returns {Promise<Response>} JSON response with attendance records by class
   */
  static async getAttendanceByClass(c) {
    try {
      // Get validated query parameters from middleware
      const query_params = c.req.valid('query');

      // Get attendance records by class
      const result = await attendanceService.getAttendanceByClass(query_params);

      return jsonResponse(result.data, result.status, result.pagination);

    } catch (error) {
      console.error('Get attendance by class error:', error);
      return errorResponse(error.message || 'Failed to fetch attendance records by class', 500);
    }
  }

  /**
   * Get attendance records by students
   * @param {Object} c - Hono context object
   * @returns {Promise<Response>} JSON response with attendance records by students
   */
  static async getAttendanceByStudents(c) {
    try {
      // Get validated query parameters from middleware
      const query_params = c.req.valid('query');

      // Get attendance records by students
      const result = await attendanceService.getAttendanceByStudents(query_params);

      return jsonResponse(result.data, result.status, result.pagination);

    } catch (error) {
      console.error('Get attendance by students error:', error);
      return errorResponse(error.message || 'Failed to fetch attendance records by students', 500);
    }
  }

  /**
   * Update attendance record
   * @param {Object} c - Hono context object
   * @returns {Promise<Response>} JSON response with updated attendance
   */
  static async updateAttendance(c) {
    try {
      // Get validated data from middleware
      const { id } = c.req.valid('param');
      const updateData = c.req.valid('json');

      // Update attendance record
      const result = await attendanceService.updateAttendance(id, updateData);

      return jsonResponse(result.data, result.status);

    } catch (error) {
      console.error('Update attendance error:', error);

      if (error.message.includes('not found')) {
        return errorResponse(error.message, 404);
      }

      return errorResponse(error.message || 'Failed to update attendance record', 500);
    }
  }

  /**
   * Delete attendance record
   * @param {Object} c - Hono context object
   * @returns {Promise<Response>} JSON response with success message
   */
  static async deleteAttendance(c) {
    try {
      // Get validated ID from middleware
      const { id } = c.req.valid('param');

      // Delete attendance record
      const result = await attendanceService.deleteAttendance(id);

      return jsonResponse(result.data, result.status);

    } catch (error) {
      console.error('Delete attendance error:', error);

      if (error.message.includes('not found')) {
        return errorResponse(error.message, 404);
      }

      return errorResponse(error.message || 'Failed to delete attendance record', 500);
    }
  }

  /**
   * Restore attendance record
   * @param {Object} c - Hono context object
   * @returns {Promise<Response>} JSON response with restored attendance
   */
  static async restoreAttendance(c) {
    try {
      // Get validated ID from middleware
      const { id } = c.req.valid('param');

      // Restore attendance record
      const result = await attendanceService.restoreAttendance(parseInt(id));

      return jsonResponse(result.data, result.status);

    } catch (error) {
      console.error('Restore attendance error:', error);

      if (error.message.includes('not found')) {
        return errorResponse(error.message, 404);
      }

      return errorResponse(error.message || 'Failed to restore attendance record', 500);
    }
  }

  /**
   * Create multiple attendance records
   * @param {Object} c - Hono context object
   * @returns {Promise<Response>} JSON response with bulk creation results
   */
  static async createBulkAttendance(c) {
    try {
      // Get validated data from middleware
      const { attendances } = c.req.valid('json');

      // Create bulk attendance records
      const result = await attendanceService.createBulkAttendance(attendances);

      return jsonResponse(result.data, result.status);

    } catch (error) {
      console.error('Bulk create attendance error:', error);
      return errorResponse(error.message || 'Failed to create bulk attendance records', 500);
    }
  }

  // ==================== GUEST CRUD OPERATIONS ====================

  /**
   * Create new guest record with signature upload
   * @param {Object} c - Hono context object
   * @returns {Promise<Response>} JSON response with created guest
   */
  static async createGuest(c) {
    try {
      // Get validated form data from middleware
      const guestData = c.req.valid('form');

      // Parse form data to get signature file
      const formData = await c.req.formData();
      const signatureFile = formData.get('signature');

      // Validate signature file if provided
      if (signatureFile && !(signatureFile instanceof File)) {
        return errorResponse('Signature must be a valid file', 400);
      }

      // Create guest record with signature
      const result = await attendanceService.createGuest(guestData, signatureFile);

      return jsonResponse(result.data, result.status);

    } catch (error) {
      console.error('Create guest error:', error);
      return errorResponse(error.message || 'Failed to create guest record', 500);
    }
  }

  /**
   * Get guest record by ID
   * @param {Object} c - Hono context object
   * @returns {Promise<Response>} JSON response with guest record
   */
  static async getGuestById(c) {
    try {
      // Get validated ID from middleware
      const { id } = c.req.valid('param');

      // Fetch guest record
      const guest = await attendanceService.getGuestById(id);

      return jsonResponse(guest, 200);

    } catch (error) {
      console.error('Get guest by ID error:', error);

      if (error.message.includes('not found')) {
        return errorResponse(error.message, 404);
      }

      return errorResponse(error.message || 'Failed to fetch guest record', 500);
    }
  }

  /**
   * Get guest records with filtering and pagination
   * @param {Object} c - Hono context object
   * @returns {Promise<Response>} JSON response with paginated guest records
   */
  static async getGuests(c) {
    try {
      // Get validated query parameters from middleware
      const filters = c.req.valid('query');

      // Fetch guest records
      const result = await attendanceService.getAllGuests(filters);

      return jsonResponse(result.data, result.status);

    } catch (error) {
      console.error('Get guests error:', error);
      return errorResponse(error.message || 'Failed to fetch guest records', 500);
    }
  }

  /**
   * Update guest record with optional signature upload
   * @param {Object} c - Hono context object
   * @returns {Promise<Response>} JSON response with updated guest
   */
  static async updateGuest(c) {
    try {
      // Get validated data from middleware
      const { id } = c.req.valid('param');
      const updateData = c.req.valid('form');

      // Parse form data to get signature file
      const formData = await c.req.formData();
      const signatureFile = formData.get('signature');

      // Validate signature file if provided
      if (signatureFile && !(signatureFile instanceof File)) {
        return errorResponse('Signature must be a valid file', 400);
      }

      // Update guest record with optional signature
      const result = await attendanceService.updateGuest(id, updateData, signatureFile);

      return jsonResponse(result.data, result.status);

    } catch (error) {
      console.error('Update guest error:', error);

      if (error.message.includes('not found')) {
        return errorResponse(error.message, 404);
      }

      return errorResponse(error.message || 'Failed to update guest record', 500);
    }
  }

  /**
   * Delete guest record
   * @param {Object} c - Hono context object
   * @returns {Promise<Response>} JSON response with success message
   */
  static async deleteGuest(c) {
    try {
      // Get validated ID from middleware
      const { id } = c.req.valid('param');

      // Delete guest record
      const result = await attendanceService.deleteGuest(id);

      return jsonResponse(result.data, result.status);

    } catch (error) {
      console.error('Delete guest error:', error);

      if (error.message.includes('not found')) {
        return errorResponse(error.message, 404);
      }

      return errorResponse(error.message || 'Failed to delete guest record', 500);
    }
  }

  /**
   * Restore guest record
   * @param {Object} c - Hono context object
   * @returns {Promise<Response>} JSON response with restored guest
   */
  static async restoreGuest(c) {
    try {
      // Get validated ID from middleware
      const { id } = c.req.valid('param');

      // Restore guest record
      const result = await attendanceService.restoreGuest(parseInt(id));

      return jsonResponse(result.data, result.status);

    } catch (error) {
      console.error('Restore guest error:', error);

      if (error.message.includes('not found')) {
        return errorResponse(error.message, 404);
      }

      return errorResponse(error.message || 'Failed to restore guest record', 500);
    }
  }

  // ==================== UTILITY ENDPOINTS ====================

  /**
   * Get attendance statistics
   * @param {Object} c - Hono context object
   * @returns {Promise<Response>} JSON response with attendance statistics
   */
  static async getAttendanceStats(c) {
    try {
      // Get query parameters (optional filters)
      const filters = c.req.query() || {};

      // Get attendance statistics
      const result = await attendanceService.getAttendanceStats(filters);

      return jsonResponse(result.data, result.status);

    } catch (error) {
      console.error('Get attendance stats error:', error);
      return errorResponse(error.message || 'Failed to fetch attendance statistics', 500);
    }
  }

  /**
   * Get attendance info endpoint
   * @param {Object} c - Hono context object
   * @returns {Promise<Response>} JSON response with attendance module info
   */
  static async getAttendanceInfo(c) {
    try {
      return jsonResponse({
        message: 'Attendance module is ready',
        info: {
          attendance: {
            supported_statuses: ['hadir', 'izin', 'sakit', 'alpha', 'terlambat', 'cuti', 'dinas'],
            date_format: 'YYYY-MM-DD',
            bulk_limit: 500,
            date_range_limit: '1 year in the past'
          },
          guests: {
            signature_upload: 'Optional image file',
            visit_date_format: 'ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ)',
            visit_date_range: 'Future dates up to 1 month ahead',
            signature_folder: 'signatures/',
            supported_signature_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp']
          },
          validation_rules: {
            full_name: 'Min 2 chars, max 255 chars, letters/spaces/dots/apostrophes/hyphens only',
            address: 'Optional, max 1000 chars',
            purpose: 'Min 5 chars, max 255 chars',
            signature: 'Optional file upload, stored as image path'
          }
        }
      }, 200);

    } catch (error) {
      console.error('Get attendance info error:', error);
      return errorResponse('Failed to get attendance info', 500);
    }
  }
}
