import { badRequestError, serverError } from "@/errors/index.js";
import { locations } from "@/services/index.js";
import type { Context } from "hono";

const updateLocationController = async (c: Context) => {
  const body = await c.req.json();
  const user = c.get("user");

  const response = await locations.updateLocationService({
    organizationId: user.organizationId,
    userId: user.userId,
    latitude: body.latitude,
    longitude: body.longitude,
  });

  if (response.error) {
    return badRequestError(c, response.error);
  }

  if (response.serverError) {
    return serverError(c, response.serverError);
  }

  return c.json(response, 201);
};

const getLocationsController = async (c: Context) => {
  const user = c.get("user");

  const response = await locations.getLocationsService(user.organizationId);

  if (response.serverError) {
    return serverError(c, response.serverError);
  }

  return c.json(response, 200);
};

export { getLocationsController, updateLocationController };
