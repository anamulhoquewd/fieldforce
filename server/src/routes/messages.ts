import { messages } from "@/controllers/index.js";
import { authMiddileware } from "@/middleware/auth.js";
import { Hono } from "hono";

const messageRoute = new Hono();

messageRoute.get("/:userId", authMiddileware, (c) =>
  messages.getMessagesController(c),
);

export default messageRoute;
