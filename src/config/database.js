import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import dotenv from "dotenv";
dotenv.config();

/**
 * Database configuration for MySQL connection using Drizzle ORM
 * Supports both individual env vars and DATABASE_URL for Railway compatibility
 */

// Parse DATABASE_URL if available (Railway format)
if (process.env.DATABASE_URL) {
  try {
    const url = new URL(process.env.DATABASE_URL);
    process.env.DB_HOST = url.hostname;
    process.env.DB_USER = url.username;
    process.env.DB_PASSWORD = url.password;
    process.env.DB_NAME = url.pathname.slice(1); // Remove leading slash
    process.env.DB_PORT = url.port || "3306";
    console.log("Using DATABASE_URL for connection");
  } catch (error) {
    console.warn("Failed to parse DATABASE_URL:", error.message);
  }
}

// Railway specific config based on actual variables
const isRailway =
  process.env.RAILWAY_ENVIRONMENT_NAME || process.env.NODE_ENV === "production";

const dbConfig = {
  host:
    process.env.DB_HOST ||
    process.env.MYSQLHOST ||
    process.env.MYSQL_HOST ||
    "mysql.railway.internal",
  user:
    process.env.DB_USER ||
    process.env.MYSQLUSER ||
    process.env.MYSQL_USER ||
    "root",
  password:
    process.env.DB_PASSWORD ||
    process.env.MYSQLPASSWORD ||
    process.env.MYSQL_ROOT_PASSWORD ||
    "AxVIxEoUIDWqOiujqVBMFYFkNxvsAtzk",
  database:
    process.env.DB_NAME ||
    process.env.MYSQLDATABASE ||
    process.env.MYSQL_DATABASE ||
    "railway",
  port:
    parseInt(
      process.env.DB_PORT || process.env.MYSQLPORT || process.env.MYSQL_PORT
    ) || 3306,
  // Connection pool settings
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
  connectTimeout: parseInt(process.env.DB_CONNECT_TIMEOUT) || 30000, // 30s for Railway
  acquireTimeout: 30000,
  timeout: 30000,
  waitForConnections: true,
  queueLimit: 0,
  // Additional MySQL settings
  charset: "utf8mb4",
  timezone: "+00:00",
  multipleStatements: false,
  // Railway often uses SSL
  ssl:
    process.env.NODE_ENV === "production"
      ? {
          rejectUnauthorized: false,
        }
      : false,
};

// Debug logging for connection config
console.log("Database connection config:", {
  host: dbConfig.host,
  user: dbConfig.user,
  database: dbConfig.database,
  port: dbConfig.port,
  ssl: !!dbConfig.ssl,
});

let pool;
let db;

/**
 * Test database connection with detailed error reporting
 */
async function testConnection() {
  try {
    console.log("Testing database connection...");
    const connection = await pool.getConnection();
    console.log("Got connection from pool");

    await connection.ping();
    console.log("Ping successful");

    // Test a simple query
    const [rows] = await connection.execute("SELECT 1 as test");
    console.log("Test query successful:", rows);

    connection.release();
    console.log("Connection released");
    return true;
  } catch (error) {
    console.error("Connection test failed with details:");
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    throw new Error(`Database connection test failed: ${error.message}`);
  }
}

/**
 * Initialize database connection
 */
async function initializeDatabase() {
  try {
    console.log("Initializing database connection...");

    // Create MySQL connection pool
    pool = mysql.createPool(dbConfig);
    console.log("Connection pool created");

    // Test the connection first
    await testConnection();

    // Initialize Drizzle ORM with the pool
    db = drizzle(pool);
    console.log("Drizzle ORM initialized");

    console.log("Database connection established successfully");
    return true;
  } catch (error) {
    console.error("Failed to establish database connection:", error.message);

    // Try alternative configurations
    if (
      dbConfig.host.includes("railway") ||
      dbConfig.host.includes("switchyard")
    ) {
      console.log("Attempting Railway-specific connection settings...");

      // Railway sometimes needs different SSL settings
      const railwayConfig = {
        ...dbConfig,
        ssl: {
          rejectUnauthorized: false,
          ca: false,
        },
        connectTimeout: 60000,
        acquireTimeout: 60000,
        timeout: 60000,
      };

      try {
        if (pool) {
          await pool.end();
        }
        pool = mysql.createPool(railwayConfig);
        await testConnection();
        db = drizzle(pool);
        console.log("Database connection established with Railway settings");
        return true;
      } catch (railwayError) {
        console.error("Railway connection also failed:", railwayError.message);
      }
    }

    throw error;
  }
}

// Initialize database immediately (not lazily)
try {
  await initializeDatabase();
} catch (error) {
  console.error("Database initialization failed:", error.message);
  // Don't throw - let the app start but log the error
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
 * Get database connection pool
 */
export function getPool() {
  if (!pool) {
    throw new Error("Database pool not initialized");
  }
  return pool;
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
    if (!pool) {
      return {
        status: "unhealthy",
        error: "Database pool not initialized",
        timestamp: new Date().toISOString(),
        database: dbConfig.database,
        host: dbConfig.host,
        port: dbConfig.port,
      };
    }

    await testConnection();
    return {
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: dbConfig.database,
      host: dbConfig.host,
      port: dbConfig.port,
    };
  } catch (error) {
    return {
      status: "unhealthy",
      error: error.message,
      timestamp: new Date().toISOString(),
      database: dbConfig.database,
      host: dbConfig.host,
      port: dbConfig.port,
    };
  }
}

// Export the main database instance
export { db };

// Default export for convenience
export default db;
