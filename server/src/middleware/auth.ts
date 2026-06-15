import { getSession } from "@/lib/session.js";
import type { Context, Next } from "hono";
import { getSignedCookie } from "hono/cookie";

const SESSION_SECRET = process.env.SESSION_SECRET || "field_force_dev_by_anam";

const authMiddileware = async (c: Context, next: Next) => {
  const sessionId = await getSignedCookie(c, SESSION_SECRET, "session");
  if (!sessionId)
    return c.json({ success: false, message: "Unauthorized" }, 401);

  const session = await getSession(sessionId);
  if (!session)
    return c.json({ success: false, message: "Session expired" }, 401);

  c.set("user", session);

  await next();
};

const requiredRoles = (...allowedRoles: string[]) => {
  return async (c: Context, next: Next) => {
    const user = c.get("user");
    if (!user || !allowedRoles.includes(user.role)) {
      return c.json(
        { success: false, message: "Forbidden: insufficient permissions" },
        403,
      );
    }

    await next();
  };
};

export { authMiddileware, requiredRoles };

