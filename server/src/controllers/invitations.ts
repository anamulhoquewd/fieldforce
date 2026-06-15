import { db } from "@/db/index.js";
import { invitations } from "@/services/index.js";
import type { Context } from "hono";
import { setSignedCookie } from "hono/cookie";
import { SESSION_SECRET } from "./auth.js";

const invitationController = async (c: Context) => {
  const user = c.get("user");
  const body = await c.req.json();

  try {
    const response = await invitations.createInvitationService({
      organizationId: user.organizationId,
      role: body.role || "worker",
      email: body.email,
    });

    return c.json(response, 201);
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 400);
  }
};

const listInvitationsController = async (c: Context) => {
  const user = c.get("user");

  try {
    const listOfInvitations = await db.query.invitations.findMany({
      where: (inv, { eq }) => eq(inv.organizationId, user.organizationId),
    });

    return c.json({
      success: true,
      message: "Fetch invitations successfully!",
      data: listOfInvitations,
    });
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 400);
  }
};

const acceptInvitationController = async (c: Context) => {
  const body = await c.req.json();

  try {
    const response = await invitations.acceptInvitationService(body);

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

export {
  invitationController,
  listInvitationsController,
  acceptInvitationController,
};
