import { eq, and, isNull, like, or, desc, asc, sql, gte, lte } from 'drizzle-orm';
import { db } from '@config/database.js';
import { academicYears, principalAgendas, surveys, surveyResponses } from '@models/academic.model.js';

/**
 * Academic Service
 * Handles all CRUD operations for academic-related entities with Drizzle ORM
 */
export class AcademicService {
  // ============= ACADEMIC YEARS =============

  static async createAcademicYear(academic_year_data) {
    try {
      const [existing_year] = await db
        .select()
        .from(academicYears)
        .where(and(eq(academicYears.year, academic_year_data.academic_year), isNull(academicYears.deleted_at)))
        .limit(1);

      if (existing_year) {
        throw new Error('Academic year already exists');
      }

      if (academic_year_data.is_active) {
        await db.update(academicYears).set({ is_active: false }).where(and(eq(academicYears.is_active, true), isNull(academicYears.deleted_at)));
      }

      const year_to_insert = {
        year: academic_year_data.academic_year,
        is_active: academic_year_data.is_active || false
      };

      const insert_result = await db.insert(academicYears).values(year_to_insert);
      const [new_year] = await db.select().from(academicYears).where(eq(academicYears.id, insert_result[0].insertId)).limit(1);

      return { data: new_year, status: 201, pagination: null };
    } catch (error) {
      throw new Error(`Failed to create academic year: ${error.message}`);
    }
  }

  static async getAllAcademicYears(options = {}) {
    try {
      const { page = 1, limit = 10, active, year } = options;
      const offset = (page - 1) * limit;
      const where_conditions = [isNull(academicYears.deleted_at)];

      if (active !== undefined) where_conditions.push(eq(academicYears.is_active, active));
      if (year) where_conditions.push(eq(academicYears.year, year));

      const years_list = await db.select().from(academicYears).where(and(...where_conditions)).orderBy(desc(academicYears.created_at)).limit(limit).offset(offset);
      const [{ count }] = await db.select({ count: sql`count(*)` }).from(academicYears).where(and(...where_conditions));
      const total_pages = Math.ceil(count / limit);

      return {
        data: years_list, status: 200,
        pagination: { current_page: page, total_pages, total_items: count, items_per_page: limit, has_next_page: page < total_pages, has_prev_page: page > 1 }
      };
    } catch (error) {
      throw new Error(`Failed to get academic years: ${error.message}`);
    }
  }

  static async getAcademicYearById(year_id) {
    try {
      const [year] = await db.select().from(academicYears).where(and(eq(academicYears.id, year_id), isNull(academicYears.deleted_at))).limit(1);
      return { data: year || null, status: 200, pagination: null };
    } catch (error) {
      throw new Error(`Failed to get academic year: ${error.message}`);
    }
  }

  static async updateAcademicYear(year_id, update_data) {
    try {
      const existing_year_result = await this.getAcademicYearById(year_id);
      if (!existing_year_result.data) throw new Error('Academic year not found');

      if (update_data.is_active) {
        await db.update(academicYears).set({ is_active: false }).where(and(eq(academicYears.is_active, true), isNull(academicYears.deleted_at)));
      }

      const update_payload = {};
      if (update_data.academic_year) update_payload.year = update_data.academic_year;
      if (update_data.is_active !== undefined) update_payload.is_active = update_data.is_active;

      await db.update(academicYears).set(update_payload).where(eq(academicYears.id, year_id));
      const [updated_year] = await db.select().from(academicYears).where(eq(academicYears.id, year_id)).limit(1);

      return { data: updated_year, status: 200, pagination: null };
    } catch (error) {
      throw new Error(`Failed to update academic year: ${error.message}`);
    }
  }

  static async deleteAcademicYear(year_id) {
    try {
      const existing_year_result = await this.getAcademicYearById(year_id);
      if (!existing_year_result.data) throw new Error('Academic year not found');

      const update_result = await db.update(academicYears).set({ deleted_at: new Date() }).where(eq(academicYears.id, year_id));
      return { data: update_result.affectedRows > 0, status: 200, pagination: null };
    } catch (error) {
      throw new Error(`Failed to delete academic year: ${error.message}`);
    }
  }

  // ============= PRINCIPAL AGENDAS =============

  static async createPrincipalAgenda(agenda_data) {
    try {
      const agenda_to_insert = {
        event_name: agenda_data.event_name,
        description: agenda_data.description || null,
        event_date: new Date(agenda_data.event_date)
      };

      const insert_result = await db.insert(principalAgendas).values(agenda_to_insert);
      const [new_agenda] = await db.select().from(principalAgendas).where(eq(principalAgendas.id, insert_result[0].insertId)).limit(1);

      return { data: new_agenda, status: 201, pagination: null };
    } catch (error) {
      throw new Error(`Failed to create principal agenda: ${error.message}`);
    }
  }

  static async getAllPrincipalAgendas(options = {}) {
    try {
      const { page = 1, limit = 10, start_date, end_date, search } = options;
      const offset = (page - 1) * limit;
      const where_conditions = [isNull(principalAgendas.deleted_at)];

      if (start_date) where_conditions.push(gte(principalAgendas.event_date, new Date(start_date)));
      if (end_date) where_conditions.push(lte(principalAgendas.event_date, new Date(end_date + 'T23:59:59')));
      if (search) where_conditions.push(or(like(principalAgendas.event_name, `%${search}%`), like(principalAgendas.description, `%${search}%`)));

      const agendas_list = await db.select().from(principalAgendas).where(and(...where_conditions)).orderBy(asc(principalAgendas.event_date)).limit(limit).offset(offset);
      const [{ count }] = await db.select({ count: sql`count(*)` }).from(principalAgendas).where(and(...where_conditions));
      const total_pages = Math.ceil(count / limit);

      return {
        data: agendas_list, status: 200,
        pagination: { current_page: page, total_pages, total_items: count, items_per_page: limit, has_next_page: page < total_pages, has_prev_page: page > 1 }
      };
    } catch (error) {
      throw new Error(`Failed to get principal agendas: ${error.message}`);
    }
  }

  static async getPrincipalAgendaById(agenda_id) {
    try {
      const [agenda] = await db.select().from(principalAgendas).where(and(eq(principalAgendas.id, agenda_id), isNull(principalAgendas.deleted_at))).limit(1);
      return { data: agenda || null, status: 200, pagination: null };
    } catch (error) {
      throw new Error(`Failed to get principal agenda: ${error.message}`);
    }
  }

  static async updatePrincipalAgenda(agenda_id, update_data) {
    try {
      const existing_agenda_result = await this.getPrincipalAgendaById(agenda_id);
      if (!existing_agenda_result.data) throw new Error('Principal agenda not found');

      const update_payload = {};
      if (update_data.event_name) update_payload.event_name = update_data.event_name;
      if (update_data.description !== undefined) update_payload.description = update_data.description;
      if (update_data.event_date) update_payload.event_date = new Date(update_data.event_date);

      await db.update(principalAgendas).set(update_payload).where(eq(principalAgendas.id, agenda_id));
      const [updated_agenda] = await db.select().from(principalAgendas).where(eq(principalAgendas.id, agenda_id)).limit(1);

      return { data: updated_agenda, status: 200, pagination: null };
    } catch (error) {
      throw new Error(`Failed to update principal agenda: ${error.message}`);
    }
  }

  static async deletePrincipalAgenda(agenda_id) {
    try {
      const existing_agenda_result = await this.getPrincipalAgendaById(agenda_id);
      if (!existing_agenda_result.data) throw new Error('Principal agenda not found');

      const update_result = await db.update(principalAgendas).set({ deleted_at: new Date() }).where(eq(principalAgendas.id, agenda_id));
      return { data: update_result.affectedRows > 0, status: 200, pagination: null };
    } catch (error) {
      throw new Error(`Failed to delete principal agenda: ${error.message}`);
    }
  }

  // ============= SURVEYS =============

  static async createSurvey(survey_data) {
    try {
      const academic_year_result = await this.getAcademicYearById(survey_data.academic_year_id);
      if (!academic_year_result.data) throw new Error('Academic year not found');

      const survey_to_insert = {
        title: survey_data.title,
        description: survey_data.description || null,
        id_academic_year: survey_data.academic_year_id
      };

      const insert_result = await db.insert(surveys).values(survey_to_insert);
      const [new_survey] = await db.select().from(surveys).where(eq(surveys.id, insert_result[0].insertId)).limit(1);

      return { data: new_survey, status: 201, pagination: null };
    } catch (error) {
      throw new Error(`Failed to create survey: ${error.message}`);
    }
  }

  static async getAllSurveys(options = {}) {
    try {
      const { page = 1, limit = 10, academic_year_id, search } = options;
      const offset = (page - 1) * limit;
      const where_conditions = [isNull(surveys.deleted_at)];

      if (academic_year_id) where_conditions.push(eq(surveys.id_academic_year, academic_year_id));
      if (search) where_conditions.push(or(like(surveys.title, `%${search}%`), like(surveys.description, `%${search}%`)));

      const surveys_list = await db.select({
        id: surveys.id, title: surveys.title, description: surveys.description, id_academic_year: surveys.id_academic_year,
        created_at: surveys.created_at, updated_at: surveys.updated_at,
        academic_year: { id: academicYears.id, year: academicYears.year, is_active: academicYears.is_active }
      }).from(surveys).leftJoin(academicYears, eq(surveys.id_academic_year, academicYears.id))
        .where(and(...where_conditions)).orderBy(desc(surveys.created_at)).limit(limit).offset(offset);

      const [{ count }] = await db.select({ count: sql`count(*)` }).from(surveys).where(and(...where_conditions));
      const total_pages = Math.ceil(count / limit);

      return {
        data: surveys_list, status: 200,
        pagination: { current_page: page, total_pages, total_items: count, items_per_page: limit, has_next_page: page < total_pages, has_prev_page: page > 1 }
      };
    } catch (error) {
      throw new Error(`Failed to get surveys: ${error.message}`);
    }
  }

  static async getSurveyById(survey_id) {
    try {
      const [survey] = await db.select({
        id: surveys.id, title: surveys.title, description: surveys.description, id_academic_year: surveys.id_academic_year,
        created_at: surveys.created_at, updated_at: surveys.updated_at,
        academic_year: { id: academicYears.id, year: academicYears.year, is_active: academicYears.is_active }
      }).from(surveys).leftJoin(academicYears, eq(surveys.id_academic_year, academicYears.id))
        .where(and(eq(surveys.id, survey_id), isNull(surveys.deleted_at))).limit(1);

      return { data: survey || null, status: 200, pagination: null };
    } catch (error) {
      throw new Error(`Failed to get survey: ${error.message}`);
    }
  }

  static async updateSurvey(survey_id, update_data) {
    try {
      const existing_survey_result = await this.getSurveyById(survey_id);
      if (!existing_survey_result.data) throw new Error('Survey not found');

      if (update_data.academic_year_id) {
        const academic_year_result = await this.getAcademicYearById(update_data.academic_year_id);
        if (!academic_year_result.data) throw new Error('Academic year not found');
      }

      const update_payload = {};
      if (update_data.title) update_payload.title = update_data.title;
      if (update_data.description !== undefined) update_payload.description = update_data.description;
      if (update_data.academic_year_id) update_payload.id_academic_year = update_data.academic_year_id;

      await db.update(surveys).set(update_payload).where(eq(surveys.id, survey_id));
      const updated_survey_result = await this.getSurveyById(survey_id);
      return { data: updated_survey_result.data, status: 200, pagination: null };
    } catch (error) {
      throw new Error(`Failed to update survey: ${error.message}`);
    }
  }

  static async deleteSurvey(survey_id) {
    try {
      const existing_survey_result = await this.getSurveyById(survey_id);
      if (!existing_survey_result.data) throw new Error('Survey not found');

      const update_result = await db.update(surveys).set({ deleted_at: new Date() }).where(eq(surveys.id, survey_id));
      return { data: update_result.affectedRows > 0, status: 200, pagination: null };
    } catch (error) {
      throw new Error(`Failed to delete survey: ${error.message}`);
    }
  }

  // ============= SURVEY RESPONSES =============

  static async createSurveyResponse(response_data) {
    try {
      const survey_result = await this.getSurveyById(response_data.survey_id);
      if (!survey_result.data) throw new Error('Survey not found');

      const response_to_insert = {
        id_survey: response_data.survey_id,
        question: response_data.question,
        score: response_data.score,
        surveyor_name: response_data.surveyor_name,
        surveyor_details: response_data.surveyor_details || null
      };

      const insert_result = await db.insert(surveyResponses).values(response_to_insert);
      const [new_response] = await db.select().from(surveyResponses).where(eq(surveyResponses.id, insert_result[0].insertId)).limit(1);

      return { data: new_response, status: 201, pagination: null };
    } catch (error) {
      throw new Error(`Failed to create survey response: ${error.message}`);
    }
  }

  static async createBulkSurveyResponses(responses_data) {
    try {
      const survey_id = responses_data[0].survey_id;
      const survey_result = await this.getSurveyById(survey_id);
      if (!survey_result.data) throw new Error('Survey not found');

      const responses_to_insert = responses_data.map(response => ({
        id_survey: response.survey_id,
        question: response.question,
        score: response.score,
        surveyor_name: response.surveyor_name,
        surveyor_details: response.surveyor_details || null
      }));

      const insert_result = await db.insert(surveyResponses).values(responses_to_insert);
      return { data: { inserted_count: insert_result[0].affectedRows, survey_id }, status: 201, pagination: null };
    } catch (error) {
      throw new Error(`Failed to create bulk survey responses: ${error.message}`);
    }
  }

  static async getAllSurveyResponses(options = {}) {
    try {
      const { page = 1, limit = 10, survey_id, min_score, max_score, surveyor_name } = options;
      const offset = (page - 1) * limit;
      const where_conditions = [isNull(surveyResponses.deleted_at)];

      if (survey_id) where_conditions.push(eq(surveyResponses.id_survey, survey_id));
      if (min_score !== undefined) where_conditions.push(gte(surveyResponses.score, min_score));
      if (max_score !== undefined) where_conditions.push(lte(surveyResponses.score, max_score));
      if (surveyor_name) where_conditions.push(like(surveyResponses.surveyor_name, `%${surveyor_name}%`));

      const responses_list = await db.select({
        id: surveyResponses.id, id_survey: surveyResponses.id_survey, question: surveyResponses.question,
        score: surveyResponses.score, surveyor_name: surveyResponses.surveyor_name, surveyor_details: surveyResponses.surveyor_details,
        created_at: surveyResponses.created_at, updated_at: surveyResponses.updated_at,
        survey: { id: surveys.id, title: surveys.title }
      }).from(surveyResponses).leftJoin(surveys, eq(surveyResponses.id_survey, surveys.id))
        .where(and(...where_conditions)).orderBy(desc(surveyResponses.created_at)).limit(limit).offset(offset);

      const [{ count }] = await db.select({ count: sql`count(*)` }).from(surveyResponses).where(and(...where_conditions));
      const total_pages = Math.ceil(count / limit);

      return {
        data: responses_list, status: 200,
        pagination: { current_page: page, total_pages, total_items: count, items_per_page: limit, has_next_page: page < total_pages, has_prev_page: page > 1 }
      };
    } catch (error) {
      throw new Error(`Failed to get survey responses: ${error.message}`);
    }
  }

  static async getSurveyResponseById(response_id) {
    try {
      const [response] = await db.select({
        id: surveyResponses.id, id_survey: surveyResponses.id_survey, question: surveyResponses.question,
        score: surveyResponses.score, surveyor_name: surveyResponses.surveyor_name, surveyor_details: surveyResponses.surveyor_details,
        created_at: surveyResponses.created_at, updated_at: surveyResponses.updated_at,
        survey: { id: surveys.id, title: surveys.title }
      }).from(surveyResponses).leftJoin(surveys, eq(surveyResponses.id_survey, surveys.id))
        .where(and(eq(surveyResponses.id, response_id), isNull(surveyResponses.deleted_at))).limit(1);

      return { data: response || null, status: 200, pagination: null };
    } catch (error) {
      throw new Error(`Failed to get survey response: ${error.message}`);
    }
  }

  static async updateSurveyResponse(response_id, update_data) {
    try {
      const existing_response_result = await this.getSurveyResponseById(response_id);
      if (!existing_response_result.data) throw new Error('Survey response not found');

      if (update_data.survey_id) {
        const survey_result = await this.getSurveyById(update_data.survey_id);
        if (!survey_result.data) throw new Error('Survey not found');
      }

      const update_payload = {};
      if (update_data.survey_id) update_payload.id_survey = update_data.survey_id;
      if (update_data.question) update_payload.question = update_data.question;
      if (update_data.score !== undefined) update_payload.score = update_data.score;
      if (update_data.surveyor_name) update_payload.surveyor_name = update_data.surveyor_name;
      if (update_data.surveyor_details !== undefined) update_payload.surveyor_details = update_data.surveyor_details;

      await db.update(surveyResponses).set(update_payload).where(eq(surveyResponses.id, response_id));
      const updated_response_result = await this.getSurveyResponseById(response_id);
      return { data: updated_response_result.data, status: 200, pagination: null };
    } catch (error) {
      throw new Error(`Failed to update survey response: ${error.message}`);
    }
  }

  static async deleteSurveyResponse(response_id) {
    try {
      const existing_response_result = await this.getSurveyResponseById(response_id);
      if (!existing_response_result.data) throw new Error('Survey response not found');

      const update_result = await db.update(surveyResponses).set({ deleted_at: new Date() }).where(eq(surveyResponses.id, response_id));
      return { data: update_result.affectedRows > 0, status: 200, pagination: null };
    } catch (error) {
      throw new Error(`Failed to delete survey response: ${error.message}`);
    }
  }
}