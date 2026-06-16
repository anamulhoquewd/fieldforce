import { serve } from "@hono/node-server";
import "dotenv/config";
import { Hono } from "hono";
import authRoute from "./routes/auth.js";
import invitationRoute from "./routes/invitations.js";
import { cors } from "hono/cors";
import { notFoundError } from "./errors/index.js";

const PORT = process.env.PORT || 3000;

const app = new Hono().basePath("/api/v1");

app.use(
  "/*",
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE"], // Ensure OPTIONS is handled
    allowHeaders: ["Content-Type", "Authorization"], // Allow necessary headers
  }),
);

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

// invitations route
app.route("/invitations", invitationRoute);


// Global Error Handler
app.onError((error: any, c) => {
  console.error("error: ", error);
  return c.json(
    {
      success: false,
      message: error.message,
      stack: process.env.NODE_ENV === "production" ? null : error.stack,
    },
    500,
  );
});

// Not Found Handler
app.notFound((c) => {
  const error = notFoundError(c);
  return error;
});

serve(
  {
    fetch: app.fetch,
    port: Number(PORT) || 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
