import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { secureHeaders } from "hono/secure-headers";
import fs from "fs/promises";
import path from "path";
import imageRoute from "./routes/image.route.js";
import { usersRoute } from "./routes/users.route.js";
import { uploadRoute } from "./routes/upload.route.js";
import { authRoute } from "./routes/auth.route.js";
import { attendanceRoute } from "./routes/attendance.route.js";
import { academicRoute } from "./routes/academic.route.js";
import { roleRoute } from "./routes/role.route.js";
import { classesRoute } from "./routes/classes.route.js";
import { studentsRoute } from "./routes/students.route.js";
import { teachersRoute } from "./routes/teachers.route.js";
import { healthCheck } from "./config/database.js";

/**
 * Main Hono Application
 * School Management System Backend API
 */
const app = new Hono();

/**
 * Global Middleware
 */
// Security headers
app.use("*", secureHeaders());

// CORS configuration
app.use(
  "*",
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://127.0.0.1:3000",
      "https://smkn4jogja.sch.id",
    ],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Request logging
app.use("*", logger());

// Pretty JSON responses
app.use("*", prettyJSON());

const serveStaticFile = async (c, folder) => {
  try {
    // Construct file path by removing the folder prefix
    const requestPath = c.req.path.replace(new RegExp(`^${folder}`), "");
    const filePath = path.join(process.cwd(), folder, requestPath);

    try {
      await fs.access(filePath);
      const file = await fs.readFile(filePath);

      return new Response(file, {
        status: 200,
        headers: {
          "Content-Type": getContentType(filePath),
          "Cache-Control": "public, max-age=31536000",
        },
      });
    } catch (error) {
      return c.json(
        {
          message: "File not found",
        },
        404
      );
    }
  } catch (error) {
    console.error("Static file error:", error);
    return c.json(
      {
        message: "Error serving file",
      },
      500
    );
  }
};

/**
 * Helper to set Content-Type based on extension
 */
const getContentType = (filePath) => {
  const ext = path.extname(filePath).toLowerCase().slice(1);
  const mimeTypes = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    css: "text/css",
    webp: "image/webp",
    js: "application/javascript",
    html: "text/html",
    json: "application/json",
    txt: "text/plain",
    woff: "font/woff",
    woff2: "font/woff2",
    ttf: "font/ttf",
  };
  return mimeTypes[ext] || "application/octet-stream";
};

// Use for /public/*
app.get("/public/*", (c) => serveStaticFile(c, "/public"));

/**
 * Root endpoint
 */
app.get("/", (c) => {
  return c.json({
    success: true,
    message: "Website Sekolahku API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

/**
 * Health check endpoints
 */
app.get("/health", (c) => {
  return c.json({
    message: "API is healthy",
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

app.get("/health/db", async (c) => {
  try {
    const dbHealth = await healthCheck();
    return c.json({
      message: "Database health check",
      data: dbHealth,
    });
  } catch (error) {
    return c.json(
      {
        message: "Database health check failed",
      },
      503
    );
  }
});

/**
 * API Routes
 */
app.route("/api/users", usersRoute);
app.route("/api/upload", uploadRoute);
app.route("/api/auth", authRoute);
app.route("/api/attendance", attendanceRoute);
app.route("/api/academic", academicRoute);
app.route("/api/role", roleRoute);
app.route("/api/classes", classesRoute);
app.route("/api/students", studentsRoute);
app.route("/api/teachers", teachersRoute);
app.route("/", imageRoute);

/**
 * 404 Handler
 */
app.notFound((c) => {
  return c.json(
    {
      message: "Endpoint not found",
    },
    404
  );
});

/**
 * Global Error Handler
 */
app.onError((error, c) => {
  console.error("Global error:", error);

  return c.json(
    {
      message: "Internal server error",
    },
    500
  );
});

/**
 * Server Configuration - Fixed for Railway
 */
const port = parseInt(process.env.PORT) || 8080;
const hostname = "0.0.0.0"; // Changed from localhost to 0.0.0.0 for Railway

/**
 * Graceful shutdown handling
 */
process.on("SIGTERM", async () => {
  console.log("Received SIGTERM, shutting down gracefully...");
  try {
    const { closeDatabase } = await import("./config/database.js");
    await closeDatabase();
    console.log("Server shut down successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error during shutdown:", error);
    process.exit(1);
  }
});

process.on("SIGINT", async () => {
  console.log("Received SIGINT, shutting down gracefully...");
  try {
    const { closeDatabase } = await import("./config/database.js");
    await closeDatabase();
    console.log("Server shut down successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error during shutdown:", error);
    process.exit(1);
  }
});

/**
 * Start Server
 */
console.log(`Website Sekolahku API`);
console.log(`Server running at: http://${hostname}:${port}`);
console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
console.log(`Database: ${process.env.DB_NAME || "website_sekolahku"}`);
console.log(`Railway PORT: ${process.env.PORT || "not set"}`);

serve(
  {
    fetch: app.fetch,
    port: port,
    hostname: hostname,
  },
  (info) => {
    console.log(`🚀 Hono server started successfully`);
    console.log(`📍 Server info:`, info);
  }
);

export default app;
