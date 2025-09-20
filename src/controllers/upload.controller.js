import uploadService from '../services/upload.service.js';
import { fileConstraints } from "../validation/upload.validation.js";

/**
 * Upload Controller
 * Handles HTTP requests for file upload operations
 */
export class UploadController {

  /**
   * Handle file upload request
   * @param {Object} c - Hono context object
   * @returns {Promise<Response>} JSON response with upload results
   */
  static async uploadFiles(c) {
    try {
      // Get validated data from middleware
      const { folder_name } = c.req.valid('form');
      const files = c.get('validatedFiles'); // Files validated by custom middleware

      // Upload files using the service
      const uploadedFiles = await uploadService.saveFiles(files, folder_name || null);

      // Return success response
      return c.json({
        message: `Successfully uploaded ${uploadedFiles.length} file(s)`,
        uploaded_files: uploadedFiles
      }, 200);

    } catch (error) {
      console.error('Upload error:', error);

      // Return error response
      return c.json({
        message: error.message || 'Failed to upload files',
      }, 500);
    }
  }

  /**
   * Get upload status or file information (optional endpoint)
   * @param {Object} c - Hono context object
   * @returns {Promise<Response>} JSON response with upload info
   */
  static async getUploadInfo(c) {
    try {
      return c.json({
        message: 'Upload endpoint is ready',
        info: {
          max_file_size: `${fileConstraints.maxFileSize / (1024 * 1024)}MB`,
          max_files_per_upload: fileConstraints.maxFiles,
          supported_folder_name_length: '20 characters max',
          folder_name_pattern: 'alphanumeric, underscore, hyphen, forward slash',
          file_naming_format: '{folder_name}-{sub_folder}-{UUID}-{first25chars}.{ext}',
          default_upload_path: '/public',
          custom_upload_path: '/public/{folder_name}',
          allowed_extensions: fileConstraints.allowedExtensions,
          validation_rules: {
            folder_name: 'Optional, max 20 chars, alphanumeric + _-/',
            files: 'Required, max 10 files, max 10MB each',
            filename: 'Max 255 chars, no dangerous patterns',
            extensions: 'Must be in allowed list'
          }
        }
      });
    } catch (error) {
      return c.json({
        message: 'Failed to get upload info'
      }, 500);
    }
  }
}