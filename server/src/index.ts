import { serve } from "@hono/node-server";
import "dotenv/config";
import { Hono } from "hono";
import authRoute from "./routes/auth.js";
import invitationRoute from "./routes/invitations.js";
import { cors } from "hono/cors";
import { notFoundError } from "./errors/index.js";
import taskRoute from "./routes/tasks.js";
import membershipRoute from "./routes/memberships.js";
import locationRoute from "./routes/locations.js";
import { Server } from "socket.io";
import { parseSigned } from "hono/utils/cookie";
import { getSession } from "./lib/session.js";
import { updateLocationService } from "./services/locations.js";

const SESSION_SECRET = process.env.SESSION_SECRET || "field_force_dev_by_anam";
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

// tasks route
app.route("/tasks", taskRoute);

// memberships
app.route("/memberships", membershipRoute);

app.route("/locations", locationRoute);

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

const server = serve(
  {
    fetch: app.fetch,
    port: Number(PORT) || 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
    credentials: true,
  },
});

io.use(async (socket, next) => {
  try {
    // ১. cookie header থেকে session id বের করো
    const cookieHeader = socket.handshake.headers.cookie;
    if (!cookieHeader) {
      return next(new Error("No cookie - unauthorized"));
    }

    const signedCookies = await parseSigned(
      cookieHeader,
      SESSION_SECRET,
      "session",
    );
    console.log("Signd: ", signedCookies);
    const sessionId = signedCookies.session;

    if (!sessionId || typeof sessionId !== "string") {
      return next(new Error("No session - unauthorized"));
    }

    const session = await getSession(sessionId);
    if (!session) {
      return next(new Error("Invalid session - unauthorized"));
    }
    console.log("Session: ", session);

    socket.data.user = session; // { userId, organizationId, role }
    next(); // সব ঠিক, connect হতে দাও
  } catch (err) {
    next(new Error("Auth failed"));
  }
});

io.on("connection", (socket) => {
  const user = socket.data.user; // auth middleware থেকে { userId, organizationId, role }

  const room = `org:${user.organizationId}`;
  socket.join(room);
  console.log(`📥 ${user.role} joined room: ${room}`);

  socket.on(
    "location-update",
    async (data: { latitude: number; longitude: number }) => {
      if (user.role !== "worker") return;

      await updateLocationService({
        organizationId: user.organizationId,
        latitude: data.latitude,
        longitude: data.longitude,
        userId: user.userId,
      });

      const room = `org:${user.organizationId}`;
      socket.to(room).emit("worker-location", {
        userId: user.userId,
        latitude: data.latitude,
        longitude: data.longitude,
        updatedAt: new Date().toISOString(),
      });
    },
  );

  socket.on("disconnect", () => {
    console.log("❌ A client disconnected:", socket.id);
  });
});
