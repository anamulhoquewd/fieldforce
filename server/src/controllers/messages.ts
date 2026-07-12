import { badRequestError, serverError } from "@/errors/index.js";
import { messages } from "@/services/index.js";
import type { Context } from "hono";

const getMessagesController = async (c: Context) => {
  const user = c.get("user");
  const userB = c.req.param("userId");

  const response = await messages.getMessagesService({
    organizationId: user.organizationId,
    userId: user.userId,
    userB,
  });

  if (response.error) {
    return badRequestError(c, response.error);
  }

  if (response.serverError) return serverError(c, response.serverError);

  return c.json(response, 200);
};

const sendMessageController = async (c: Context) => {
  const user = c.get("user");
  const body: any = await c.req.json();

  const response = await messages.sendMessageService({
    organizationId: user.organizationId,
    senderId: user.userId,
    receiverId: body.receiverId,
    content: body.content,
  });

  if (response.error) {
    return badRequestError(c, response.error);
  }

  if (response.serverError) return serverError(c, response.serverError);

  return c.json(response, 201);
};

const markMessageReadController = async (c: Context) => {
  const user = c.get("user");
  const messageId = c.req.param("id") ?? "";

  const response = await messages.markMessageReadService({
    messageId,
    organizationId: user.organizationId,
  });

  if (response.error) {
    return badRequestError(c, response.error);
  }

  if (response.serverError) return serverError(c, response.serverError);

  return c.json(response, 200);
};

export {
  getMessagesController,
  markMessageReadController,
  sendMessageController,
};
