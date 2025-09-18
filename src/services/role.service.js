import { eq, and, isNull, like, or, desc, asc, ne, sql } from 'drizzle-orm';
import { db } from '@config/database.js';
import { roles, rolePermissions, users } from '@models/index.models.js';

/**
 * Role Service
 * Handles all CRUD operations for roles and role permissions with Drizzle ORM
 */
export class RoleService {
  /**
   * Create a new role
   * @param {Object} role_data - Role data
   * @returns {Promise<Object>} Created role
   */
  static async createRole(role_data) {
    try {
      // Check if role name already exists (excluding soft deleted)
      const existing_role = await db
        .select()
        .from(roles)
        .where(and(
          eq(roles.name, role_data.name),
          isNull(roles.deleted_at)
        ))
        .limit(1);

      if (existing_role.length > 0) {
        throw new Error('Role name already exists');
      }
      console.log("ROLE DATA: ", role_data);
      const role_to_insert = {
        name: role_data.name,
        can_login: role_data.can_login || false
      };

      // Insert new role
      const insert_result = await db
        .insert(roles)
        .values(role_to_insert);

      // Get the inserted role by ID
      const insert_id = insert_result[0].insertId;
      const [new_role] = await db
        .select()
        .from(roles)
        .where(eq(roles.id, insert_id))
        .limit(1);

      if (!new_role || Object.keys(new_role).length === 0) {
        throw new Error('Failed to retrieve created role');
      }

      return {
        data: new_role,
        status: 201,
        pagination: null
      };
    } catch (error) {
      console.log("ERROR: ", error);
      throw new Error(`Failed to create role: ${error.message}`);
    }
  }

  /**
   * Get all roles with pagination and filtering
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Roles list with pagination info
   */
  static async getAllRoles(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        sortBy = 'created_at',
        sortOrder = 'desc'
      } = options;

      const offset = (page - 1) * limit;

      // Build where conditions
      const where_conditions = [isNull(roles.deleted_at)];

      if (search) {
        where_conditions.push(
          like(roles.name, `%${search}%`)
        );
      }

      // Build order by
      const order_by = sortOrder === 'asc'
        ? asc(roles[sortBy] || roles.created_at)
        : desc(roles[sortBy] || roles.created_at);

      // Query roles
      const roles_list = await db
        .select()
        .from(roles)
        .where(and(...where_conditions))
        .orderBy(order_by)
        .limit(limit)
        .offset(offset);

      // Get total count for pagination
      const [{ count }] = await db
        .select({ count: sql`count(*)` })
        .from(roles)
        .where(and(...where_conditions));

      const total_pages = Math.ceil(count / limit);

      return {
        data: roles_list,
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
      throw new Error(`Failed to get roles: ${error.message}`);
    }
  }

  /**
   * Get role by ID
   * @param {number} role_id - Role ID
   * @returns {Promise<Object|null>} Role data
   */
  static async getRoleById(role_id) {
    try {
      const [role] = await db
        .select()
        .from(roles)
        .where(and(
          eq(roles.id, role_id),
          isNull(roles.deleted_at)
        ))
        .limit(1);

      return {
        data: role || null,
        status: 200,
        pagination: null
      };
    } catch (error) {
      throw new Error(`Failed to get role: ${error.message}`);
    }
  }

  /**
   * Update role by ID
   * @param {number} role_id - Role ID
   * @param {Object} update_data - Data to update
   * @returns {Promise<Object|null>} Updated role
   */
  static async updateRole(role_id, update_data) {
    try {
      // Check if role exists and not soft deleted
      const existing_role_result = await this.getRoleById(role_id);
      if (!existing_role_result.data) {
        throw new Error('Role not found');
      }

      // If name is being updated, check for duplicates
      if (update_data.name && update_data.name !== existing_role_result.data.name) {
        const name_exists = await db
          .select()
          .from(roles)
          .where(and(
            eq(roles.name, update_data.name),
            isNull(roles.deleted_at),
            ne(roles.id, role_id)
          ))
          .limit(1);

        if (name_exists.length > 0) {
          throw new Error('Role name already exists');
        }
      }

      // Update role
      await db
        .update(roles)
        .set(update_data)
        .where(eq(roles.id, role_id));

      // Get the updated role
      const [updated_role] = await db
        .select()
        .from(roles)
        .where(eq(roles.id, role_id))
        .limit(1);

      if (!updated_role) {
        throw new Error('Failed to update role');
      }

      return {
        data: updated_role,
        status: 200,
        pagination: null
      };
    } catch (error) {
      throw new Error(`Failed to update role: ${error.message}`);
    }
  }

  /**
   * Soft delete role by ID
   * @param {number} role_id - Role ID
   * @returns {Promise<boolean>} Success status
   */
  static async deleteRole(role_id) {
    try {
      // Check if role exists and not already soft deleted
      const existing_role_result = await this.getRoleById(role_id);
      if (!existing_role_result.data) {
        throw new Error('Role not found');
      }

      // Check if role is being used by any users
      const [users_count] = await db
        .select({ count: sql`count(*)` })
        .from(users)
        .where(and(
          eq(users.id_role, role_id),
          isNull(users.deleted_at)
        ));

      if (users_count.count > 0) {
        throw new Error('Cannot delete role that is assigned to users');
      }

      // Soft delete by setting deleted_at timestamp
      const update_result = await db
        .update(roles)
        .set({ deleted_at: new Date() })
        .where(eq(roles.id, role_id));

      // Check if the update was successful
      const success = update_result.affectedRows > 0;

      return {
        data: success,
        status: 200,
        pagination: null
      };
    } catch (error) {
      throw new Error(`Failed to delete role: ${error.message}`);
    }
  }

  /**
   * Restore soft deleted role
   * @param {number} role_id - Role ID
   * @returns {Promise<Object|null>} Restored role
   */
  static async restoreRole(role_id) {
    try {
      // Check if role exists and is soft deleted
      const [existing_role] = await db
        .select()
        .from(roles)
        .where(eq(roles.id, role_id))
        .limit(1);

      if (!existing_role) {
        throw new Error('Role not found');
      }

      if (!existing_role.deleted_at) {
        throw new Error('Role is not deleted');
      }

      // Restore role by setting deleted_at to null
      await db
        .update(roles)
        .set({ deleted_at: null })
        .where(eq(roles.id, role_id));

      // Get the restored role
      const [restored_role] = await db
        .select()
        .from(roles)
        .where(eq(roles.id, role_id))
        .limit(1);

      if (!restored_role) {
        throw new Error('Failed to restore role');
      }

      return {
        data: restored_role,
        status: 200,
        pagination: null
      };
    } catch (error) {
      throw new Error(`Failed to restore role: ${error.message}`);
    }
  }

  // ==================== ROLE PERMISSIONS METHODS ====================

  /**
   * Create a new role permission
   * @param {Object} permission_data - Role permission data
   * @returns {Promise<Object>} Created role permission
   */
  static async createRolePermission(permission_data) {
    try {
      // Check if role exists
      const role_result = await this.getRoleById(permission_data.id_role);
      if (!role_result.data) {
        throw new Error('Role not found');
      }

      // Check if permission already exists for this role and table
      const existing_permission = await db
        .select()
        .from(rolePermissions)
        .where(and(
          eq(rolePermissions.id_role, permission_data.id_role),
          eq(rolePermissions.table_name, permission_data.table_name),
          isNull(rolePermissions.deleted_at)
        ))
        .limit(1);

      if (existing_permission.length > 0) {
        throw new Error('Permission already exists for this role and table');
      }

      const permission_to_insert = {
        id_role: permission_data.id_role,
        table_name: permission_data.table_name,
        can_create: permission_data.can_create || false,
        can_read: permission_data.can_read || false,
        can_update: permission_data.can_update || false,
        can_delete: permission_data.can_delete || false
      };

      // Insert new role permission
      const insert_result = await db
        .insert(rolePermissions)
        .values(permission_to_insert);

      // Get the inserted role permission by ID
      const insert_id = insert_result[0].insertId;
      const [new_permission] = await db
        .select({
          id: rolePermissions.id,
          id_role: rolePermissions.id_role,
          table_name: rolePermissions.table_name,
          can_create: rolePermissions.can_create,
          can_read: rolePermissions.can_read,
          can_update: rolePermissions.can_update,
          can_delete: rolePermissions.can_delete,
          created_at: rolePermissions.created_at,
          updated_at: rolePermissions.updated_at,
          role: {
            id: roles.id,
            name: roles.name,
          }
        })
        .from(rolePermissions)
        .leftJoin(roles, eq(rolePermissions.id_role, roles.id))
        .where(eq(rolePermissions.id, insert_id))
        .limit(1);

      if (!new_permission || Object.keys(new_permission).length === 0) {
        throw new Error('Failed to retrieve created role permission');
      }

      return {
        data: new_permission,
        status: 201,
        pagination: null
      };
    } catch (error) {
      console.log("ERROR: ", error);
      throw new Error(`Failed to create role permission: ${error.message}`);
    }
  }

  /**
   * Get all role permissions with pagination and filtering
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Role permissions list with pagination info
   */
  static async getAllRolePermissions(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        role = '',
        table_name = '',
        sortBy = 'created_at',
        sortOrder = 'desc'
      } = options;

      const offset = (page - 1) * limit;

      // Build where conditions
      const where_conditions = [isNull(rolePermissions.deleted_at)];

      if (search) {
        where_conditions.push(
          or(
            like(rolePermissions.table_name, `%${search}%`),
            like(roles.name, `%${search}%`)
          )
        );
      }

      if (role) {
        where_conditions.push(eq(rolePermissions.id_role, parseInt(role)));
      }

      if (table_name) {
        where_conditions.push(eq(rolePermissions.table_name, table_name));
      }

      // Build order by
      const order_by = sortOrder === 'asc'
        ? asc(rolePermissions[sortBy] || rolePermissions.created_at)
        : desc(rolePermissions[sortBy] || rolePermissions.created_at);

      // Query role permissions with role info
      const permissions_list = await db
        .select({
          id: rolePermissions.id,
          id_role: rolePermissions.id_role,
          table_name: rolePermissions.table_name,
          can_create: rolePermissions.can_create,
          can_read: rolePermissions.can_read,
          can_update: rolePermissions.can_update,
          can_delete: rolePermissions.can_delete,
          created_at: rolePermissions.created_at,
          updated_at: rolePermissions.updated_at,
          role: {
            id: roles.id,
            name: roles.name,
          }
        })
        .from(rolePermissions)
        .leftJoin(roles, eq(rolePermissions.id_role, roles.id))
        .where(and(...where_conditions))
        .orderBy(order_by)
        .limit(limit)
        .offset(offset);

      // Get total count for pagination
      const [{ count }] = await db
        .select({ count: sql`count(*)` })
        .from(rolePermissions)
        .leftJoin(roles, eq(rolePermissions.id_role, roles.id))
        .where(and(...where_conditions));

      const total_pages = Math.ceil(count / limit);

      return {
        data: permissions_list,
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
      throw new Error(`Failed to get role permissions: ${error.message}`);
    }
  }

  /**
   * Get role permission by ID
   * @param {number} permission_id - Role permission ID
   * @returns {Promise<Object|null>} Role permission data
   */
  static async getRolePermissionById(permission_id) {
    try {
      const [permission] = await db
        .select({
          id: rolePermissions.id,
          id_role: rolePermissions.id_role,
          table_name: rolePermissions.table_name,
          can_create: rolePermissions.can_create,
          can_read: rolePermissions.can_read,
          can_update: rolePermissions.can_update,
          can_delete: rolePermissions.can_delete,
          created_at: rolePermissions.created_at,
          updated_at: rolePermissions.updated_at,
          role: {
            id: roles.id,
            name: roles.name,
          }
        })
        .from(rolePermissions)
        .leftJoin(roles, eq(rolePermissions.id_role, roles.id))
        .where(and(
          eq(rolePermissions.id, permission_id),
          isNull(rolePermissions.deleted_at)
        ))
        .limit(1);

      return {
        data: permission || null,
        status: 200,
        pagination: null
      };
    } catch (error) {
      throw new Error(`Failed to get role permission: ${error.message}`);
    }
  }

  /**
   * Update role permission by ID
   * @param {number} permission_id - Role permission ID
   * @param {Object} update_data - Data to update
   * @returns {Promise<Object|null>} Updated role permission
   */
  static async updateRolePermission(permission_id, update_data) {
    try {
      // Check if role permission exists and not soft deleted
      const existing_permission_result = await this.getRolePermissionById(permission_id);
      if (!existing_permission_result.data) {
        throw new Error('Role permission not found');
      }

      // If role or table_name is being updated, check for duplicates
      if ((update_data.id_role || update_data.table_name)) {
        const final_role_id = update_data.id_role || existing_permission_result.data.id_role;
        const final_table_name = update_data.table_name || existing_permission_result.data.table_name;

        const duplicate_exists = await db
          .select()
          .from(rolePermissions)
          .where(and(
            eq(rolePermissions.id_role, final_role_id),
            eq(rolePermissions.table_name, final_table_name),
            isNull(rolePermissions.deleted_at),
            ne(rolePermissions.id, permission_id)
          ))
          .limit(1);

        if (duplicate_exists.length > 0) {
          throw new Error('Permission already exists for this role and table');
        }
      }

      // Update role permission
      await db
        .update(rolePermissions)
        .set(update_data)
        .where(eq(rolePermissions.id, permission_id));

      // Get the updated role permission
      const updated_permission_result = await this.getRolePermissionById(permission_id);

      if (!updated_permission_result.data) {
        throw new Error('Failed to update role permission');
      }

      return {
        data: updated_permission_result.data,
        status: 200,
        pagination: null
      };
    } catch (error) {
      throw new Error(`Failed to update role permission: ${error.message}`);
    }
  }

  /**
   * Soft delete role permission by ID
   * @param {number} permission_id - Role permission ID
   * @returns {Promise<boolean>} Success status
   */
  static async deleteRolePermission(permission_id) {
    try {
      // Check if role permission exists and not already soft deleted
      const existing_permission_result = await this.getRolePermissionById(permission_id);
      if (!existing_permission_result.data) {
        throw new Error('Role permission not found');
      }

      // Soft delete by setting deleted_at timestamp
      const update_result = await db
        .update(rolePermissions)
        .set({ deleted_at: new Date() })
        .where(eq(rolePermissions.id, permission_id));

      // Check if the update was successful
      const success = update_result.affectedRows > 0;

      return {
        data: success,
        status: 200,
        pagination: null
      };
    } catch (error) {
      throw new Error(`Failed to delete role permission: ${error.message}`);
    }
  }

  /**
   * Restore soft deleted role permission
   * @param {number} permission_id - Role permission ID
   * @returns {Promise<Object|null>} Restored role permission
   */
  static async restoreRolePermission(permission_id) {
    try {
      // Check if role permission exists and is soft deleted
      const [existing_permission] = await db
        .select()
        .from(rolePermissions)
        .where(eq(rolePermissions.id, permission_id))
        .limit(1);

      if (!existing_permission) {
        throw new Error('Role permission not found');
      }

      if (!existing_permission.deleted_at) {
        throw new Error('Role permission is not deleted');
      }

      // Restore role permission by setting deleted_at to null
      await db
        .update(rolePermissions)
        .set({ deleted_at: null })
        .where(eq(rolePermissions.id, permission_id));

      // Get the restored role permission
      const restored_permission_result = await this.getRolePermissionById(permission_id);

      if (!restored_permission_result.data) {
        throw new Error('Failed to restore role permission');
      }

      return {
        data: restored_permission_result.data,
        status: 200,
        pagination: null
      };
    } catch (error) {
      throw new Error(`Failed to restore role permission: ${error.message}`);
    }
  }

  /**
   * Get permissions by role ID
   * @param {number} role_id - Role ID
   * @returns {Promise<Object>} Role permissions list
   */
  static async getPermissionsByRoleId(role_id) {
    try {
      // Check if role exists
      const role_result = await this.getRoleById(role_id);
      if (!role_result.data) {
        throw new Error('Role not found');
      }

      const permissions_list = await db
        .select({
          id: rolePermissions.id,
          table_name: rolePermissions.table_name,
          can_create: rolePermissions.can_create,
          can_read: rolePermissions.can_read,
          can_update: rolePermissions.can_update,
          can_delete: rolePermissions.can_delete,
          created_at: rolePermissions.created_at,
          updated_at: rolePermissions.updated_at,
        })
        .from(rolePermissions)
        .where(and(
          eq(rolePermissions.id_role, role_id),
          isNull(rolePermissions.deleted_at)
        ))
        .orderBy(asc(rolePermissions.table_name));

      return {
        data: {
          role: role_result.data,
          permissions: permissions_list
        },
        status: 200,
        pagination: null
      };
    } catch (error) {
      throw new Error(`Failed to get permissions by role: ${error.message}`);
    }
  }
}
