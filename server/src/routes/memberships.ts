import { memberships } from "@/controllers/index.js";
import { authMiddileware, requiredRoles } from "@/middleware/auth.js";
import { Hono } from "hono";

const membershipRoute = new Hono();

membershipRoute.get("/workers", authMiddileware, requiredRoles("manager"), (c) =>
  memberships.getWorkerController(c),
);

export default membershipRoute;
