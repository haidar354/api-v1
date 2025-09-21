import { eq, and, isNull, like, or, desc, asc, ne, sql } from 'drizzle-orm';
import { db } from '../config/database.js';
import { students, users, classes, departments, academicYears } from '../models/index.models.js';

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
  static async verifyStudentExists(nis, userId = null) {
    try {
      console.log(`Verifying student exists: NIS=${nis}, UserID=${userId}`);

      const where_conditions = [
        eq(students.nis, nis),
        isNull(students.deleted_at),
      ];

      if (userId) {
        where_conditions.push(eq(students.id_user, userId));
      }

      const [student] = await db
        .select({
          id: students.id,
          id_user: students.id_user,
          nis: students.nis,
          created_at: students.created_at,
          user: {
            id: users.id,
            full_name: users.full_name,
          },
        })
        .from(students)
        .leftJoin(users, eq(students.id_user, users.id))
        .where(and(...where_conditions))
        .limit(1);

      const exists = !!student;
      console.log(
        `Verification result: exists=${exists}`,
        student ? { id: student.id, nis: student.nis } : null
      );

      return {
        exists,
        student_data: student || null,
      };
    } catch (error) {
      console.error("Error verifying student exists:", error);
      throw new Error(`Failed to verify student: ${error.message}`);
    }
  }

  static async processExcelData(excelData) {
    try {
      console.log("Processing Excel data:", excelData);

      if (!Array.isArray(excelData) || excelData.length === 0) {
        throw new Error("Excel data is empty or invalid");
      }

      const processed_data = [];
      const errors = [];

      for (let i = 0; i < excelData.length; i++) {
        try {
          const row = excelData[i];
          console.log(`Processing row ${i + 1}:`, row);

          // Skip empty rows
          if (!row || Object.keys(row).length === 0) {
            console.log(`Skipping empty row ${i + 1}`);
            continue;
          }

          // Normalize keys to handle case-insensitive matching
          const normalized_row = {};
          Object.keys(row).forEach((key) => {
            const normalized_key = key
              .toLowerCase()
              .trim()
              .replace(/\s+/g, " ");
            normalized_row[normalized_key] =
              typeof row[key] === "string" ? row[key].trim() : row[key];
          });

          console.log("Normalized row:", normalized_row);

          // Extract data with multiple possible key variations
          const full_name =
            normalized_row["nama lengkap"] ||
            row["Nama Lengkap"] ||
            normalized_row["nama"] ||
            row["Nama"];

          const grade =
            normalized_row["kelas"] ||
            row["Kelas"] ||
            normalized_row["tingkat"] ||
            row["Tingkat"];

          const department_name =
            normalized_row["jurusan"] ||
            row["Jurusan"] ||
            normalized_row["program"] ||
            row["Program"];

          const subgrade =
            normalized_row["subkelas"] ||
            row["Subkelas"] ||
            normalized_row["sub kelas"] ||
            row["Sub Kelas"];

          let nis =
            normalized_row["nis"] ||
            row["NIS"] ||
            normalized_row["nomor induk"] ||
            row["Nomor Induk"];

          const academic_year =
            normalized_row["tahun ajaran"] ||
            row["Tahun Ajaran"] ||
            normalized_row["tahun"] ||
            row["Tahun"];

          // Ensure NIS is string
          if (nis !== undefined && nis !== null) {
            nis = String(nis).trim();
          }

          console.log("Extracted data:", {
            full_name,
            grade,
            department_name,
            subgrade,
            nis,
            academic_year,
          });

          // Validate required fields
          if (
            !full_name ||
            !grade ||
            !department_name ||
            !nis ||
            !academic_year
          ) {
            const missing_fields = [];
            if (!full_name) missing_fields.push("Nama Lengkap");
            if (!grade) missing_fields.push("Kelas");
            if (!department_name) missing_fields.push("Jurusan");
            if (!nis) missing_fields.push("NIS");
            if (!academic_year) missing_fields.push("Tahun Ajaran");

            errors.push({
              index: i + 1,
              nama: full_name || "Unknown",
              error: `Missing required fields: ${missing_fields.join(", ")}`,
            });
            continue;
          }

          // Check for duplicate NIS in current batch
          const duplicate_in_batch = processed_data.find(
            (item) => item.data.nis === nis
          );
          if (duplicate_in_batch) {
            errors.push({
              index: i + 1,
              nama: full_name,
              nis: nis,
              error: `Duplicate NIS found in batch: ${nis}`,
            });
            continue;
          }

          // Check if NIS already exists in database
          const existing_nis = await db
            .select({ id: students.id, nis: students.nis })
            .from(students)
            .where(and(eq(students.nis, nis), isNull(students.deleted_at)))
            .limit(1);

          if (existing_nis.length > 0) {
            errors.push({
              index: i + 1,
              nama: full_name,
              nis: nis,
              error: `NIS already exists in database: ${nis}`,
            });
            continue;
          }

          // Find department by name (case-insensitive)
          const [department] = await db
            .select({ id: departments.id, short_name: departments.short_name })
            .from(departments)
            .where(
              and(
                sql`LOWER(${departments.short_name}) = LOWER(${department_name})`,
                isNull(departments.deleted_at)
              )
            )
            .limit(1);

          if (!department) {
            errors.push({
              index: i + 1,
              nama: full_name,
              nis: nis,
              error: `Department not found: '${department_name}'`,
            });
            continue;
          }

          // Find academic year by year
          const [academic_year_record] = await db
            .select({ id: academicYears.id, year: academicYears.year })
            .from(academicYears)
            .where(
              and(
                eq(academicYears.year, academic_year),
                isNull(academicYears.deleted_at)
              )
            )
            .limit(1);

          if (!academic_year_record) {
            errors.push({
              index: i + 1,
              nama: full_name,
              nis: nis,
              error: `Academic year not found: '${academic_year}'`,
            });
            continue;
          }

          // Find class by grade, subgrade (optional), department, and academic year
          const class_where_conditions = [
            eq(classes.grade, grade),
            eq(classes.id_department, department.id),
            eq(classes.id_academic_year, academic_year_record.id),
            isNull(classes.deleted_at),
          ];

          // Add subgrade condition if provided and not empty
          if (subgrade && String(subgrade).trim()) {
            class_where_conditions.push(
              eq(classes.subgrade, String(subgrade).trim())
            );
          }

          const class_records = await db
            .select({
              id: classes.id,
              grade: classes.grade,
              subgrade: classes.subgrade,
            })
            .from(classes)
            .where(and(...class_where_conditions));

          let class_record;

          if (class_records.length === 0) {
            errors.push({
              index: i + 1,
              nama: full_name,
              nis: nis,
              error: `Class not found for: grade '${grade}', department '${department_name}', subgrade '${
                subgrade || "none"
              }', academic year '${academic_year}'`,
            });
            continue;
          } else if (class_records.length === 1) {
            class_record = class_records[0];
          } else {
            // Multiple classes found, pick the first one or add logic to choose
            class_record = class_records[0];
            console.log(
              `Multiple classes found for grade '${grade}', department '${department_name}', using first match`
            );
          }

          // Create processed user object
          const processed_user = {
            full_name: full_name,
            id_role: 4, // Student role - make sure this role exists in your database
            data: {
              nis: nis,
              id_class: class_record.id,
              // Add additional user data if needed
              email: null, // You might want to generate email or leave null
              nisn: null, // If you need NISN field
            },
          };

          processed_data.push(processed_user);
          console.log(`✅ Row ${i + 1} processed successfully`);
        } catch (error) {
          console.error(`Error processing row ${i + 1}:`, error);
          errors.push({
            index: i + 1,
            nama:
              excelData[i]?.["Nama Lengkap"] ||
              excelData[i]?.["nama lengkap"] ||
              "Unknown",
            error: `Processing error: ${error.message}`,
          });
        }
      }

      console.log(
        `Excel processing completed: ${processed_data.length} successful, ${errors.length} failed`
      );

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
        pagination: null,
      };
    } catch (error) {
      console.error("processExcelData error:", error);
      if (error.details) {
        // Re-throw errors with details
        throw error;
      }
      throw new Error(`Failed to process Excel data: ${error.message}`);
    }
  }

  static async createStudent(studentData) {
    try {
      console.log("Creating student with data:", studentData);

      // Existing validation code...
      const [existing_user] = await db
        .select()
        .from(users)
        .where(and(eq(users.id, studentData.id_user), isNull(users.deleted_at)))
        .limit(1);

      if (!existing_user) {
        throw new Error("User not found");
      }

      const [existing_class] = await db
        .select()
        .from(classes)
        .where(
          and(eq(classes.id, studentData.id_class), isNull(classes.deleted_at))
        )
        .limit(1);

      if (!existing_class) {
        throw new Error("Class not found");
      }

      const existing_nis = await db
        .select()
        .from(students)
        .where(
          and(eq(students.nis, studentData.nis), isNull(students.deleted_at))
        )
        .limit(1);

      if (existing_nis.length > 0) {
        throw new Error("NIS already exists");
      }

      const existing_student = await db
        .select()
        .from(students)
        .where(
          and(
            eq(students.id_user, studentData.id_user),
            isNull(students.deleted_at)
          )
        )
        .limit(1);

      if (existing_student.length > 0) {
        throw new Error("User is already registered as a student");
      }

      // Insert new student
      const insert_result = await db.insert(students).values(studentData);

      console.log("Insert result:", insert_result);

      // ⚠️ PERBAIKAN: Handle different insert result formats
      let student_id;
      if (insert_result[0]?.insertId) {
        student_id = insert_result[0].insertId;
      } else if (insert_result.insertId) {
        student_id = insert_result.insertId;
      } else if (insert_result[0]?.id) {
        student_id = insert_result[0].id;
      } else {
        // Fallback: query by NIS to find the created student
        const [created_student] = await db
          .select({ id: students.id })
          .from(students)
          .where(
            and(
              eq(students.nis, studentData.nis),
              eq(students.id_user, studentData.id_user),
              isNull(students.deleted_at)
            )
          )
          .limit(1);

        if (created_student) {
          student_id = created_student.id;
        }
      }

      if (!student_id) {
        throw new Error("Failed to get student ID after insert");
      }

      // Get the full student data
      const student_result = await this.getStudentById(student_id);

      if (!student_result.data) {
        // ⚠️ PERBAIKAN: Jika getStudentById gagal, tetap return success dengan data minimal
        console.log(
          "Warning: Could not retrieve full student data, but insert was successful"
        );
        return {
          data: {
            id: student_id,
            nis: studentData.nis,
            id_user: studentData.id_user,
            id_class: studentData.id_class,
            created: true,
          },
          status: 201,
          pagination: null,
        };
      }

      console.log("Student created successfully:", {
        id: student_id,
        nis: studentData.nis,
      });

      return {
        data: student_result.data,
        status: 201,
        pagination: null,
      };
    } catch (error) {
      console.log("ERROR creating student: ", error);
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
        search = "",
        class: class_filter = "",
        sortBy = "created_at",
        sortOrder = "desc",
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
      const order_by =
        sortOrder === "asc"
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
            data: users.data,
          },
          class: {
            id: classes.id,
            grade: classes.grade,
            subgrade: classes.subgrade,
          },
          departments: {
            id: departments.id,
            short_name: departments.short_name,
          },
          academicYears: {
            id: academicYears.id,
            year: academicYears.year,
          },
        })
        .from(students)
        .leftJoin(users, eq(students.id_user, users.id))
        .leftJoin(classes, eq(students.id_class, classes.id))
        .leftJoin(departments, eq(classes.id_department, departments.id))
        .leftJoin(academicYears, eq(classes.id_academic_year, academicYears.id))
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
        },
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
            data: users.data,
          },
          class: {
            id: classes.id,
            grade: classes.grade,
          },
        })
        .from(students)
        .leftJoin(users, eq(students.id_user, users.id))
        .leftJoin(classes, eq(students.id_class, classes.id))
        .where(and(eq(students.id, studentId), isNull(students.deleted_at)))
        .limit(1);

      return {
        data: student || null,
        status: 200,
        pagination: null,
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
        throw new Error("Student not found");
      }

      // If user ID is being updated, check if user exists
      if (updateData.id_user) {
        const [existing_user] = await db
          .select()
          .from(users)
          .where(
            and(eq(users.id, updateData.id_user), isNull(users.deleted_at))
          )
          .limit(1);

        if (!existing_user) {
          throw new Error("User not found");
        }

        // Check if user is already a student (excluding current student)
        const existing_user_student = await db
          .select()
          .from(students)
          .where(
            and(
              eq(students.id_user, updateData.id_user),
              isNull(students.deleted_at),
              ne(students.id, studentId)
            )
          )
          .limit(1);

        if (existing_user_student.length > 0) {
          throw new Error("User is already registered as a student");
        }
      }

      // If class ID is being updated, check if class exists
      if (updateData.id_class) {
        const [existing_class] = await db
          .select()
          .from(classes)
          .where(
            and(eq(classes.id, updateData.id_class), isNull(classes.deleted_at))
          )
          .limit(1);

        if (!existing_class) {
          throw new Error("Class not found");
        }
      }

      // If NIS is being updated, check for duplicates
      if (
        updateData.nis &&
        updateData.nis !== existing_student_result.data.nis
      ) {
        const existing_nis = await db
          .select()
          .from(students)
          .where(
            and(
              eq(students.nis, updateData.nis),
              isNull(students.deleted_at),
              ne(students.id, studentId)
            )
          )
          .limit(1);

        if (existing_nis.length > 0) {
          throw new Error("NIS already exists");
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
        throw new Error("Failed to update student");
      }

      return {
        data: updated_student_result.data,
        status: 200,
        pagination: null,
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
        throw new Error("Student not found");
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
        pagination: null,
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
        throw new Error("Student not found");
      }

      if (!existing_student.deleted_at) {
        throw new Error("Student is not deleted");
      }

      // Check if NIS would conflict after restore
      const existing_nis = await db
        .select()
        .from(students)
        .where(
          and(
            eq(students.nis, existing_student.nis),
            isNull(students.deleted_at),
            ne(students.id, studentId)
          )
        )
        .limit(1);

      if (existing_nis.length > 0) {
        throw new Error("Cannot restore: NIS already exists");
      }

      // Check if user would conflict after restore
      const existing_user_student = await db
        .select()
        .from(students)
        .where(
          and(
            eq(students.id_user, existing_student.id_user),
            isNull(students.deleted_at),
            ne(students.id, studentId)
          )
        )
        .limit(1);

      if (existing_user_student.length > 0) {
        throw new Error(
          "Cannot restore: User is already registered as a student"
        );
      }

      // Restore student by setting deleted_at to null
      await db
        .update(students)
        .set({ deleted_at: null })
        .where(eq(students.id, studentId));

      // Get the restored student
      const restored_student_result = await this.getStudentById(studentId);

      if (!restored_student_result.data) {
        throw new Error("Failed to restore student");
      }

      return {
        data: restored_student_result.data,
        status: 200,
        pagination: null,
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
        pagination: null,
      };
    } catch (error) {
      throw new Error(
        `Failed to get students count by class: ${error.message}`
      );
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
          status: "healthy",
          timestamp: new Date().toISOString(),
          statistics: {
            total_students,
            classes_with_students: class_stats.data.length,
          },
        },
        status: 200,
        pagination: null,
      };
    } catch (error) {
      throw new Error(`Students service health check failed: ${error.message}`);
    }
  }

  /**
   * Process Excel data format and convert to user creation format
   * @param {Array} excelData - Array of Excel row objects
   * @returns {Promise<Array>} Processed user data array
   */
  static async excelData(excelData) {
    return this.processExcelData(excelData);
  }
}
