import { eq, and, isNull, like, or, desc, asc, ne, sql } from 'drizzle-orm';
import { db } from '@config/database.js';
import { classes, departments, academicYears } from '@models/index.models.js';

/**
 * Classes Service
 * Handles all CRUD operations for departments and classes with Drizzle ORM
 */
export class ClassesService {
  /**
   * Create a new department
   * @param {Object} departmentData - Department data
   * @returns {Promise<Object>} Created department
   */
  static async createDepartment(departmentData) {
    try {
      // Check if department name already exists (excluding soft deleted)
      const existing_department = await db
        .select()
        .from(departments)
        .where(and(
          eq(departments.name, departmentData.name),
          isNull(departments.deleted_at)
        ))
        .limit(1);

      if (existing_department.length > 0) {
        throw new Error('Department name already exists');
      }

      // Insert new department
      const insert_result = await db
        .insert(departments)
        .values(departmentData);

      // Get the inserted department by ID
      const insert_id = insert_result[0].insertId;
      const [new_department] = await db
        .select()
        .from(departments)
        .where(eq(departments.id, insert_id))
        .limit(1);

      if (!new_department || Object.keys(new_department).length === 0) {
        throw new Error('Failed to retrieve created department');
      }

      return {
        data: new_department,
        status: 201,
        pagination: null
      };
    } catch (error) {
      console.log("ERROR: ", error);
      throw new Error(`Failed to create department: ${error.message}`);
    }
  }

  /**
   * Get all departments with pagination and filtering
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Departments list with pagination info
   */
  static async getAllDepartments(options = {}) {
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
      const whereConditions = [isNull(departments.deleted_at)];

      if (search) {
        whereConditions.push(
          like(departments.name, `%${search}%`)
        );
      }

      // Build order by
      const orderBy = sortOrder === 'asc'
        ? asc(departments[sortBy] || departments.created_at)
        : desc(departments[sortBy] || departments.created_at);

      // Query departments
      const departments_list = await db
        .select()
        .from(departments)
        .where(and(...whereConditions))
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset);

      // Get total count for pagination
      const [{ count }] = await db
        .select({ count: sql`count(*)` })
        .from(departments)
        .where(and(...whereConditions));

      const total_pages = Math.ceil(count / limit);

      return {
        data: departments_list,
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
      throw new Error(`Failed to get departments: ${error.message}`);
    }
  }

  /**
   * Get department by ID
   * @param {number} departmentId - Department ID
   * @returns {Promise<Object|null>} Department data
   */
  static async getDepartmentById(departmentId) {
    try {
      const [department] = await db
        .select()
        .from(departments)
        .where(and(
          eq(departments.id, departmentId),
          isNull(departments.deleted_at)
        ))
        .limit(1);

      return {
        data: department || null,
        status: 200,
        pagination: null
      };
    } catch (error) {
      throw new Error(`Failed to get department: ${error.message}`);
    }
  }

  /**
   * Update department by ID
   * @param {number} departmentId - Department ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>} Updated department
   */
  static async updateDepartment(departmentId, updateData) {
    try {
      // Check if department exists and not soft deleted
      const existing_department_result = await this.getDepartmentById(departmentId);
      if (!existing_department_result.data) {
        throw new Error('Department not found');
      }

      // If name is being updated, check for duplicates
      if (updateData.name && updateData.name !== existing_department_result.data.name) {
        const name_exists = await db
          .select()
          .from(departments)
          .where(and(
            eq(departments.name, updateData.name),
            isNull(departments.deleted_at),
            ne(departments.id, departmentId)
          ))
          .limit(1);

        if (name_exists.length > 0) {
          throw new Error('Department name already exists');
        }
      }

      // Update department
      await db
        .update(departments)
        .set(updateData)
        .where(eq(departments.id, departmentId));

      // Get the updated department
      const [updated_department] = await db
        .select()
        .from(departments)
        .where(eq(departments.id, departmentId))
        .limit(1);

      if (!updated_department) {
        throw new Error('Failed to update department');
      }

      return {
        data: updated_department,
        status: 200,
        pagination: null
      };
    } catch (error) {
      throw new Error(`Failed to update department: ${error.message}`);
    }
  }

  /**
   * Soft delete department by ID
   * @param {number} departmentId - Department ID
   * @returns {Promise<boolean>} Success status
   */
  static async deleteDepartment(departmentId) {
    try {
      // Check if department exists and not already soft deleted
      const existing_department_result = await this.getDepartmentById(departmentId);
      if (!existing_department_result.data) {
        throw new Error('Department not found');
      }

      // Check if department has active classes
      const [active_classes] = await db
        .select({ count: sql`count(*)` })
        .from(classes)
        .where(and(
          eq(classes.id_department, departmentId),
          isNull(classes.deleted_at)
        ));

      if (active_classes.count > 0) {
        throw new Error('Cannot delete department with active classes');
      }

      // Soft delete by setting deleted_at timestamp
      const update_result = await db
        .update(departments)
        .set({ deleted_at: new Date() })
        .where(eq(departments.id, departmentId));

      // Check if the update was successful
      const success = update_result.affectedRows > 0;

      return {
        data: success,
        status: 200,
        pagination: null
      };
    } catch (error) {
      throw new Error(`Failed to delete department: ${error.message}`);
    }
  }

  /**
   * Create a new class
   * @param {Object} classData - Class data
   * @returns {Promise<Object>} Created class
   */
  static async createClass(classData) {
    try {
      // Check if department exists
      const department_result = await this.getDepartmentById(classData.id_department);
      if (!department_result.data) {
        throw new Error('Department not found');
      }

      // Check if academic year exists
      const [academic_year] = await db
        .select()
        .from(academicYears)
        .where(and(
          eq(academicYears.id, classData.id_academic_year),
          isNull(academicYears.deleted_at)
        ))
        .limit(1);

      if (!academic_year) {
        throw new Error('Academic year not found');
      }

      // Check for duplicate class (grade + subgrade + department + academic year)
      const existing_class = await db
        .select()
        .from(classes)
        .where(and(
          eq(classes.grade, classData.grade),
          eq(classes.id_department, classData.id_department),
          eq(classes.id_academic_year, classData.id_academic_year),
          classData.subgrade ? eq(classes.subgrade, classData.subgrade) : isNull(classes.subgrade),
          isNull(classes.deleted_at)
        ))
        .limit(1);

      if (existing_class.length > 0) {
        throw new Error('Class with same grade, subgrade, department, and academic year already exists');
      }

      // Insert new class
      const insert_result = await db
        .insert(classes)
        .values(classData);

      // Get the inserted class by ID
      const insert_id = insert_result[0].insertId;
      const [new_class] = await db
        .select({
          id: classes.id,
          grade: classes.grade,
          id_department: classes.id_department,
          subgrade: classes.subgrade,
          id_academic_year: classes.id_academic_year,
          created_at: classes.created_at,
          updated_at: classes.updated_at,
          department: {
            id: departments.id,
            name: departments.name,
          },
          academic_year: {
            id: academicYears.id,
            year: academicYears.year,
            semester: academicYears.semester,
          }
        })
        .from(classes)
        .leftJoin(departments, eq(classes.id_department, departments.id))
        .leftJoin(academicYears, eq(classes.id_academic_year, academicYears.id))
        .where(eq(classes.id, insert_id))
        .limit(1);

      if (!new_class || Object.keys(new_class).length === 0) {
        throw new Error('Failed to retrieve created class');
      }

      return {
        data: new_class,
        status: 201,
        pagination: null
      };
    } catch (error) {
      console.log("ERROR: ", error);
      throw new Error(`Failed to create class: ${error.message}`);
    }
  }

  /**
   * Get all classes with pagination and filtering
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Classes list with pagination info
   */
  static async getAllClasses(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        departmentId = '',
        academicYearId = '',
        grade = '',
        subgrade = '',
        include_relations = true,
        sortBy = 'created_at',
        sortOrder = 'desc'
      } = options;

      const offset = (page - 1) * limit;

      // Build where conditions
      const whereConditions = [isNull(classes.deleted_at)];

      if (search) {
        whereConditions.push(
          or(
            like(classes.grade, `%${search}%`),
            like(classes.subgrade, `%${search}%`)
          )
        );
      }

      if (departmentId) {
        whereConditions.push(eq(classes.id_department, parseInt(departmentId)));
      }

      if (academicYearId) {
        whereConditions.push(eq(classes.id_academic_year, parseInt(academicYearId)));
      }

      if (grade) {
        whereConditions.push(eq(classes.grade, grade));
      }

      if (subgrade) {
        whereConditions.push(eq(classes.subgrade, subgrade));
      }

      // Build order by
      const orderBy = sortOrder === 'asc'
        ? asc(classes[sortBy] || classes.created_at)
        : desc(classes[sortBy] || classes.created_at);

      // Query classes
      let query;
      if (include_relations) {
        query = db
          .select({
            id: classes.id,
            grade: classes.grade,
            id_department: classes.id_department,
            subgrade: classes.subgrade,
            id_academic_year: classes.id_academic_year,
            created_at: classes.created_at,
            updated_at: classes.updated_at,
            department: {
              id: departments.id,
              name: departments.name,
            },
            academic_year: {
              id: academicYears.id,
              year: academicYears.year,
              semester: academicYears.semester,
            }
          })
          .from(classes)
          .leftJoin(departments, eq(classes.id_department, departments.id))
          .leftJoin(academicYears, eq(classes.id_academic_year, academicYears.id))
          .where(and(...whereConditions))
          .orderBy(orderBy)
          .limit(limit)
          .offset(offset);
      } else {
        query = db
          .select()
          .from(classes)
          .where(and(...whereConditions))
          .orderBy(orderBy)
          .limit(limit)
          .offset(offset);
      }

      const classes_list = await query;

      // Get total count for pagination
      const [{ count }] = await db
        .select({ count: sql`count(*)` })
        .from(classes)
        .where(and(...whereConditions));

      const total_pages = Math.ceil(count / limit);

      return {
        data: classes_list,
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
      throw new Error(`Failed to get classes: ${error.message}`);
    }
  }

  /**
   * Get class by ID
   * @param {number} classId - Class ID
   * @param {boolean} include_relations - Include department and academic year data
   * @returns {Promise<Object|null>} Class data
   */
  static async getClassById(classId, include_relations = true) {
    try {
      let query;

      if (include_relations) {
        query = db
          .select({
            id: classes.id,
            grade: classes.grade,
            id_department: classes.id_department,
            subgrade: classes.subgrade,
            id_academic_year: classes.id_academic_year,
            created_at: classes.created_at,
            updated_at: classes.updated_at,
            department: {
              id: departments.id,
              name: departments.name,
            },
            academic_year: {
              id: academicYears.id,
              year: academicYears.year,
              semester: academicYears.semester,
            }
          })
          .from(classes)
          .leftJoin(departments, eq(classes.id_department, departments.id))
          .leftJoin(academicYears, eq(classes.id_academic_year, academicYears.id))
          .where(and(
            eq(classes.id, classId),
            isNull(classes.deleted_at)
          ))
          .limit(1);
      } else {
        query = db
          .select()
          .from(classes)
          .where(and(
            eq(classes.id, classId),
            isNull(classes.deleted_at)
          ))
          .limit(1);
      }

      const [class_data] = await query;
      return {
        data: class_data || null,
        status: 200,
        pagination: null
      };
    } catch (error) {
      throw new Error(`Failed to get class: ${error.message}`);
    }
  }

  /**
   * Update class by ID
   * @param {number} classId - Class ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>} Updated class
   */
  static async updateClass(classId, updateData) {
    try {
      // Check if class exists and not soft deleted
      const existing_class_result = await this.getClassById(classId, false);
      if (!existing_class_result.data) {
        throw new Error('Class not found');
      }

      // If department is being updated, check if it exists
      if (updateData.id_department) {
        const department_result = await this.getDepartmentById(updateData.id_department);
        if (!department_result.data) {
          throw new Error('Department not found');
        }
      }

      // If academic year is being updated, check if it exists
      if (updateData.id_academic_year) {
        const [academic_year] = await db
          .select()
          .from(academicYears)
          .where(and(
            eq(academicYears.id, updateData.id_academic_year),
            isNull(academicYears.deleted_at)
          ))
          .limit(1);

        if (!academic_year) {
          throw new Error('Academic year not found');
        }
      }

      // Check for duplicate class if key fields are being updated
      const existing_class = existing_class_result.data;
      const final_grade = updateData.grade || existing_class.grade;
      const final_subgrade = updateData.subgrade !== undefined ? updateData.subgrade : existing_class.subgrade;
      const final_department = updateData.id_department || existing_class.id_department;
      const final_academic_year = updateData.id_academic_year || existing_class.id_academic_year;

      const duplicate_check = await db
        .select()
        .from(classes)
        .where(and(
          eq(classes.grade, final_grade),
          eq(classes.id_department, final_department),
          eq(classes.id_academic_year, final_academic_year),
          final_subgrade ? eq(classes.subgrade, final_subgrade) : isNull(classes.subgrade),
          isNull(classes.deleted_at),
          ne(classes.id, classId)
        ))
        .limit(1);

      if (duplicate_check.length > 0) {
        throw new Error('Class with same grade, subgrade, department, and academic year already exists');
      }

      // Update class
      await db
        .update(classes)
        .set(updateData)
        .where(eq(classes.id, classId));

      // Get the updated class with relations
      const updated_class_result = await this.getClassById(classId, true);

      return {
        data: updated_class_result.data,
        status: 200,
        pagination: null
      };
    } catch (error) {
      throw new Error(`Failed to update class: ${error.message}`);
    }
  }

  /**
   * Soft delete class by ID
   * @param {number} classId - Class ID
   * @returns {Promise<boolean>} Success status
   */
  static async deleteClass(classId) {
    try {
      // Check if class exists and not already soft deleted
      const existing_class_result = await this.getClassById(classId, false);
      if (!existing_class_result.data) {
        throw new Error('Class not found');
      }

      // Soft delete by setting deleted_at timestamp
      const update_result = await db
        .update(classes)
        .set({ deleted_at: new Date() })
        .where(eq(classes.id, classId));

      // Check if the update was successful
      const success = update_result.affectedRows > 0;

      return {
        data: success,
        status: 200,
        pagination: null
      };
    } catch (error) {
      throw new Error(`Failed to delete class: ${error.message}`);
    }
  }

  /**
   * Bulk create departments
   * @param {Array} departmentsData - Array of department data
   * @returns {Promise<Object>} Bulk creation result
   */
  static async bulkCreateDepartments(departmentsData) {
    try {
      const created_departments = [];
      const errors = [];

      for (let i = 0; i < departmentsData.length; i++) {
        try {
          const response = await this.createDepartment(departmentsData[i]);
          created_departments.push(response.data);
        } catch (error) {
          errors.push({
            index: i,
            name: departmentsData[i].name,
            error: error.message
          });
        }
      }

      return {
        data: {
          created: created_departments,
          errors: errors,
          summary: {
            total: departmentsData.length,
            successful: created_departments.length,
            failed: errors.length
          }
        },
        status: errors.length === 0 ? 201 : 207,
        pagination: null
      };
    } catch (error) {
      throw new Error(`Failed to bulk create departments: ${error.message}`);
    }
  }

  /**
   * Bulk create classes
   * @param {Array} classesData - Array of class data
   * @returns {Promise<Object>} Bulk creation result
   */
  static async bulkCreateClasses(classesData) {
    try {
      const created_classes = [];
      const errors = [];

      for (let i = 0; i < classesData.length; i++) {
        try {
          const response = await this.createClass(classesData[i]);
          created_classes.push(response.data);
        } catch (error) {
          errors.push({
            index: i,
            grade: classesData[i].grade,
            subgrade: classesData[i].subgrade,
            error: error.message
          });
        }
      }

      return {
        data: {
          created: created_classes,
          errors: errors,
          summary: {
            total: classesData.length,
            successful: created_classes.length,
            failed: errors.length
          }
        },
        status: errors.length === 0 ? 201 : 207,
        pagination: null
      };
    } catch (error) {
      throw new Error(`Failed to bulk create classes: ${error.message}`);
    }
  }

  /**
   * Get classes statistics by department
   * @returns {Promise<Array>} Department statistics
   */
  static async getClassesStatsByDepartment() {
    try {
      const department_stats = await db
        .select({
          departmentId: classes.id_department,
          departmentName: departments.name,
          count: sql`count(*)`,
        })
        .from(classes)
        .leftJoin(departments, eq(classes.id_department, departments.id))
        .where(isNull(classes.deleted_at))
        .groupBy(classes.id_department, departments.name);

      return {
        data: department_stats,
        status: 200,
        pagination: null
      };
    } catch (error) {
      throw new Error(`Failed to get classes stats by department: ${error.message}`);
    }
  }
}
