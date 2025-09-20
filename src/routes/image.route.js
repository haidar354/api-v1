import { Hono } from "hono";
import { serveStatic } from "@hono/node-server/serve-static";

const imageRoute = new Hono();

imageRoute.use(
  "/signatures/*",
  serveStatic({
    root: "./public", // pastikan folder public dari project root
  })
);

export default imageRoute;
