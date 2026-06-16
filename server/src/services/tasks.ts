import { db } from "@/db/index.js";
import { tasks } from "@/db/schema.js";
import { schemaValidationError } from "@/errors/index.js";
import { zTasks, type TTasks } from "validations/index.js";

const taskCreateService = async (body: TTasks) => {
  const data = zTasks.safeParse(body);
  console.log("Body: ", body);

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

    const [task] = await db.insert(tasks).values(taskValues).returning();

    // response
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

export { taskCreateService };
