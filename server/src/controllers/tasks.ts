import { badRequestError, serverError } from "@/errors/index.js";
import { tasks } from "@/services/index.js";
import type { Context } from "hono";

const tasksController = async (c: Context) => {
  const body = await c.req.json();
  const user = c.get("user");

  const response = await tasks.taskCreateService({
    ...body,
    creatorId: user.userId,
    organizationId: user.organizationId,
  });

  if (response.error) {
    return badRequestError(c, response.error);
  }

  if (response.serverError) {
    return serverError(c, response.serverError);
  }

  return c.json(response, 201);
};

const fetchTasksController = async (c: Context) => {
  const user = c.get("user");

  const response = await tasks.fetchTasksService({
    userId: user.userId,
    organizationId: user.organizationId,
    role: user.role,
  });

  if (response.serverError) {
    return serverError(c, response.serverError);
  }

  return c.json(response, 200);
};

const taskUpdateController = async (c: Context) => {
  const taskId = c.req.param("id");

  if (!taskId)
    return badRequestError(c, {
      message: "Task not found",
    });

  const body = await c.req.json();
  const user = c.get("user");
  console.log("User: ", user);

  const response = await tasks.updateTaskService({
    status: body.status,
    organizationId: user.organizationId,
    role: user.role,
    taskId,
    userId: user.userId,
  });

  if (response.error) {
    return badRequestError(c, response.error);
  }

  if (response.serverError) {
    return serverError(c, response.serverError);
  }

  return c.json(response, 200);
};

const taskPatchController = async (c: Context) => {
  const taskId = c.req.param("id");
  if (!taskId) return badRequestError(c, { message: "Task ID is required" });

  const body = await c.req.json();
  const user = c.get("user");

  const response = await tasks.patchTaskService({
    taskId,
    organizationId: user.organizationId,
    updates: body,
  });

  if (response.error) return badRequestError(c, response.error);
  if (response.serverError) return serverError(c, response.serverError);

  return c.json(response, 200);
};

export {
  fetchTasksController,
  taskPatchController,
  tasksController,
  taskUpdateController,
};

