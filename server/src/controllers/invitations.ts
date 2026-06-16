import { badRequestError, serverError } from "@/errors/index.js";
import { invitations } from "@/services/index.js";
import type { Context } from "hono";
import { setSignedCookie } from "hono/cookie";
import { SESSION_SECRET } from "./auth.js";

const invitationController = async (c: Context) => {
  const user = c.get("user");
  const body = await c.req.json();

  const response = await invitations.createInvitationService({
    organizationId: user.organizationId,
    role: body.role || "worker",
    email: body.email,
  });

  if (response.error) {
    return badRequestError(c, response.error);
  }

  if (response.serverError) {
    return serverError(c, response.serverError);
  }
  return c.json(response, 201);
};

const listInvitationsController = async (c: Context) => {
  const user = c.get("user");

  const response = await invitations.fetchInvitations({
    organizationId: user.organizationId,
  });

  if (response.serverError) {
    return serverError(c, response.serverError);
  }
  return c.json(response, 200);
};

const acceptInvitationController = async (c: Context) => {
  const body = await c.req.json();

  const response = await invitations.acceptInvitationService(body);

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

export {
  acceptInvitationController,
  invitationController,
  listInvitationsController,
};
