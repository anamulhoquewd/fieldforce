import {
  authenticationError,
  badRequestError,
  serverError,
} from "@/errors/index.js";
import { db } from "@/db/index.js";
import { users } from "@/db/schema.js";
import { eq } from "drizzle-orm";
import { deleteSession } from "@/lib/session.js";
import { auth } from "@/services/index.js";
import type { Context } from "hono";
import { deleteCookie, getSignedCookie, setSignedCookie } from "hono/cookie";

export const SESSION_SECRET =
  process.env.SESSION_SECRET || "field_force_dev_by_anam";

const signupController = async (c: Context) => {
  const body = await c.req.json();

  const response = await auth.signupService(body);

  if (response.error) {
    return badRequestError(c, response.error);
  }

  if (response.serverError) {
    return serverError(c, response.serverError);
  }

  await setSignedCookie(c, "session", response.data.sessionId, SESSION_SECRET, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    maxAge: 60 * 60 * 24 * 7, // 7 Days
    path: "/",
  });

  return c.json(response, 201);
};

const signinController = async (c: Context) => {
  const body = await c.req.json();

  const response = await auth.singinService(body);

  if (response.error) {
    return badRequestError(c, response.error);
  }

  if (response.serverError) {
    return serverError(c, response.serverError);
  }

  await setSignedCookie(c, "session", response.data.sessionId, SESSION_SECRET, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    maxAge: 60 * 60 * 24 * 7, // 7 Days
    // maxAge: 30, // 30s
    path: "/",
  });

  return c.json(response, 201);
};

const singoutController = async (c: Context) => {
  try {
    const sessionId = await getSignedCookie(c, SESSION_SECRET, "session");
    if (!sessionId) {
      return authenticationError(c, "Session id missing");
    }
    await deleteSession(sessionId);

    deleteCookie(c, "session", { path: "/" });

    return c.json({ success: true, message: "Signout successfully!" }, 200);
  } catch (error: any) {
    return c.json(
      {
        success: false,
        message: error.message,
        stack: process.env.NODE_ENV === "production" ? null : error.stack,
      },
      500,
    );
  }
};

// Get Me
const fetchMe = async (c: Context) => {
  try {
    const session = c.get("user");

    if (!session) {
      return authenticationError(c);
    }

    const dbUser = await db.query.users.findFirst({
      where: eq(users.id, session.userId),
      columns: { id: true, name: true, email: true },
    });

    return c.json(
      {
        success: true,
        message: "User fetched successfully",
        data: {
          userId: session.userId,
          organizationId: session.organizationId,
          role: session.role,
          name: dbUser?.name ?? null,
          email: dbUser?.email ?? null,
        },
      },
      200,
    );
  } catch (error: any) {
    return c.json(
      {
        success: false,
        message: error.message,
        stack: process.env.NODE_ENV === "production" ? null : error.stack,
      },
      500,
    );
  }
};

export { fetchMe, signinController, signupController, singoutController };
