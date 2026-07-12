import { messages } from "@/controllers/index.js";
import { authMiddileware } from "@/middleware/auth.js";
import { Hono } from "hono";

const messageRoute = new Hono();

messageRoute.get("/:userId", authMiddileware, (c) =>
  messages.getMessagesController(c),
);

messageRoute.post("/", authMiddileware, (c) =>
  messages.sendMessageController(c),
);

messageRoute.patch("/:id/read", authMiddileware, (c) =>
  messages.markMessageReadController(c),
);

export default messageRoute;
