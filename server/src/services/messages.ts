import { db } from "@/db/index.js";

const getMessagesService = async (body: {
  organizationId: string;
  userId: string;
  userB?: string;
}) => {
  const { organizationId, userId, userB } = body;
  if (!organizationId || !userId || !userB)
    return {
      error: {
        message: "Organization id, user id and other user id is required",
      },
    };

  try {
    const history = await db.query.messages.findMany({
      where: (m, { or, eq, and }) =>
        and(
          eq(m.organizationId, organizationId),
          or(
            and(eq(m.senderId, userB), eq(m.receiverId, userId)),
            and(eq(m.senderId, userId), eq(m.receiverId, userB)),
          ),
        ),
      orderBy: (m, { asc }) => [asc(m.createdAt)],
    });

    return {
      success: true,
      message: "get messages successfully",
      data: history,
    };
  } catch (error: any) {
    console.log("Error on fetch messages: ", error);
    return {
      serverError: {
        success: false,
        message: error.message,
        stack: process.env.NODE_ENV === "production" ? null : error.stack,
      },
    };
  }
};

export { getMessagesService };
