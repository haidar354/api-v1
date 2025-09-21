import { TeachersService } from '../services/teachers.service.js';
import { UsersService } from '../services/users.service.js';
import { jsonResponse, errorResponse } from '../utils/response.util.js';
import * as XLSX from "xlsx";
/**
 * Teachers Controller
 * Handles HTTP requests for teacher CRUD operations
 */
export class TeachersController {
  /**
   * Create a new teacher
   * POST /teachers
   */

  static async bulkCreateTeachersFromFile(c) {
    try {
      // Parse FormData dari request
      const body = await c.req.parseBody();
      const file = body.file;

      if (!file || typeof file === "string") {
        return errorResponse(
          'File tidak ditemukan. Pastikan Anda mengupload file dengan key "file"',
          400
        );
      }

      console.log("File info:", {
        name: file.name,
        type: file.type,
        size: file.size,
      });

      // Baca file buffer dari uploaded file
      const arrayBuffer = await file.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);

      // Parse file berdasarkan extension
      let jsonData;
      const filename = file.name.toLowerCase();

      if (filename.endsWith(".xlsx") || filename.endsWith(".xls")) {
        try {
          const workbook = XLSX.read(buffer, { type: "buffer" });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          jsonData = XLSX.utils.sheet_to_json(worksheet);
        } catch (excelError) {
          console.error("Excel parsing error:", excelError);
          return errorResponse(
            "Gagal membaca file Excel. Pastikan file tidak corrupt.",
            400
          );
        }
      } else if (filename.endsWith(".csv")) {
        try {
          const csvText = new TextDecoder("utf-8").decode(buffer);
          const workbook = XLSX.read(csvText, { type: "string" });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          jsonData = XLSX.utils.sheet_to_json(worksheet);
        } catch (csvError) {
          console.error("CSV parsing error:", csvError);
          return errorResponse(
            "Gagal membaca file CSV. Pastikan format file benar.",
            400
          );
        }
      } else {
        return errorResponse(
          "Format file tidak didukung. Gunakan file .xlsx, .xls, atau .csv",
          400
        );
      }

      if (!jsonData || jsonData.length === 0) {
        return errorResponse(
          "File kosong atau tidak memiliki data yang valid",
          400
        );
      }

      console.log("Parsed data preview:", jsonData.slice(0, 3));

      const created_teachers = [];
      const errors = [];

      // Process Excel data menggunakan service yang sudah ada
      let teachers_data = [];
      try {
        const excel_result = await TeachersService.excelData(jsonData);
        teachers_data = excel_result.data;
        console.log("Processed teachers data:", teachers_data.length);
      } catch (error) {
        console.error("Excel data processing error:", error);
        if (error.details) {
          return jsonResponse(
            {
              success: false,
              message: `Gagal memproses data Excel: ${error.message}`,
              data: {
                created: [],
                errors: error.details,
                summary: {
                  total: jsonData.length,
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

      // Process setiap teacher menggunakan UsersService
      for (let i = 0; i < teachers_data.length; i++) {
        try {
          console.log(`Processing teacher ${i + 1}:`, teachers_data[i]);

          const response = await UsersService.createUser(teachers_data[i]);

          if (response.status >= 200 && response.status < 300) {
            created_teachers.push(response.data);
            console.log(`Teacher ${i + 1} created successfully`);
          } else {
            errors.push({
              index: i + 1,
              nip: teachers_data[i].data?.nip,
              error: "Gagal membuat data guru",
            });
            console.log(
              `Teacher ${i + 1} failed: response status ${response.status}`
            );
          }
        } catch (error) {
          console.error(`Error creating teacher ${i + 1}:`, error);
          errors.push({
            index: i + 1,
            nip: teachers_data[i].data?.nip,
            error: error.message || "Unknown error",
          });
        }
      }

      const result = {
        success: errors.length === 0,
        message: `Proses bulk upload selesai. ${created_teachers.length} guru berhasil dibuat, ${errors.length} gagal`,
        data: {
          created: created_teachers,
          errors: errors,
          summary: {
            total: teachers_data.length,
            successful: created_teachers.length,
            failed: errors.length,
          },
        },
      };

      console.log("Bulk upload result:", result.data.summary);

      return jsonResponse(result, errors.length === 0 ? 201 : 207); // 207 Multi-Status untuk partial success
    } catch (error) {
      console.error("Bulk upload error:", error);
      return errorResponse(`Gagal memproses file: ${error.message}`, 400);
    }
  }

  static async exportTeachers(c) {
    try {
      const { format = "xlsx", startDate, endDate } = c.req.query();

      // Build query parameters for getting all teachers
      const query_params = {
        page: 1,
        limit: 10000, // Get all data for export
      };

      // Add date filters if provided
      if (startDate && endDate) {
        query_params.startDate = startDate;
        query_params.endDate = endDate;
      }

      const response = await TeachersService.getAllTeachers(query_params);

      if (format === "xlsx") {
        // Create Excel file
        const exportData = response.data.map((teacher, index) => ({
          No: index + 1,
          "Nama Lengkap": teacher.user?.full_name || "",
          NIP: teacher.nip || "",
          Kelas: teacher.class?.grade || "",
          Email: teacher.user?.data?.email || "",
          Telepon: teacher.user?.data?.phone || "",
          "Tanggal Dibuat": teacher.created_at
            ? new Date(teacher.created_at).toLocaleDateString("id-ID")
            : "",
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Data Guru");

        // Set column widths
        const range = XLSX.utils.decode_range(worksheet["!ref"]);
        const colWidths = [
          { wch: 5 }, // No
          { wch: 25 }, // Nama Lengkap
          { wch: 15 }, // NIP
          { wch: 10 }, // Kelas
          { wch: 25 }, // Email
          { wch: 15 }, // Telepon
          { wch: 15 }, // Tanggal Dibuat
        ];
        worksheet["!cols"] = colWidths;

        const buffer = XLSX.write(workbook, {
          type: "buffer",
          bookType: "xlsx",
        });

        c.header(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        c.header(
          "Content-Disposition",
          `attachment; filename=data-guru-${
            new Date().toISOString().split("T")[0]
          }.xlsx`
        );

        return c.body(buffer);
      } else if (format === "csv") {
        // Create CSV file
        const exportData = response.data.map((teacher, index) => ({
          No: index + 1,
          "Nama Lengkap": teacher.user?.full_name || "",
          NIP: teacher.nip || "",
          Kelas: teacher.class?.grade || "",
          Email: teacher.user?.data?.email || "",
          Telepon: teacher.user?.data?.phone || "",
          "Tanggal Dibuat": teacher.created_at
            ? new Date(teacher.created_at).toLocaleDateString("id-ID")
            : "",
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const csv = XLSX.utils.sheet_to_csv(worksheet);

        c.header("Content-Type", "text/csv; charset=utf-8");
        c.header(
          "Content-Disposition",
          `attachment; filename=data-guru-${
            new Date().toISOString().split("T")[0]
          }.csv`
        );

        return c.text(csv);
      }

      return errorResponse("Format tidak valid. Gunakan xlsx atau csv", 400);
    } catch (error) {
      console.error("Export error:", error);
      return errorResponse(`Export gagal: ${error.message}`, 500);
    }
  }

  static async createTeacher(c) {
    try {
      const teacher_data = c.req.valid("json");

      const response = await TeachersService.createTeacher(teacher_data);

      return jsonResponse(response.data, response.status);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  /**
   * Get all teachers with pagination and filtering
   * GET /teachers
   */
  static async getAllTeachers(c) {
    try {
      const query_params = c.req.valid("query");

      const response = await TeachersService.getAllTeachers(query_params);

      return jsonResponse(response.data, response.status, response.pagination);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  /**
   * Get teacher by ID
   * GET /teachers/:id
   */
  static async getTeacherById(c) {
    try {
      const { id } = c.req.valid("param");

      const response = await TeachersService.getTeacherById(parseInt(id));

      if (!response.data) {
        return errorResponse("Teacher not found", 404);
      }

      return jsonResponse(response.data, response.status);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  /**
   * Update teacher by ID
   * PUT /teachers/:id
   */
  static async updateTeacher(c) {
    try {
      const { id } = c.req.valid("param");
      const update_data = c.req.valid("json");

      const response = await TeachersService.updateTeacher(
        parseInt(id),
        update_data
      );

      return jsonResponse(response.data, response.status);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  /**
   * Soft delete teacher by ID
   * DELETE /teachers/:id
   */
  static async deleteTeacher(c) {
    try {
      const { id } = c.req.valid("param");

      const response = await TeachersService.deleteTeacher(parseInt(id));

      return jsonResponse(
        {
          message: response.data
            ? "Teacher successfully deleted"
            : "Failed to delete teacher",
        },
        response.status
      );
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  /**
   * Restore soft deleted teacher
   * POST /teachers/:id/restore
   */
  static async restoreTeacher(c) {
    try {
      const { id } = c.req.valid("param");

      const response = await TeachersService.restoreTeacher(parseInt(id));

      return jsonResponse(response.data, response.status);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  /**
   * Get teachers statistics by class
   * GET /teachers/stats/classes
   */
  static async getTeachersStatsByClass(c) {
    try {
      const response = await TeachersService.getTeachersCountByClass();

      return jsonResponse(response.data, response.status);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  /**
   * Search teachers by NIP or name
   * GET /teachers/search
   */
  static async searchTeachers(c) {
    try {
      const { q: query, limit = "10" } = c.req.query();

      if (!query || query.trim().length < 2) {
        return errorResponse("Search query must be at least 2 characters", 400);
      }

      const response = await TeachersService.getAllTeachers({
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
   * Get teachers by class
   * GET /teachers/class/:id_class
   */
  static async getTeachersByClass(c) {
    try {
      const { id_class } = c.req.param();
      const { page = "1", limit = "10" } = c.req.query();

      const response = await TeachersService.getAllTeachers({
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
   * Bulk create teachers
   * POST /teachers/bulk
   */
  static async bulkCreateTeachers(c) {
    try {
      const payload = c.req.valid("json");
      let teachers_data = [];
      let processing_errors = [];

      // Handle Excel format
      if (payload.type === "excel") {
        try {
          const excel_result = await TeachersService.excelData(payload.data);
          teachers_data = excel_result.data;
        } catch (error) {
          // Handle Excel processing errors with details
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
        // Handle existing format (with or without type field)
        teachers_data = payload.teachers || [];
      }

      if (!teachers_data || teachers_data.length === 0) {
        return errorResponse("No teacher data provided", 400);
      }

      const created_teachers = [];
      const errors = [];

      // Process each teacher
      for (let i = 0; i < teachers_data.length; i++) {
        try {
          let response;

          // For Excel format, use UsersService.createUser
          if (payload.type === "excel") {
            response = await UsersService.createUser(teachers_data[i]);
          } else {
            // For existing format, use TeachersService.createTeacher
            response = await TeachersService.createTeacher(teachers_data[i]);
          }

          if (response.status >= 200 && response.status < 300) {
            created_teachers.push(response.data);
          } else {
            errors.push({
              index: i,
              nip: teachers_data[i].data?.nip || teachers_data[i].nip,
              error: "Failed to create teacher",
            });
          }
        } catch (error) {
          errors.push({
            index: i,
            nip: teachers_data[i].data?.nip || teachers_data[i].nip,
            error: error.message,
          });
        }
      }

      return jsonResponse(
        {
          success: errors.length === 0,
          message: `Bulk operation completed. ${created_teachers.length} teachers created, ${errors.length} failed`,
          data: {
            created: created_teachers,
            errors: errors,
            summary: {
              total: teachers_data.length,
              successful: created_teachers.length,
              failed: errors.length,
            },
          },
        },
        errors.length === 0 ? 201 : 207
      ); // 207 Multi-Status for partial success
    } catch (error) {
      return errorResponse(error.message, 400);
    }
  }

  /**
   * Health check for teachers service
   * GET /teachers/health
   */
  static async healthCheck(c) {
    try {
      const response = await TeachersService.healthCheck();

      return jsonResponse(response.data, response.status);
    } catch (error) {
      console.log("ERROR: ", error);
      return errorResponse(error.message, 503);
    }
  }
}
