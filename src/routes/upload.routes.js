import { Hono } from 'hono';
import uploadController from '@controller/upload.controller';

/**
 * Upload Routes
 * Defines all routes related to file upload operations
 */
const uploadRoute = new Hono();

/**
 * POST /upload
 * Upload one or multiple files
 * 
 * Body (multipart/form-data):
 * - file(s): File objects to upload
 * - folder_name (optional): Target folder name (max 20 characters)
 * 
 * Response:
 * {
 *   "success": boolean,
 *   "message": string,
 *   "uploaded_files": string[] // Array of relative file paths
 * }
 */
uploadRoute.post('/', uploadController.uploadFiles.bind(uploadController));

/**
 * GET /upload/info
 * Get upload endpoint information and configuration
 * 
 * Response:
 * {
 *   "success": boolean,
 *   "message": string,
 *   "info": {
 *     "max_file_size": string,
 *     "supported_folder_name_length": string,
 *     "folder_name_pattern": string,
 *     "file_naming_format": string,
 *     "default_upload_path": string,
 *     "custom_upload_path": string
 *   }
 * }
 */
uploadRoute.get('/info', uploadController.getUploadInfo.bind(uploadController));

export { uploadRoute };