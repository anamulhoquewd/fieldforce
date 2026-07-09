import { badRequestError, serverError } from "@/errors/index.js";
import { memberships } from "@/services/index.js";
import type { Context } from "hono";

const getMembershipsController = async (c: Context) => {
  const type = c.req.query("type") as "all" | "manager" | "worker";
  const user = c.get("user");

  const response = await memberships.getMembershipService({
    organizationId: user.organizationId,
    role: type,
  });

  if (response.error) {
    return badRequestError(c, response.error);
  }

  if (response.serverError) {
    return serverError(c, response.serverError);
  }

  return c.json(response, 200);
};

export { getMembershipsController };

