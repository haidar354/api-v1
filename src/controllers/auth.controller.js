import { AuthService } from '@services/auth.service.js';
import { jsonResponse, errorResponse } from '@utils/response.utils';

/**
 * Authentication Controller
 * Handles authentication-related HTTP requests
 */
export class AuthController {

    /**
     * Login user
     * @param {Object} c - Hono context object
     * @returns {Promise<Response>} Login response
     */
    static async login(c) {
        try {
            // Get validated data from middleware
            const { email, password } = c.req.valid('json');

            // Attempt login
            const result = await AuthService.login(email, password);
            const data = result.data;
            return jsonResponse(
                data
                , result.status);

        } catch (error) {
            console.error('Login error:', error);

            // Return generic error message for security
            const isAuthError = error.message.includes('User not found') ||
                error.message.includes('Invalid credentials');

            if (isAuthError) {
                return errorResponse('Invalid email or password', 401);
            }

            return errorResponse('Login failed', 500);
        }
    }

    /**
     * Forgot password - send reset token
     * @param {Object} c - Hono context object
     * @returns {Promise<Response>} Forgot password response
     */
    static async forgotPassword(c) {
        try {
            // Get validated data from middleware
            const { email } = c.req.valid('json');

            // Process forgot password request
            const result = await AuthService.forgotPassword(email);
            const data = result.data
            return jsonResponse(data, result.status);

        } catch (error) {
            console.error('Forgot password error:', error);

            // Always return success message for security
            return jsonResponse({
                message: 'If the email exists, a password reset link has been sent.'
            }, 200);
        }
    }

    /**
     * Reset password using reset token
     * @param {Object} c - Hono context object
     * @returns {Promise<Response>} Reset password response
     */
    static async resetPassword(c) {
        try {
            // Get validated data from middleware
            const { token, new_password, confirm_new_password } = c.req.valid('json');

            // Reset password
            const result = await AuthService.resetPassword(token, new_password);

            return jsonResponse({
                message: result.data.message,
            }, result.status);

        } catch (error) {
            console.error('Reset password error:', error);

            const isTokenError = error.message.includes('Invalid') ||
                error.message.includes('expired');

            if (isTokenError) {
                return errorResponse('Invalid or expired reset token', 400);
            }

            return errorResponse('Password reset failed', 500);
        }
    }

    /**
     * Change password for authenticated user
     * @param {Object} c - Hono context object
     * @returns {Promise<Response>} Change password response
     */
    static async changePassword(c) {
        try {
            // Get validated data from middleware
            const { currentPassword, new_password, confirm_new_password } = c.req.valid('json');

            // Get user from token (assuming middleware sets c.user)
            const user = c.get('user');
            if (!user) {
                return errorResponse('Authentication required', 401);
            }

            // Change password
            const result = await AuthService.changePassword(user.id, currentPassword, new_password);

            return jsonResponse({
                message: result.data.message,
            }, result.status);

        } catch (error) {
            console.error('Change password error:', error);

            const isAuthError = error.message.includes('incorrect') ||
                error.message.includes('Unauthorized') ||
                error.message.includes('not found');

            if (isAuthError) {
                return errorResponse(error.message, 401);
            }

            return errorResponse('Password change failed', 500);
        }
    }

    /**
     * Verify token endpoint
     * @param {Object} c - Hono context object
     * @returns {Promise<Response>} Token verification response
     */
    static async verifyToken(c) {
        try {
            const authHeader = c.req.header('Authorization');

            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return errorResponse('Authorization token required', 401);
            }

            const token = authHeader.substring(7);
            const decoded = AuthService.verifyToken(token);

            return jsonResponse({
                message: 'Token is valid',
            }, 200);

        } catch (error) {
            console.error('Token verification error:', error);
            return errorResponse('Invalid or expired token', 401);
        }
    }

    /**
     * Get current user profile
     * @param {Object} c - Hono context object
     * @returns {Promise<Response>} User profile response
     */
    static async getProfile(c) {
        try {
            // Get user from token (assuming middleware sets c.user)
            const user = c.get('user');
            if (!user) {
                return errorResponse('Authentication required', 401);
            }

            return jsonResponse({
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                role: user.role
            }, 200);

        } catch (error) {
            console.error('Get profile error:', error);
            return errorResponse('Failed to get profile', 500);
        }
    }

    /**
     * Logout user (client-side token invalidation)
     * @param {Object} c - Hono context object
     * @returns {Promise<Response>} Logout response
     */
    static async logout(c) {
        try {
            // In JWT-based auth, logout is typically handled client-side
            // by removing the token from storage
            // Here we just return a success message

            return jsonResponse({
                message: 'Logged out successfully',
            }, 200);

        } catch (error) {
            console.error('Logout error:', error);
            return errorResponse('Logout failed', 500);
        }
    }
}
