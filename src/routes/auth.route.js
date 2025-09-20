import { Hono } from 'hono';
import { AuthController } from "../controllers/auth.controller.js";
import {
  validateLogin,
  validateChangePassword,
  validateForgotPassword,
  validateResetPassword,
  validateUpdateProfile,
} from "../validation/index.validation.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const authRoute = new Hono();

// Public routes
authRoute.post('/login', validateLogin, AuthController.login);
authRoute.post('/forgot-password', validateForgotPassword, AuthController.forgotPassword);
authRoute.post('/reset-password', validateResetPassword, AuthController.resetPassword);

// Protected routes
authRoute.post('/change-password', authMiddleware, validateChangePassword, AuthController.changePassword);
authRoute.post('/verify-token', authMiddleware, AuthController.verifyToken);
authRoute.get('/profile', authMiddleware, AuthController.getProfile);
authRoute.put('/profile', authMiddleware, validateUpdateProfile, AuthController.profileUpdate);
authRoute.post('/logout', authMiddleware, AuthController.logout);

export { authRoute };
