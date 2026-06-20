import { badRequestError, serverError } from "@/errors/index.js";
import { memberships } from "@/services/index.js";
import type { Context } from "hono";

// Get Me
const getWorkerController = async (c: Context) => {
  const user = c.get("user");

  const response = await memberships.getWorkersService(user.organizationId);

  if (response.error) {
    return badRequestError(c, response.error);
  }

  if (response.serverError) {
    return serverError(c, response.serverError);
  }

  return c.json(response, 200);
};

export { getWorkerController };
