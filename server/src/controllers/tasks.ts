import { badRequestError, serverError } from "@/errors/index.js";
import { tasks } from "@/services/index.js";
import type { Context } from "hono";

const tasksController = async (c: Context) => {
  const body = await c.req.json();
  const user = c.get("user");

  console.log("User: ", user);

  const response = await tasks.taskCreateService({
    ...body,
    creatorId: user.userId,
    organizationId: user.organizationId,
  });

  if (response.error) {
    return badRequestError(c, response.error);
  }

  if (response.serverError) {
    return serverError(c, response.serverError);
  }

  return c.json(response, 201);
};

export { tasksController };
