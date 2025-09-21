import { Hono } from "hono";
import { serveStatic } from "@hono/node-server/serve-static";

const imageRoute = new Hono();

// CORS middleware untuk semua origin
imageRoute.use("/signatures/*", async (c, next) => {
  // Set CORS headers
  c.header("Access-Control-Allow-Origin", "http://localhost:8080"); // atau '*'
  c.header("Access-Control-Allow-Methods", "GET, OPTIONS");
  c.header("Access-Control-Allow-Headers", "Content-Type");
  c.header("Access-Control-Allow-Credentials", "false");

  if (c.req.method === "OPTIONS") {
    return c.text("", 200);
  }

  await next();
});

imageRoute.use(
  "/signatures/*",
  serveStatic({
    root: "./public",
    onNotFound: (path, c) => {
      console.log(`File not found: ${path}`);
      return c.text("File not found", 404);
    },
  })
);

export default imageRoute;
