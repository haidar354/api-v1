import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { secureHeaders } from 'hono/secure-headers';

import { usersRoute } from '@routes/users.route.js';
import { uploadRoute } from '@routes/upload.routes.js';
import { healthCheck } from '@config/database.js';

/**
 * Main Hono Application
 * School Management System Backend API
 */
const app = new Hono();

/**
 * Global Middleware
 */
// Security headers
app.use('*', secureHeaders());

// CORS configuration
app.use('*', cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Request logging
app.use('*', logger());

// Pretty JSON responses
app.use('*', prettyJSON());

const serveStaticFile = async (c, folder) => {
  try {
    // Construct file path by removing the folder prefix
    const path = c.req.path.replace(new RegExp(`^${folder}`), '');
    const filePath = `.${folder}/${path}`;

    const file = Bun.file(filePath);

    if (!(await file.exists())) {
      return c.json({
        success: false,
        message: 'File not found',
        error: 'The requested file does not exist'
      }, 404);
    }

    return new Response(file, {
      status: 200,
      headers: {
        'Content-Type': getContentType(filePath),
        'Cache-Control': 'public, max-age=31536000'
      }
    });
  } catch (error) {
    console.error('Static file error:', error);
    return c.json({
      success: false,
      message: 'Error serving file',
      error: 'Failed to serve static file'
    }, 500);
  }
};

/**
 * Helper to set Content-Type based on extension
 */
const getContentType = (filePath) => {
  const ext = filePath.split('.').pop().toLowerCase();
  const mimeTypes = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'css': 'text/css',
    'js': 'application/javascript',
    'html': 'text/html',
    'json': 'application/json',
    'txt': 'text/plain',
    'woff': 'font/woff',
    'woff2': 'font/woff2',
    'ttf': 'font/ttf'
  };
  return mimeTypes[ext] || 'application/octet-stream';
};

// Use for /public/*
app.get('/public/*', (c) => serveStaticFile(c, '/public'));

/**
 * Root endpoint
 */
app.get('/', (c) => {
  return c.json({
    success: true,
    message: 'Website Sekolahku API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Health check endpoints
 */
app.get('/health', (c) => {
  return c.json({
    success: true,
    message: 'API is healthy',
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: Bun.env.NODE_ENV || 'development'
  });
});

app.get('/health/db', async (c) => {
  try {
    const dbHealth = await healthCheck();
    return c.json({
      success: true,
      message: 'Database health check',
      data: dbHealth,
      error: null
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Database health check failed',
      data: null,
      error: error.message
    }, 503);
  }
});

/**
 * API Routes
 */
app.route('/api/users', usersRoute);
app.route('/api/upload', uploadRoute);

/**
 * 404 Handler
 */
app.notFound((c) => {
  return c.json({
    success: false,
    message: 'Endpoint not found',
    data: null,
    error: 'The requested resource does not exist'
  }, 404);
});

/**
 * Global Error Handler
 */
app.onError((error, c) => {
  console.error('Global error:', error);

  return c.json({
    success: false,
    message: 'Internal server error',
    data: null,
    error: Bun.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  }, 500);
});

/**
 * Bun Server Configuration
 */
const server = Bun.serve({
  port: Bun.env.PORT || 3001,
  hostname: Bun.env.HOST || 'localhost',
  fetch: app.fetch,

  // Server configuration
  development: Bun.env.NODE_ENV !== 'production',

  // Error handling
  error(error) {
    console.error('Server error:', error);
    return new Response('Internal Server Error', { status: 500 });
  },
});

/**
 * Graceful shutdown handling
 */
process.on('SIGTERM', async () => {
  console.log('🔄 Received SIGTERM, shutting down gracefully...');

  try {
    // Close database connections
    const { closeDatabase } = await import('@config/database.js');
    await closeDatabase();

    // Stop the server
    server.stop();

    console.log('✅ Server shut down successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGINT', async () => {
  console.log('🔄 Received SIGINT, shutting down gracefully...');

  try {
    // Close database connections
    const { closeDatabase } = await import('@config/database.js');
    await closeDatabase();

    // Stop the server
    server.stop();

    console.log('✅ Server shut down successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

/**
 * Server startup message
 */
console.log(`🚀 Website Sekolahku API`);
console.log(`📍 Server running at: http://${server.hostname}:${server.port}`);
console.log(`🌍 Environment: ${Bun.env.NODE_ENV || 'development'}`);
console.log(`📊 Database: ${Bun.env.DB_NAME || 'website_sekolahku'}`);
console.log(`⚡ Powered by Bun ${Bun.version}`);

export default app;
