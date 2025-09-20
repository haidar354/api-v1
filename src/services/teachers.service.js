import { eq, and, isNull, like, or, desc, asc, ne, sql } from 'drizzle-orm';
import { db } from '../config/database.js';
import { teachers, users, classes, departments, academicYears } from '../models/index.models.js';

/**
 * Teachers Service
 * Handles all CRUD operations for teachers with Drizzle ORM
 */
export class TeachersService {
  /**
   * Create a new teacher
   * @param {Object} teacherData - Teacher data
   * @returns {Promise<Object>} Created teacher
   */
  static async createTeacher(teacherData) {
    try {
      // Check if user exists and not soft deleted
      const [existing_user] = await db
        .select()
        .from(users)
        .where(and(
          eq(users.id, teacherData.id_user),
          isNull(users.deleted_at)
        ))
        .limit(1);

      if (!existing_user) {
        throw new Error('User not found');
      }

      // Check if NIP already exists (excluding soft deleted)
      const existing_nip = await db
        .select()
        .from(teachers)
        .where(and(
          eq(teachers.nip, teacherData.nip),
          isNull(teachers.deleted_at)
        ))
        .limit(1);

      if (existing_nip.length > 0) {
        throw new Error('NIP already exists');
      }

      // Check if user is already a teacher (excluding soft deleted)
      const existing_teacher = await db
        .select()
        .from(teachers)
        .where(and(
          eq(teachers.id_user, teacherData.id_user),
          isNull(teachers.deleted_at)
        ))
        .limit(1);

      if (existing_teacher.length > 0) {
        throw new Error('User is already registered as a teacher');
      }

      // Insert new teacher
      const insert_result = await db
        .insert(teachers)
        .values(teacherData);

      // Get the inserted teacher by ID with relationships
      const id_insert = insert_result[0].insertId;
      const teacher_result = await this.getTeacherById(id_insert);

      if (!teacher_result.data) {
        throw new Error('Failed to retrieve created teacher');
      }

      return {
        data: teacher_result.data,
        status: 201,
        pagination: null
      };
    } catch (error) {
      console.log("ERROR: ", error);
      throw new Error(`Failed to create teacher: ${error.message}`);
    }
  }

  /**
   * Get all teachers with pagination and filtering
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Teachers list with pagination info
   */
  static async getAllTeachers(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        class: class_filter = '',
        sortBy = 'created_at',
        sortOrder = 'desc'
      } = options;

      const offset = (page - 1) * limit;

      // Build where conditions
      const where_conditions = [isNull(teachers.deleted_at)];

      if (search) {
        where_conditions.push(
          or(
            like(teachers.nip, `%${search}%`),
            like(users.full_name, `%${search}%`)
          )
        );
      }

      if (class_filter) {
        where_conditions.push(eq(teachers.id_class, parseInt(class_filter)));
      }

      // Build order by
      const order_by = sortOrder === 'asc'
        ? asc(teachers[sortBy] || teachers.created_at)
        : desc(teachers[sortBy] || teachers.created_at);

      // Query teachers with relationships
      const teachers_list = await db
        .select({
          id: teachers.id,
          id_user: teachers.id_user,
          id_class: teachers.id_class,
          nip: teachers.nip,
          created_at: teachers.created_at,
          updated_at: teachers.updated_at,
          user: {
            id: users.id,
            full_name: users.full_name,
            data: users.data
          },
          class: {
            id: classes.id,
            grade: classes.grade
          }
        })
        .from(teachers)
        .leftJoin(users, eq(teachers.id_user, users.id))
        .leftJoin(classes, eq(teachers.id_class, classes.id))
        .where(and(...where_conditions))
        .orderBy(order_by)
        .limit(limit)
        .offset(offset);

      // Get total count for pagination
      const [{ count }] = await db
        .select({ count: sql`count(*)` })
        .from(teachers)
        .leftJoin(users, eq(teachers.id_user, users.id))
        .where(and(...where_conditions));

      const total_pages = Math.ceil(count / limit);

      return {
        data: teachers_list,
        status: 200,
        pagination: {
          current_page: page,
          total_pages,
          total_items: count,
          items_per_page: limit,
          has_next_page: page < total_pages,
          has_prev_page: page > 1,
        }
      };
    } catch (error) {
      throw new Error(`Failed to get teachers: ${error.message}`);
    }
  }

  /**
   * Get teacher by ID
   * @param {number} teacherId - Teacher ID
   * @returns {Promise<Object|null>} Teacher data
   */
  static async getTeacherById(teacherId) {
    try {
      const [teacher] = await db
        .select({
          id: teachers.id,
          id_user: teachers.id_user,
          id_class: teachers.id_class,
          nip: teachers.nip,
          created_at: teachers.created_at,
          updated_at: teachers.updated_at,
          user: {
            id: users.id,
            full_name: users.full_name,
            data: users.data
          },
          class: {
            id: classes.id,
            grade: classes.grade
          }
        })
        .from(teachers)
        .leftJoin(users, eq(teachers.id_user, users.id))
        .leftJoin(classes, eq(teachers.id_class, classes.id))
        .where(and(
          eq(teachers.id, teacherId),
          isNull(teachers.deleted_at)
        ))
        .limit(1);

      return {
        data: teacher || null,
        status: 200,
        pagination: null
      };
    } catch (error) {
      throw new Error(`Failed to get teacher: ${error.message}`);
    }
  }

  /**
   * Update teacher by ID
   * @param {number} teacherId - Teacher ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>} Updated teacher
   */
  static async updateTeacher(teacherId, updateData) {
    try {
      // Check if teacher exists and not soft deleted
      const existing_teacher_result = await this.getTeacherById(teacherId);
      if (!existing_teacher_result.data) {
        throw new Error('Teacher not found');
      }

      // If user ID is being updated, check if user exists
      if (updateData.id_user) {
        const [existing_user] = await db
          .select()
          .from(users)
          .where(and(
            eq(users.id, updateData.id_user),
            isNull(users.deleted_at)
          ))
          .limit(1);

        if (!existing_user) {
          throw new Error('User not found');
        }

        // Check if user is already a teacher (excluding current teacher)
        const existing_user_teacher = await db
          .select()
          .from(teachers)
          .where(and(
            eq(teachers.id_user, updateData.id_user),
            isNull(teachers.deleted_at),
            ne(teachers.id, teacherId)
          ))
          .limit(1);

        if (existing_user_teacher.length > 0) {
          throw new Error('User is already registered as a teacher');
        }
      }

      // If class ID is being updated, check if class exists
      if (updateData.id_class) {
        const [existing_class] = await db
          .select()
          .from(classes)
          .where(and(
            eq(classes.id, updateData.id_class),
            isNull(classes.deleted_at)
          ))
          .limit(1);

        if (!existing_class) {
          throw new Error('Class not found');
        }
      }

      // If NIP is being updated, check for duplicates
      if (updateData.nip && updateData.nip !== existing_teacher_result.data.nip) {
        const existing_nip = await db
          .select()
          .from(teachers)
          .where(and(
            eq(teachers.nip, updateData.nip),
            isNull(teachers.deleted_at),
            ne(teachers.id, teacherId)
          ))
          .limit(1);

        if (existing_nip.length > 0) {
          throw new Error('NIP already exists');
        }
      }

      // Update teacher
      await db
        .update(teachers)
        .set(updateData)
        .where(eq(teachers.id, teacherId));

      // Get the updated teacher
      const updated_teacher_result = await this.getTeacherById(teacherId);

      if (!updated_teacher_result.data) {
        throw new Error('Failed to update teacher');
      }

      return {
        data: updated_teacher_result.data,
        status: 200,
        pagination: null
      };
    } catch (error) {
      throw new Error(`Failed to update teacher: ${error.message}`);
    }
  }

  /**
   * Soft delete teacher by ID
   * @param {number} teacherId - Teacher ID
   * @returns {Promise<boolean>} Success status
   */
  static async deleteTeacher(teacherId) {
    try {
      // Check if teacher exists and not already soft deleted
      const existing_teacher_result = await this.getTeacherById(teacherId);
      if (!existing_teacher_result.data) {
        throw new Error('Teacher not found');
      }

      // Soft delete by setting deleted_at timestamp
      const update_result = await db
        .update(teachers)
        .set({ deleted_at: new Date() })
        .where(eq(teachers.id, teacherId));

      // Check if the update was successful
      const success = update_result.affectedRows > 0;

      return {
        data: success,
        status: 200,
        pagination: null
      };
    } catch (error) {
      throw new Error(`Failed to delete teacher: ${error.message}`);
    }
  }

  /**
   * Restore soft deleted teacher
   * @param {number} teacherId - Teacher ID
   * @returns {Promise<Object|null>} Restored teacher
   */
  static async restoreTeacher(teacherId) {
    try {
      // Check if teacher exists and is soft deleted
      const [existing_teacher] = await db
        .select()
        .from(teachers)
        .where(eq(teachers.id, teacherId))
        .limit(1);

      if (!existing_teacher) {
        throw new Error('Teacher not found');
      }

      if (!existing_teacher.deleted_at) {
        throw new Error('Teacher is not deleted');
      }

      // Check if NIP would conflict after restore
      const existing_nip = await db
        .select()
        .from(teachers)
        .where(and(
          eq(teachers.nip, existing_teacher.nip),
          isNull(teachers.deleted_at),
          ne(teachers.id, teacherId)
        ))
        .limit(1);

      if (existing_nip.length > 0) {
        throw new Error('Cannot restore: NIP already exists');
      }

      // Check if user would conflict after restore
      const existing_user_teacher = await db
        .select()
        .from(teachers)
        .where(and(
          eq(teachers.id_user, existing_teacher.id_user),
          isNull(teachers.deleted_at),
          ne(teachers.id, teacherId)
        ))
        .limit(1);

      if (existing_user_teacher.length > 0) {
        throw new Error('Cannot restore: User is already registered as a teacher');
      }

      // Restore teacher by setting deleted_at to null
      await db
        .update(teachers)
        .set({ deleted_at: null })
        .where(eq(teachers.id, teacherId));

      // Get the restored teacher
      const restored_teacher_result = await this.getTeacherById(teacherId);

      if (!restored_teacher_result.data) {
        throw new Error('Failed to restore teacher');
      }

      return {
        data: restored_teacher_result.data,
        status: 200,
        pagination: null
      };
    } catch (error) {
      throw new Error(`Failed to restore teacher: ${error.message}`);
    }
  }

  /**
   * Get teachers count by class
   * @returns {Promise<Array>} Class statistics
   */
  static async getTeachersCountByClass() {
    try {
      const class_stats = await db
        .select({
          id_class: teachers.id_class,
          grade: classes.grade,
          count: sql`count(*)`,
        })
        .from(teachers)
        .leftJoin(classes, eq(teachers.id_class, classes.id))
        .where(isNull(teachers.deleted_at))
        .groupBy(teachers.id_class, classes.grade);

      return {
        data: class_stats,
        status: 200,
        pagination: null
      };
    } catch (error) {
      throw new Error(`Failed to get teachers count by class: ${error.message}`);
    }
  }

  /**
   * Health check for teachers service
   * @returns {Promise<Object>} Health status with statistics
   */
  static async healthCheck() {
    try {
      // Get total teachers count
      const [{ total_teachers }] = await db
        .select({ total_teachers: sql`count(*)` })
        .from(teachers)
        .where(isNull(teachers.deleted_at));

      // Get teachers by class count
      const class_stats = await this.getTeachersCountByClass();

      return {
        data: {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          statistics: {
            total_teachers,
            classes_with_teachers: class_stats.data.length
          }
        },
        status: 200,
        pagination: null
      };
    } catch (error) {
      throw new Error(`Teachers service health check failed: ${error.message}`);
    }
  }

  /**
   * Process Excel data format and convert to user creation format for teachers
   * @param {Array} excelData - Array of Excel row objects
   * @returns {Promise<Array>} Processed user data array
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
          const grade = normalized_row['kelas'] || row['Kelas'];
          const department_name = normalized_row['jurusan'] || row['Jurusan'];
          const subgrade = normalized_row['subkelas'] || row['Subkelas'];
          const nip = String(normalized_row['nip'] || row['NIP']);
          const academic_year = normalized_row['tahun ajaran'] || row['Tahun Ajaran'];

          // Validate required fields (only full_name and nip are required)
          if (!full_name || !nip) {
            errors.push({
              index: i,
              error: 'Missing required fields: Nama Lengkap, NIP'
            });
            continue;
          }

          let id_class = null;

          // If any class-related field is provided, try to resolve the class
          if (grade && department_name && subgrade && academic_year) {
            // Check if all required class fields are provided
            if (!grade || !department_name || !academic_year) {
              // If some class fields are provided but not all, set id_class to null
              id_class = null;
            } else {
              // Find department by name
              const [department] = await db
                .select({ id: departments.id })
                .from(departments)
                .where(and(
                  eq(departments.name, department_name),
                  isNull(departments.deleted_at)
                ))
                .limit(1);

              if (!department) {
                errors.push({
                  index: i,
                  nip: nip,
                  error: `Department '${department_name}' not found`
                });
                continue;
              }

              // Find academic year by year
              const [academic_year_record] = await db
                .select({ id: academicYears.id })
                .from(academicYears)
                .where(and(
                  eq(academicYears.year, academic_year),
                  isNull(academicYears.deleted_at)
                ))
                .limit(1);

              if (!academic_year_record) {
                errors.push({
                  index: i,
                  nip: nip,
                  error: `Academic year '${academic_year}' not found`
                });
                continue;
              }

              // Find class by grade, subgrade, department, and academic year
              const class_where_conditions = [
                eq(classes.grade, grade),
                eq(classes.id_department, department.id),
                eq(classes.id_academic_year, academic_year_record.id),
                isNull(classes.deleted_at)
              ];

              // Add subgrade condition if provided
              if (subgrade) {
                class_where_conditions.push(eq(classes.subgrade, String(subgrade)));
              } else {
                class_where_conditions.push(isNull(classes.subgrade));
              }

              const [class_record] = await db
                .select({ id: classes.id })
                .from(classes)
                .where(and(...class_where_conditions))
                .limit(1);

              if (!class_record) {
                errors.push({
                  index: i,
                  nip: nip,
                  error: `Class not found for grade '${grade}', department '${department_name}', subgrade '${subgrade || 'none'}', academic year '${academic_year}'`
                });
                continue;
              }

              id_class = class_record.id;
            }
          }

          // Create processed user object
          const processed_user = {
            full_name: full_name,
            id_role: 3, // Teacher role
            data: {
              nip: nip,
              id_class: id_class
            }
          };

          processed_data.push(processed_user);

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
}
