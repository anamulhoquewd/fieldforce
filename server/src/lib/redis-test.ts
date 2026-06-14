import { redis } from "./redis.js";
import { createSession, getSession, deleteSession } from "./session.js";

async function main() {
  const sessionId = await createSession({
    userId: "user123",
    organizationId: "org456",
    role: "manager",
  });

  console.log("set sessionId ✓", sessionId);

  const value = await getSession(sessionId);
  console.log("GET sessionId →", value);

  await deleteSession(sessionId);
  console.log("DEL sessionId ✓");

  await redis.quit();
}

main().catch(console.error);
