import { db } from "@/db/index.js";
import { tasks } from "@/db/schema.js";
import { schemaValidationError } from "@/errors/index.js";
import { eq } from "drizzle-orm";
import { zTasks, type TTasks } from "validations/index.js";

const taskCreateService = async (body: TTasks) => {
  const data = zTasks.safeParse(body);

  if (!data.success) {
    return {
      error: schemaValidationError(data.error, "Invalid request body"),
    };
  }
  const {
    organizationId,
    title,
    description,
    latitude,
    longitude,
    creatorId,
    assignedTo,
    status,
    deadline,
  } = data.data;

  try {
    if (assignedTo) {
      const user = await db.query.memberships.findFirst({
        where: (m, { and, eq }) =>
          and(eq(m.userId, assignedTo), eq(m.organizationId, organizationId)),
      });

      if (!user) {
        return {
          error: {
            message: "Assigned user is not a member of this organization",
            fields: [
              {
                name: "assignedTo",
                message: "Invalid assigned worker",
              },
            ],
          },
        };
      }
    }

    const taskValues = {
      organizationId,
      title,
      description,
      latitude,
      longitude,
      creatorId,
      assignedTo,
      status,
      deadline: deadline,
    };

    const [inserted] = await db.insert(tasks).values(taskValues).returning();

    const task = await db.query.tasks.findFirst({
      where: (t, { eq }) => eq(t.id, inserted.id),
      with: {
        assignedWorker: { columns: { id: true, name: true, email: true } },
        creator: { columns: { id: true, name: true, email: true } },
        organization: { columns: { id: true, name: true } },
      },
    });

    return {
      success: true,
      message: "Task created",
      data: task,
    };
  } catch (error: any) {
    return {
      serverError: {
        success: false,
        message: error.message,
        stack: process.env.NODE_ENV === "production" ? null : error.stack,
      },
    };
  }
};

const fetchTasksService = async (query: {
  organizationId: string;
  userId: string;
  role: "manager" | "worker";
}) => {
  const { organizationId, userId, role } = query;

  try {
    const tasks = await db.query.tasks.findMany({
      where: (t, { eq, and }) => {
        if (role === "manager") return eq(t.organizationId, organizationId);

        return and(
          eq(t.organizationId, organizationId),
          eq(t.assignedTo, userId),
        );
      },
      with: {
        assignedWorker: {
          columns: { id: true, name: true, email: true },
        },
        creator: { columns: { id: true, name: true, email: true } },
        organization: { columns: { id: true, name: true } },
      },
      orderBy: (t, { desc }) => [desc(t.createdAt)],
    });

    return {
      success: true,
      message: "Tasks list fetched successfully.",
      data: tasks,
    };
  } catch (error: any) {
    return {
      serverError: {
        success: false,
        message: error.message,
        stack: process.env.NODE_ENV === "production" ? null : error.stack,
      },
    };
  }
};

const updateTaskService = async (body: {
  taskId: string;
  organizationId: string;
  userId: string;
  role: "manager" | "worker";
  status: string;
}) => {
  const data = zTasks.pick({ status: true }).safeParse(body);
  if (!data.success) {
    return {
      error: schemaValidationError(data.error, "Invalid request body"),
    };
  }

  const { taskId, organizationId, userId, role } = body;
  const { status } = data.data;
  try {
    const task = await db.query.tasks.findFirst({
      where: (t, { eq, and }) =>
        and(eq(t.id, taskId), eq(t.organizationId, organizationId)),
    });

    if (!task) {
      return {
        error: {
          message: "Task not found",
        },
      };
    }

    console.log("Role: ", role, "task: ", task, "user ID: ", userId);

    if (role === "worker" && task.assignedTo !== userId) {
      return {
        error: {
          message: "You can only update your own tasks",
        },
      };
    }

    const [updated] = await db
      .update(tasks)
      .set({ status, updatedAt: new Date() })
      .where(eq(tasks.id, taskId))
      .returning();

    return {
      success: true,
      message: "Task status updated",
      data: updated,
    };
  } catch (error: any) {
    return {
      serverError: {
        success: false,
        message: error.message,
        stack: process.env.NODE_ENV === "production" ? null : error.stack,
      },
    };
  }
};

const patchTaskService = async (body: {
  taskId: string;
  organizationId: string;
  updates: { status?: string; assignedTo?: string | null };
}) => {
  const { taskId, organizationId, updates } = body;
  if (!updates.status && !updates.assignedTo) {
    return { error: { message: "No fields to update" } };
  }

  try {
    const task = await db.query.tasks.findFirst({
      where: (t, { eq, and }) =>
        and(eq(t.id, taskId), eq(t.organizationId, organizationId)),
    });

    if (!task) return { error: { message: "Task not found" } };

    if (updates.status !== undefined) {
      const valid = ["pending", "in_progress", "completed"].includes(
        updates.status,
      );
      if (!valid) return { error: { message: "Invalid status value" } };
    }

    if (updates.assignedTo) {
      const membership = await db.query.memberships.findFirst({
        where: (m, { and, eq }) =>
          and(
            eq(m.userId, updates.assignedTo!),
            eq(m.organizationId, organizationId),
          ),
      });
      if (!membership)
        return {
          error: {
            message: "Assigned user is not a member of this organization",
          },
        };
    }

    const updateFields: Record<string, unknown> = { updatedAt: new Date() };
    if (updates.status !== undefined) updateFields.status = updates.status;
    if (updates.assignedTo !== undefined)
      updateFields.assignedTo = updates.assignedTo;

    const updated = await db.transaction(async (tx) => {
      await tx.update(tasks).set(updateFields).where(eq(tasks.id, taskId));

      return tx.query.tasks.findFirst({
        where: (t, { eq }) => eq(t.id, taskId),
        with: {
          assignedWorker: { columns: { id: true, name: true, email: true } },
          creator: { columns: { id: true, name: true, email: true } },
          organization: { columns: { id: true, name: true } },
        },
      });
    });

    return { success: true, message: "Task updated", data: updated };
  } catch (error: any) {
    return {
      serverError: {
        success: false,
        message: error.message,
        stack: process.env.NODE_ENV === "production" ? null : error.stack,
      },
    };
  }
};

export {
  fetchTasksService,
  taskCreateService,
  updateTaskService,
  patchTaskService,
};

