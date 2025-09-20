import { db } from '../config/database.js';
import { attendance, guests } from '../models/attendance.model.js';
import { users, roles } from '../models/users.model.js';
import { eq, and, gte, lte, like, desc, asc, isNull, count, isNotNull, sql } from 'drizzle-orm';
import uploadService from './upload.service.js';
import { classes, departments } from '../models/classes.model.js';
import { academicYears } from '../models/academic.model.js';
import { students } from '../models/students.model.js';

/**
 * Attendance Service
 * Handles business logic for attendance and guest management
 */
class AttendanceService {

  // ==================== HEALTH CHECK ====================

  /**
   * Health check for attendance service
   * @returns {Promise<Object>} Health status and statistics
   */
  static async healthCheck() {
    try {
      // Test database connectivity by querying all attendance entities
      const [attendance_result] = await db
        .select({ count: count() })
        .from(attendance)
        .where(isNull(attendance.deleted_at));

      const [guests_result] = await db
        .select({ count: count() })
        .from(guests)
        .where(isNull(guests.deleted_at));

      const health_data = {
        service: 'attendance',
        status: 'healthy',
        timestamp: new Date().toISOString(),
        statistics: {
          total_attendance_records: attendance_result.count,
          total_guest_records: guests_result.count
        }
      };

      return {
        data: health_data,
        status: 200,
        pagination: null
      };

    } catch (error) {
      console.error('Attendance service health check error:', error);
      throw new Error(`Attendance service health check failed: ${error.message}`);
    }
  }

  // ==================== ATTENDANCE CRUD OPERATIONS ====================

  /**
   * Create new attendance record
   * @param {Object} attendance_data - Attendance data
   * @returns {Promise<Object>} Created attendance record
   */
  static async createAttendance(attendance_data) {
    try {
      const { id_user, id_class, id_role, date, time, status, information } = attendance_data;
      
      // Verify user exists
      const existing_user = await db
        .select()
        .from(users)
        .where(eq(users.id, id_user))
        .limit(1);

      if (existing_user.length === 0) {
        throw new Error('User not found');
      }

      // Verify role exists if provided
      if (id_role) {
        const existing_role = await db
          .select()
          .from(roles)
          .where(eq(roles.id, id_role))
          .limit(1);

        if (existing_role.length === 0) {
          throw new Error('Role not found');
        }
      }

      // Create attendance record
      const insert_result = await db
        .insert(attendance)
        .values({
          id_user,
          id_role: id_role || existing_user[0].id_role,
          id_class: id_class || existing_user[0].data.id_class,
          date,
          time,
          status: Array.isArray(status) ? status : [status],
          information: information || null
        });

      // Get the inserted attendance by ID
      const inserted_id = insert_result[0].insertId;
      const created_attendance = await this.getAttendanceById(inserted_id);

      return {
        data: created_attendance.data,
        status: 201,
        pagination: null
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
  static async getAttendanceById(id) {
    try {
      const attendance_result = await db
        .select({
          id: attendance.id,
          id_user: attendance.id_user,
          id_role: attendance.id_role,
          id_class: attendance.id_class,
          date: attendance.date,
          time: attendance.time,
          status: attendance.status,
          information: attendance.information,
          created_at: attendance.created_at,
          updated_at: attendance.updated_at,
          user: {
            full_name: users.full_name
          },
          role: {
            name: roles.name
          },
        })
        .from(attendance)
        .leftJoin(users, eq(attendance.id_user, users.id))
        .leftJoin(roles, eq(attendance.id_role, roles.id))
        .where(
          and(
            eq(attendance.id, id),
            isNull(attendance.deleted_at)
          )
        )
        .limit(1);

      if (attendance_result.length === 0) {
        throw new Error('Attendance record not found');
      }

      return {
        data: attendance_result[0],
        status: 200,
        pagination: null
      };

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
  static async getAllAttendances(filters = {}) {
    try {
      const {
        id_user,
        id_role,
        id_class,
        start_date,
        end_date,
        status,
        page = 1,
        limit = 10
      } = filters;

      const offset = (page - 1) * limit;
      let where_conditions = [isNull(attendance.deleted_at)];

      // Apply filters
      if (id_user) {
        where_conditions.push(eq(attendance.id_user, id_user));
      }
      if (id_class) {
        where_conditions.push(eq(attendance.id_class, id_class));
      }

      if (id_role) {
        where_conditions.push(eq(attendance.id_role, id_role));
      }

      if (start_date) {
        where_conditions.push(gte(attendance.date, start_date));
      }

      if (end_date) {
        where_conditions.push(lte(attendance.date, end_date));
      }

      if (status) {
        where_conditions.push(like(attendance.status, `%${status}%`));
      }

      // Get total count
      const [total_result] = await db
        .select({ count: count() })
        .from(attendance)
        .leftJoin(users, eq(attendance.id_user, users.id))
        .leftJoin(roles, eq(attendance.id_role, roles.id))
        .where(and(...where_conditions));

      const total = total_result.count;

      // Get paginated results
      const attendance_results = await db
        .select({
          id: attendance.id,
          id_user: attendance.id_user,
          id_role: attendance.id_role,
          id_class: attendance.id_class,
          date: attendance.date,
          time: attendance.time,
          status: attendance.status,
          information: attendance.information,
          created_at: attendance.created_at,
          updated_at: attendance.updated_at,
          user: {
            full_name: users.full_name,
          },
          role: {
            name: roles.name
          },
        })
        .from(attendance)
        .leftJoin(users, eq(attendance.id_user, users.id))
        .leftJoin(roles, eq(attendance.id_role, roles.id))
        .where(and(...where_conditions))
        .orderBy(desc(attendance.date), desc(attendance.created_at))
        .limit(limit)
        .offset(offset);

      return {
        data: attendance_results,
        status: 200,
        pagination: {
          page,
          limit,
          total,
          total_pages: Math.ceil(total / limit)
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
   * @param {Object} update_data - Data to update
   * @returns {Promise<Object>} Updated attendance record
   */
  static async updateAttendance(id, update_data) {
    try {
      // Check if attendance exists
      const existing_attendance = await this.getAttendanceById(id);

      // Verify role exists if being updated
      if (update_data.id_role) {
        const existing_role = await db
          .select()
          .from(roles)
          .where(eq(roles.id, update_data.id_role))
          .limit(1);

        if (existing_role.length === 0) {
          throw new Error('Role not found');
        }
      }

      // Update attendance record
      await db
        .update(attendance)
        .set({
          ...update_data,
          status: update_data.status ? (Array.isArray(update_data.status) ? update_data.status : [update_data.status]) : undefined
        })
        .where(eq(attendance.id, id));

      // Fetch updated record
      const updated_attendance = await this.getAttendanceById(id);

      return {
        data: updated_attendance.data,
        status: 200,
        pagination: null
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
  static async deleteAttendance(id) {
    try {
      // Check if attendance exists
      await this.getAttendanceById(id);

      // Soft delete
      await db
        .update(attendance)
        .set({ deleted_at: new Date() })
        .where(eq(attendance.id, id));

      return {
        data: {
          message: 'Attendance record deleted successfully'
        },
        status: 200,
        pagination: null
      };

    } catch (error) {
      console.error('Delete attendance error:', error);
      throw new Error(error.message || 'Failed to delete attendance record');
    }
  }

  /**
   * Restore attendance record
   * @param {number} id - Attendance ID
   * @returns {Promise<Object>} Restored attendance record
   */
  static async restoreAttendance(id) {
    try {
      // Check if attendance exists and is deleted
      const existing_attendance = await db
        .select()
        .from(attendance)
        .where(eq(attendance.id, id))
        .limit(1);

      if (existing_attendance.length === 0) {
        throw new Error('Attendance record not found');
      }

      if (!existing_attendance[0].deleted_at) {
        throw new Error('Attendance record is not deleted');
      }

      // Restore attendance record
      await db
        .update(attendance)
        .set({ deleted_at: null })
        .where(eq(attendance.id, id));

      // Fetch restored record
      const restored_attendance = await this.getAttendanceById(id);

      return {
        data: restored_attendance.data,
        status: 200,
        pagination: null
      };

    } catch (error) {
      console.error('Restore attendance error:', error);
      throw new Error(error.message || 'Failed to restore attendance record');
    }
  }

  // ==================== GUEST CRUD OPERATIONS ====================

  /**
   * Create new guest record with signature upload
   * @param {Object} guest_data - Guest data
   * @param {File} signature_file - Signature image file
   * @returns {Promise<Object>} Created guest record
   */
  static async createGuest(guest_data, signature_file = null) {
    try {
      const { full_name, address, purpose } = guest_data;
      let signature_path = null;

      if (signature_file) {
        signature_path = await uploadService.saveFile(signature_file, 'signatures');
      }

      // Insert guest record
      const insert_result = await db.insert(guests).values({
        full_name,
        address,
        purpose,
        visit_date: new Date(),
        signature: signature_path
      });

      // Get the inserted ID from MySQL
      const inserted_id = insert_result[0].insertId;

      // Fetch the created record
      const created_guest = await this.getGuestById(inserted_id);

      return {
        data: created_guest.data,
        status: 201,
        pagination: null
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
  static async getGuestById(id) {
    try {
      const guest_result = await db
        .select()
        .from(guests)
        .where(
          and(
            eq(guests.id, id),
            isNull(guests.deleted_at)
          )
        )
        .limit(1);

      if (guest_result.length === 0) {
        throw new Error('Guest record not found');
      }

      return {
        data: guest_result[0],
        status: 200,
        pagination: null
      };

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
  static async getAllGuests(filters = {}) {
    try {
      const {
        start_date,
        end_date,
        search,
        page = 1,
        limit = 10
      } = filters;

      const offset = (page - 1) * limit;
      let where_conditions = [isNull(guests.deleted_at)];

      // Apply filters
      if (start_date) {
        where_conditions.push(gte(guests.visit_date, new Date(start_date)));
      }

      if (end_date) {
        const end_date_time = new Date(end_date);
        end_date_time.setHours(23, 59, 59, 999);
        where_conditions.push(lte(guests.visit_date, end_date_time));
      }

      if (search) {
        where_conditions.push(
          like(guests.full_name, `%${search}%`)
        );
      }

      // Get total count
      const [total_result] = await db
        .select({ count: count() })
        .from(guests)
        .where(and(...where_conditions));

      const total = total_result.count;

      // Get paginated results
      const guest_results = await db
        .select()
        .from(guests)
        .where(and(...where_conditions))
        .orderBy(desc(guests.visit_date), desc(guests.created_at))
        .limit(limit)
        .offset(offset);

      return {
        data: guest_results,
        status: 200,
        pagination: {
          page,
          limit,
          total,
          total_pages: Math.ceil(total / limit)
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
   * @param {Object} update_data - Data to update
   * @param {File} signature_file - New signature image file (optional)
   * @returns {Promise<Object>} Updated guest record
   */
  static async updateGuest(id, update_data, signature_file = null) {
    try {
      // Check if guest exists
      const existing_guest = await this.getGuestById(id);

      let signature_path = existing_guest.data.signature;

      // Upload new signature if provided
      if (signature_file) {
        signature_path = await uploadService.saveFile(signature_file, 'signatures');
      }

      // Prepare update data
      const update_payload = {
        ...update_data,
        signature: signature_path
      };

      // Convert visit_date to Date object if provided
      if (update_data.visit_date) {
        update_payload.visit_date = new Date(update_data.visit_date);
      }

      // Update guest record
      await db
        .update(guests)
        .set(update_payload)
        .where(eq(guests.id, id));

      // Fetch updated record
      const updated_guest = await this.getGuestById(id);

      return {
        data: updated_guest.data,
        status: 200,
        pagination: null
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
  static async deleteGuest(id) {
    try {
      // Check if guest exists
      await this.getGuestById(id);

      // Soft delete
      await db
        .update(guests)
        .set({ deleted_at: new Date() })
        .where(eq(guests.id, id));

      return {
        data: {
          message: 'Guest record deleted successfully'
        },
        status: 200,
        pagination: null
      };

    } catch (error) {
      console.error('Delete guest error:', error);
      throw new Error(error.message || 'Failed to delete guest record');
    }
  }

  /**
   * Restore guest record
   * @param {number} id - Guest ID
   * @returns {Promise<Object>} Restored guest record
   */
  static async restoreGuest(id) {
    try {
      // Check if guest exists and is deleted
      const existing_guest = await db
        .select()
        .from(guests)
        .where(eq(guests.id, id))
        .limit(1);

      if (existing_guest.length === 0) {
        throw new Error('Guest record not found');
      }

      if (!existing_guest[0].deleted_at) {
        throw new Error('Guest record is not deleted');
      }

      // Restore guest record
      await db
        .update(guests)
        .set({ deleted_at: null })
        .where(eq(guests.id, id));

      // Fetch restored record
      const restored_guest = await this.getGuestById(id);

      return {
        data: restored_guest.data,
        status: 200,
        pagination: null
      };

    } catch (error) {
      console.error('Restore guest error:', error);
      throw new Error(error.message || 'Failed to restore guest record');
    }
  }

  // ==================== BULK OPERATIONS ====================

  /**
   * Create multiple attendance records
   * @param {Array} attendances_data - Array of attendance data
   * @returns {Promise<Object>} Created attendance records
   */
  static async createBulkAttendance(attendances_data) {
    try {
      const created_records = [];
      const errors = [];

      for (const attendance_data of attendances_data) {
        try {
          const result = await this.createAttendance(attendance_data);
          created_records.push(result.data);
        } catch (error) {
          errors.push({
            data: attendance_data,
            error: error.message
          });
        }
      }

      return {
        data: {
          created: created_records,
          errors: errors
        },
        status: errors.length === 0 ? 201 : 207, // 207 Multi-Status if some failed
        pagination: null
      };

    } catch (error) {
      console.error('Bulk create attendance error:', error);
      throw new Error(error.message || 'Failed to create bulk attendance records');
    }
  }

  // ==================== EXCEL DATA PROCESSING ====================

  /**
   * Process Excel data format and convert to bulk attendance format
   * @param {Array} excelData - Array of Excel row objects
   * @returns {Promise<Object>} Processed attendance data array
   */
  static async excelData(excelData) {
    try {
      const processed_data = [];
      const errors = [];

      for (let i = 0; i < excelData.length; i++) {
        try {
          const row = excelData[i];

          // Normalize keys to handle case-insensitive matching
          const normalized_row = {};
          Object.keys(row).forEach(key => {
            const normalized_key = key.toLowerCase().trim();
            normalized_row[normalized_key] = row[key];
          });

          // Extract data with case-insensitive key matching
          const full_name = normalized_row['nama lengkap'] || row['Nama Lengkap'];
          const date = normalized_row['tanggal'] || row['Tanggal'];
          const time = normalized_row['waktu'] || row['Waktu'];
          const information = normalized_row['informasi'] || row['Informasi'] || null;

          // Validate required fields
          if (!full_name || !date || !time) {
            errors.push({
              index: i,
              error: 'Missing required fields: Nama Lengkap, Tanggal, Waktu'
            });
            continue;
          }

          // Format time if needed (convert HH:MM to HH:MM:SS)
          let formatted_time = time;
          if (time && time.length === 5) {
            formatted_time = `${time}:00`;
          }

          // Find user by full_name
          const [user_record] = await db
            .select({ id: users.id, data: users.data })
            .from(users)
            .where(and(
              eq(users.full_name, full_name),
              isNull(users.deleted_at)
            ))
            .limit(1);

          if (!user_record) {
            errors.push({
              index: i,
              full_name: full_name,
              error: `User with name '${full_name}' not found`
            });
            continue;
          }

          // Process status fields
          const status_fields = ['hadir', 'izin', 'sakit', 'alpha', 'terlambat', 'cuti', 'dinas'];
          const status_array = [];

          for (const status_field of status_fields) {
            // Check both proper case and lowercase versions
            const proper_case_key = status_field.charAt(0).toUpperCase() + status_field.slice(1);
            const value = normalized_row[status_field] || row[proper_case_key];

            if (value && typeof value === 'string' && value.toLowerCase().trim() === 'ya') {
              status_array.push(status_field);
            }
          }

          // If no status found, default to 'alpha'
          if (status_array.length === 0) {
            status_array.push('alpha');
          }

          // Create processed attendance object
          const processed_attendance = {
            id_user: user_record.id,
            id_class: user_record.data.id_class || null,
            date: date,
            time: formatted_time,
            status: status_array
          };

          // Add information if provided
          if (information && information.trim() !== '') {
            processed_attendance.information = information.trim();
          }

          processed_data.push(processed_attendance);

        } catch (error) {
          errors.push({
            index: i,
            error: `Processing error: ${error.message}`
          });
        }
      }

      // If there are errors, throw with details
      if (errors.length > 0) {
        const error_message = `Failed to process ${errors.length} out of ${excelData.length} records`;
        const error = new Error(error_message);
        error.details = errors;
        throw error;
      }

      return {
        data: processed_data,
        status: 200,
        pagination: null
      };

    } catch (error) {
      if (error.details) {
        // Re-throw errors with details
        throw error;
      }
      throw new Error(`Failed to process Excel data: ${error.message}`);
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Get attendance statistics for a date range
   * @param {Object} filters - Date range and user filters
   * @returns {Promise<Object>} Attendance statistics
   */
  static async getAttendanceStats(filters = {}) {
    try {
      const { start_date, end_date, id_user, id_role, id_class } = filters;
      let where_conditions = [isNull(attendance.deleted_at)];

      if (id_user) {
        where_conditions.push(eq(attendance.id_user, id_user));
      }

      if (id_role) {
        where_conditions.push(eq(attendance.id_role, id_role));
      }

      if (id_class) {
        where_conditions.push(eq(attendance.id_class, id_class));
      }

      if (start_date) {
        where_conditions.push(gte(attendance.date, start_date));
      }

      if (end_date) {
        where_conditions.push(lte(attendance.date, end_date));
      }

      const stats_results = await db
        .select({
          status: attendance.status,
          count: count()
        })
        .from(attendance)
        .where(and(...where_conditions))
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

      stats_results.forEach(result => {
        const status_array = Array.isArray(result.status) ? result.status : [result.status];
        status_array.forEach(status => {
          if (stats.hasOwnProperty(status)) {
            stats[status] += result.count;
            stats.total += result.count;
          }
        });
      });

      return {
        data: {
          statistics: stats,
          date_range: {
            start_date,
            end_date
          }
        },
        status: 200,
        pagination: null
      };

    } catch (error) {
      console.error('Get attendance stats error:', error);
      throw new Error(error.message || 'Failed to fetch attendance statistics');
    }
  }

  /**
   * Get attendance statistics by class with formatted class names
   * @param {Object} filters - Date range and class filters
   * @returns {Promise<Object>} Classes with attendance statistics
   */
  static async getAttendanceByClass(filters = {}) {
    try {
      const { start_date, end_date, id_class, include_relations = false } = filters;

      // Build where conditions for classes
      const class_where_conditions = [isNull(classes.deleted_at)];

      if (id_class) {
        class_where_conditions.push(eq(classes.id, id_class));
      }

      // Build select fields based on include_relations
      let select_fields;
      if (include_relations) {
        select_fields = {
          id: classes.id,
          class: sql`CONCAT(${classes.grade}, ' ', ${departments.short_name}, COALESCE(CONCAT(' ', ${classes.subgrade}), ''))`,
          id_academic_year: classes.id_academic_year,
          academic_years: {
            id: academicYears.id,
            year: academicYears.year,
          }
        };
      } else {
        select_fields = {
          id: classes.id,
          class: sql`CONCAT(${classes.grade}, ' ', ${departments.short_name}, COALESCE(CONCAT(' ', ${classes.subgrade}), ''))`,
          id_academic_year: classes.id_academic_year,
        };
      }

      // Get all classes with formatted names
      const classes_list = await db
        .select(select_fields)
        .from(classes)
        .leftJoin(departments, eq(classes.id_department, departments.id))
        .leftJoin(academicYears, eq(classes.id_academic_year, academicYears.id))
        .where(and(...class_where_conditions))
        .orderBy(desc(classes.created_at));

      // For each class, get attendance statistics
      const classes_with_stats = await Promise.all(
        classes_list.map(async (class_item) => {
          // Build where conditions for attendance stats
          const attendance_where_conditions = [
            isNull(attendance.deleted_at),
            eq(attendance.id_class, class_item.id)
          ];

          if (start_date) {
            attendance_where_conditions.push(gte(attendance.date, start_date));
          }

          if (end_date) {
            attendance_where_conditions.push(lte(attendance.date, end_date));
          }

          // Get attendance statistics for this class
          const stats_results = await db
            .select({
              status: attendance.status,
              count: count()
            })
            .from(attendance)
            .where(and(...attendance_where_conditions))
            .groupBy(attendance.status);

          // Initialize statistics object
          const statistics = {
            total: 0,
            hadir: 0,
            izin: 0,
            sakit: 0,
            alpha: 0,
            terlambat: 0,
            cuti: 0,
            dinas: 0
          };

          // Process statistics results
          stats_results.forEach(result => {
            const status_array = Array.isArray(result.status) ? result.status : [result.status];
            status_array.forEach(status => {
              if (statistics.hasOwnProperty(status)) {
                statistics[status] += result.count;
                statistics.total += result.count;
              }
            });
          });

          return {
            ...class_item,
            statistics,
            date_range: {
              start_date,
              end_date
            }
          };
        })
      );

      return {
        data: classes_with_stats,
        status: 200,
        pagination: null
      };

    } catch (error) {
      console.error('Get attendance by class error:', error);
      throw new Error(error.message || 'Failed to fetch attendance statistics by class');
    }
  }

  /**
   * Get attendance statistics by students with formatted student information
   * @param {Object} filters - Date range, class, department, and pagination filters
   * @returns {Promise<Object>} Students with attendance statistics
   */
  static async getAttendanceByStudents(filters = {}) {
    try {
      const {
        start_date,
        end_date,
        id_class,
        id_department,
        id_academic_year,
        include_relations = false,
        page = 1,
        limit = 10
      } = filters;

      const offset = (page - 1) * limit;

      // Build where conditions for students
      const student_where_conditions = [isNull(students.deleted_at)];

      if (id_class) {
        student_where_conditions.push(eq(students.id_class, id_class));
      }

      if (id_department) {
        student_where_conditions.push(eq(students.id_department, id_department));
      }

      if (id_academic_year) {
        student_where_conditions.push(eq(classes.id_academic_year, id_academic_year));
      }

      // Build select fields based on include_relations
      let select_fields;
      if (include_relations) {
        select_fields = {
          id: students.id,
          id_class: students.id_class,
          id_department: students.id_department,
          nis: students.nis,
          full_name: users.full_name,
          id_academic_year: classes.id_academic_year,
          academic_years: {
            id: academicYears.id,
            year: academicYears.year,
          },
          departments: {
            id: departments.id,
            name: departments.name,
            short_name: departments.short_name,
          }
        };
      } else {
        select_fields = {
          id: students.id,
          id_class: students.id_class,
          id_department: students.id_department,
          nis: students.nis,
          full_name: users.full_name,
          id_academic_year: classes.id_academic_year,
        };
      }

      // Get total count for pagination
      const [total_result] = await db
        .select({ count: count() })
        .from(students)
        .leftJoin(users, eq(students.id_user, users.id))
        .leftJoin(classes, eq(students.id_class, classes.id))
        .leftJoin(departments, eq(students.id_department, departments.id))
        .leftJoin(academicYears, eq(classes.id_academic_year, academicYears.id))
        .where(and(...student_where_conditions));

      const total = total_result.count;

      // Get paginated students list with relationships
      const students_list = await db
        .select(select_fields)
        .from(students)
        .leftJoin(users, eq(students.id_user, users.id))
        .leftJoin(classes, eq(students.id_class, classes.id))
        .leftJoin(departments, eq(students.id_department, departments.id))
        .leftJoin(academicYears, eq(classes.id_academic_year, academicYears.id))
        .where(and(...student_where_conditions))
        .orderBy(desc(students.created_at))
        .limit(limit)
        .offset(offset);

      // For each student, get attendance statistics
      const students_with_stats = await Promise.all(
        students_list.map(async (student_item) => {
          // Build where conditions for attendance stats
          const attendance_where_conditions = [
            isNull(attendance.deleted_at),
            eq(attendance.id_user, student_item.id)
          ];

          if (start_date) {
            attendance_where_conditions.push(gte(attendance.date, start_date));
          }

          if (end_date) {
            attendance_where_conditions.push(lte(attendance.date, end_date));
          }

          // Get attendance statistics for this student
          const stats_results = await db
            .select({
              status: attendance.status,
              count: count()
            })
            .from(attendance)
            .where(and(...attendance_where_conditions))
            .groupBy(attendance.status);

          // Initialize statistics object
          const statistics = {
            total: 0,
            hadir: 0,
            izin: 0,
            sakit: 0,
            alpha: 0,
            terlambat: 0,
            cuti: 0,
            dinas: 0
          };

          // Process statistics results
          stats_results.forEach(result => {
            const status_array = Array.isArray(result.status) ? result.status : [result.status];
            status_array.forEach(status => {
              if (statistics.hasOwnProperty(status)) {
                statistics[status] += result.count;
                statistics.total += result.count;
              }
            });
          });

          return {
            ...student_item,
            statistics,
            date_range: {
              start_date,
              end_date
            }
          };
        })
      );

      return {
        data: students_with_stats,
        status: 200,
        pagination: {
          page,
          limit,
          total,
          total_pages: Math.ceil(total / limit)
        }
      };

    } catch (error) {
      console.error('Get attendance by students error:', error);
      throw new Error(error.message || 'Failed to fetch attendance statistics by students');
    }
  }
}

export default AttendanceService;
