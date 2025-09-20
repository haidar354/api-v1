import { eq, and, isNull, like, or, desc, asc, ne, sql } from 'drizzle-orm';
import { db } from '../config/database.js';
import { students, users, classes } from '../models/index.models.js';

/**
 * Students Service
 * Handles all CRUD operations for students with Drizzle ORM
 */
export class StudentsService {
  /**
   * Create a new student
   * @param {Object} studentData - Student data
   * @returns {Promise<Object>} Created student
   */
  static async createStudent(studentData) {
    try {
      // Check if user exists and not soft deleted
      const [existing_user] = await db
        .select()
        .from(users)
        .where(and(
          eq(users.id, studentData.id_user),
          isNull(users.deleted_at)
        ))
        .limit(1);

      if (!existing_user) {
        throw new Error('User not found');
      }

      // Check if class exists and not soft deleted
      const [existing_class] = await db
        .select()
        .from(classes)
        .where(and(
          eq(classes.id, studentData.id_class),
          isNull(classes.deleted_at)
        ))
        .limit(1);

      if (!existing_class) {
        throw new Error('Class not found');
      }

      // Check if NIS already exists (excluding soft deleted)
      const existing_nis = await db
        .select()
        .from(students)
        .where(and(
          eq(students.nis, studentData.nis),
          isNull(students.deleted_at)
        ))
        .limit(1);

      if (existing_nis.length > 0) {
        throw new Error('NIS already exists');
      }

      // Check if user is already a student (excluding soft deleted)
      const existing_student = await db
        .select()
        .from(students)
        .where(and(
          eq(students.id_user, studentData.id_user),
          isNull(students.deleted_at)
        ))
        .limit(1);

      if (existing_student.length > 0) {
        throw new Error('User is already registered as a student');
      }

      // Insert new student
      const insert_result = await db
        .insert(students)
        .values(studentData);

      // Get the inserted student by ID with relationships
      const id_insert = insert_result[0].insertId;
      const student_result = await this.getStudentById(id_insert);

      if (!student_result.data) {
        throw new Error('Failed to retrieve created student');
      }

      return {
        data: student_result.data,
        status: 201,
        pagination: null
      };
    } catch (error) {
      console.log("ERROR: ", error);
      throw new Error(`Failed to create student: ${error.message}`);
    }
  }

  /**
   * Get all students with pagination and filtering
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Students list with pagination info
   */
  static async getAllStudents(options = {}) {
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
      const where_conditions = [isNull(students.deleted_at)];

      if (search) {
        where_conditions.push(
          or(
            like(students.nis, `%${search}%`),
            like(users.full_name, `%${search}%`)
          )
        );
      }

      if (class_filter) {
        where_conditions.push(eq(students.id_class, parseInt(class_filter)));
      }

      // Build order by
      const order_by = sortOrder === 'asc'
        ? asc(students[sortBy] || students.created_at)
        : desc(students[sortBy] || students.created_at);

      // Query students with relationships
      const students_list = await db
        .select({
          id: students.id,
          id_user: students.id_user,
          id_class: students.id_class,
          nis: students.nis,
          created_at: students.created_at,
          updated_at: students.updated_at,
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
        .from(students)
        .leftJoin(users, eq(students.id_user, users.id))
        .leftJoin(classes, eq(students.id_class, classes.id))
        .where(and(...where_conditions))
        .orderBy(order_by)
        .limit(limit)
        .offset(offset);

      // Get total count for pagination
      const [{ count }] = await db
        .select({ count: sql`count(*)` })
        .from(students)
        .leftJoin(users, eq(students.id_user, users.id))
        .where(and(...where_conditions));

      const total_pages = Math.ceil(count / limit);

      return {
        data: students_list,
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
      throw new Error(`Failed to get students: ${error.message}`);
    }
  }

  /**
   * Get student by ID
   * @param {number} studentId - Student ID
   * @returns {Promise<Object|null>} Student data
   */
  static async getStudentById(studentId) {
    try {
      const [student] = await db
        .select({
          id: students.id,
          id_user: students.id_user,
          id_class: students.id_class,
          nis: students.nis,
          created_at: students.created_at,
          updated_at: students.updated_at,
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
        .from(students)
        .leftJoin(users, eq(students.id_user, users.id))
        .leftJoin(classes, eq(students.id_class, classes.id))
        .where(and(
          eq(students.id, studentId),
          isNull(students.deleted_at)
        ))
        .limit(1);

      return {
        data: student || null,
        status: 200,
        pagination: null
      };
    } catch (error) {
      throw new Error(`Failed to get student: ${error.message}`);
    }
  }

  /**
   * Update student by ID
   * @param {number} studentId - Student ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>} Updated student
   */
  static async updateStudent(studentId, updateData) {
    try {
      // Check if student exists and not soft deleted
      const existing_student_result = await this.getStudentById(studentId);
      if (!existing_student_result.data) {
        throw new Error('Student not found');
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

        // Check if user is already a student (excluding current student)
        const existing_user_student = await db
          .select()
          .from(students)
          .where(and(
            eq(students.id_user, updateData.id_user),
            isNull(students.deleted_at),
            ne(students.id, studentId)
          ))
          .limit(1);

        if (existing_user_student.length > 0) {
          throw new Error('User is already registered as a student');
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

      // If NIS is being updated, check for duplicates
      if (updateData.nis && updateData.nis !== existing_student_result.data.nis) {
        const existing_nis = await db
          .select()
          .from(students)
          .where(and(
            eq(students.nis, updateData.nis),
            isNull(students.deleted_at),
            ne(students.id, studentId)
          ))
          .limit(1);

        if (existing_nis.length > 0) {
          throw new Error('NIS already exists');
        }
      }

      // Update student
      await db
        .update(students)
        .set(updateData)
        .where(eq(students.id, studentId));

      // Get the updated student
      const updated_student_result = await this.getStudentById(studentId);

      if (!updated_student_result.data) {
        throw new Error('Failed to update student');
      }

      return {
        data: updated_student_result.data,
        status: 200,
        pagination: null
      };
    } catch (error) {
      throw new Error(`Failed to update student: ${error.message}`);
    }
  }

  /**
   * Soft delete student by ID
   * @param {number} studentId - Student ID
   * @returns {Promise<boolean>} Success status
   */
  static async deleteStudent(studentId) {
    try {
      // Check if student exists and not already soft deleted
      const existing_student_result = await this.getStudentById(studentId);
      if (!existing_student_result.data) {
        throw new Error('Student not found');
      }

      // Soft delete by setting deleted_at timestamp
      const update_result = await db
        .update(students)
        .set({ deleted_at: new Date() })
        .where(eq(students.id, studentId));

      // Check if the update was successful
      const success = update_result.affectedRows > 0;

      return {
        data: success,
        status: 200,
        pagination: null
      };
    } catch (error) {
      throw new Error(`Failed to delete student: ${error.message}`);
    }
  }

  /**
   * Restore soft deleted student
   * @param {number} studentId - Student ID
   * @returns {Promise<Object|null>} Restored student
   */
  static async restoreStudent(studentId) {
    try {
      // Check if student exists and is soft deleted
      const [existing_student] = await db
        .select()
        .from(students)
        .where(eq(students.id, studentId))
        .limit(1);

      if (!existing_student) {
        throw new Error('Student not found');
      }

      if (!existing_student.deleted_at) {
        throw new Error('Student is not deleted');
      }

      // Check if NIS would conflict after restore
      const existing_nis = await db
        .select()
        .from(students)
        .where(and(
          eq(students.nis, existing_student.nis),
          isNull(students.deleted_at),
          ne(students.id, studentId)
        ))
        .limit(1);

      if (existing_nis.length > 0) {
        throw new Error('Cannot restore: NIS already exists');
      }

      // Check if user would conflict after restore
      const existing_user_student = await db
        .select()
        .from(students)
        .where(and(
          eq(students.id_user, existing_student.id_user),
          isNull(students.deleted_at),
          ne(students.id, studentId)
        ))
        .limit(1);

      if (existing_user_student.length > 0) {
        throw new Error('Cannot restore: User is already registered as a student');
      }

      // Restore student by setting deleted_at to null
      await db
        .update(students)
        .set({ deleted_at: null })
        .where(eq(students.id, studentId));

      // Get the restored student
      const restored_student_result = await this.getStudentById(studentId);

      if (!restored_student_result.data) {
        throw new Error('Failed to restore student');
      }

      return {
        data: restored_student_result.data,
        status: 200,
        pagination: null
      };
    } catch (error) {
      throw new Error(`Failed to restore student: ${error.message}`);
    }
  }

  /**
   * Get students count by class
   * @returns {Promise<Array>} Class statistics
   */
  static async getStudentsCountByClass() {
    try {
      const class_stats = await db
        .select({
          id_class: students.id_class,
          grade: classes.grade,
          count: sql`count(*)`,
        })
        .from(students)
        .leftJoin(classes, eq(students.id_class, classes.id))
        .where(isNull(students.deleted_at))
        .groupBy(students.id_class, classes.grade);

      return {
        data: class_stats,
        status: 200,
        pagination: null
      };
    } catch (error) {
      throw new Error(`Failed to get students count by class: ${error.message}`);
    }
  }

  /**
   * Health check for students service
   * @returns {Promise<Object>} Health status with statistics
   */
  static async healthCheck() {
    try {
      // Get total students count
      const [{ total_students }] = await db
        .select({ total_students: sql`count(*)` })
        .from(students)
        .where(isNull(students.deleted_at));

      // Get students by class count
      const class_stats = await this.getStudentsCountByClass();

      return {
        data: {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          statistics: {
            total_students,
            classes_with_students: class_stats.data.length
          }
        },
        status: 200,
        pagination: null
      };
    } catch (error) {
      throw new Error(`Students service health check failed: ${error.message}`);
    }
  }
}
