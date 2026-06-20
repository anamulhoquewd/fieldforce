import { db } from "@/db/index.js";
import { memberships, users } from "@/db/schema.js";
import { and, eq } from "drizzle-orm";

const getWorkersService = async (organizationId: string) => {
  if (!organizationId)
    return {
      error: {
        message: "organization ID is required",
      },
    };

  try {
    const workers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: memberships.role,
      })
      .from(memberships)
      .innerJoin(users, eq(memberships.userId, users.id))
      .where(
        and(
          eq(memberships.organizationId, organizationId),
          eq(memberships.role, "worker"),
        ),
      );

    return {
      success: true,
      message: "Workers get successfully",
      data: workers,
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

export { getWorkersService };

