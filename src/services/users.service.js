import bcrypt from 'bcryptjs';
import { eq, and, isNull, like, or, desc, asc, ne, sql } from 'drizzle-orm';
import { db } from '@config/database.js';
import { users, roles } from '@models/index.models.js';
import { TeachersService } from '@services/teachers.service.js';
import { StudentsService } from '@services/students.service.js';

/**
 * Users Service
 * Handles all CRUD operations for users with Drizzle ORM
 */
export class UsersService {
  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user
   */
  static async createUser(userData) {
    try {
      // Check if the role exists and get can_login property
      const [role_info] = await db
        .select({
          can_login: roles.can_login
        })
        .from(roles)
        .where(eq(roles.id, userData.id_role))
        .limit(1);

      if (!role_info) {
        throw new Error('Invalid role ID');
      }

      // Role-specific validation - check role first
      if (userData.id_role === 3) {
        // Teacher role - require nip and check for null/undefined
        if (!userData.data || userData.data.nip === null || userData.data.nip === undefined || userData.data.nip === '') {
          throw new Error('NIP is required for teachers');
        }
        // id_class is optional for teachers
      }

      if (userData.id_role === 4) {
        // Student role - require nis and id_class, check for null/undefined
        if (!userData.data || userData.data.nis === null || userData.data.nis === undefined || userData.data.nis === '') {
          throw new Error('NIS is required for students');
        }
        if (!userData.data || userData.data.id_class === null || userData.data.id_class === undefined) {
          throw new Error('ID Class is required for students');
        }
      }

      // Prepare user data based on role can_login
      let final_data = {};

      if (role_info.can_login) {
        // Role can login - require email and password
        if (!userData.data || !userData.data.email || !userData.data.password) {
          throw new Error('Email and password are required for users with login access');
        }

        // Check if email already exists (excluding soft deleted)
        const existing_user = await db
          .select()
          .from(users)
          .where(and(
            sql`JSON_EXTRACT(data, '$.email') = ${userData.data.email}`,
            isNull(users.deleted_at)
          ))
          .limit(1);

        if (existing_user.length > 0) {
          throw new Error('Email already exists');
        }

        // Hash password and prepare data
        const salt_rounds = 12;
        const hash_password = await bcrypt.hash(userData.data.password, salt_rounds);

        final_data = {
          ...userData.data,
          password: hash_password
        };
      } else {
        // Role cannot login - clean data without email/password
        const { email, password, ...clean_data } = userData.data || {};
        final_data = clean_data;
      }

      const user_to_insert = {
        full_name: userData.full_name,
        id_role: userData.id_role,
        data: final_data
      };

      // Insert new user 
      const insert_result = await db
        .insert(users)
        .values(user_to_insert);

      // Get the inserted user by ID
      const id_insert = insert_result[0].insertId;
      const [new_user] = await db
        .select()
        .from(users)
        .where(eq(users.id, id_insert))
        .limit(1);

      if (!new_user || Object.keys(new_user).length === 0) {
        throw new Error('Failed to retrieve created user');
      }

      // Handle role-specific table insertions using services
      if (userData.id_role === 3) {
        // Create teacher record using TeachersService
        const teacher_data = {
          id_user: new_user.id,
          id_class: userData.data.id_class || null, // Extract from userData.data, nullable for teachers
          nip: userData.data.nip
        };

        try {
          await TeachersService.createTeacher(teacher_data);
        } catch (error) {
          // If teacher creation fails, delete the user to maintain consistency
          await db
            .update(users)
            .set({ deleted_at: new Date() })
            .where(eq(users.id, new_user.id));
          throw new Error(`Failed to create teacher record: ${error.message}`);
        }
      }

      if (userData.id_role === 4) {
        // Create student record using StudentsService
        const student_data = {
          id_user: new_user.id,
          id_class: userData.data.id_class, // Extract from userData.data, required for students
          nis: userData.data.nis
        };

        try {
          await StudentsService.createStudent(student_data);
        } catch (error) {
          // If student creation fails, delete the user to maintain consistency
          await db
            .update(users)
            .set({ deleted_at: new Date() })
            .where(eq(users.id, new_user.id));
          throw new Error(`Failed to create student record: ${error.message}`);
        }
      }

      // Return user without password in data
      const user_response = { ...new_user };
      if (user_response.data && user_response.data.password) {
        const { password, ...data_without_password } = user_response.data;
        user_response.data = data_without_password;
      }

      return {
        data: user_response,
        status: 201,
        pagination: null
      };
    } catch (error) {
      console.log("ERROR: ", error);
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  /**
   * Get all users with pagination and filtering
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Users list with pagination info
   */
  static async getAllUsers(options = {}) {
    console.log("INI BEKERJA")
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        role = '',
        include_role = true,
        sortBy = 'created_at',
        sortOrder = 'desc'
      } = options;

      console.log("INI BEKERJA 2")

      const offset = (page - 1) * limit;

      // Build where conditions
      const whereConditions = [isNull(users.deleted_at)];
      console.log("INI BEKERJA 3")
      if (search) {
        whereConditions.push(
          or(
            like(users.full_name, `%${search}%`),
            like(users.email, `%${search}%`)
          )
        );
      }
      console.log("INI BEKERJA 4")

      if (role) {
        whereConditions.push(eq(users.id_role, parseInt(role))); // Map id_role -> id_role
      }
      console.log("INI BEKERJA 5")

      // Build order by
      const orderBy = sortOrder === 'asc'
        ? asc(users[sortBy] || users.created_at)
        : desc(users[sortBy] || users.created_at);

      // Query users
      let query;
      console.log("INI BEKERJA 6")
      if (include_role) {
        query = db
          .select({
            id: users.id,
            full_name: users.full_name,
            id_role: users.id_role, // Map id_role -> id_role
            data: users.data,
            created_at: users.created_at,
            updated_at: users.updated_at,
            role: {
              id: roles.id,
              name: roles.name,
            }
          })
          .from(users)
          .leftJoin(roles, eq(users.id_role, roles.id)) // Map id_role -> id_role
          .where(and(...whereConditions))
          .orderBy(orderBy)
          .limit(limit)
          .offset(offset);
        console.log("INI BEKERJA 7")

      } else {
        query = db
          .select({
            id: users.id,
            full_name: users.full_name,
            id_role: users.id_role, // Map id_role -> id_role
            data: users.data,
            created_at: users.created_at,
            updated_at: users.updated_at,
          })
          .from(users)
          .where(and(...whereConditions))
          .orderBy(orderBy)
          .limit(limit)
          .offset(offset);
      }

      const usersList = await query;

      // Get total count for pagination
      const [{ count }] = await db
        .select({ count: sql`count(*)` })
        .from(users)
        .where(and(...whereConditions));

      const total_pages = Math.ceil(count / limit);

      return {
        data: usersList,
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
      throw new Error(`Failed to get users: ${error.message}`);
    }
  }

  /**
   * Get user by ID
   * @param {number} userId - User ID
   * @param {boolean} include_role - Include role data
   * @returns {Promise<Object|null>} User data
   */
  static async getUserById(userId, include_role = true) {
    try {
      let query;

      if (include_role) {
        query = db
          .select({
            id: users.id,
            full_name: users.full_name,
            id_role: users.id_role,
            data: users.data,
            created_at: users.created_at,
            updated_at: users.updated_at,
            role: {
              id: roles.id,
              name: roles.name,
            }
          })
          .from(users)
          .leftJoin(roles, eq(users.id_role, roles.id)) // Map id_role -> id_role
          .where(and(
            eq(users.id, userId),
            isNull(users.deleted_at)
          ))
          .limit(1);
      } else {
        query = db
          .select({
            id: users.id,
            full_name: users.full_name,
            id_role: users.id_role, // Map id_role -> id_role
            data: users.data,
            created_at: users.created_at,
            updated_at: users.updated_at,
          })
          .from(users)
          .where(and(
            eq(users.id, userId),
            isNull(users.deleted_at)
          ))
          .limit(1);
      }

      const [user] = await query;
      return {
        data: user || null,
        status: 200,
        pagination: null
      };
    } catch (error) {
      throw new Error(`Failed to get user: ${error.message}`);
    }
  }

  /**
   * Update user by ID
   * @param {number} userId - User ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>} Updated user
   */
  static async updateUser(userId, updateData) {
    try {
      const { password, ...dataWithoutPassword } = updateData;

      // Check if user exists and not soft deleted
      const existingUserResult = await this.getUserById(userId, false);
      if (!existingUserResult.data) {
        throw new Error('User not found');
      }

      const existing_user = existingUserResult.data;

      // Role-specific validation - check role first and validate null/undefined
      if (existing_user.id_role === 3) {
        // Teacher role - validate NIP if being updated
        if (updateData.data && updateData.data.hasOwnProperty('nip')) {
          if (updateData.data.nip === null || updateData.data.nip === undefined || updateData.data.nip === '') {
            throw new Error('NIP cannot be null or empty for teachers');
          }
        }
      }

      if (existing_user.id_role === 4) {
        // Student role - validate NIS if being updated
        if (updateData.data && updateData.data.hasOwnProperty('nis')) {
          if (updateData.data.nis === null || updateData.data.nis === undefined || updateData.data.nis === '') {
            throw new Error('NIS cannot be null or empty for students');
          }
        }
        if (updateData.data && updateData.data.hasOwnProperty('id_class')) {
          if (updateData.data.id_class === null || updateData.data.id_class === undefined) {
            throw new Error('ID Class cannot be null or empty for students');
          }
        }
      }

      // If email is being updated, check for duplicates
      if (updateData.data && updateData.data.email && updateData.data.email !== (existing_user.data && existing_user.data.email)) {
        const emailExists = await db
          .select()
          .from(users)
          .where(and(
            sql`JSON_EXTRACT(data, '$.email') = ${updateData.data.email}`,
            isNull(users.deleted_at),
            ne(users.id, userId)
          ))
          .limit(1);

        if (emailExists.length > 0) {
          throw new Error('Email already exists');
        }
      }

      // Prepare update data
      const updatePayload = { ...dataWithoutPassword };

      // Hash new password if provided
      if (password) {
        const saltRounds = 12;
        updatePayload.password = await bcrypt.hash(password, saltRounds);
      }

      // Update user
      await db
        .update(users)
        .set(updatePayload)
        .where(eq(users.id, userId));

      // Handle role-specific table updates using services validation
      if (existing_user.id_role === 3 && updateData.data && (updateData.data.nip || updateData.id_class !== undefined)) {
        // For teachers, we need to find the existing teacher record first
        const [existing_teacher] = await db
          .select()
          .from(teachers)
          .where(and(
            eq(teachers.id_user, userId),
            isNull(teachers.deleted_at)
          ))
          .limit(1);

        if (existing_teacher) {
          const teacher_update_data = {};
          
          if (updateData.data.nip) {
            teacher_update_data.nip = updateData.data.nip;
          }
          
          if (updateData.id_class !== undefined) {
            teacher_update_data.id_class = updateData.id_class;
          }

          if (Object.keys(teacher_update_data).length > 0) {
            try {
              await TeachersService.updateTeacher(existing_teacher.id, teacher_update_data);
            } catch (error) {
              throw new Error(`Failed to update teacher record: ${error.message}`);
            }
          }
        }
      }

      if (existing_user.id_role === 4 && updateData.data && (updateData.data.nis || updateData.id_class !== undefined)) {
        // For students, we need to find the existing student record first
        const [existing_student] = await db
          .select()
          .from(students)
          .where(and(
            eq(students.id_user, userId),
            isNull(students.deleted_at)
          ))
          .limit(1);

        if (existing_student) {
          const student_update_data = {};
          
          if (updateData.data.nis) {
            student_update_data.nis = updateData.data.nis;
          }
          
          if (updateData.id_class !== undefined) {
            student_update_data.id_class = updateData.id_class;
          }

          if (Object.keys(student_update_data).length > 0) {
            try {
              await StudentsService.updateStudent(existing_student.id, student_update_data);
            } catch (error) {
              throw new Error(`Failed to update student record: ${error.message}`);
            }
          }
        }
      }

      // Get the updated user
      const [updatedUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!updatedUser) {
        throw new Error('Failed to update user');
      }

      // Return updated user without password
      const user_response = { ...updatedUser };
      if (user_response.data && user_response.data.password) {
        const { password: _, ...data_without_password } = user_response.data;
        user_response.data = data_without_password;
      }

      return {
        data: user_response,
        status: 200,
        pagination: null
      };
    } catch (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  /**
   * Soft delete user by ID
   * @param {number} userId - User ID
   * @returns {Promise<boolean>} Success status
   */
  static async deleteUser(userId) {
    try {
      // Check if user exists and not already soft deleted
      const existingUserResult = await this.getUserById(userId, false);
      if (!existingUserResult.data) {
        throw new Error('User not found');
      }

      // Soft delete by setting deleted_at timestamp
      const updateResult = await db
        .update(users)
        .set({ deleted_at: new Date() })
        .where(eq(users.id, userId));

      // Check if the update was successful
      const success = updateResult.affectedRows > 0;

      return {
        data: success,
        status: 200,
        pagination: null
      };
    } catch (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }

  /**
   * Restore soft deleted user
   * @param {number} userId - User ID
   * @returns {Promise<Object|null>} Restored user
   */
  static async restoreUser(userId) {
    try {
      // Check if user exists and is soft deleted
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!existingUser) {
        throw new Error('User not found');
      }

      if (!existingUser.deleted_at) {
        throw new Error('User is not deleted');
      }

      // Restore user by setting deleted_at to null
      await db
        .update(users)
        .set({ deleted_at: null })
        .where(eq(users.id, userId));

      // Get the restored user
      const [restoredUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!restoredUser) {
        throw new Error('Failed to restore user');
      }

      // Return user without password
      const { password: _, ...userWithoutPassword } = restoredUser;
      return {
        data: userWithoutPassword,
        status: 200,
        pagination: null
      };
    } catch (error) {
      throw new Error(`Failed to restore user: ${error.message}`);
    }
  }

  /**
   * Get user by email (for authentication purposes)
   * @param {string} email - User email
   * @returns {Promise<Object|null>} User with password
   */
  static async getUserByEmail(email) {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(and(
          sql`JSON_EXTRACT(data, '$.email') = ${email}`,
          isNull(users.deleted_at)
        ))
        .limit(1);

      return {
        data: user || null,
        status: 200,
        pagination: null
      };
    } catch (error) {
      throw new Error(`Failed to get user by email: ${error.message}`);
    }
  }

  /**
   * Verify user password
   * @param {string} plain_password - Plain text password
   * @param {string} hashed_password - Hashed password
   * @returns {Promise<boolean>} Password match status
   */
  static async verifyPassword(plain_password, hashed_password) {
    try {
      return {
        data: await bcrypt.compare(plain_password, hashed_password),
        status: 200,
        pagination: null
      };
    } catch (error) {
      throw new Error(`Failed to verify password: ${error.message}`);
    }
  }

  /**
   * Get users count by role
   * @returns {Promise<Array>} Role statistics
   */
  static async getUsersCountByRole() {
    try {
      const roleStats = await db
        .select({
          roleId: users.id_role, // Map id_role -> roleId
          roleName: roles.name,
          count: sql`count(*)`,
        })
        .from(users)
        .leftJoin(roles, eq(users.id_role, roles.id)) // Map id_role -> id_role
        .where(isNull(users.deleted_at))
        .groupBy(users.id_role, roles.name);

      return {
        data: roleStats,
        status: 200,
        pagination: null
      };
    } catch (error) {
      throw new Error(`Failed to get users count by role: ${error.message}`);
    }
  }
}