import nodemailer from 'nodemailer';

/**
 * Email Utility
 * Handles email sending operations using nodemailer
 */

/**
 * Create email transporter with SMTP configuration
 * @returns {Object} Nodemailer transporter
 */
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true' || false, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    });
};

/**
 * Send email using nodemailer
 * @param {Object} email_options - Email configuration
 * @param {string} email_options.to - Recipient email address
 * @param {string} email_options.subject - Email subject
 * @param {string} email_options.text - Plain text content (optional)
 * @param {string} email_options.html - HTML content (optional)
 * @param {string} email_options.from - Sender email (optional, uses default)
 * @returns {Promise<Object>} Send result
 */
export const sendEmail = async (email_options) => {
    try {
        // Validate required fields
        if (!email_options.to) {
            throw new Error('Recipient email is required');
        }

        if (!email_options.subject) {
            throw new Error('Email subject is required');
        }

        if (!email_options.text && !email_options.html) {
            throw new Error('Email content (text or html) is required');
        }

        // Check if SMTP credentials are configured
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            throw new Error('SMTP credentials not configured');
        }

        // Create transporter
        const transporter = createTransporter();

        // Prepare email options
        const mail_options = {
            from: email_options.from || `"${process.env.APP_NAME || 'Website Sekolahku'}" <${process.env.SMTP_USER}>`,
            to: email_options.to,
            subject: email_options.subject,
            text: email_options.text,
            html: email_options.html
        };

        // Send email
        const info = await transporter.sendMail(mail_options);

        return {
            success: true,
            message: 'Email sent successfully',
            messageId: info.messageId,
            response: info.response
        };

    } catch (error) {
        console.error('Email sending failed:', error.message);
        
        return {
            success: false,
            message: `Email sending failed: ${error.message}`,
            error: error.message
        };
    }
};

/**
 * Generate password reset email HTML template
 * @param {Object} template_data - Template data
 * @param {string} template_data.user_name - User full name
 * @param {string} template_data.reset_link - Password reset link
 * @param {string} template_data.app_name - Application name
 * @returns {string} HTML email template
 */
export const generatePasswordResetEmailTemplate = (template_data) => {
    const { user_name, reset_link, app_name = 'Website Sekolahku' } = template_data;

    return `
    <!DOCTYPE html>
    <html lang="id">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Password - ${app_name}</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f4f4f4;
            }
            .container {
                background-color: #ffffff;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 2px solid #007bff;
            }
            .header h1 {
                color: #007bff;
                margin: 0;
                font-size: 28px;
            }
            .content {
                margin-bottom: 30px;
            }
            .button {
                display: inline-block;
                padding: 12px 30px;
                background-color: #007bff;
                color: #ffffff;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
                text-align: center;
                margin: 20px 0;
            }
            .button:hover {
                background-color: #0056b3;
            }
            .footer {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                font-size: 12px;
                color: #666;
                text-align: center;
            }
            .warning {
                background-color: #fff3cd;
                border: 1px solid #ffeaa7;
                color: #856404;
                padding: 15px;
                border-radius: 5px;
                margin: 20px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>${app_name}</h1>
                <p>Reset Password</p>
            </div>
            
            <div class="content">
                <h2>Halo, ${user_name}!</h2>
                
                <p>Kami menerima permintaan untuk mereset password akun Anda. Jika Anda yang melakukan permintaan ini, silakan klik tombol di bawah untuk mereset password Anda:</p>
                
                <div style="text-align: center;">
                    <a href="${reset_link}" class="button">Reset Password</a>
                </div>
                
                <p>Atau salin dan tempel link berikut ke browser Anda:</p>
                <p style="word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 5px; font-family: monospace;">
                    ${reset_link}
                </p>
                
                <div class="warning">
                    <strong>Penting:</strong>
                    <ul>
                        <li>Link reset password ini akan kedaluwarsa dalam 1 jam</li>
                        <li>Jika Anda tidak meminta reset password, abaikan email ini</li>
                        <li>Untuk keamanan, jangan bagikan link ini kepada siapa pun</li>
                    </ul>
                </div>
            </div>
            
            <div class="footer">
                <p>Email ini dikirim secara otomatis dari sistem ${app_name}.</p>
                <p>Jika Anda memiliki pertanyaan, silakan hubungi administrator sistem.</p>
                <p>&copy; ${new Date().getFullYear()} ${app_name}. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

/**
 * Send password reset email
 * @param {Object} email_data - Email data
 * @param {string} email_data.to - Recipient email
 * @param {string} email_data.user_name - User full name
 * @param {string} email_data.reset_token - Password reset token
 * @returns {Promise<Object>} Send result
 */
export const sendPasswordResetEmail = async (email_data) => {
    try {
        const { to, user_name, reset_token } = email_data;

        // Use dev email as fallback if recipient email is not provided
        const recipient_email = to || process.env.DEV_EMAIL || 'dev.resolusi@gmail.com';
        const display_name = user_name || 'User';

        console.log('Email data received:', { to, user_name, reset_token });
        console.log('Using recipient email:', recipient_email);

        // Generate reset link
        const frontend_url = process.env.FRONTEND_URL || 'http://localhost:3000';
        const reset_link = `${frontend_url}/reset-password?token=${reset_token}`;

        // Generate HTML template
        const html_content = generatePasswordResetEmailTemplate({
            user_name: display_name,
            reset_link,
            app_name: process.env.APP_NAME || 'Website Sekolahku'
        });

        // Prepare email options
        const email_options = {
            to: recipient_email,
            subject: `Reset Password - ${process.env.APP_NAME || 'Website Sekolahku'}`,
            html: html_content,
            text: `Halo ${display_name}, Anda telah meminta reset password. Silakan kunjungi link berikut untuk mereset password Anda: ${reset_link}. Link ini akan kedaluwarsa dalam 1 jam.`
        };

        // Send email
        const result = await sendEmail(email_options);

        return result;

    } catch (error) {
        console.error('Password reset email sending failed:', error.message);
        
        return {
            success: false,
            message: `Password reset email sending failed: ${error.message}`,
            error: error.message
        };
    }
};