import { serve } from "@hono/node-server";
import "dotenv/config";
import { Hono } from "hono";
import authRoute from "./routes/auth.js";

const PORT = process.env.PORT || 3000;

const app = new Hono().basePath("/api/v1");

app.get("/health", async (c) => {
  try {
    return c.text("Server is healthy!");
  } catch (error) {
    console.error("Health check failed", error);
    return c.text("Server is unhealthy", 500);
  }
});

// Auth rotue
app.route("/auth", authRoute);

serve(
  {
    fetch: app.fetch,
    port: Number(PORT) || 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
