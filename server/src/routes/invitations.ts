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

invitationRoute.get("/", authMiddileware, requiredRoles("manager"), (c) =>
  invitation.listInvitationsController(c),
);

invitationRoute.post("/accept", (c) =>
  invitation.acceptInvitationController(c),
);

invitationRoute.post("/decline", authMiddileware, requiredRoles("manager"), (c) =>
  invitation.declineInvitationController(c),
);

export default invitationRoute;
