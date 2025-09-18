import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

/**
 * File upload validation schema
 * Validates folder_name parameter for file uploads
 */
export const uploadFileSchema = z.object({
  folder_name: z.string()
    .max(20, 'Folder name must not exceed 20 characters')
    .regex(/^[a-zA-Z0-9_\-\/]+$/, 'Folder name can only contain alphanumeric characters, underscores, hyphens, and forward slashes')
    .transform((val) => val.trim())
    .optional(),
});

/**
 * File validation constraints
 */
export const fileConstraints = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 10, // Maximum number of files per upload
  allowedExtensions: [
    // Images
    'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico',
    // Documents
    'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf',
    // Archives
    'zip', 'rar', '7z', 'tar', 'gz',
    // Audio/Video
    'mp3', 'mp4', 'avi', 'mov', 'wav', 'flac',
    // Other
    'csv', 'json', 'xml'
  ]
};

/**
 * Custom file validation function
 * Validates file properties that can't be handled by Zod
 */
export const validateFiles = (files) => {
  const errors = [];

  // Check if files array exists and has content
  if (!files || files.length === 0) {
    errors.push('No files provided for upload');
    return { isValid: false, errors };
  }

  // Check maximum number of files
  if (files.length > fileConstraints.maxFiles) {
    errors.push(`Maximum ${fileConstraints.maxFiles} files allowed per upload`);
  }

  // Validate each file
  files.forEach((file, index) => {
    // Check if it's actually a File object
    if (!(file instanceof File)) {
      errors.push(`Item at position ${index + 1} is not a valid file`);
      return;
    }

    // Check file size
    if (file.size > fileConstraints.maxFileSize) {
      errors.push(`File "${file.name}" exceeds maximum size limit of ${fileConstraints.maxFileSize / (1024 * 1024)}MB`);
    }

    // Check for empty files
    if (file.size === 0) {
      errors.push(`File "${file.name}" is empty`);
    }

    // Check file extension
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension) {
      errors.push(`File "${file.name}" has no extension`);
    } else if (!fileConstraints.allowedExtensions.includes(fileExtension)) {
      errors.push(`File "${file.name}" has unsupported extension. Allowed: ${fileConstraints.allowedExtensions.join(', ')}`);
    }

    // Check filename length
    if (file.name.length > 255) {
      errors.push(`File "${file.name}" name is too long (max 255 characters)`);
    }

    // Check for potentially dangerous filenames
    const dangerousPatterns = [
      /\.\./,  // Directory traversal
      /[<>:"|?*]/,  // Invalid filename characters
      /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i  // Reserved Windows names
    ];

    if (dangerousPatterns.some(pattern => pattern.test(file.name))) {
      errors.push(`File "${file.name}" has invalid or potentially dangerous filename`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Upload info request validation schema (for GET /upload/info)
 */
export const uploadInfoSchema = z.object({
  // No body parameters needed for info endpoint
}).optional();

/**
 * Bulk file operation validation schema
 */
export const bulkFileOperationSchema = z.object({
  file_paths: z.array(z.string().min(1, 'File path cannot be empty'))
    .min(1, 'At least one file path is required')
    .max(50, 'Maximum 50 files can be processed at once'),
  
  operation: z.enum(['delete', 'move', 'copy'], {
    errorMap: () => ({ message: 'Operation must be one of: delete, move, copy' })
  }),
  
  destination: z.string()
    .max(255, 'Destination path too long')
    .optional()
    .refine((val, ctx) => {
      const operation = ctx.parent.operation;
      if ((operation === 'move' || operation === 'copy') && !val) {
        return false;
      }
      return true;
    }, 'Destination is required for move and copy operations')
});

/**
 * File search/filter validation schema
 */
export const fileSearchSchema = z.object({
  folder: z.string()
    .max(255, 'Folder path too long')
    .optional(),
  
  extension: z.string()
    .max(10, 'Extension too long')
    .regex(/^[a-zA-Z0-9]+$/, 'Extension can only contain alphanumeric characters')
    .optional(),
  
  name_pattern: z.string()
    .max(100, 'Search pattern too long')
    .optional(),
  
  min_size: z.string()
    .optional()
    .transform((val) => val ? parseInt(val, 10) : undefined)
    .refine((val) => val === undefined || (val >= 0 && val <= fileConstraints.maxFileSize), 
      `Size must be between 0 and ${fileConstraints.maxFileSize} bytes`),
  
  max_size: z.string()
    .optional()
    .transform((val) => val ? parseInt(val, 10) : undefined)
    .refine((val) => val === undefined || (val >= 0 && val <= fileConstraints.maxFileSize), 
      `Size must be between 0 and ${fileConstraints.maxFileSize} bytes`),
  
  created_after: z.string()
    .optional()
    .refine((date) => !date || /^\d{4}-\d{2}-\d{2}$/.test(date), 'Date must be in YYYY-MM-DD format'),
  
  created_before: z.string()
    .optional()
    .refine((date) => !date || /^\d{4}-\d{2}-\d{2}$/.test(date), 'Date must be in YYYY-MM-DD format'),
  
  page: z.string()
    .optional()
    .transform((val) => val ? parseInt(val, 10) : 1)
    .refine((val) => val > 0, 'Page must be positive'),
  
  limit: z.string()
    .optional()
    .transform((val) => val ? parseInt(val, 10) : 20)
    .refine((val) => val > 0 && val <= 100, 'Limit must be between 1 and 100')
});

/**
 * Hono validators for easy use in routes
 */
export const validateUploadFile = zValidator('form', uploadFileSchema);
export const validateUploadInfo = zValidator('query', uploadInfoSchema);
export const validateBulkFileOperation = zValidator('json', bulkFileOperationSchema);
export const validateFileSearch = zValidator('query', fileSearchSchema);

/**
 * Custom middleware for file validation
 * This handles the actual file validation since Zod can't validate File objects directly
 */
export const validateFileUpload = async (c, next) => {
  try {
    // Parse form data
    const formData = await c.req.formData();
    
    // Extract files
    const files = [];
    for (const [key, value] of formData.entries()) {
      if (key !== 'folder_name' && value instanceof File) {
        files.push(value);
      }
    }
    
    // Validate files
    const validation = validateFiles(files);
    
    if (!validation.isValid) {
      return c.json({
        message: 'File validation failed',
        errors: validation.errors
      }, 400);
    }
    
    // Store validated files in context for controller use
    c.set('validatedFiles', files);
    
    await next();
    
  } catch (error) {
    console.error('File validation middleware error:', error);
    return c.json({
      message: 'File validation failed',
      error: error.message
    }, 500);
  }
};