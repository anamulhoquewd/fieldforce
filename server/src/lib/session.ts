import { redis } from "./redis.js";
import { randomBytes } from "crypto";

// Session data structure
type SessionData = {
  userId: string;
  organizationId: string;
  role: "manager" | "worker";
};

const SESSION_PREFIX = "session:";
const SESSION_TTL = 60 * 60 * 24 * 7; // 7 days in seconds

// 1. session create — call in login route
export async function createSession(data: SessionData): Promise<string> {
  const sessionId = randomBytes(32).toString("hex"); // secure, random session ID
  const key = SESSION_PREFIX + sessionId;
  await redis.set(key, JSON.stringify(data), "EX", SESSION_TTL);
  return sessionId; // return sessionId to client for future requests and set it in cookies or headers
}

// 2. session read — call in protected routes
export async function getSession(
  sessionId: string,
): Promise<SessionData | null> {
  const key = SESSION_PREFIX + sessionId;
  const raw = await redis.get(key);
  if (!raw) return null;
  return JSON.parse(raw) as SessionData;
}

// 3. session delete — call in logout route
export async function deleteSession(sessionId: string): Promise<void> {
  await redis.del(SESSION_PREFIX + sessionId);
}
