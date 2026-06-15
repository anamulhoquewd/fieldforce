import { deleteSession } from "@/lib/session.js";
import { auth } from "@/services/index.js";
import type { Context } from "hono";
import { deleteCookie, getSignedCookie, setSignedCookie } from "hono/cookie";

export const SESSION_SECRET =
  process.env.SESSION_SECRET || "field_force_dev_by_anam";

const signupController = async (c: Context) => {
  const data = await c.req.json();
  try {
    const response = await auth.signupService(data);

    await setSignedCookie(
      c,
      "session",
      response.data.sessionId,
      SESSION_SECRET,
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
        maxAge: 60 * 60 * 24 * 7, // 7 Days
        path: "/",
      },
    );

    return c.json(response, 201);
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 400);
  }
};

const signinController = async (c: Context) => {
  const body = await c.req.json();

  try {
    const response = await auth.singinService(body);

    await setSignedCookie(
      c,
      "session",
      response.data.sessionId,
      SESSION_SECRET,
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
        maxAge: 60 * 60 * 24 * 7, // 7 Days
        path: "/",
      },
    );

    return c.json(response, 201);
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 400);
  }
};

const singoutController = async (c: Context) => {
  const sessionId = await getSignedCookie(c, SESSION_SECRET, "session");
  if (sessionId) {
    await deleteSession(sessionId);
  }

  deleteCookie(c, "session", { path: "/" });

  return c.json({ success: true, message: "Signout successfully!" }, 200);
};

export { signupController, signinController, singoutController };
