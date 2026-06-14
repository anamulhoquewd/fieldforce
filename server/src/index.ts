import { serve } from "@hono/node-server";
import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import { Hono } from "hono";
import Redis from "ioredis";

const PORT = process.env.PORT || 3000;

const app = new Hono().basePath("/api/v1");

const db = drizzle(process.env.DATABASE_URL!);

const redisClient = new Redis(process.env.REDIS_URL);
redisClient.on("error", (err) => {
  console.error("Redis Client Error", err);
});

app.get("/health", async (c) => {
  try {
    const pong = await redisClient.ping();
    if (pong !== "PONG") {
      throw new Error("Redis ping failed");
    }
    return c.text("Server is healthy!");
  } catch (error) {
    console.error("Health check failed", error);
    return c.text("Redis connection failed", 500);
  }
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
