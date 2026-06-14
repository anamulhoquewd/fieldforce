import Redis from "ioredis";
import "dotenv/config.js";

if (!process.env.REDIS_URL) {
  throw new Error("REDIS_URL is not set in .env");
}

export const redis = new Redis(process.env.REDIS_URL);

redis.on("connect", () => {
  console.log("✅ Redis connected");
});

redis.on("error", (err: Error) => {
  console.error("❌ Redis error:", err.message);
});
