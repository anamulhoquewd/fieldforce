import { db } from "@/db/index.js";
import { invitations, memberships, users } from "@/db/schema.js";
import { schemaValidationError } from "@/errors/index.js";
import { generateToken, passwordHashingHelper } from "@/lib/auth.js";
import { sendInvitationEmail } from "@/lib/email.js";
import { createSession } from "@/lib/session.js";
import dotenv from "dotenv";
import { eq } from "drizzle-orm";
import z from "zod";

dotenv.config();

const zInvitation = z.object({
  organizationId: z.string(),
  email: z.email(),
  role: z.enum(["manager", "worker"]),
});
type TInvitation = z.infer<typeof zInvitation>;

const createInvitationService = async (body: TInvitation) => {
  const data = zInvitation.safeParse(body);

  if (!data.success) {
    return {
      error: schemaValidationError(data.error, "Invalid request body"),
    };
  }
  const { organizationId, email, role } = data.data;

  try {
    // create token
    const token = generateToken(32);

    const invitation = await db
      .insert(invitations)
      .values({ organizationId, email, token, role, status: "pending" } as any)
      .returning();

    // Generate the join URL
    const inviteLink = `${process.env.CLIENT_ORIGIN}/join?token=${token}`;

    // Look up the organization name to personalize the email
    const organization = await db.query.organizations.findFirst({
      where: (org, { eq }) => eq(org.id, organizationId),
    });

    // Send the invitation email (best-effort: the invite still stands and the
    // link is returned so the manager can share it manually if delivery fails)
    let emailSent = false;
    try {
      await sendInvitationEmail({
        to: email,
        inviteLink,
        role,
        organizationName: organization?.name,
      });
      emailSent = true;
    } catch (mailError: any) {
      console.error("Failed to send invitation email:", mailError?.message);
    }

    // const mailOptions = {
    //   from: process.env.EMAIL_USER,
    //   to: email,
    //   subject: "Your Account Details",
    //   text: `Hello ${data.name},\n\nClick the link below to reset your password:\n\n${resetUrl}\n\nIf you didn't request this, please ignore this email. This token will expire in 30 minutes.\n\nBest regards,\n${data.name}`,
    // };

    // await transporter.sendMail(mailOptions);

    return {
      success: true,
      message: emailSent
        ? "Invitation created and email sent"
        : "Invitation created (email could not be sent)",
      data: {
        invitation,
        inviteLink,
        emailSent,
      },
    };
  } catch (error: any) {
    console.log("Error: ", error);
    return {
      serverError: {
        success: false,
        message: error.message,
        stack: process.env.NODE_ENV === "production" ? null : error.stack,
      },
    };
  }
};

const zAcceptInvite = z.object({
  token: z.string(),
  password: z.string().min(6).max(20),
  name: z.string().min(3),
});
type TAcceptInvite = z.infer<typeof zAcceptInvite>;

const acceptInvitationService = async (body: TAcceptInvite) => {
  const data = zAcceptInvite.safeParse(body);

  if (!data.success) {
    return {
      error: schemaValidationError(data.error, "Invalid request body"),
    };
  }
  const { token, password, name } = data.data;
  try {
    const invite = await db.query.invitations.findFirst({
      where: (inv, { eq }) => eq(inv.token, token),
    });
    if (!invite) {
      return {
        error: {
          message: "Invalid invitation link",
        },
      };
    }

    if (invite.status !== "pending") {
      return {
        error: {
          message: "This invitation has already been used",
        },
      };
    }

    // To check if a user exists
    const existingUser = await db.query.users.findFirst({
      where: (user, { eq }) => eq(user.email, invite.email),
    });
    if (existingUser) {
      return {
        error: {
          message:
            "An account with this email already exists. Please log in instead",
        },
      };
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

const fetchInvitations = async ({
  organizationId,
}: {
  organizationId: string;
}) => {
  try {
    const data = await db.query.invitations.findMany({
      where: (inv, { eq }) => eq(inv.organizationId, organizationId),
    });

    return {
      success: true,
      message: "Fetch invitations successfully!",
      data,
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

const declineInvitationService = async ({
  organizationId,
  invitationId,
}: {
  organizationId: string;
  invitationId: string;
}) => {
  if (!organizationId || !invitationId)
    return {
      error: {
        message: "Organization id and invitation id are required",
      },
    };

  try {
    const invite = await db.query.invitations.findFirst({
      where: (inv, { eq, and }) =>
        and(eq(inv.id, invitationId), eq(inv.organizationId, organizationId)),
    });

    if (!invite) {
      return {
        error: {
          message: "Invitation not found",
        },
      };
    }

    if (invite.status !== "pending") {
      return {
        error: {
          message: `Invitation already ${invite.status}`,
        },
      };
    }

    await db
      .update(invitations)
      .set({ status: "declined" })
      .where(eq(invitations.id, invitationId));

    return {
      success: true,
      message: "Invitation declined",
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

export {
  acceptInvitationService,
  createInvitationService,
  declineInvitationService,
  fetchInvitations,
};
