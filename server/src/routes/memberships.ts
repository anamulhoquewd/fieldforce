import { memberships } from "@/controllers/index.js";
import { authMiddileware } from "@/middleware/auth.js";
import { Hono } from "hono";

const membershipRoute = new Hono();

membershipRoute.get("/", authMiddileware, (c) =>
  memberships.getMembershipsController(c),
);

export default membershipRoute;
