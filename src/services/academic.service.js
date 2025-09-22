import {
  eq,
  and,
  isNull,
  like,
  or,
  desc,
  asc,
  sql,
  gte,
  lte,
} from "drizzle-orm";
import { db } from "../config/database.js";
import {
  academicYears,
  principalAgendas,
  surveys,
  surveyQuestions,
  surveyResponses,
  surveySurveyors,
  letters,
} from "../models/academic.model.js";
import { users } from "../models/users.model.js";
import ExcelJS from "exceljs";
/**
 * Academic Service
 * Handles all CRUD operations for academic-related entities with Drizzle ORM
 */

export class AcademicService {
  // ============= ACADEMIC YEARS =============
  static async generateSurveysExcel(options = {}) {
    try {
      const {
        id_academic_year,
        search,
        include_responses = false,
        include_questions = false,
        include_surveyors = false,
      } = options;

      // Get surveys data with related information
      const surveys_result = await this.getAllSurveys({
        id_academic_year,
        search,
        limit: 10000, // Get all data for export
      });

      if (!surveys_result.data || surveys_result.data.length === 0) {
        return { data: null, status: 404, pagination: null };
      }

      // Create new workbook
      const workbook = new ExcelJS.Workbook();

      // Set workbook properties
      workbook.creator = "Academic System";
      workbook.lastModifiedBy = "Academic System";
      workbook.created = new Date();
      workbook.modified = new Date();

      // Create main surveys worksheet
      const surveysSheet = workbook.addWorksheet("Surveys", {
        properties: { tabColor: { argb: "FF0066CC" } },
      });

      // Define surveys columns
      surveysSheet.columns = [
        { header: "ID", key: "id", width: 10 },
        { header: "Title", key: "title", width: 30 },
        { header: "Description", key: "description", width: 40 },
        { header: "Academic Year", key: "academic_year", width: 15 },
        { header: "Created At", key: "created_at", width: 20 },
        { header: "Updated At", key: "updated_at", width: 20 },
      ];

      // Style the header row
      surveysSheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF0066CC" },
        };
        cell.alignment = { vertical: "middle", horizontal: "center" };
      });

      // Add surveys data
      surveys_result.data.forEach((survey) => {
        surveysSheet.addRow({
          id: survey.id,
          title: survey.title,
          description: survey.description || "N/A",
          academic_year: survey.academic_year?.year || "N/A",
          created_at: new Date(survey.created_at).toLocaleDateString(),
          updated_at: new Date(survey.updated_at).toLocaleDateString(),
        });
      });

      // Auto-fit columns
      surveysSheet.columns.forEach((column) => {
        let maxLength = 0;
        column.eachCell({ includeEmpty: false }, (cell) => {
          const length = cell.value ? cell.value.toString().length : 0;
          if (length > maxLength) {
            maxLength = length;
          }
        });
        column.width = Math.min(Math.max(maxLength + 2, 10), 50);
      });

      // Include survey questions if requested
      if (include_questions) {
        const questionsSheet = workbook.addWorksheet("Survey Questions", {
          properties: { tabColor: { argb: "FF00AA00" } },
        });

        questionsSheet.columns = [
          { header: "ID", key: "id", width: 10 },
          { header: "Survey ID", key: "survey_id", width: 12 },
          { header: "Survey Title", key: "survey_title", width: 25 },
          { header: "Question", key: "question", width: 40 },
          { header: "Description", key: "description", width: 30 },
          { header: "Created At", key: "created_at", width: 20 },
        ];

        // Style header
        questionsSheet.getRow(1).eachCell((cell) => {
          cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF00AA00" },
          };
          cell.alignment = { vertical: "middle", horizontal: "center" };
        });

        // Get questions for all surveys
        for (const survey of surveys_result.data) {
          const questions_result = await this.getAllSurveyQuestions({
            id_survey: survey.id,
            limit: 10000,
          });

          questions_result.data.forEach((question) => {
            questionsSheet.addRow({
              id: question.id,
              survey_id: question.id_survey,
              survey_title: question.survey?.title || "N/A",
              question: question.question,
              description: question.description || "N/A",
              created_at: new Date(question.created_at).toLocaleDateString(),
            });
          });
        }

        // Auto-fit columns for questions sheet
        questionsSheet.columns.forEach((column) => {
          let maxLength = 0;
          column.eachCell({ includeEmpty: false }, (cell) => {
            const length = cell.value ? cell.value.toString().length : 0;
            if (length > maxLength) {
              maxLength = length;
            }
          });
          column.width = Math.min(Math.max(maxLength + 2, 10), 50);
        });
      }

      // Include survey surveyors if requested
      if (include_surveyors) {
        const surveyorsSheet = workbook.addWorksheet("Survey Surveyors", {
          properties: { tabColor: { argb: "FFAA6600" } },
        });

        surveyorsSheet.columns = [
          { header: "ID", key: "id", width: 10 },
          { header: "Survey ID", key: "survey_id", width: 12 },
          { header: "Survey Title", key: "survey_title", width: 25 },
          { header: "Surveyor Name", key: "name", width: 25 },
          { header: "Organization", key: "organization", width: 30 },
          { header: "Feedback", key: "feedback", width: 40 },
          { header: "Created At", key: "created_at", width: 20 },
        ];

        // Style header
        surveyorsSheet.getRow(1).eachCell((cell) => {
          cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFAA6600" },
          };
          cell.alignment = { vertical: "middle", horizontal: "center" };
        });

        // Get surveyors for all surveys
        for (const survey of surveys_result.data) {
          const surveyors_result = await this.getAllSurveySurveyors({
            id_survey: survey.id,
            limit: 10000,
          });

          surveyors_result.data.forEach((surveyor) => {
            surveyorsSheet.addRow({
              id: surveyor.id,
              survey_id: surveyor.id_survey,
              survey_title: surveyor.survey?.title || "N/A",
              name: surveyor.name,
              organization: surveyor.organization || "N/A",
              feedback: surveyor.feedback || "N/A",
              created_at: new Date(surveyor.created_at).toLocaleDateString(),
            });
          });
        }

        // Auto-fit columns for surveyors sheet
        surveyorsSheet.columns.forEach((column) => {
          let maxLength = 0;
          column.eachCell({ includeEmpty: false }, (cell) => {
            const length = cell.value ? cell.value.toString().length : 0;
            if (length > maxLength) {
              maxLength = length;
            }
          });
          column.width = Math.min(Math.max(maxLength + 2, 10), 50);
        });
      }

      // Include survey responses if requested
      if (include_responses) {
        const responsesSheet = workbook.addWorksheet("Survey Responses", {
          properties: { tabColor: { argb: "FFCC0000" } },
        });

        responsesSheet.columns = [
          { header: "Response ID", key: "id", width: 12 },
          { header: "Survey ID", key: "survey_id", width: 12 },
          { header: "Survey Title", key: "survey_title", width: 25 },
          { header: "Question ID", key: "question_id", width: 12 },
          { header: "Question", key: "question_text", width: 40 },
          { header: "Surveyor ID", key: "surveyor_id", width: 12 },
          { header: "Surveyor Name", key: "surveyor_name", width: 25 },
          { header: "Score", key: "score", width: 10 },
          { header: "Created At", key: "created_at", width: 20 },
        ];

        // Style header
        responsesSheet.getRow(1).eachCell((cell) => {
          cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFCC0000" },
          };
          cell.alignment = { vertical: "middle", horizontal: "center" };
        });

        // Get responses for all surveys
        for (const survey of surveys_result.data) {
          const responses_result = await this.getAllSurveyResponses({
            id_survey: survey.id,
            limit: 10000,
          });

          responses_result.data.forEach((response) => {
            responsesSheet.addRow({
              id: response.id,
              survey_id: response.id_survey,
              survey_title: response.survey?.title || "N/A",
              question_id: response.id_survey_question,
              question_text: response.survey_question?.question || "N/A",
              surveyor_id: response.id_survey_surveyor,
              surveyor_name: response.survey_surveyor?.name || "N/A",
              score: response.score,
              created_at: new Date(response.created_at).toLocaleDateString(),
            });
          });
        }

        // Auto-fit columns for responses sheet
        responsesSheet.columns.forEach((column) => {
          let maxLength = 0;
          column.eachCell({ includeEmpty: false }, (cell) => {
            const length = cell.value ? cell.value.toString().length : 0;
            if (length > maxLength) {
              maxLength = length;
            }
          });
          column.width = Math.min(Math.max(maxLength + 2, 10), 50);
        });
      }

      // Generate buffer
      const buffer = await workbook.xlsx.writeBuffer();

      return {
        data: buffer,
        status: 200,
        pagination: null,
      };
    } catch (error) {
      throw new Error(`Failed to generate surveys Excel: ${error.message}`);
    }
  }

  static async createAcademicYear(academic_year_data) {
    try {
      const [existing_year] = await db
        .select()
        .from(academicYears)
        .where(
          and(
            eq(academicYears.year, academic_year_data.year),
            isNull(academicYears.deleted_at)
          )
        )
        .limit(1);

      if (existing_year) {
        throw new Error("Academic year already exists");
      }
      // If is_active can only 1 (Don't delete this)
      // if (academic_year_data.is_active) {
      //   await db.update(academicYears).set({ is_active: false }).where(and(eq(academicYears.is_active, true), isNull(academicYears.deleted_at)));
      // }

      const year_to_insert = {
        year: academic_year_data.year,
        start_date: new Date(academic_year_data.start_date),
        end_date: new Date(academic_year_data.end_date),
        is_active: academic_year_data.is_active || false,
      };

      const insert_result = await db
        .insert(academicYears)
        .values(year_to_insert);
      const [new_year] = await db
        .select()
        .from(academicYears)
        .where(eq(academicYears.id, insert_result[0].insertId))
        .limit(1);

      return { data: new_year, status: 201, pagination: null };
    } catch (error) {
      console.log("ERROR: ", error);
      throw new Error(`Failed to create academic year: ${error.message}`);
    }
  }

  static async getAllAcademicYears(options = {}) {
    try {
      const { page = 1, limit = 10, active, year } = options;
      const offset = (page - 1) * limit;
      const where_conditions = [isNull(academicYears.deleted_at)];

      if (active !== undefined)
        where_conditions.push(eq(academicYears.is_active, active));
      if (year) where_conditions.push(eq(academicYears.year, year));

      const years_list = await db
        .select()
        .from(academicYears)
        .where(and(...where_conditions))
        .orderBy(desc(academicYears.created_at))
        .limit(limit)
        .offset(offset);
      const [{ count }] = await db
        .select({ count: sql`count(*)` })
        .from(academicYears)
        .where(and(...where_conditions));
      const total_pages = Math.ceil(count / limit);

      return {
        data: years_list,
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
      throw new Error(`Failed to get academic years: ${error.message}`);
    }
  }

  static async getAcademicYearById(id_year) {
    try {
      const [year] = await db
        .select()
        .from(academicYears)
        .where(
          and(eq(academicYears.id, id_year), isNull(academicYears.deleted_at))
        )
        .limit(1);
      return { data: year || null, status: 200, pagination: null };
    } catch (error) {
      throw new Error(`Failed to get academic year: ${error.message}`);
    }
  }

  static async updateAcademicYear(id_year, update_data) {
    try {
      const existing_year_result = await this.getAcademicYearById(id_year);
      if (!existing_year_result.data)
        throw new Error("Academic year not found");

      // If is_active can only 1 (Don't delete this)
      // if (update_data.is_active) {
      //   await db.update(academicYears).set({ is_active: false }).where(and(eq(academicYears.is_active, true), isNull(academicYears.deleted_at)));
      // }

      const update_payload = {};
      if (update_data.year) update_payload.year = update_data.year;
      if (update_data.start_date)
        update_payload.start_date = new Date(update_data.start_date);
      if (update_data.end_date)
        update_payload.end_date = new Date(update_data.end_date);
      if (update_data.is_active !== undefined)
        update_payload.is_active = update_data.is_active;

      await db
        .update(academicYears)
        .set(update_payload)
        .where(eq(academicYears.id, id_year));
      const [updated_year] = await db
        .select()
        .from(academicYears)
        .where(eq(academicYears.id, id_year))
        .limit(1);

      return { data: updated_year, status: 200, pagination: null };
    } catch (error) {
      throw new Error(`Failed to update academic year: ${error.message}`);
    }
  }

  static async deleteAcademicYear(id_year) {
    try {
      const existing_year_result = await this.getAcademicYearById(id_year);
      if (!existing_year_result.data)
        throw new Error("Academic year not found");

      const update_result = await db
        .update(academicYears)
        .set({ deleted_at: new Date() })
        .where(eq(academicYears.id, id_year));
      return {
        data: update_result.affectedRows > 0,
        status: 200,
        pagination: null,
      };
    } catch (error) {
      throw new Error(`Failed to delete academic year: ${error.message}`);
    }
  }

  /**
   * Restore soft deleted academic year
   * @param {number} id_year - Academic year ID
   * @returns {Promise<Object|null>} Restored academic year
   */
  static async restoreAcademicYear(id_year) {
    try {
      // Check if academic year exists and is soft deleted
      const [existing_year] = await db
        .select()
        .from(academicYears)
        .where(eq(academicYears.id, id_year))
        .limit(1);

      if (!existing_year) {
        throw new Error("Academic year not found");
      }

      if (!existing_year.deleted_at) {
        throw new Error("Academic year is not deleted");
      }

      // Restore academic year by setting deleted_at to null
      await db
        .update(academicYears)
        .set({ deleted_at: null })
        .where(eq(academicYears.id, id_year));

      // Get the restored academic year
      const [restored_year] = await db
        .select()
        .from(academicYears)
        .where(eq(academicYears.id, id_year))
        .limit(1);

      if (!restored_year) {
        throw new Error("Failed to restore academic year");
      }

      return {
        data: restored_year,
        status: 200,
        pagination: null,
      };
    } catch (error) {
      throw new Error(`Failed to restore academic year: ${error.message}`);
    }
  }

  // ============= PRINCIPAL AGENDAS =============

  static async createPrincipalAgenda(agenda_data) {
    try {
      const agenda_to_insert = {
        event_name: agenda_data.event_name,
        description: agenda_data.description || null,
        event_date: new Date(agenda_data.event_date),
      };

      const insert_result = await db
        .insert(principalAgendas)
        .values(agenda_to_insert);
      const [new_agenda] = await db
        .select()
        .from(principalAgendas)
        .where(eq(principalAgendas.id, insert_result[0].insertId))
        .limit(1);

      return { data: new_agenda, status: 201, pagination: null };
    } catch (error) {
      throw new Error(`Failed to create principal agenda: ${error.message}`);
    }
  }

  static async getAllPrincipalAgendas(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        start_date,
        end_date,
        search,
        count = false,
        month = false,
        monthSet,
        year = false,
        yearSet,
        statistics_month = false,
      } = options;

      // Debug: Log parameter statistics_month
      console.log("=== DEBUG: statistics_month parameter ===");
      console.log(
        "statistics_month:",
        statistics_month,
        typeof statistics_month
      );

      const where_conditions = [isNull(principalAgendas.deleted_at)];

      // Filter berdasarkan start_date dan end_date
      if (start_date)
        where_conditions.push(
          gte(principalAgendas.event_date, new Date(start_date))
        );
      if (end_date)
        where_conditions.push(
          lte(principalAgendas.event_date, new Date(end_date + "T23:59:59"))
        );

      // Filter berdasarkan bulan (untuk data pagination, bukan count)
      if (month && monthSet && !statistics_month) {
        const monthNumber = parseInt(monthSet);

        if (monthNumber >= 1 && monthNumber <= 12) {
          where_conditions.push(
            sql`EXTRACT(MONTH FROM ${principalAgendas.event_date}) = ${monthNumber}`
          );
        }
      }

      // Filter berdasarkan tahun (untuk data pagination, bukan count)
      if (year && yearSet && !statistics_month) {
        const yearNumber = parseInt(yearSet);
        if (yearNumber > 0) {
          where_conditions.push(
            sql`EXTRACT(YEAR FROM ${principalAgendas.event_date}) = ${yearNumber}`
          );
        }
      }

      // Filter berdasarkan search
      if (search)
        where_conditions.push(
          or(
            like(principalAgendas.event_name, `%${search}%`),
            like(principalAgendas.description, `%${search}%`)
          )
        );

      // Jika request untuk statistics_month
      if (statistics_month === true) {
        console.log("=== Processing monthly statistics ===");

        let statisticsQuery;

        // Jika ada filter tahun, hitung statistik untuk tahun tersebut
        if (year === true && yearSet) {
          const yearNumber = parseInt(yearSet);
          console.log("Getting statistics for year:", yearNumber);

          // Fixed query - only select aggregated columns and group by them
          statisticsQuery = await db.execute(sql`
          SELECT 
            MONTH(event_date) as month_number,
            COUNT(*) as count
          FROM principal_agendas 
          WHERE deleted_at IS NULL 
          AND YEAR(event_date) = ${yearNumber}
          GROUP BY MONTH(event_date)
          ORDER BY MONTH(event_date)
        `);
        } else {
          // Jika tidak ada filter tahun, gunakan tahun sekarang
          const currentYear = new Date().getFullYear();
          console.log("Getting statistics for current year:", currentYear);

          // Fixed query - only select aggregated columns and group by them
          statisticsQuery = await db.execute(sql`
          SELECT 
            MONTH(event_date) as month_number,
            COUNT(*) as count
          FROM principal_agendas 
          WHERE deleted_at IS NULL 
          AND YEAR(event_date) = ${currentYear}
          GROUP BY MONTH(event_date)
          ORDER BY MONTH(event_date)
        `);
        }

        console.log("Statistics query result:", statisticsQuery);

        // Format hasil menjadi object dengan key bulan
        const monthlyStats = {};

        // Inisialisasi semua bulan dengan 0
        for (let i = 1; i <= 12; i++) {
          const monthKey = i.toString().padStart(2, "0");
          monthlyStats[monthKey] = 0;
        }

        // Isi data dari query result
        if (
          statisticsQuery &&
          statisticsQuery[0] &&
          statisticsQuery[0].length > 0
        ) {
          statisticsQuery[0].forEach((row) => {
            const monthKey = row.month_number.toString().padStart(2, "0");
            monthlyStats[monthKey] = parseInt(row.count);
          });
        }

        console.log("Final monthly statistics:", monthlyStats);

        return {
          data: monthlyStats,
          status: 200,
          message: "Monthly statistics retrieved successfully",
        };
      }

      // Debug: Log final where conditions
      console.log("=== DEBUG: Final where conditions count ===");
      console.log("Number of where conditions:", where_conditions.length);

      // Debug: Test the actual query
      const debugCount = await db
        .select({ count: sql`count(*)` })
        .from(principalAgendas)
        .where(and(...where_conditions));
      console.log("Debug count result:", debugCount);

      // Jika hanya ingin menghitung jumlah data
      if (count) {
        let totalCount;

        // Jika ada filter bulan atau tahun, gunakan raw query yang lebih reliable
        if (month && monthSet) {
          const monthNumber = parseInt(monthSet);
          if (monthNumber >= 1 && monthNumber <= 12) {
            let rawQuery;

            // Jika ada filter tahun juga
            if (year && yearSet) {
              const yearNumber = parseInt(yearSet);
              rawQuery = await db.execute(sql`
          SELECT COUNT(*) as total_count
          FROM principal_agendas 
          WHERE deleted_at IS NULL 
          AND EXTRACT(MONTH FROM event_date) = ${monthNumber}
          AND EXTRACT(YEAR FROM event_date) = ${yearNumber}
        `);
            } else {
              // Hanya filter bulan
              rawQuery = await db.execute(sql`
          SELECT COUNT(*) as total_count
          FROM principal_agendas 
          WHERE deleted_at IS NULL 
          AND EXTRACT(MONTH FROM event_date) = ${monthNumber}
        `);
            }

            console.log("Raw query result:", rawQuery);
            totalCount = rawQuery[0][0].total_count;
          }
        } else if (year && yearSet) {
          // Hanya filter tahun
          const yearNumber = parseInt(yearSet);
          const rawQuery = await db.execute(sql`
      SELECT COUNT(*) as total_count
      FROM principal_agendas 
      WHERE deleted_at IS NULL 
      AND EXTRACT(YEAR FROM event_date) = ${yearNumber}
    `);
          totalCount = rawQuery[0][0].total_count;
        } else {
          // Tidak ada filter bulan/tahun, gunakan Drizzle ORM biasa
          const [{ count: countResult }] = await db
            .select({ count: sql`count(*)` })
            .from(principalAgendas)
            .where(and(...where_conditions));
          totalCount = countResult;
        }

        return {
          count: totalCount,
          status: 200,
          message: "Total count retrieved successfully",
        };
      }

      // Jika tidak hanya count, ambil data dengan pagination
      const offset = (page - 1) * limit;

      const agendas_list = await db
        .select()
        .from(principalAgendas)
        .where(and(...where_conditions))
        .orderBy(asc(principalAgendas.event_date))
        .limit(limit)
        .offset(offset);

      const [{ count: totalCount }] = await db
        .select({ count: sql`count(*)` })
        .from(principalAgendas)
        .where(and(...where_conditions));

      const total_pages = Math.ceil(totalCount / limit);

      return {
        data: agendas_list,
        status: 200,
        pagination: {
          current_page: page,
          total_pages,
          total_items: totalCount,
          items_per_page: limit,
          has_next_page: page < total_pages,
          has_prev_page: page > 1,
        },
      };
    } catch (error) {
      throw new Error(`Failed to get principal agendas: ${error.message}`);
    }
  }

  static async getPrincipalAgendaById(id_principal_agenda) {
    try {
      const [agenda] = await db
        .select()
        .from(principalAgendas)
        .where(
          and(
            eq(principalAgendas.id, id_principal_agenda),
            isNull(principalAgendas.deleted_at)
          )
        )
        .limit(1);
      return { data: agenda || null, status: 200, pagination: null };
    } catch (error) {
      throw new Error(`Failed to get principal agenda: ${error.message}`);
    }
  }

  static async updatePrincipalAgenda(id_principal_agenda, update_data) {
    try {
      const existing_agenda_result = await this.getPrincipalAgendaById(
        id_principal_agenda
      );
      if (!existing_agenda_result.data)
        throw new Error("Principal agenda not found");

      const update_payload = {};
      if (update_data.event_name)
        update_payload.event_name = update_data.event_name;
      if (update_data.description !== undefined)
        update_payload.description = update_data.description;
      if (update_data.event_date)
        update_payload.event_date = new Date(update_data.event_date);

      await db
        .update(principalAgendas)
        .set(update_payload)
        .where(eq(principalAgendas.id, id_principal_agenda));
      const [updated_agenda] = await db
        .select()
        .from(principalAgendas)
        .where(eq(principalAgendas.id, id_principal_agenda))
        .limit(1);

      return { data: updated_agenda, status: 200, pagination: null };
    } catch (error) {
      throw new Error(`Failed to update principal agenda: ${error.message}`);
    }
  }

  static async deletePrincipalAgenda(id_principal_agenda) {
    try {
      const existing_agenda_result = await this.getPrincipalAgendaById(
        id_principal_agenda
      );
      if (!existing_agenda_result.data)
        throw new Error("Principal agenda not found");

      const update_result = await db
        .update(principalAgendas)
        .set({ deleted_at: new Date() })
        .where(eq(principalAgendas.id, id_principal_agenda));
      return {
        data: update_result.affectedRows > 0,
        status: 200,
        pagination: null,
      };
    } catch (error) {
      throw new Error(`Failed to delete principal agenda: ${error.message}`);
    }
  }

  /**
   * Restore soft deleted principal agenda
   * @param {number} id_principal_agenda - Principal agenda ID
   * @returns {Promise<Object|null>} Restored principal agenda
   */
  static async restorePrincipalAgenda(id_principal_agenda) {
    try {
      // Check if principal agenda exists and is soft deleted
      const [existing_agenda] = await db
        .select()
        .from(principalAgendas)
        .where(eq(principalAgendas.id, id_principal_agenda))
        .limit(1);

      if (!existing_agenda) {
        throw new Error("Principal agenda not found");
      }

      if (!existing_agenda.deleted_at) {
        throw new Error("Principal agenda is not deleted");
      }

      // Restore principal agenda by setting deleted_at to null
      await db
        .update(principalAgendas)
        .set({ deleted_at: null })
        .where(eq(principalAgendas.id, id_principal_agenda));

      // Get the restored principal agenda
      const [restored_agenda] = await db
        .select()
        .from(principalAgendas)
        .where(eq(principalAgendas.id, id_principal_agenda))
        .limit(1);

      if (!restored_agenda) {
        throw new Error("Failed to restore principal agenda");
      }

      return {
        data: restored_agenda,
        status: 200,
        pagination: null,
      };
    } catch (error) {
      throw new Error(`Failed to restore principal agenda: ${error.message}`);
    }
  }

  // ============= SURVEYS =============

  static async createSurvey(survey_data) {
    try {
      const academic_year_result = await this.getAcademicYearById(
        survey_data.id_academic_year
      );
      if (!academic_year_result.data)
        throw new Error("Academic year not found");

      const survey_to_insert = {
        title: survey_data.title,
        description: survey_data.description || null,
        id_academic_year: survey_data.id_academic_year,
      };

      const insert_result = await db.insert(surveys).values(survey_to_insert);
      const [new_survey] = await db
        .select()
        .from(surveys)
        .where(eq(surveys.id, insert_result[0].insertId))
        .limit(1);

      return { data: new_survey, status: 201, pagination: null };
    } catch (error) {
      throw new Error(`Failed to create survey: ${error.message}`);
    }
  }

  static async getAllSurveys(options = {}) {
    try {
      const { page = 1, limit = 10, id_academic_year, search } = options;
      const offset = (page - 1) * limit;
      const where_conditions = [];

      if (id_academic_year)
        where_conditions.push(eq(surveys.id_academic_year, id_academic_year));
      if (search)
        where_conditions.push(
          or(
            like(surveys.title, `%${search}%`),
            like(surveys.description, `%${search}%`)
          )
        );

      const surveys_list = await db
        .select({
          id: surveys.id,
          title: surveys.title,
          description: surveys.description,
          id_academic_year: surveys.id_academic_year,
          created_at: surveys.created_at,
          updated_at: surveys.updated_at,
          academic_year: {
            id: academicYears.id,
            year: academicYears.year,
            is_active: academicYears.is_active,
          },
        })
        .from(surveys)
        .leftJoin(academicYears, eq(surveys.id_academic_year, academicYears.id))
        .where(and(...where_conditions))
        .orderBy(desc(surveys.created_at))
        .limit(limit)
        .offset(offset);

      const [{ count }] = await db
        .select({ count: sql`count(*)` })
        .from(surveys)
        .where(and(...where_conditions));
      const total_pages = Math.ceil(count / limit);

      return {
        data: surveys_list,
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
      throw new Error(`Failed to get surveys: ${error.message}`);
    }
  }

  static async getSurveyById(id_survey) {
    try {
      const [survey] = await db
        .select({
          id: surveys.id,
          title: surveys.title,
          description: surveys.description,
          id_academic_year: surveys.id_academic_year,
          created_at: surveys.created_at,
          updated_at: surveys.updated_at,
          academic_year: {
            id: academicYears.id,
            year: academicYears.year,
            is_active: academicYears.is_active,
          },
        })
        .from(surveys)
        .leftJoin(academicYears, eq(surveys.id_academic_year, academicYears.id))
        .where(and(eq(surveys.id, id_survey), isNull(surveys.deleted_at)))
        .limit(1);

      return { data: survey || null, status: 200, pagination: null };
    } catch (error) {
      throw new Error(`Failed to get survey: ${error.message}`);
    }
  }

  static async updateSurvey(id_survey, update_data) {
    try {
      const existing_survey_result = await this.getSurveyById(id_survey);
      if (!existing_survey_result.data) throw new Error("Survey not found");

      if (update_data.id_academic_year) {
        const academic_year_result = await this.getAcademicYearById(
          update_data.id_academic_year
        );
        if (!academic_year_result.data)
          throw new Error("Academic year not found");
      }

      const update_payload = {};
      if (update_data.title) update_payload.title = update_data.title;
      if (update_data.description !== undefined)
        update_payload.description = update_data.description;
      if (update_data.id_academic_year)
        update_payload.id_academic_year = update_data.id_academic_year;

      await db
        .update(surveys)
        .set(update_payload)
        .where(eq(surveys.id, id_survey));
      const updated_survey_result = await this.getSurveyById(id_survey);
      return {
        data: updated_survey_result.data,
        status: 200,
        pagination: null,
      };
    } catch (error) {
      throw new Error(`Failed to update survey: ${error.message}`);
    }
  }

  static async deleteSurvey(id_survey) {
    try {
      const existing_survey_result = await this.getSurveyById(id_survey);
      if (!existing_survey_result.data) throw new Error("Survey not found");

      const update_result = await db
        .update(surveys)
        .set({ deleted_at: new Date() })
        .where(eq(surveys.id, id_survey));
      return {
        data: update_result.affectedRows > 0,
        status: 200,
        pagination: null,
      };
    } catch (error) {
      throw new Error(`Failed to delete survey: ${error.message}`);
    }
  }

  /**
   * Restore soft deleted survey
   * @param {number} id_survey - Survey ID
   * @returns {Promise<Object|null>} Restored survey
   */
  static async restoreSurvey(id_survey) {
    try {
      // Check if survey exists and is soft deleted
      const [existing_survey] = await db
        .select()
        .from(surveys)
        .where(eq(surveys.id, id_survey))
        .limit(1);

      if (!existing_survey) {
        throw new Error("Survey not found");
      }

      if (!existing_survey.deleted_at) {
        throw new Error("Survey is not deleted");
      }

      // Restore survey by setting deleted_at to null
      await db
        .update(surveys)
        .set({ deleted_at: null })
        .where(eq(surveys.id, id_survey));

      // Get the restored survey with academic year details
      const restored_survey_result = await this.getSurveyById(id_survey);

      if (!restored_survey_result.data) {
        throw new Error("Failed to restore survey");
      }

      return {
        data: restored_survey_result.data,
        status: 200,
        pagination: null,
      };
    } catch (error) {
      throw new Error(`Failed to restore survey: ${error.message}`);
    }
  }

  // ============= SURVEY QUESTIONS =============

  static async createSurveyQuestion(question_data) {
    try {
      const survey_result = await this.getSurveyById(question_data.id_survey);
      if (!survey_result.data) throw new Error("Survey not found");

      const question_to_insert = {
        id_survey: question_data.id_survey,
        question: question_data.question,
        description: question_data.description || null,
      };

      const insert_result = await db
        .insert(surveyQuestions)
        .values(question_to_insert);
      const [new_question] = await db
        .select()
        .from(surveyQuestions)
        .where(eq(surveyQuestions.id, insert_result[0].insertId))
        .limit(1);

      return { data: new_question, status: 201, pagination: null };
    } catch (error) {
      throw new Error(`Failed to create survey question: ${error.message}`);
    }
  }

  static async getAllSurveyQuestions(options = {}) {
    try {
      const { page = 1, limit = 10, id_survey, search } = options;
      const offset = (page - 1) * limit;
      const where_conditions = [isNull(surveyQuestions.deleted_at)];

      if (id_survey)
        where_conditions.push(eq(surveyQuestions.id_survey, id_survey));
      if (search)
        where_conditions.push(like(surveyQuestions.question, `%${search}%`));

      const questions_list = await db
        .select({
          id: surveyQuestions.id,
          id_survey: surveyQuestions.id_survey,
          question: surveyQuestions.question,
          description: surveyQuestions.description,
          created_at: surveyQuestions.created_at,
          updated_at: surveyQuestions.updated_at,
          survey: { id: surveys.id, title: surveys.title },
        })
        .from(surveyQuestions)
        .leftJoin(surveys, eq(surveyQuestions.id_survey, surveys.id))
        .where(and(...where_conditions))
        .orderBy(desc(surveyQuestions.created_at))
        .limit(limit)
        .offset(offset);
      const [{ count }] = await db
        .select({ count: sql`count(*)` })
        .from(surveyQuestions)
        .where(and(...where_conditions));
      const total_pages = Math.ceil(count / limit);

      return {
        data: questions_list,
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
      throw new Error(`Failed to get survey questions: ${error.message}`);
    }
  }

  static async getSurveyQuestionById(id_survey_question) {
    try {
      const [question] = await db
        .select({
          id: surveyQuestions.id,
          id_survey: surveyQuestions.id_survey,
          question: surveyQuestions.question,
          description: surveyQuestions.description,
          created_at: surveyQuestions.created_at,
          updated_at: surveyQuestions.updated_at,
          survey: { id: surveys.id, title: surveys.title },
        })
        .from(surveyQuestions)
        .leftJoin(surveys, eq(surveyQuestions.id_survey, surveys.id))
        .where(
          and(
            eq(surveyQuestions.id, id_survey_question),
            isNull(surveyQuestions.deleted_at)
          )
        )
        .limit(1);

      return { data: question || null, status: 200, pagination: null };
    } catch (error) {
      throw new Error(`Failed to get survey question: ${error.message}`);
    }
  }

  static async updateSurveyQuestion(id_survey_question, update_data) {
    try {
      const existing_question_result = await this.getSurveyQuestionById(
        id_survey_question
      );
      if (!existing_question_result.data)
        throw new Error("Survey question not found");

      if (update_data.id_survey) {
        const survey_result = await this.getSurveyById(update_data.id_survey);
        if (!survey_result.data) throw new Error("Survey not found");
      }

      const update_payload = {};
      if (update_data.id_survey)
        update_payload.id_survey = update_data.id_survey;
      if (update_data.question) update_payload.question = update_data.question;
      if (update_data.description !== undefined)
        update_payload.description = update_data.description;

      await db
        .update(surveyQuestions)
        .set(update_payload)
        .where(eq(surveyQuestions.id, id_survey_question));
      const updated_question_result = await this.getSurveyQuestionById(
        id_survey_question
      );
      return {
        data: updated_question_result.data,
        status: 200,
        pagination: null,
      };
    } catch (error) {
      throw new Error(`Failed to update survey question: ${error.message}`);
    }
  }

  static async deleteSurveyQuestion(id_survey_question) {
    try {
      const existing_question_result = await this.getSurveyQuestionById(
        id_survey_question
      );
      if (!existing_question_result.data)
        throw new Error("Survey question not found");

      const update_result = await db
        .update(surveyQuestions)
        .set({ deleted_at: new Date() })
        .where(eq(surveyQuestions.id, id_survey_question));
      return {
        data: update_result.affectedRows > 0,
        status: 200,
        pagination: null,
      };
    } catch (error) {
      throw new Error(`Failed to delete survey question: ${error.message}`);
    }
  }

  /**
   * Restore soft deleted survey question
   * @param {number} id_survey_question - Survey question ID
   * @returns {Promise<Object|null>} Restored survey question
   */
  static async restoreSurveyQuestion(id_survey_question) {
    try {
      // Check if survey question exists and is soft deleted
      const [existing_question] = await db
        .select()
        .from(surveyQuestions)
        .where(eq(surveyQuestions.id, id_survey_question))
        .limit(1);

      if (!existing_question) {
        throw new Error("Survey question not found");
      }

      if (!existing_question.deleted_at) {
        throw new Error("Survey question is not deleted");
      }

      // Restore survey question by setting deleted_at to null
      await db
        .update(surveyQuestions)
        .set({ deleted_at: null })
        .where(eq(surveyQuestions.id, id_survey_question));

      // Get the restored survey question with survey details
      const restored_question_result = await this.getSurveyQuestionById(
        id_survey_question
      );

      if (!restored_question_result.data) {
        throw new Error("Failed to restore survey question");
      }

      return {
        data: restored_question_result.data,
        status: 200,
        pagination: null,
      };
    } catch (error) {
      throw new Error(`Failed to restore survey question: ${error.message}`);
    }
  }

  // ============= SURVEY RESPONSES =============

  static async createSurveyResponse(response_data) {
    try {
      const survey_result = await this.getSurveyById(response_data.id_survey);
      if (!survey_result.data) throw new Error("Survey not found");

      const question_result = await this.getSurveyQuestionById(
        response_data.id_survey_question
      );
      if (!question_result.data) throw new Error("Survey question not found");

      const response_to_insert = {
        id_survey: response_data.id_survey,
        id_survey_question: response_data.id_survey_question,
        id_survey_surveyor: response_data.id_survey_surveyor,
        score: response_data.score,
      };

      const insert_result = await db
        .insert(surveyResponses)
        .values(response_to_insert);
      const [new_response] = await db
        .select()
        .from(surveyResponses)
        .where(eq(surveyResponses.id, insert_result[0].insertId))
        .limit(1);

      return { data: new_response, status: 201, pagination: null };
    } catch (error) {
      throw new Error(`Failed to create survey response: ${error.message}`);
    }
  }

  static async createBulkSurveyResponses(responses_data) {
    try {
      const id_survey = responses_data[0].id_survey;
      const survey_result = await this.getSurveyById(id_survey);
      if (!survey_result.data) throw new Error("Survey not found");

      // Validate all survey questions exist
      const id_survey_questions = [
        ...new Set(responses_data.map((r) => r.id_survey_question)),
      ];
      for (const id_survey_question of id_survey_questions) {
        const question_result = await this.getSurveyQuestionById(
          id_survey_question
        );
        if (!question_result.data)
          throw new Error(
            `Survey question with ID ${id_survey_question} not found`
          );
      }

      const responses_to_insert = responses_data.map((response) => ({
        id_survey: response.id_survey,
        id_survey_question: response.id_survey_question,
        id_survey_surveyor: response.id_survey_surveyor,
        score: response.score,
      }));

      const insert_result = await db
        .insert(surveyResponses)
        .values(responses_to_insert);
      return {
        data: { inserted_count: insert_result[0].affectedRows, id_survey },
        status: 201,
        pagination: null,
      };
    } catch (error) {
      throw new Error(
        `Failed to create bulk survey responses: ${error.message}`
      );
    }
  }

  static async getAllSurveyResponses(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        id_survey,
        id_survey_question,
        min_score,
        max_score,
        surveyor_name,
      } = options;
      const offset = (page - 1) * limit;
      const where_conditions = [isNull(surveyResponses.deleted_at)];
      if (id_survey)
        where_conditions.push(eq(surveyResponses.id_survey, id_survey));
      if (id_survey_question)
        where_conditions.push(
          eq(surveyResponses.id_survey_question, id_survey_question)
        );
      if (min_score !== undefined)
        where_conditions.push(gte(surveyResponses.score, min_score));
      if (max_score !== undefined)
        where_conditions.push(lte(surveyResponses.score, max_score));
      if (surveyor_name)
        where_conditions.push(
          like(surveyResponses.surveyor_name, `%${surveyor_name}%`)
        );
      const responses_list = await db
        .select({
          id: surveyResponses.id,
          id_survey: surveyResponses.id_survey,
          id_survey_question: surveyResponses.id_survey_question,
          id_survey_surveyor: surveyResponses.id_survey_surveyor,
          score: surveyResponses.score,
          created_at: surveyResponses.created_at,
          updated_at: surveyResponses.updated_at,
          survey: {
            id: surveys.id,
            title: surveys.title,
            description: surveys.description,
          },
          survey_question: {
            id: surveyQuestions.id,
            question: surveyQuestions.question,
            description: surveyQuestions.description,
          },
          survey_surveyor: {
            id: surveySurveyors.id,
            name: surveySurveyors.name,
            organization: surveySurveyors.organization,
            feedback: surveySurveyors.feedback,
          },
        })
        .from(surveyResponses)
        .leftJoin(surveys, eq(surveyResponses.id_survey, surveys.id))
        .leftJoin(
          surveyQuestions,
          eq(surveyResponses.id_survey_question, surveyQuestions.id)
        )
        .leftJoin(
          surveySurveyors,
          eq(surveyResponses.id_survey_surveyor, surveySurveyors.id)
        )
        .where(and(...where_conditions))
        .orderBy(desc(surveyResponses.created_at))
        .limit(limit)
        .offset(offset);

      const [{ count }] = await db
        .select({ count: sql`count(*)` })
        .from(surveyResponses)
        .where(and(...where_conditions));
      const total_pages = Math.ceil(count / limit);

      return {
        data: responses_list,
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
      throw new Error(`Failed to get survey responses: ${error.message}`);
    }
  }

  static async getSurveyResponseById(id_survey_response) {
    try {
      const [response] = await db
        .select({
          id: surveyResponses.id,
          id_survey: surveyResponses.id_survey,
          id_survey_question: surveyResponses.id_survey_question,
          id_survey_surveyor: surveyResponses.id_survey_surveyor,
          score: surveyResponses.score,
          created_at: surveyResponses.created_at,
          updated_at: surveyResponses.updated_at,
          survey: { id: surveys.id, title: surveys.title },
          survey_question: {
            id: surveyQuestions.id,
            question: surveyQuestions.question,
            description: surveyQuestions.description,
          },
          survey_surveyor: {
            id: surveySurveyors.id,
            name: surveySurveyors.name,
            organization: surveySurveyors.organization,
            feedback: surveySurveyors.feedback,
          },
        })
        .from(surveyResponses)
        .leftJoin(surveys, eq(surveyResponses.id_survey, surveys.id))
        .leftJoin(
          surveyQuestions,
          eq(surveyResponses.id_survey_question, surveyQuestions.id)
        )
        .leftJoin(
          surveySurveyors,
          eq(surveyResponses.id_survey_surveyor, surveySurveyors.id)
        )
        .where(
          and(
            eq(surveyResponses.id, id_survey_response),
            isNull(surveyResponses.deleted_at)
          )
        )
        .limit(1);

      return { data: response || null, status: 200, pagination: null };
    } catch (error) {
      throw new Error(`Failed to get survey response: ${error.message}`);
    }
  }

  static async updateSurveyResponse(id_survey_response, update_data) {
    try {
      const existing_response_result = await this.getSurveyResponseById(
        id_survey_response
      );
      if (!existing_response_result.data)
        throw new Error("Survey response not found");

      if (update_data.id_survey) {
        const survey_result = await this.getSurveyById(update_data.id_survey);
        if (!survey_result.data) throw new Error("Survey not found");
      }

      if (update_data.id_survey_question) {
        const question_result = await this.getSurveyQuestionById(
          update_data.id_survey_question
        );
        if (!question_result.data) throw new Error("Survey question not found");
      }

      if (update_data.id_survey_surveyor) {
        const surveyor_result = await this.getSurveySurveyorById(
          update_data.id_survey_surveyor
        );
        if (!surveyor_result.data) throw new Error("Survey surveyor not found");
      }

      const update_payload = {};
      if (update_data.id_survey)
        update_payload.id_survey = update_data.id_survey;
      if (update_data.id_survey_question)
        update_payload.id_survey_question = update_data.id_survey_question;
      if (update_data.id_survey_surveyor)
        update_payload.id_survey_surveyor = update_data.id_survey_surveyor;
      if (update_data.score !== undefined)
        update_payload.score = update_data.score;

      await db
        .update(surveyResponses)
        .set(update_payload)
        .where(eq(surveyResponses.id, id_survey_response));
      const updated_response_result = await this.getSurveyResponseById(
        id_survey_response
      );
      return {
        data: updated_response_result.data,
        status: 200,
        pagination: null,
      };
    } catch (error) {
      throw new Error(`Failed to update survey response: ${error.message}`);
    }
  }

  static async deleteSurveyResponse(id_survey_response) {
    try {
      const existing_response_result = await this.getSurveyResponseById(
        id_survey_response
      );
      if (!existing_response_result.data)
        throw new Error("Survey response not found");

      const update_result = await db
        .update(surveyResponses)
        .set({ deleted_at: new Date() })
        .where(eq(surveyResponses.id, id_survey_response));
      return {
        data: update_result.affectedRows > 0,
        status: 200,
        pagination: null,
      };
    } catch (error) {
      throw new Error(`Failed to delete survey response: ${error.message}`);
    }
  }

  /**
   * Restore soft deleted survey response
   * @param {number} id_survey_response - Survey response ID
   * @returns {Promise<Object|null>} Restored survey response
   */
  static async restoreSurveyResponse(id_survey_response) {
    try {
      // Check if survey response exists and is soft deleted
      const [existing_response] = await db
        .select()
        .from(surveyResponses)
        .where(eq(surveyResponses.id, id_survey_response))
        .limit(1);

      if (!existing_response) {
        throw new Error("Survey response not found");
      }

      if (!existing_response.deleted_at) {
        throw new Error("Survey response is not deleted");
      }

      // Restore survey response by setting deleted_at to null
      await db
        .update(surveyResponses)
        .set({ deleted_at: null })
        .where(eq(surveyResponses.id, id_survey_response));

      // Get the restored survey response with survey details
      const restored_response_result = await this.getSurveyResponseById(
        id_survey_response
      );

      if (!restored_response_result.data) {
        throw new Error("Failed to restore survey response");
      }

      return {
        data: restored_response_result.data,
        status: 200,
        pagination: null,
      };
    } catch (error) {
      throw new Error(`Failed to restore survey response: ${error.message}`);
    }
  }

  // ============= SURVEY SURVEYORS =============

  /**
   * Create a new survey surveyor
   * @param {Object} surveyor_data - Survey surveyor data
   * @returns {Promise<Object>} Created survey surveyor
   */
  static async createSurveySurveyor(surveyor_data) {
    try {
      // Validate survey exists
      const [existing_survey] = await db
        .select()
        .from(surveys)
        .where(
          and(
            eq(surveys.id, surveyor_data.id_survey),
            isNull(surveys.deleted_at)
          )
        )
        .limit(1);

      if (!existing_survey) {
        throw new Error("Survey not found");
      }

      const surveyor_to_insert = {
        id_survey: surveyor_data.id_survey,
        name: surveyor_data.name,
        organization: surveyor_data.organization || null,
        feedback: surveyor_data.feedback || null,
      };

      const insert_result = await db
        .insert(surveySurveyors)
        .values(surveyor_to_insert);
      const [new_surveyor] = await db
        .select({
          id: surveySurveyors.id,
          id_survey: surveySurveyors.id_survey,
          name: surveySurveyors.name,
          organization: surveySurveyors.organization,
          feedback: surveySurveyors.feedback,
          created_at: surveySurveyors.created_at,
          updated_at: surveySurveyors.updated_at,
          survey: {
            id: surveys.id,
            title: surveys.title,
            description: surveys.description,
          },
        })
        .from(surveySurveyors)
        .leftJoin(surveys, eq(surveySurveyors.id_survey, surveys.id))
        .where(eq(surveySurveyors.id, insert_result[0].insertId))
        .limit(1);

      return { data: new_surveyor, status: 201, pagination: null };
    } catch (error) {
      throw new Error(`Failed to create survey surveyor: ${error.message}`);
    }
  }

  /**
   * Get all survey surveyors with pagination and filtering
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Survey surveyors list with pagination
   */
  static async getAllSurveySurveyors(options = {}) {
    try {
      const { page = 1, limit = 10, id_survey, search } = options;
      const offset = (page - 1) * limit;
      const where_conditions = [isNull(surveySurveyors.deleted_at)];

      if (id_survey) {
        where_conditions.push(eq(surveySurveyors.id_survey, id_survey));
      }

      if (search) {
        where_conditions.push(
          or(
            like(surveySurveyors.name, `%${search}%`),
            like(surveySurveyors.organization, `%${search}%`)
          )
        );
      }

      const surveyors_list = await db
        .select({
          id: surveySurveyors.id,
          id_survey: surveySurveyors.id_survey,
          name: surveySurveyors.name,
          organization: surveySurveyors.organization,
          feedback: surveySurveyors.feedback,
          created_at: surveySurveyors.created_at,
          updated_at: surveySurveyors.updated_at,
          survey: {
            id: surveys.id,
            title: surveys.title,
            description: surveys.description,
          },
        })
        .from(surveySurveyors)
        .leftJoin(surveys, eq(surveySurveyors.id_survey, surveys.id))
        .where(and(...where_conditions))
        .orderBy(desc(surveySurveyors.created_at))
        .limit(limit)
        .offset(offset);

      const [{ count }] = await db
        .select({ count: sql`count(*)` })
        .from(surveySurveyors)
        .where(and(...where_conditions));

      const total_items = Number(count);
      const total_pages = Math.ceil(total_items / limit);

      return {
        data: surveyors_list,
        status: 200,
        pagination: {
          current_page: page,
          total_pages,
          total_items,
          items_per_page: limit,
        },
      };
    } catch (error) {
      throw new Error(`Failed to get survey surveyors: ${error.message}`);
    }
  }

  /**
   * Get survey surveyor by ID
   * @param {number} id_survey_surveyor - Survey surveyor ID
   * @returns {Promise<Object|null>} Survey surveyor data
   */
  static async getSurveySurveyorById(id_survey_surveyor) {
    try {
      const [surveyor] = await db
        .select({
          id: surveySurveyors.id,
          id_survey: surveySurveyors.id_survey,
          name: surveySurveyors.name,
          organization: surveySurveyors.organization,
          feedback: surveySurveyors.feedback,
          created_at: surveySurveyors.created_at,
          updated_at: surveySurveyors.updated_at,
          survey: {
            id: surveys.id,
            title: surveys.title,
            description: surveys.description,
          },
        })
        .from(surveySurveyors)
        .leftJoin(surveys, eq(surveySurveyors.id_survey, surveys.id))
        .where(
          and(
            eq(surveySurveyors.id, id_survey_surveyor),
            isNull(surveySurveyors.deleted_at)
          )
        )
        .limit(1);

      return { data: surveyor || null, status: 200, pagination: null };
    } catch (error) {
      throw new Error(`Failed to get survey surveyor: ${error.message}`);
    }
  }

  /**
   * Update survey surveyor by ID
   * @param {number} id_survey_surveyor - Survey surveyor ID
   * @param {Object} update_data - Updated survey surveyor data
   * @returns {Promise<Object|null>} Updated survey surveyor
   */
  static async updateSurveySurveyor(id_survey_surveyor, update_data) {
    try {
      // Check if survey surveyor exists
      const existing_surveyor_result = await this.getSurveySurveyorById(
        id_survey_surveyor
      );
      if (!existing_surveyor_result.data) {
        throw new Error("Survey surveyor not found");
      }

      // Validate survey exists if id_survey is being updated
      if (update_data.id_survey) {
        const [existing_survey] = await db
          .select()
          .from(surveys)
          .where(
            and(
              eq(surveys.id, update_data.id_survey),
              isNull(surveys.deleted_at)
            )
          )
          .limit(1);

        if (!existing_survey) {
          throw new Error("Survey not found");
        }
      }

      const surveyor_to_update = {};
      if (update_data.id_survey !== undefined)
        surveyor_to_update.id_survey = update_data.id_survey;
      if (update_data.name !== undefined)
        surveyor_to_update.name = update_data.name;
      if (update_data.organization !== undefined)
        surveyor_to_update.organization = update_data.organization;
      if (update_data.feedback !== undefined)
        surveyor_to_update.feedback = update_data.feedback;

      if (Object.keys(surveyor_to_update).length === 0) {
        return existing_surveyor_result;
      }

      await db
        .update(surveySurveyors)
        .set(surveyor_to_update)
        .where(eq(surveySurveyors.id, id_survey_surveyor));

      const updated_surveyor_result = await this.getSurveySurveyorById(
        id_survey_surveyor
      );
      return {
        data: updated_surveyor_result.data,
        status: 200,
        pagination: null,
      };
    } catch (error) {
      throw new Error(`Failed to update survey surveyor: ${error.message}`);
    }
  }

  /**
   * Soft delete survey surveyor by ID
   * @param {number} id_survey_surveyor - Survey surveyor ID
   * @returns {Promise<Object>} Deletion result
   */
  static async deleteSurveySurveyor(id_survey_surveyor) {
    try {
      const existing_surveyor_result = await this.getSurveySurveyorById(
        id_survey_surveyor
      );
      if (!existing_surveyor_result.data) {
        throw new Error("Survey surveyor not found");
      }

      await db
        .update(surveySurveyors)
        .set({ deleted_at: new Date() })
        .where(eq(surveySurveyors.id, id_survey_surveyor));

      return {
        data: { message: "Survey surveyor deleted successfully" },
        status: 200,
        pagination: null,
      };
    } catch (error) {
      throw new Error(`Failed to delete survey surveyor: ${error.message}`);
    }
  }

  /**
   * Restore soft deleted survey surveyor
   * @param {number} id_survey_surveyor - Survey surveyor ID
   * @returns {Promise<Object|null>} Restored survey surveyor
   */
  static async restoreSurveySurveyor(id_survey_surveyor) {
    try {
      // Check if survey surveyor exists and is soft deleted
      const [existing_surveyor] = await db
        .select()
        .from(surveySurveyors)
        .where(eq(surveySurveyors.id, id_survey_surveyor))
        .limit(1);

      if (!existing_surveyor) {
        throw new Error("Survey surveyor not found");
      }

      if (!existing_surveyor.deleted_at) {
        throw new Error("Survey surveyor is not deleted");
      }

      // Restore survey surveyor by setting deleted_at to null
      await db
        .update(surveySurveyors)
        .set({ deleted_at: null })
        .where(eq(surveySurveyors.id, id_survey_surveyor));

      // Get the restored survey surveyor with survey details
      const restored_surveyor_result = await this.getSurveySurveyorById(
        id_survey_surveyor
      );

      if (!restored_surveyor_result.data) {
        throw new Error("Failed to restore survey surveyor");
      }

      return {
        data: restored_surveyor_result.data,
        status: 200,
        pagination: null,
      };
    } catch (error) {
      throw new Error(`Failed to restore survey surveyor: ${error.message}`);
    }
  }

  // ============= LETTERS =============

  /**
   * Create a new letter
   * @param {Object} letter_data - Letter data object
   * @returns {Promise<Object>} Created letter with status and pagination
   */
  static async createLetter(letter_data) {
    try {
      // Validate user exists
      const [existing_user] = await db
        .select()
        .from(users)
        .where(and(eq(users.id, letter_data.id_user), isNull(users.deleted_at)))
        .limit(1);

      if (!existing_user) {
        throw new Error("User not found");
      }

      // Validate letter number uniqueness
      const [existing_letter] = await db
        .select()
        .from(letters)
        .where(
          and(
            eq(letters.letter_number, letter_data.letter_number),
            isNull(letters.deleted_at)
          )
        )
        .limit(1);

      if (existing_letter) {
        throw new Error("Letter number already exists");
      }

      const letter_to_insert = {
        id_user: letter_data.id_user,
        letter_number: letter_data.letter_number,
        letter_type: letter_data.letter_type,
        title: letter_data.title,
        description: letter_data.description || null,
        sender: letter_data.sender || null,
        recipient: letter_data.recipient || null,
        date_received: letter_data.date_received
          ? new Date(letter_data.date_received)
          : null,
        date_sent: letter_data.date_sent
          ? new Date(letter_data.date_sent)
          : null,
        file_path: letter_data.file_path || null,
      };

      const insert_result = await db.insert(letters).values(letter_to_insert);
      const [new_letter] = await db
        .select()
        .from(letters)
        .where(eq(letters.id, insert_result[0].insertId))
        .limit(1);

      return { data: new_letter, status: 201, pagination: null };
    } catch (error) {
      throw new Error(`Failed to create letter: ${error.message}`);
    }
  }

  /**
   * Create multiple letters at once
   * @param {Array} letters_data - Array of letter data objects
   * @returns {Promise<Object>} Bulk creation result with status and pagination
   */
  static async createBulkLetters(letters_data) {
    try {
      // Validate all users exist
      const user_ids = [...new Set(letters_data.map((l) => l.id_user))];
      for (const id_user of user_ids) {
        const [existing_user] = await db
          .select()
          .from(users)
          .where(and(eq(users.id, id_user), isNull(users.deleted_at)))
          .limit(1);
        if (!existing_user)
          throw new Error(`User with ID ${id_user} not found`);
      }

      // Validate letter number uniqueness
      const letter_numbers = letters_data.map((l) => l.letter_number);
      for (const letter_number of letter_numbers) {
        const [existing_letter] = await db
          .select()
          .from(letters)
          .where(
            and(
              eq(letters.letter_number, letter_number),
              isNull(letters.deleted_at)
            )
          )
          .limit(1);
        if (existing_letter)
          throw new Error(`Letter number ${letter_number} already exists`);
      }

      const letters_to_insert = letters_data.map((letter) => ({
        id_user: letter.id_user,
        letter_number: letter.letter_number,
        letter_type: letter.letter_type,
        title: letter.title,
        description: letter.description || null,
        sender: letter.sender || null,
        recipient: letter.recipient || null,
        date_received: letter.date_received
          ? new Date(letter.date_received)
          : null,
        date_sent: letter.date_sent ? new Date(letter.date_sent) : null,
        file_path: letter.file_path || null,
      }));

      const insert_result = await db.insert(letters).values(letters_to_insert);
      return {
        data: { inserted_count: insert_result[0].affectedRows },
        status: 201,
        pagination: null,
      };
    } catch (error) {
      throw new Error(`Failed to create bulk letters: ${error.message}`);
    }
  }

  /**
   * Get all letters with pagination and filtering
   * @param {Object} options - Query options (page, limit, filters)
   * @returns {Promise<Object>} Letters list with status and pagination
   */
  static async getAllLetters(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        id_user,
        letter_type,
        search,
        start_date,
        end_date,
        count = false,
        month = false,
        monthSet,
        year = false,
        yearSet,
        statistics_month = false,
      } = options;

      const where_conditions = [isNull(letters.deleted_at)];

      // Base filters
      if (id_user) where_conditions.push(eq(letters.id_user, id_user));
      if (letter_type)
        where_conditions.push(eq(letters.letter_type, letter_type));

      if (search) {
        where_conditions.push(
          or(
            like(letters.title, `%${search}%`),
            like(letters.letter_number, `%${search}%`),
            like(letters.sender, `%${search}%`),
            like(letters.recipient, `%${search}%`)
          )
        );
      }

      // Date filters
      if (start_date) {
        where_conditions.push(
          or(
            gte(letters.date_received, new Date(start_date)),
            gte(letters.date_sent, new Date(start_date))
          )
        );
      }
      if (end_date) {
        where_conditions.push(
          or(
            lte(letters.date_received, new Date(end_date)),
            lte(letters.date_sent, new Date(end_date))
          )
        );
      }

      // Month filter
      if (month && monthSet) {
        const monthNumber = parseInt(monthSet, 10);
        where_conditions.push(
          or(
            sql`EXTRACT(MONTH FROM ${letters.date_received}) = ${monthNumber}`,
            sql`EXTRACT(MONTH FROM ${letters.date_sent}) = ${monthNumber}`
          )
        );
      }

      // Year filter
      if (year && yearSet) {
        const yearNumber = parseInt(yearSet, 10);
        where_conditions.push(
          or(
            sql`EXTRACT(YEAR FROM ${letters.date_received}) = ${yearNumber}`,
            sql`EXTRACT(YEAR FROM ${letters.date_sent}) = ${yearNumber}`
          )
        );
      }

      // If statistics_month is requested
      if (statistics_month) {
        let statsQuery = db
          .select({
            month: sql`EXTRACT(MONTH FROM COALESCE(${letters.date_received}, ${letters.date_sent}))`,
            count: sql`count(*)`,
          })
          .from(letters)
          .where(and(...where_conditions))
          .groupBy(
            sql`EXTRACT(MONTH FROM COALESCE(${letters.date_received}, ${letters.date_sent}))`
          )
          .orderBy(
            sql`EXTRACT(MONTH FROM COALESCE(${letters.date_received}, ${letters.date_sent}))`
          );

        const monthlyStats = await statsQuery;

        // Initialize all months with 0
        const result = {
          "01": 0,
          "02": 0,
          "03": 0,
          "04": 0,
          "05": 0,
          "06": 0,
          "07": 0,
          "08": 0,
          "09": 0,
          10: 0,
          11: 0,
          12: 0,
        };

        // Fill in actual counts
        monthlyStats.forEach((stat) => {
          const monthKey = stat.month.toString().padStart(2, "0");
          result[monthKey] = stat.count;
        });

        return {
          data: result,
          status: 200,
          pagination: null,
        };
      }

      // If only count is requested
      if (count) {
        const [{ total }] = await db
          .select({ total: sql`count(*)` })
          .from(letters)
          .where(and(...where_conditions));

        return {
          data: { count: total },
          status: 200,
          pagination: null,
        };
      }

      // Regular query with pagination
      const offset = (page - 1) * limit;

      const letters_list = await db
        .select({
          id: letters.id,
          id_user: letters.id_user,
          letter_number: letters.letter_number,
          letter_type: letters.letter_type,
          title: letters.title,
          description: letters.description,
          sender: letters.sender,
          recipient: letters.recipient,
          date_received: letters.date_received,
          date_sent: letters.date_sent,
          file_path: letters.file_path,
          created_at: letters.created_at,
          updated_at: letters.updated_at,
          user: { id: users.id, full_name: users.full_name },
        })
        .from(letters)
        .leftJoin(users, eq(letters.id_user, users.id))
        .where(and(...where_conditions))
        .orderBy(desc(letters.created_at))
        .limit(limit)
        .offset(offset);

      const [{ total }] = await db
        .select({ total: sql`count(*)` })
        .from(letters)
        .where(and(...where_conditions));

      const total_pages = Math.ceil(total / limit);

      return {
        data: letters_list,
        status: 200,
        pagination: {
          current_page: page,
          total_pages,
          total_items: total,
          items_per_page: limit,
          has_next_page: page < total_pages,
          has_prev_page: page > 1,
        },
      };
    } catch (error) {
      throw new Error(`Failed to get letters: ${error.message}`);
    }
  }

  /**
   * Get letter by ID
   * @param {number} id_letter - Letter ID
   * @returns {Promise<Object>} Letter data with status and pagination
   */
  static async getLetterById(id_letter) {
    try {
      const [letter] = await db
        .select({
          id: letters.id,
          id_user: letters.id_user,
          letter_number: letters.letter_number,
          letter_type: letters.letter_type,
          title: letters.title,
          description: letters.description,
          sender: letters.sender,
          recipient: letters.recipient,
          date_received: letters.date_received,
          date_sent: letters.date_sent,
          file_path: letters.file_path,
          created_at: letters.created_at,
          updated_at: letters.updated_at,
          user: { id: users.id, full_name: users.full_name },
        })
        .from(letters)
        .leftJoin(users, eq(letters.id_user, users.id))
        .where(and(eq(letters.id, id_letter), isNull(letters.deleted_at)))
        .limit(1);

      return { data: letter || null, status: 200, pagination: null };
    } catch (error) {
      throw new Error(`Failed to get letter: ${error.message}`);
    }
  }

  /**
   * Update letter by ID
   * @param {number} id_letter - Letter ID
   * @param {Object} update_data - Updated letter data
   * @returns {Promise<Object>} Updated letter with status and pagination
   */
  static async updateLetter(id_letter, update_data) {
    try {
      // Check if letter exists
      const existing_letter_result = await this.getLetterById(id_letter);
      if (!existing_letter_result.data) {
        throw new Error("Letter not found");
      }

      // Validate user exists if updating id_user
      if (update_data.id_user) {
        const [existing_user] = await db
          .select()
          .from(users)
          .where(
            and(eq(users.id, update_data.id_user), isNull(users.deleted_at))
          )
          .limit(1);

        if (!existing_user) {
          throw new Error("User not found");
        }
      }

      // Validate letter number uniqueness if updating letter_number
      if (update_data.letter_number) {
        const [existing_letter] = await db
          .select()
          .from(letters)
          .where(
            and(
              eq(letters.letter_number, update_data.letter_number),
              isNull(letters.deleted_at)
            )
          )
          .limit(1);

        if (existing_letter && existing_letter.id !== id_letter) {
          throw new Error("Letter number already exists");
        }
      }

      const letter_to_update = {};
      if (update_data.id_user !== undefined)
        letter_to_update.id_user = update_data.id_user;
      if (update_data.letter_number !== undefined)
        letter_to_update.letter_number = update_data.letter_number;
      if (update_data.letter_type !== undefined)
        letter_to_update.letter_type = update_data.letter_type;
      if (update_data.title !== undefined)
        letter_to_update.title = update_data.title;
      if (update_data.description !== undefined)
        letter_to_update.description = update_data.description || null;
      if (update_data.sender !== undefined)
        letter_to_update.sender = update_data.sender || null;
      if (update_data.recipient !== undefined)
        letter_to_update.recipient = update_data.recipient || null;
      if (update_data.date_received !== undefined)
        letter_to_update.date_received = update_data.date_received
          ? new Date(update_data.date_received)
          : null;
      if (update_data.date_sent !== undefined)
        letter_to_update.date_sent = update_data.date_sent
          ? new Date(update_data.date_sent)
          : null;
      if (update_data.file_path !== undefined)
        letter_to_update.file_path = update_data.file_path || null;

      await db
        .update(letters)
        .set(letter_to_update)
        .where(eq(letters.id, id_letter));

      const updated_letter_result = await this.getLetterById(id_letter);
      return {
        data: updated_letter_result.data,
        status: 200,
        pagination: null,
      };
    } catch (error) {
      throw new Error(`Failed to update letter: ${error.message}`);
    }
  }

  /**
   * Soft delete letter by ID
   * @param {number} id_letter - Letter ID
   * @returns {Promise<Object>} Deletion result with status and pagination
   */
  static async deleteLetter(id_letter) {
    try {
      const existing_letter_result = await this.getLetterById(id_letter);
      if (!existing_letter_result.data) {
        throw new Error("Letter not found");
      }

      await db
        .update(letters)
        .set({ deleted_at: new Date() })
        .where(eq(letters.id, id_letter));

      return {
        data: { message: "Letter deleted successfully" },
        status: 200,
        pagination: null,
      };
    } catch (error) {
      throw new Error(`Failed to delete letter: ${error.message}`);
    }
  }

  /**
   * Restore soft deleted letter by ID
   * @param {number} id_letter - Letter ID
   * @returns {Promise<Object>} Restored letter with status and pagination
   */
  static async restoreLetter(id_letter) {
    try {
      // Check if letter exists and is deleted
      const [existing_letter] = await db
        .select()
        .from(letters)
        .where(eq(letters.id, id_letter))
        .limit(1);

      if (!existing_letter) {
        throw new Error("Letter not found");
      }

      if (!existing_letter.deleted_at) {
        throw new Error("Letter is not deleted");
      }

      await db
        .update(letters)
        .set({ deleted_at: null })
        .where(eq(letters.id, id_letter));

      const restored_letter_result = await this.getLetterById(id_letter);
      if (!restored_letter_result.data) {
        throw new Error("Failed to restore letter");
      }

      return {
        data: restored_letter_result.data,
        status: 200,
        pagination: null,
      };
    } catch (error) {
      throw new Error(`Failed to restore letter: ${error.message}`);
    }
  }

  // ============= HEALTH CHECK =============

  /**
   * Health check for academic service
   * @returns {Promise<Object>} Health status with basic statistics
   */
  static async healthCheck() {
    try {
      // Simple health check by counting academic entities
      const academic_years_result = await this.getAllAcademicYears({
        limit: 1,
      });
      const surveys_result = await this.getAllSurveys({ limit: 1 });
      const questions_result = await this.getAllSurveyQuestions({ limit: 1 });
      const surveyors_result = await this.getAllSurveySurveyors({ limit: 1 });
      const agendas_result = await this.getAllPrincipalAgendas({ limit: 1 });
      const responses_result = await this.getAllSurveyResponses({ limit: 1 });
      const letters_result = await this.getAllLetters({ limit: 1 });

      if (
        academic_years_result.status >= 200 &&
        academic_years_result.status < 300 &&
        surveys_result.status >= 200 &&
        surveys_result.status < 300 &&
        questions_result.status >= 200 &&
        questions_result.status < 300 &&
        surveyors_result.status >= 200 &&
        surveyors_result.status < 300 &&
        agendas_result.status >= 200 &&
        agendas_result.status < 300 &&
        responses_result.status >= 200 &&
        responses_result.status < 300 &&
        letters_result.status >= 200 &&
        letters_result.status < 300
      ) {
        return {
          data: {
            status: "healthy",
            timestamp: new Date().toISOString(),
            statistics: {
              total_academic_years:
                academic_years_result.pagination?.total_items || 0,
              total_surveys: surveys_result.pagination?.total_items || 0,
              total_survey_questions:
                questions_result.pagination?.total_items || 0,
              total_survey_surveyors:
                surveyors_result.pagination?.total_items || 0,
              total_agendas: agendas_result.pagination?.total_items || 0,
              total_responses: responses_result.pagination?.total_items || 0,
              total_letters: letters_result.pagination?.total_items || 0,
            },
          },
          status: 200,
          pagination: null,
        };
      } else {
        throw new Error("Service health check failed");
      }
    } catch (error) {
      throw new Error(`Academic service health check failed: ${error.message}`);
    }
  }
}
