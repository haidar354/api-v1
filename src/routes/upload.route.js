import { Hono } from 'hono';
import { UploadController } from '../controllers/upload.controller.js';
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  validateUploadFile,
  validateUploadInfo,
  validateFileUpload,
} from "../validation/upload.validation.js";

/**
 * Upload Routes
 * Defines all routes related to file upload operations
 */
const uploadRoute = new Hono();

/**
 * POST /upload
 * Upload one or multiple files
 * Uses custom file validation middleware + form validation
 */
uploadRoute.post('/', 
  authMiddleware, 
  validateUploadFile,  // Validates form data (folder_name)
  validateFileUpload,  // Custom middleware for file validation
  UploadController.uploadFiles
);

/**
 * GET /upload/info
 * Get upload endpoint information and configuration
 */
uploadRoute.get('/info', 
  authMiddleware, 
  validateUploadInfo, 
  UploadController.getUploadInfo
);

export { uploadRoute };