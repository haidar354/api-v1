import { db } from '@config/database.js';
import { attendance, guests } from '@models/attendance.model.js';
import { users } from '@models/users.model.js';
import { eq, and, gte, lte, like, desc, asc, isNull, count } from 'drizzle-orm';
import uploadService from './upload.service.js';

/**
 * Attendance Service
 * Handles business logic for attendance and guest management
 */
class AttendanceService {

  // ==================== ATTENDANCE CRUD OPERATIONS ====================

  /**
   * Create new attendance record
   * @param {Object} attendanceData - Attendance data
   * @returns {Promise<Object>} Created attendance record
   */
  async createAttendance(attendanceData) {
    try {
      const { id_user, date, status } = attendanceData;

      // Check if attendance already exists for this user and date
      const existingAttendance = await db
        .select()
        .from(attendance)
        .where(
          and(
            eq(attendance.id_user, id_user),
            eq(attendance.date, date),
            isNull(attendance.deleted_at)
          )
        )
        .limit(1);

      if (existingAttendance.length > 0) {
        throw new Error('Attendance record already exists for this user and date');
      }

      // Verify user exists
      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, id_user))
        .limit(1);

      if (user.length === 0) {
        throw new Error('User not found');
      }

      // Create attendance record
      const [newAttendance] = await db
        .insert(attendance)
        .values({
          id_user,
          date,
          status: Array.isArray(status) ? status : [status]
        })
        .$returningId();

      // Fetch the created record with user details
      const createdAttendance = await this.getAttendanceById(newAttendance.id);

      return {
        status: 201,
        data: {
          message: 'Attendance record created successfully',
          attendance: createdAttendance
        }
      };

    } catch (error) {
      console.error('Create attendance error:', error);
      throw new Error(error.message || 'Failed to create attendance record');
    }
  }

  /**
   * Get attendance record by ID
   * @param {number} id - Attendance ID
   * @returns {Promise<Object>} Attendance record with user details
   */
  async getAttendanceById(id) {
    try {
      const result = await db
        .select({
          id: attendance.id,
          id_user: attendance.id_user,
          date: attendance.date,
          status: attendance.status,
          created_at: attendance.created_at,
          updated_at: attendance.updated_at,
          user_name: users.full_name,
          user_email: users.email
        })
        .from(attendance)
        .leftJoin(users, eq(attendance.id_user, users.id))
        .where(
          and(
            eq(attendance.id, id),
            isNull(attendance.deleted_at)
          )
        )
        .limit(1);

      if (result.length === 0) {
        throw new Error('Attendance record not found');
      }

      return result[0];

    } catch (error) {
      console.error('Get attendance by ID error:', error);
      throw new Error(error.message || 'Failed to fetch attendance record');
    }
  }

  /**
   * Get attendance records with filtering and pagination
   * @param {Object} filters - Query filters
   * @returns {Promise<Object>} Paginated attendance records
   */
  async getAttendances(filters = {}) {
    try {
      const {
        user_id,
        start_date,
        end_date,
        status,
        page = 1,
        limit = 10
      } = filters;

      const offset = (page - 1) * limit;
      let whereConditions = [isNull(attendance.deleted_at)];

      // Apply filters
      if (user_id) {
        whereConditions.push(eq(attendance.id_user, user_id));
      }

      if (start_date) {
        whereConditions.push(gte(attendance.date, start_date));
      }

      if (end_date) {
        whereConditions.push(lte(attendance.date, end_date));
      }

      if (status) {
        whereConditions.push(like(attendance.status, `%${status}%`));
      }

      // Get total count
      const [totalResult] = await db
        .select({ count: count() })
        .from(attendance)
        .leftJoin(users, eq(attendance.id_user, users.id))
        .where(and(...whereConditions));

      const total = totalResult.count;

      // Get paginated results
      const results = await db
        .select({
          id: attendance.id,
          id_user: attendance.id_user,
          date: attendance.date,
          status: attendance.status,
          created_at: attendance.created_at,
          updated_at: attendance.updated_at,
          user_name: users.full_name,
          user_email: users.email
        })
        .from(attendance)
        .leftJoin(users, eq(attendance.id_user, users.id))
        .where(and(...whereConditions))
        .orderBy(desc(attendance.date), desc(attendance.created_at))
        .limit(limit)
        .offset(offset);

      return {
        status: 200,
        data: {
          attendances: results,
          pagination: {
            page,
            limit,
            total,
            total_pages: Math.ceil(total / limit)
          }
        }
      };

    } catch (error) {
      console.error('Get attendances error:', error);
      throw new Error(error.message || 'Failed to fetch attendance records');
    }
  }

  /**
   * Update attendance record
   * @param {number} id - Attendance ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated attendance record
   */
  async updateAttendance(id, updateData) {
    try {
      // Check if attendance exists
      const existingAttendance = await this.getAttendanceById(id);

      // Update attendance record
      await db
        .update(attendance)
        .set({
          ...updateData,
          status: Array.isArray(updateData.status) ? updateData.status : [updateData.status]
        })
        .where(eq(attendance.id, id));

      // Fetch updated record
      const updatedAttendance = await this.getAttendanceById(id);

      return {
        status: 200,
        data: {
          message: 'Attendance record updated successfully',
          attendance: updatedAttendance
        }
      };

    } catch (error) {
      console.error('Update attendance error:', error);
      throw new Error(error.message || 'Failed to update attendance record');
    }
  }

  /**
   * Delete attendance record (soft delete)
   * @param {number} id - Attendance ID
   * @returns {Promise<Object>} Success message
   */
  async deleteAttendance(id) {
    try {
      // Check if attendance exists
      await this.getAttendanceById(id);

      // Soft delete
      await db
        .update(attendance)
        .set({ deleted_at: new Date() })
        .where(eq(attendance.id, id));

      return {
        status: 200,
        data: {
          message: 'Attendance record deleted successfully'
        }
      };

    } catch (error) {
      console.error('Delete attendance error:', error);
      throw new Error(error.message || 'Failed to delete attendance record');
    }
  }

  // ==================== GUEST CRUD OPERATIONS ====================

  /**
   * Create new guest record with signature upload
   * @param {Object} guestData - Guest data
   * @param {File} signatureFile - Signature image file
   * @returns {Promise<Object>} Created guest record
   */
  async createGuest(guestData, signatureFile = null) {
    try {
      const { full_name, address, purpose, visit_date } = guestData;
      let signature_path = null;

      // Upload signature if provided
      if (signatureFile) {
        signature_path = await uploadService.saveFile(signatureFile, 'signatures');
      }

      // Create guest record
      const [newGuest] = await db
        .insert(guests)
        .values({
          full_name,
          address,
          purpose,
          visitDate: new Date(visit_date),
          signature: signature_path
        })
        .$returningId();

      // Fetch the created record
      const createdGuest = await this.getGuestById(newGuest.id);

      return {
        status: 201,
        data: {
          message: 'Guest record created successfully',
          guest: createdGuest
        }
      };

    } catch (error) {
      console.error('Create guest error:', error);
      throw new Error(error.message || 'Failed to create guest record');
    }
  }

  /**
   * Get guest record by ID
   * @param {number} id - Guest ID
   * @returns {Promise<Object>} Guest record
   */
  async getGuestById(id) {
    try {
      const result = await db
        .select()
        .from(guests)
        .where(
          and(
            eq(guests.id, id),
            isNull(guests.deleted_at)
          )
        )
        .limit(1);

      if (result.length === 0) {
        throw new Error('Guest record not found');
      }

      return result[0];

    } catch (error) {
      console.error('Get guest by ID error:', error);
      throw new Error(error.message || 'Failed to fetch guest record');
    }
  }

  /**
   * Get guest records with filtering and pagination
   * @param {Object} filters - Query filters
   * @returns {Promise<Object>} Paginated guest records
   */
  async getGuests(filters = {}) {
    try {
      const {
        start_date,
        end_date,
        search,
        page = 1,
        limit = 10
      } = filters;

      const offset = (page - 1) * limit;
      let whereConditions = [isNull(guests.deleted_at)];

      // Apply filters
      if (start_date) {
        whereConditions.push(gte(guests.visitDate, new Date(start_date)));
      }

      if (end_date) {
        const endDateTime = new Date(end_date);
        endDateTime.setHours(23, 59, 59, 999);
        whereConditions.push(lte(guests.visitDate, endDateTime));
      }

      if (search) {
        whereConditions.push(
          like(guests.full_name, `%${search}%`)
        );
      }

      // Get total count
      const [totalResult] = await db
        .select({ count: count() })
        .from(guests)
        .where(and(...whereConditions));

      const total = totalResult.count;

      // Get paginated results
      const results = await db
        .select()
        .from(guests)
        .where(and(...whereConditions))
        .orderBy(desc(guests.visitDate), desc(guests.created_at))
        .limit(limit)
        .offset(offset);

      return {
        status: 200,
        data: {
          guests: results,
          pagination: {
            page,
            limit,
            total,
            total_pages: Math.ceil(total / limit)
          }
        }
      };

    } catch (error) {
      console.error('Get guests error:', error);
      throw new Error(error.message || 'Failed to fetch guest records');
    }
  }

  /**
   * Update guest record with optional signature upload
   * @param {number} id - Guest ID
   * @param {Object} updateData - Data to update
   * @param {File} signatureFile - New signature image file (optional)
   * @returns {Promise<Object>} Updated guest record
   */
  async updateGuest(id, updateData, signatureFile = null) {
    try {
      // Check if guest exists
      const existingGuest = await this.getGuestById(id);

      let signature_path = existingGuest.signature;

      // Upload new signature if provided
      if (signatureFile) {
        signature_path = await uploadService.saveFile(signatureFile, 'signatures');
      }

      // Prepare update data
      const updatePayload = {
        ...updateData,
        signature: signature_path
      };

      // Convert visit_date to Date object if provided
      if (updateData.visit_date) {
        updatePayload.visitDate = new Date(updateData.visit_date);
        delete updatePayload.visit_date;
      }

      // Update guest record
      await db
        .update(guests)
        .set(updatePayload)
        .where(eq(guests.id, id));

      // Fetch updated record
      const updatedGuest = await this.getGuestById(id);

      return {
        status: 200,
        data: {
          message: 'Guest record updated successfully',
          guest: updatedGuest
        }
      };

    } catch (error) {
      console.error('Update guest error:', error);
      throw new Error(error.message || 'Failed to update guest record');
    }
  }

  /**
   * Delete guest record (soft delete)
   * @param {number} id - Guest ID
   * @returns {Promise<Object>} Success message
   */
  async deleteGuest(id) {
    try {
      // Check if guest exists
      await this.getGuestById(id);

      // Soft delete
      await db
        .update(guests)
        .set({ deleted_at: new Date() })
        .where(eq(guests.id, id));

      return {
        status: 200,
        data: {
          message: 'Guest record deleted successfully'
        }
      };

    } catch (error) {
      console.error('Delete guest error:', error);
      throw new Error(error.message || 'Failed to delete guest record');
    }
  }

  // ==================== BULK OPERATIONS ====================

  /**
   * Create multiple attendance records
   * @param {Array} attendancesData - Array of attendance data
   * @returns {Promise<Object>} Created attendance records
   */
  async createBulkAttendance(attendancesData) {
    try {
      const createdRecords = [];
      const errors = [];

      for (const attendanceData of attendancesData) {
        try {
          const result = await this.createAttendance(attendanceData);
          createdRecords.push(result.data.attendance);
        } catch (error) {
          errors.push({
            data: attendanceData,
            error: error.message
          });
        }
      }

      return {
        status: errors.length === 0 ? 201 : 207, // 207 Multi-Status if some failed
        data: {
          message: `Created ${createdRecords.length} attendance records`,
          created: createdRecords,
          errors: errors
        }
      };

    } catch (error) {
      console.error('Bulk create attendance error:', error);
      throw new Error(error.message || 'Failed to create bulk attendance records');
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Get attendance statistics for a date range
   * @param {Object} filters - Date range and user filters
   * @returns {Promise<Object>} Attendance statistics
   */
  async getAttendanceStats(filters = {}) {
    try {
      const { start_date, end_date, user_id } = filters;
      let whereConditions = [isNull(attendance.deleted_at)];

      if (user_id) {
        whereConditions.push(eq(attendance.id_user, user_id));
      }

      if (start_date) {
        whereConditions.push(gte(attendance.date, start_date));
      }

      if (end_date) {
        whereConditions.push(lte(attendance.date, end_date));
      }

      const results = await db
        .select({
          status: attendance.status,
          count: count()
        })
        .from(attendance)
        .where(and(...whereConditions))
        .groupBy(attendance.status);

      const stats = {
        total: 0,
        hadir: 0,
        izin: 0,
        sakit: 0,
        alpha: 0,
        terlambat: 0,
        cuti: 0,
        dinas: 0
      };

      results.forEach(result => {
        const statusArray = Array.isArray(result.status) ? result.status : [result.status];
        statusArray.forEach(status => {
          if (stats.hasOwnProperty(status)) {
            stats[status] += result.count;
            stats.total += result.count;
          }
        });
      });

      return {
        status: 200,
        data: {
          statistics: stats,
          date_range: {
            start_date,
            end_date
          }
        }
      };

    } catch (error) {
      console.error('Get attendance stats error:', error);
      throw new Error(error.message || 'Failed to fetch attendance statistics');
    }
  }
}

export default new AttendanceService();
