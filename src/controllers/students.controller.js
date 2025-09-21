import { StudentsService } from '../services/students.service.js';
import { UsersService } from '../services/users.service.js';
import { jsonResponse, errorResponse } from '../utils/response.util.js';

/**
 * Students Controller
 * Handles HTTP requests for student CRUD operations
 */
export class StudentsController {
  /**
   * Create a new student
   * POST /students
   */

  static async debugIndividualCreate(c) {
    try {
      const { userData, studentData } = c.req.valid("json");

      console.log("=== DEBUG INDIVIDUAL CREATE ===");
      console.log("User data to create:", userData);

      // Test 1: Create User
      let user_response;
      try {
        user_response = await UsersService.createUser(userData);
        console.log(
          "UsersService.createUser RAW response:",
          JSON.stringify(user_response, null, 2)
        );
        console.log("Response type:", typeof user_response);
        console.log("Response keys:", Object.keys(user_response || {}));
      } catch (userError) {
        console.log("UsersService.createUser ERROR:", userError.message);
        return jsonResponse(
          {
            success: false,
            step: "user_creation",
            error: userError.message,
          },
          400
        );
      }

      // Test 2: Analyze User Response
      let user_id = null;
      let user_success = false;

      if (user_response?.data?.id) {
        user_id = user_response.data.id;
        user_success = true;
        console.log("✅ User ID from response.data.id:", user_id);
      } else if (user_response?.id) {
        user_id = user_response.id;
        user_success = true;
        console.log("✅ User ID from response.id:", user_id);
      } else if (user_response?.[0]?.insertId) {
        user_id = user_response[0].insertId;
        user_success = true;
        console.log("✅ User ID from response[0].insertId:", user_id);
      } else if (user_response?.insertId) {
        user_id = user_response.insertId;
        user_success = true;
        console.log("✅ User ID from response.insertId:", user_id);
      } else {
        console.log("❌ No user ID found in response");
        // Try to find user by name as fallback
        try {
          const [found_user] = await db
            .select({ id: users.id, full_name: users.full_name })
            .from(users)
            .where(
              and(
                eq(users.full_name, userData.full_name),
                isNull(users.deleted_at)
              )
            )
            .orderBy(desc(users.created_at))
            .limit(1);

          if (found_user) {
            user_id = found_user.id;
            user_success = true;
            console.log("✅ User ID found via fallback query:", user_id);
          }
        } catch (fallbackError) {
          console.log("❌ Fallback query failed:", fallbackError.message);
        }
      }

      if (!user_success || !user_id) {
        return jsonResponse(
          {
            success: false,
            step: "user_id_extraction",
            user_response,
            error: "Could not extract user ID from response",
          },
          400
        );
      }

      // Test 3: Create Student
      const student_create_data = {
        id_user: user_id,
        id_class: studentData.id_class,
        nis: studentData.nis,
      };

      console.log("Student data to create:", student_create_data);

      let student_response;
      try {
        student_response = await StudentsService.createStudent(
          student_create_data
        );
        console.log(
          "StudentsService.createStudent RAW response:",
          JSON.stringify(student_response, null, 2)
        );
      } catch (studentError) {
        console.log(
          "StudentsService.createStudent ERROR:",
          studentError.message
        );
        return jsonResponse(
          {
            success: false,
            step: "student_creation",
            user_id,
            error: studentError.message,
          },
          400
        );
      }

      // Test 4: Verify in Database
      const verification = await StudentsService.verifyStudentExists(
        studentData.nis,
        user_id
      );

      return jsonResponse(
        {
          success: true,
          debug_info: {
            user_response_analysis: {
              raw_response: user_response,
              extracted_user_id: user_id,
              success: user_success,
            },
            student_response_analysis: {
              raw_response: student_response,
            },
            database_verification: verification,
          },
        },
        200
      );
    } catch (error) {
      console.error("Debug individual create error:", error);
      return errorResponse(`Debug failed: ${error.message}`, 500);
    }
  }

  static async createStudent(c) {
    try {
      const student_data = c.req.valid("json");

      const response = await StudentsService.createStudent(student_data);

      return jsonResponse(response.data, response.status);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  /**
   * Get all students with pagination and filtering
   * GET /students
   */
  static async getAllStudents(c) {
    try {
      const query_params = c.req.valid("query");

      const response = await StudentsService.getAllStudents(query_params);

      return jsonResponse(response.data, response.status, response.pagination);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  /**
   * Get student by ID
   * GET /students/:id
   */
  static async getStudentById(c) {
    try {
      const { id } = c.req.valid("param");

      const response = await StudentsService.getStudentById(parseInt(id));

      if (!response.data) {
        return errorResponse("Student not found", 404);
      }

      return jsonResponse(response.data, response.status);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  /**
   * Update student by ID
   * PUT /students/:id
   */
  static async updateStudent(c) {
    try {
      const { id } = c.req.valid("param");
      const update_data = c.req.valid("json");

      const response = await StudentsService.updateStudent(
        parseInt(id),
        update_data
      );

      return jsonResponse(response.data, response.status);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  /**
   * Soft delete student by ID
   * DELETE /students/:id
   */
  static async deleteStudent(c) {
    try {
      const { id } = c.req.valid("param");

      const response = await StudentsService.deleteStudent(parseInt(id));

      return jsonResponse(
        {
          message: response.data
            ? "Student successfully deleted"
            : "Failed to delete student",
        },
        response.status
      );
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  /**
   * Restore soft deleted student
   * POST /students/:id/restore
   */
  static async restoreStudent(c) {
    try {
      const { id } = c.req.valid("param");

      const response = await StudentsService.restoreStudent(parseInt(id));

      return jsonResponse(response.data, response.status);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  /**
   * Get students statistics by class
   * GET /students/stats/classes
   */
  static async getStudentsStatsByClass(c) {
    try {
      const response = await StudentsService.getStudentsCountByClass();

      return jsonResponse(response.data, response.status);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  /**
   * Search students by NIS or name
   * GET /students/search
   */
  static async searchStudents(c) {
    try {
      const { q: query, limit = "10" } = c.req.query();

      if (!query || query.trim().length < 2) {
        return errorResponse("Search query must be at least 2 characters", 400);
      }

      const response = await StudentsService.getAllStudents({
        search: query.trim(),
        limit: parseInt(limit),
        page: 1,
      });

      return jsonResponse(response.data, response.status, response.pagination);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  /**
   * Get students by class
   * GET /students/class/:id_class
   */
  static async getStudentsByClass(c) {
    try {
      const { id_class } = c.req.param();
      const { page = "1", limit = "10" } = c.req.query();

      const response = await StudentsService.getAllStudents({
        class: id_class,
        page: parseInt(page),
        limit: parseInt(limit),
      });

      return jsonResponse(response.data, response.status, response.pagination);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  /**
   * Bulk create students
   * POST /students/bulk
   */
  static async bulkCreateStudents(c) {
    try {
      const payload = c.req.valid("json");
      let students_data = [];

      console.log("=== STARTING BULK UPLOAD - FIXED VERSION ===");

      // Handle Excel format
      if (payload.type === "excel") {
        try {
          const excel_result = await StudentsService.processExcelData(
            payload.data
          );
          students_data = excel_result.data;
          console.log(
            `✅ Excel processing successful: ${students_data.length} students processed`
          );
        } catch (error) {
          console.error("❌ Excel processing failed:", error.message);

          if (error.details) {
            return jsonResponse(
              {
                success: false,
                message: `Excel processing failed: ${error.message}`,
                data: {
                  created: [],
                  errors: error.details,
                  summary: {
                    total: payload.data.length,
                    successful: 0,
                    failed: error.details.length,
                  },
                },
              },
              400
            );
          }
          throw error;
        }
      } else {
        students_data = payload.students || [];
      }

      if (!students_data || students_data.length === 0) {
        return errorResponse("No student data provided after processing", 400);
      }

      console.log(
        `Starting bulk creation for ${students_data.length} students`
      );

      const created_students = [];
      const errors = [];

      // Process each student
      for (let i = 0; i < students_data.length; i++) {
        console.log(
          `\n--- Processing Student ${i + 1}/${students_data.length} ---`
        );

        try {
          const student_data = students_data[i];
          console.log("Student data:", JSON.stringify(student_data, null, 2));

          if (payload.type === "excel") {
            // ⚠️ PERBAIKAN: HANYA CREATE USER, STUDENT RECORD SUDAH DIBUAT OTOMATIS
            console.log("🔄 Creating user with embedded student data...");

            const user_response = await UsersService.createUser(student_data);
            console.log("User creation response:", {
              status: user_response?.status,
              hasData: !!user_response?.data,
              user_id: user_response?.data?.id,
            });

            // ⚠️ PERBAIKAN: CEK APAKAH USER DAN STUDENT BERHASIL DIBUAT
            if (
              user_response?.status >= 200 &&
              user_response?.status < 300 &&
              user_response?.data?.id
            ) {
              // Verifikasi student record sudah dibuat
              const verification = await StudentsService.verifyStudentExists(
                student_data.data.nis,
                user_response.data.id
              );

              if (verification.exists) {
                created_students.push(verification.student_data);
                console.log(
                  `✅ Student ${
                    i + 1
                  } created successfully (user + student record)`
                );
              } else {
                // Jika student record belum ada, buat sekarang
                console.log(
                  "🔄 Student record not found, creating manually..."
                );
                try {
                  const student_response = await StudentsService.createStudent({
                    id_user: user_response.data.id,
                    id_class: student_data.data.id_class,
                    nis: student_data.data.nis,
                  });

                  if (student_response?.data) {
                    created_students.push(student_response.data);
                    console.log(
                      `✅ Student ${
                        i + 1
                      } created successfully (manual student record)`
                    );
                  } else {
                    throw new Error("Failed to create student record manually");
                  }
                } catch (manualError) {
                  throw new Error(
                    `Manual student creation failed: ${manualError.message}`
                  );
                }
              }
            } else {
              throw new Error(
                `User creation failed: ${
                  user_response?.message || "Unknown error"
                }`
              );
            }
          } else {
            // Handle non-Excel format
            const response = await StudentsService.createStudent(student_data);
            if (
              response?.data ||
              (response?.status >= 200 && response?.status < 300)
            ) {
              created_students.push(response.data);
              console.log(`✅ Student ${i + 1} created successfully`);
            } else {
              throw new Error(
                "Student creation returned unsuccessful response"
              );
            }
          }
        } catch (error) {
          const error_msg = error.message || "Unknown error occurred";
          console.log(`❌ Student ${i + 1} failed: ${error_msg}`);

          errors.push({
            index: i + 1,
            nama: students_data[i].full_name || "Unknown",
            nis:
              students_data[i].data?.nis || students_data[i].nis || "Unknown",
            error: error_msg,
          });
        }
      }

      console.log(`\n=== BULK UPLOAD COMPLETED ===`);
      console.log(`Success: ${created_students.length}`);
      console.log(`Failed: ${errors.length}`);

      const is_fully_successful = errors.length === 0;
      const status_code = is_fully_successful
        ? 201
        : created_students.length > 0
        ? 207
        : 400;

      return jsonResponse(
        {
          success: is_fully_successful,
          message: `Bulk operation completed. ${created_students.length} students created, ${errors.length} failed`,
          data: {
            created: created_students.map((s) => ({
              id: s.id,
              nis: s.nis,
              full_name: s.user?.full_name || s.full_name,
              created_at: s.created_at,
            })),
            errors: errors,
            summary: {
              total: students_data.length,
              successful: created_students.length,
              failed: errors.length,
              success_rate: `${Math.round(
                (created_students.length / students_data.length) * 100
              )}%`,
            },
          },
        },
        status_code
      );
    } catch (error) {
      console.error("❌ Bulk upload error:", error);
      return errorResponse(`Bulk upload failed: ${error.message}`, 500);
    }
  }

  /**
   * Health check for students service
   * GET /students/health
   */
  static async healthCheck(c) {
    try {
      const response = await StudentsService.healthCheck();

      return jsonResponse(response.data, response.status);
    } catch (error) {
      console.log("ERROR: ", error);
      return errorResponse(error.message, 503);
    }
  }
}
