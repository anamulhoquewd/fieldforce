import { tasks } from "@/controllers/index.js";
import { authMiddileware, requiredRoles } from "@/middleware/auth.js";
import { Hono } from "hono";

const taskRoute = new Hono();

taskRoute.post("/register", authMiddileware, requiredRoles("manager"), (c) =>
  tasks.tasksController(c),
);

export default taskRoute;
