import { tasks } from "@/controllers/index.js";
import { authMiddileware, requiredRoles } from "@/middleware/auth.js";
import { Hono } from "hono";

const taskRoute = new Hono();

taskRoute.post("/register", authMiddileware, requiredRoles("manager"), (c) =>
  tasks.tasksController(c),
);

taskRoute.get("/list", authMiddileware, (c) => tasks.fetchTasksController(c));

taskRoute.patch("/:id/status", authMiddileware, (c) =>
  tasks.taskUpdateController(c),
);

// Manager-only: update status + assignedTo together
taskRoute.patch("/:id", authMiddileware, requiredRoles("manager"), (c) =>
  tasks.taskPatchController(c),
);

export default taskRoute;
