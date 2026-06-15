import { db } from "@/db/index.js";
import { invitations, memberships, users } from "@/db/schema.js";
import { generateToken, passwordHashingHelper } from "@/lib/auth.js";
import { createSession } from "@/lib/session.js";
import { eq } from "drizzle-orm";
import type { IRoles } from "types/index.js";

const createInvitationService = async (data: {
  organizationId: string;
  email: string;
  role: IRoles;
}) => {
  const { organizationId, email, role } = data;
  if (!email || !role) throw new Error("Email is required");

  try {
    // create token
    const token = generateToken(32);

    const invitation = await db
      .insert(invitations)
      .values({ organizationId, email, token, role, status: "pending" } as any)
      .returning();

    return {
      success: true,
      message: "Invitation created",
      data: {
        invitation,
        inviteLink: `${process.env.CLIENT_ORIGIN}/join?token=${token}`,
      },
    };
  } catch (error) {
    console.error("Error during signup:", error);
    throw new Error("An error occurred during signup. Please try again.");
  }
};

const acceptInvitationService = async (data: {
  token: string;
  password: string;
  name: string;
}) => {
  const { token, password, name } = data;
  if (!token || !name || !password)
    throw new Error("Token, name and password are required!");

  if (password.length < 5)
    throw new Error("Password must be at least 6 characters");

  const invite = await db.query.invitations.findFirst({
    where: (inv, { eq }) => eq(inv.token, token),
  });
  if (!invite) throw new Error("Invalid invitation link");

  if (invite.status !== "pending")
    throw new Error("This invitation has already been used");

  // To check if a user exists
  const existingUser = await db.query.users.findFirst({
    where: (user, { eq }) => eq(user.email, invite.email),
  });
  if (existingUser) {
    throw new Error(
      "An account with this email already exists. Please log in instead.",
    );
  }

  const hashedPassword = await passwordHashingHelper(password);
  const result = await db.transaction(async (trx) => {
    const [user] = await trx
      .insert(users)
      .values({ name, password: hashedPassword, email: invite.email })
      .returning();

    await trx
      .insert(memberships)
      .values({
        organizationId: invite.organizationId,
        role: invite.role,
        userId: user.id,
      })
      .returning();

    await trx
      .update(invitations)
      .set({ status: "accepted" })
      .where(eq(invitations.id, invite.id));

    return { user };
  });

  // loged in using session
  const sessionId = await createSession({
    userId: result.user.id,
    organizationId: invite.organizationId,
    role: invite.role,
  });

  return {
    success: true,
    message: "Invitation accepted!",
    data: {
      sessionId,
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
      },
      role: invite.role,
    },
  };
};

export { acceptInvitationService, createInvitationService };
