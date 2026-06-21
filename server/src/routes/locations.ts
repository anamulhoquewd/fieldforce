import { locations } from "@/controllers/index.js";
import { authMiddileware, requiredRoles } from "@/middleware/auth.js";
import { Hono } from "hono";

const locationRoute = new Hono();

locationRoute.post("/", authMiddileware, (c) =>
  locations.updateLocationController(c),
);

locationRoute.get("/", authMiddileware, requiredRoles("manager"), (c) =>
  locations.getLocationsController(c),
);

export default locationRoute;
