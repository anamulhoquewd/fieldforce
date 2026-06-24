import { memberships } from "@/controllers/index.js";
import { authMiddileware, requiredRoles } from "@/middleware/auth.js";
import { Hono } from "hono";

const membershipRoute = new Hono();

membershipRoute.get(
  "/workers",
  authMiddileware,
  requiredRoles("manager"),
  (c) => memberships.getWorkerController(c),
);
membershipRoute.get("/manager", authMiddileware, (c) =>
  memberships.getManagerController(c),
);

export default membershipRoute;
