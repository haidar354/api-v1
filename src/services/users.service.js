import bcrypt from 'bcryptjs';
import { eq, and, isNull, like, or, desc, asc, ne, sql } from 'drizzle-orm';
import { db } from '@config/database.js';
import { users, roles } from '@models/index.models.js';

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
      const insert_id = insert_result[0].insertId;
      const [new_user] = await db
        .select()
        .from(users)
        .where(eq(users.id, insert_id))
        .limit(1);

      if (!new_user || Object.keys(new_user).length === 0) {
        throw new Error('Failed to retrieve created user');
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

      const offset = (page - 1) * limit;

      // Build where conditions
      const whereConditions = [isNull(users.deleted_at)];

      if (search) {
        whereConditions.push(
          or(
            like(users.full_name, `%${search}%`),
            like(users.email, `%${search}%`)
          )
        );
      }

      if (role) {
        whereConditions.push(eq(users.id_role, parseInt(role))); // Map id_role -> id_role
      }

      // Build order by
      const orderBy = sortOrder === 'asc'
        ? asc(users[sortBy] || users.created_at)
        : desc(users[sortBy] || users.created_at);

      // Query users
      let query;
      if (include_role) {
        query = db
          .select({
            id: users.id,
            full_name: users.full_name,
            email: users.email,
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
      } else {
        query = db
          .select({
            id: users.id,
            full_name: users.full_name,
            email: users.email,
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
            email: users.email,
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
            email: users.email,
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

      // If email is being updated, check for duplicates
      if (updateData.email && updateData.email !== existingUserResult.data.email) {
        const emailExists = await db
          .select()
          .from(users)
          .where(and(
            sql`JSON_EXTRACT(data, '$.email') = ${updateData.email}`,
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
      const { password: _, ...userWithoutPassword } = updatedUser;
      return {
        data: userWithoutPassword,
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