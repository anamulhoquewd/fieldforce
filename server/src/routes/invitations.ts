import { invitation } from "@/controllers/index.js";
import { authMiddileware, requiredRoles } from "@/middleware/auth.js";
import { Hono } from "hono";

const invitationRoute = new Hono();

invitationRoute.post(
  "/register",
  authMiddileware,
  requiredRoles("manager"),
  (c) => invitation.invitationController(c),
);

invitationRoute.get("/list", authMiddileware, requiredRoles("manager"), (c) =>
  invitation.listInvitationsController(c),
);

invitationRoute.post("/accept", (c) =>
  invitation.acceptInvitationController(c),
);

export default invitationRoute;
