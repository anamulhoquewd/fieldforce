import { db } from "@/db/index.js";
import { and, eq } from "drizzle-orm";
import { messages } from "@/db/schema.js";

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

const sendMessageService = async (body: {
  organizationId: string;
  senderId: string;
  receiverId: string;
  content: string;
}) => {
  const { organizationId, senderId, receiverId, content } = body;
  if (!organizationId || !senderId || !receiverId || !content.trim())
    return {
      error: {
        message: "sender, receiver, and content are required",
      },
    };

  try {
    const [message] = await db
      .insert(messages)
      .values({ organizationId, senderId, receiverId, content })
      .returning();

    return {
      success: true,
      message: "message sent",
      data: message,
    };
  } catch (error: any) {
    console.log("Error on send message: ", error);
    return {
      serverError: {
        success: false,
        message: error.message,
        stack: process.env.NODE_ENV === "production" ? null : error.stack,
      },
    };
  }
};

const markMessageReadService = async ({
  messageId,
  organizationId,
}: {
  messageId: string;
  organizationId: string;
}) => {
  if (!messageId || !organizationId)
    return {
      error: {
        message: "message id and organization id are required",
      },
    };

  try {
    const [message] = await db
      .update(messages)
      .set({ readAt: new Date() })
      .where(
        and(
          eq(messages.id, messageId),
          eq(messages.organizationId, organizationId),
        ),
      )
      .returning();

    if (!message) {
      return {
        error: {
          message: "Message not found",
        },
      };
    }

    return {
      success: true,
      message: "message marked as read",
      data: message,
    };
  } catch (error: any) {
    console.log("Error on mark read: ", error);
    return {
      serverError: {
        success: false,
        message: error.message,
        stack: process.env.NODE_ENV === "production" ? null : error.stack,
      },
    };
  }
};

export { getMessagesService, markMessageReadService, sendMessageService };
