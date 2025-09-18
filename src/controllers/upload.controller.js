import uploadService from '@services/upload.service';

/**
 * Upload Controller
 * Handles HTTP requests for file upload operations
 */
class UploadController {
  
  /**
   * Handle file upload request
   * @param {Object} c - Hono context object
   * @returns {Promise<Response>} JSON response with upload results
   */
  async uploadFiles(c) {
    try {
      // Parse form data
      const formData = await c.req.formData();
      
      // Extract folder_name (optional)
      const folderName = formData.get('folder_name');
      
      // Validate folder_name if provided
      if (folderName && typeof folderName !== 'string') {
        return c.json({
          success: false,
          message: 'folder_name must be a string',
          uploaded_files: []
        }, 400);
      }

      if (folderName && folderName.length > 20) {
        return c.json({
          success: false,
          message: 'folder_name must not exceed 20 characters',
          uploaded_files: []
        }, 400);
      }

      // Extract files from form data
      const files = [];
      for (const [key, value] of formData.entries()) {
        if (key === 'folder_name') continue; // Skip folder_name field
        
        // Check if value is a File object
        if (value instanceof File) {
          files.push(value);
        }
      }

      // Validate that at least one file is provided
      if (files.length === 0) {
        return c.json({
          success: false,
          message: 'No files provided for upload',
          uploaded_files: []
        }, 400);
      }

      // Validate file sizes and types (optional - you can add more validation here)
      const maxFileSize = 10 * 1024 * 1024; // 10MB limit
      for (const file of files) {
        if (file.size > maxFileSize) {
          return c.json({
            success: false,
            message: `File ${file.name} exceeds maximum size limit of 10MB`,
            uploaded_files: []
          }, 400);
        }

        if (file.size === 0) {
          return c.json({
            success: false,
            message: `File ${file.name} is empty`,
            uploaded_files: []
          }, 400);
        }
      }

      // Upload files using the service
      const uploadedFiles = await uploadService.saveFiles(files, folderName || null);

      // Return success response
      return c.json({
        success: true,
        message: `Successfully uploaded ${uploadedFiles.length} file(s)`,
        uploaded_files: uploadedFiles
      }, 200);

    } catch (error) {
      console.error('Upload error:', error);
      
      // Return error response
      return c.json({
        success: false,
        message: error.message || 'Failed to upload files',
        uploaded_files: []
      }, 500);
    }
  }

  /**
   * Get upload status or file information (optional endpoint)
   * @param {Object} c - Hono context object
   * @returns {Promise<Response>} JSON response with upload info
   */
  async getUploadInfo(c) {
    try {
      return c.json({
        success: true,
        message: 'Upload endpoint is ready',
        info: {
          max_file_size: '10MB',
          supported_folder_name_length: '20 characters max',
          folder_name_pattern: 'alphanumeric, underscore, hyphen, forward slash',
          file_naming_format: '{folder_name}-{sub_folder}-{UUID}-{first25chars}.{ext}',
          default_upload_path: '/public',
          custom_upload_path: '/public/{folder_name}'
        }
      });
    } catch (error) {
      return c.json({
        success: false,
        message: 'Failed to get upload info'
      }, 500);
    }
  }
}

export default new UploadController();