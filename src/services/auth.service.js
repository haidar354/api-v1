import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { eq, and, isNull, sql } from 'drizzle-orm';
import { db } from '@config/database.js';
import { users, roles } from '@models/index.models.js';
import { UsersService } from '@services/users.service.js';

/**
 * Authentication Service
 * Handles login, logout, and password reset operations
 */
export class AuthService {

    /**
     * Login user (only users with can_login = true)
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<Object>} Login result with token
     */
    static async login(email, password) {
        try {
            // Get user by email from JSON data field with role info
            const [user] = await db
                .select({
                    id: users.id,
                    full_name: users.full_name,
                    id_role: users.id_role,
                    data: users.data,
                    created_at: users.created_at,
                    updated_at: users.updated_at,
                    role_can_login: roles.can_login
                })
                .from(users)
                .leftJoin(roles, eq(users.id_role, roles.id))
                .where(and(
                    sql`JSON_EXTRACT(data, '$.email') = ${email}`,
                    isNull(users.deleted_at)
                ))
                .limit(1);

            // Check if user exists
            if (!user) {
                throw new Error('User not found');
            }

            // Check if role can login
            if (!user.role_can_login) {
                return {
                    data: null,
                    status: 403,
                    message: 'Access forbidden: User role cannot login'
                };
            }

            // Check if password exists in user.data
            if (!user.data || !user.data.password) {
                throw new Error('User not found'); // Same message for security
            }

            // Verify password using bcrypt
            const password_result = await UsersService.verifyPassword(password, user.data.password);

            if (!password_result.data) {
                throw new Error('Invalid credentials');
            }

            // Generate JWT token
            const token = this.generateToken({
                id: user.id,
                email: user.data.email,
                role: user.id_role,
                full_name: user.full_name
            });

            // Prepare user data without password
            const { password: _, ...user_data } = user.data;
            const user_response = {
                id: user.id,
                full_name: user.full_name,
                email: user.data.email,
                id_role: user.id_role,
                data: user_data,
                created_at: user.created_at,
                updated_at: user.updated_at
            };

            return {
                data: {
                    user: user_response,
                    token,
                    expires_in: '24h'
                },
                status: 200,
                pagination: null
            };

        } catch (error) {
            throw new Error(`Login failed: ${error.message}`);
        }
    }

    /**
     * Generate JWT token
     * @param {Object} payload - Token payload
     * @returns {string} JWT token
     */
    static generateToken(payload) {
        const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
        const options = {
            expiresIn: '24h',
            issuer: 'website-sekolahku',
            audience: 'website-sekolahku-users'
        };

        return jwt.sign(payload, secret, options);
    }

    /**
     * Verify JWT token
     * @param {string} token - JWT token
     * @returns {Object} Decoded token payload
     */
    static verifyToken(token) {
        try {
            const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
            return jwt.verify(token, secret);
        } catch (error) {
            throw new Error('Invalid or expired token');
        }
    }

    /**
     * Generate password reset token
     * @param {string} email - User email
     * @returns {Promise<Object>} Reset token result
     */
    static async forgotPassword(email) {
        try {
            // Get user by email
            const userResult = await UsersService.getUserByEmail(email);
            const user = userResult.data;

            // Check if user exists
            if (!user) {
                // Return success even if user doesn't exist for security
                return {
                    data: {
                        message: 'If the email exists, a password reset link has been sent.'
                    },
                    status: 200,
                    pagination: null
                };
            }

            // Check if user role is Admin (0) or KepalaSekolah (1)
            if (user.id_role !== 0 && user.id_role !== 1) {
                // Return success even if user can't reset password for security
                return {
                    data: {
                        message: 'If the email exists, a password reset link has been sent.'
                    },
                    status: 200,
                    pagination: null
                };
            }

            // Generate reset token (valid for 1 hour)
            const resetToken = this.generateResetToken({
                id: user.id,
                email: user.email,
                purpose: 'password_reset'
            });

            // In a real application, you would:
            // 1. Save the reset token to database with expiration
            // 2. Send email with reset link
            // For now, we'll just return the token (remove this in production)

            console.log(`Password reset token for ${email}: ${resetToken}`);
            console.log(`Reset link: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`);

            return {
                data: resetToken,
                status: 200,
                pagination: null
            };

        } catch (error) {
            // Always return success message for security
            return {
                data: {
                    message: 'If the email exists, a password reset link has been sent.'
                },
                status: 200,
                pagination: null
            };
        }
    }

    /**
     * Generate password reset token
     * @param {Object} payload - Token payload
     * @returns {string} Reset token
     */
    static generateResetToken(payload) {
        const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
        const options = {
            expiresIn: '1h', // Reset tokens expire in 1 hour
            issuer: 'website-sekolahku',
            audience: 'website-sekolahku-reset'
        };

        return jwt.sign(payload, secret, options);
    }

    /**
     * Reset password using reset token
     * @param {string} token - Reset token
     * @param {string} new_password - New password
     * @returns {Promise<Object>} Reset result
     */
    static async resetPassword(token, new_password) {
        try {
            // Verify reset token
            const decoded = this.verifyResetToken(token);

            if (decoded.purpose !== 'password_reset') {
                throw new Error('Invalid reset token');
            }

            // Get user to ensure they still exist
            const userResult = await UsersService.getUserByEmail(decoded.email);
            const user = userResult.data;

            if (!user || user.id !== decoded.id) {
                throw new Error('Invalid reset token');
            }

            // Check if user role is still Admin (0) or KepalaSekolah (1)
            if (user.id_role !== 0 && user.id_role !== 1) {
                throw new Error('Invalid reset token');
            }

            // Hash new password
            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash(new_password, saltRounds);

            // Update user password in data field
            const updatedData = {
                ...user.data,
                password: hashedPassword
            };

            // Update user with new password
            await UsersService.updateUser(user.id, {
                data: updatedData
            });

            return {
                data: {
                    message: 'Password has been reset successfully'
                },
                status: 200,
                pagination: null
            };

        } catch (error) {
            throw new Error(`Password reset failed: ${error.message}`);
        }
    }

    /**
     * Verify password reset token
     * @param {string} token - Reset token
     * @returns {Object} Decoded token payload
     */
    static verifyResetToken(token) {
        try {
            const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
            return jwt.verify(token, secret, {
                audience: 'website-sekolahku-reset'
            });
        } catch (error) {
            throw new Error('Invalid or expired reset token');
        }
    }

    /**
     * Change password for authenticated user
     * @param {number} id_user - User ID
     * @param {string} current_password - Current password
     * @param {string} new_password - New password
     * @returns {Promise<Object>} Change password result
     */
    static async changePassword(id_user, current_password, new_password) {
        try {
            // Get user by ID with role info
            const [user] = await db
                .select({
                    id: users.id,
                    full_name: users.full_name,
                    id_role: users.id_role,
                    data: users.data,
                    role_can_login: roles.can_login
                })
                .from(users)
                .leftJoin(roles, eq(users.id_role, roles.id))
                .where(and(
                    eq(users.id, id_user),
                    isNull(users.deleted_at)
                ))
                .limit(1);

            if (!user) {
                throw new Error('User not found');
            }

            // Check if role can login
            if (!user.role_can_login) {
                throw new Error('Unauthorized');
            }

            // Check if current password exists and is correct
            if (!user.data || !user.data.password) {
                throw new Error('Current password not set');
            }

            const password_result = await UsersService.verifyPassword(current_password, user.data.password);

            if (!password_result.data) {
                throw new Error('Current password is incorrect');
            }

            // Check if new password is different from current
            const is_same_password = await bcrypt.compare(new_password, user.data.password);
            if (is_same_password) {
                throw new Error('New password must be different from current password');
            }

            // Hash new password
            const salt_rounds = 12;
            const hashed_password = await bcrypt.hash(new_password, salt_rounds);

            // Update user password in data field
            const updated_data = {
                ...user.data,
                password: hashed_password
            };

            // Update user with new password
            await UsersService.updateUser(id_user, {
                data: updated_data
            });

            return {
                data: {
                    message: 'Password changed successfully'
                },
                status: 200,
                pagination: null
            };

        } catch (error) {
            throw new Error(`Password change failed: ${error.message}`);
        }
    }

    /**
     * Update user profile for authenticated user
     * @param {number} id_user - User ID
     * @param {Object} update_data - Profile data to update
     * @returns {Promise<Object>} Update result
     */
    static async profileUpdate(id_user, update_data) {
        try {
            // Get current user to verify they exist and get current data
            const user_result = await UsersService.getUserById(id_user, false);

            const current_user = user_result.data;

            if (!current_user) {
                throw new Error('User not found');
            }

            // Check if user role can login (only users with login access can update profile)
            const [role_info] = await db
                .select({
                    can_login: roles.can_login
                })
                .from(roles)
                .where(eq(roles.id, current_user.id_role))
                .limit(1);

            if (!role_info || !role_info.can_login) {
                throw new Error('Unauthorized: User role cannot update profile');
            }

            // Prepare update payload
            const update_payload = {};

            // Handle full_name update
            if (update_data.full_name !== undefined) {
                update_payload.full_name = update_data.full_name.trim();
            }

            // Handle data object updates
            if (update_data.data) {
                const current_data = current_user.data || {};
                const updated_data = { ...current_data };

                // Handle email update with uniqueness check
                if (update_data.data.email !== undefined) {
                    const new_email = update_data.data.email.toLowerCase().trim();

                    // Check if email is different from current
                    if (new_email !== current_data.email) {
                        // Check if email already exists (excluding current user)
                        const existing_user = await db
                            .select()
                            .from(users)
                            .where(and(
                                sql`JSON_EXTRACT(data, '$.email') = ${new_email}`,
                                isNull(users.deleted_at),
                                sql`id != ${id_user}`
                            ))
                            .limit(1);

                        if (existing_user.length > 0) {
                            throw new Error('Email already exists');
                        }
                    }

                    updated_data.email = new_email;
                }

                // Handle password update with hashing
                if (update_data.data.password !== undefined) {
                    const salt_rounds = 12;
                    const hash_password = await bcrypt.hash(update_data.data.password, salt_rounds);
                    updated_data.password = hash_password;
                }

                // Merge other data fields
                Object.keys(update_data.data).forEach(key => {
                    if (key !== 'email' && key !== 'password') {
                        updated_data[key] = update_data.data[key];
                    }
                });

                update_payload.data = updated_data;
            }

            // Update user using UsersService
            const update_result = await UsersService.updateUser(id_user, update_payload);

            // Return updated user without password
            const updated_user = update_result.data;
            if (updated_user.data && updated_user.data.password) {
                const { password, ...data_without_password } = updated_user.data;
                updated_user.data = data_without_password;
            }

            return {
                data: updated_user,
                status: 200,
                pagination: null
            };

        } catch (error) {
            throw new Error(`Profile update failed: ${error.message}`);
        }
    }
}
