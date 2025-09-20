import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import dotenv from "dotenv";
dotenv.config(); 
/**
 * Database configuration for MySQL connection using Drizzle ORM
 * Uses environment variables for connection parameters
 */

// Validate required environment variables
const requiredEnvVars = ["DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME"];
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvVars.join(", ")}`
  );
}

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT) || 3306,
  // Connection pool settings
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
  connectTimeout: parseInt(process.env.DB_CONNECT_TIMEOUT) || 10000, // ms, default 10s
  waitForConnections: true, // recommended to queue if pool is full
  queueLimit: 0, // 0 = unlimited
  // Additional MySQL settings
  charset: "utf8mb4",
  timezone: "+00:00",
  // Enable multiple statements if needed
  multipleStatements: false,
  // SSL configuration (optional)
  ssl:
    process.env.DB_SSL === "true"
      ? {
          rejectUnauthorized:
            process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false",
        }
      : false,
};

let pool;
let db;

try {
  // Create MySQL connection pool
  pool = mysql.createPool(dbConfig);

  // Initialize Drizzle ORM with the pool
  db = drizzle(pool);

  // Test the connection
  await testConnection();

  console.log("Database connection established successfully");
} catch (error) {
  console.error("Failed to establish database connection:", error.message);
  throw error;
}

/**
 * Test database connection
 */
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    return true;
  } catch (error) {
    throw new Error(`Database connection test failed: ${error.message}`);
  }
}

/**
 * Get database connection pool
 */
export function getPool() {
  if (!pool) {
    throw new Error("Database pool not initialized");
  }
  return pool;
}

/**
 * Get Drizzle database instance
 */
export function getDB() {
  if (!db) {
    throw new Error("Database instance not initialized");
  }
  return db;
}

/**
 * Close database connections gracefully
 */
export async function closeDatabase() {
  try {
    if (pool) {
      await pool.end();
      console.log("Database connections closed successfully");
    }
  } catch (error) {
    console.error("Error closing database connections:", error.message);
    throw error;
  }
}

/**
 * Health check for database connection
 */
export async function healthCheck() {
  try {
    await testConnection();
    return {
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: process.env.DB_NAME,
    };
  } catch (error) {
    return {
      status: "unhealthy",
      error: error.message,
      timestamp: new Date().toISOString(),
      database: process.env.DB_NAME,
    };
  }
}

// Export the main database instance
export { db };

// Default export for convenience
export default db;
