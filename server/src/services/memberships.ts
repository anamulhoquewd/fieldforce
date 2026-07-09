import { db } from "@/db/index.js";
import { memberships, users } from "@/db/schema.js";
import { and, eq } from "drizzle-orm";

const getMembershipService = async ({
  organizationId,
  role,
}: {
  organizationId: string;
  role: "worker" | "manager" | "all";
}) => {
  if (!organizationId)
    return {
      error: {
        message: "organization ID is required",
      },
    };

  try {
    const members = await db
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
          role === "all" ? undefined : eq(memberships.role, role),
        ),
      );

    return {
      success: true,
      message: `${role}(s) get successfully`,
      data: members,
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

export { getMembershipService };

