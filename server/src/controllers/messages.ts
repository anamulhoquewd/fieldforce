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

export { getMessagesController };
