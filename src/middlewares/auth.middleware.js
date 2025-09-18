import { AuthService } from '@services/auth.service.js';

/**
 * JWT Authentication Middleware
 * Protects routes by verifying JWT tokens
 */

/**
 * Middleware to authenticate JWT tokens
 * @param {Object} c - Hono context object
 * @param {Function} next - Next middleware function
 * @returns {Promise<Response>} Authentication result
 */
export const authMiddleware = async (c, next) => {
  try {
    const authHeader = c.req.header('Authorization');
    
    // Check if Authorization header exists
    if (!authHeader) {
      return c.json({
        message: 'Authorization header required',
      }, 401);
    }

    // Check if header starts with 'Bearer '
    if (!authHeader.startsWith('Bearer ')) {
      return c.json({
        message: 'Invalid authorization format. Use Bearer token',
      }, 401);
    }

    // Extract token
    const token = authHeader.substring(7);
    
    if (!token) {
      return c.json({
        message: 'Token not provided',
      }, 401);
    }

    // Verify token
    const decoded = AuthService.verifyToken(token);
    
    // Set user data in context for use in controllers
    c.set('user', decoded);
    c.set('token', token);

    // Continue to next middleware/controller
    await next();
    
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    return c.json({
      message: 'Invalid or expired token',
    }, 401);
  }
};

/**
 * Middleware to check if user has admin role (0)
 * Must be used after authMiddleware
 * @param {Object} c - Hono context object
 * @param {Function} next - Next middleware function
 * @returns {Promise<Response>} Authorization result
 */
export const adminMiddleware = async (c, next) => {
  try {
    const user = c.get('user');
    
    if (!user) {
      return c.json({
        message: 'Authentication required',
      }, 401);
    }

    // Check if user has admin role (0)
    if (user.role !== 0) {
      return c.json({
        message: 'Admin access required',
      }, 403);
    }

    await next();
    
  } catch (error) {
    console.error('Admin middleware error:', error);
    
    return c.json({
      message: 'Authorization failed',
    }, 500);
  }
};

/**
 * Optional authentication middleware
 * Sets user data if token is valid, but doesn't block if invalid/missing
 * @param {Object} c - Hono context object
 * @param {Function} next - Next middleware function
 * @returns {Promise<void>} Always continues to next middleware
 */
export const optionalAuthMiddleware = async (c, next) => {
  try {
    const authHeader = c.req.header('Authorization');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      if (token) {
        try {
          const decoded = AuthService.verifyToken(token);
          c.set('user', decoded);
          c.set('token', token);
        } catch (error) {
          // Ignore token errors in optional auth
          console.log('Optional auth - invalid token:', error.message);
        }
      }
    }

    await next();
    
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    // Continue anyway for optional auth
    await next();
  }
};
