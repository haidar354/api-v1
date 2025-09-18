import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

/**
 * Login validation schema
 */
export const loginSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .max(255, 'Email must not exceed 255 characters')
    .toLowerCase()
    .transform((val) => val.trim()),
  
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(128, 'Password must not exceed 128 characters'),
});

/**
 * Password change validation schema
 */
export const changePasswordSchema = z.object({
  currentPassword: z.string()
    .min(1, 'Current password is required'),
  
  new_password: z.string()
    .min(8, 'New password must be at least 8 characters')
    .max(128, 'New password must not exceed 128 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'New password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  confirm_new_password: z.string(),
}).refine((data) => data.new_password === data.confirm_new_password, {
  message: 'New passwords do not match',
  path: ['confirm_new_password'],
}).refine((data) => data.currentPassword !== data.new_password, {
  message: 'New password must be different from current password',
  path: ['new_password'],
});

/**
 * Password reset request validation schema
 */
export const forgotPasswordSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .max(255, 'Email must not exceed 255 characters')
    .toLowerCase()
    .transform((val) => val.trim()),
});

/**
 * Password reset validation schema
 */
export const resetPasswordSchema = z.object({
  token: z.string()
    .min(1, 'Reset token is required')
    .max(255, 'Invalid reset token'),
  
  new_password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must not exceed 128 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  confirm_new_password: z.string(),
}).refine((data) => data.new_password === data.confirm_new_password, {
  message: 'Passwords do not match',
  path: ['confirm_new_password'],
});

/**
 * Token refresh validation schema
 */
export const refreshTokenSchema = z.object({
  refreshToken: z.string()
    .min(1, 'Refresh token is required')
    .max(500, 'Invalid refresh token'),
});

/**
 * Profile update validation schema
 */
export const updateProfileSchema = z.object({
  full_name: z.string()
    .min(2, 'Full name must be at least 2 characters')
    .max(255, 'Full name must not exceed 255 characters')
    .regex(/^[a-zA-Z\s.'-]+$/, 'Full name can only contain letters, spaces, dots, apostrophes, and hyphens')
    .transform((val) => val.trim())
    .optional(),
  
  email: z.string()
    .email('Invalid email format')
    .max(255, 'Email must not exceed 255 characters')
    .toLowerCase()
    .transform((val) => val.trim())
    .optional(),
  
  data: z.record(z.any()).optional()
    .refine((val) => {
      if (val && typeof val === 'object') {
        return Object.keys(val).length <= 50; // Reasonable limit for JSON data
      }
      return true;
    }, 'User data object is too large'),
});

/**
 * Email verification validation schema
 */
export const verifyEmailSchema = z.object({
  token: z.string()
    .min(1, 'Verification token is required')
    .max(255, 'Invalid verification token'),
});

/**
 * Logout validation schema
 */
export const logoutSchema = z.object({
  refreshToken: z.string().optional(),
});

/**
 * Hono validators for easy use in routes
 */
export const validateLogin = zValidator('json', loginSchema);
export const validateChangePassword = zValidator('json', changePasswordSchema);
export const validateForgotPassword = zValidator('json', forgotPasswordSchema);
export const validateResetPassword = zValidator('json', resetPasswordSchema);
export const validateRefreshToken = zValidator('json', refreshTokenSchema);
export const validateUpdateProfile = zValidator('json', updateProfileSchema);
export const validateVerifyEmail = zValidator('json', verifyEmailSchema);
export const validateLogout = zValidator('json', logoutSchema);
