import { db } from "@/db/index.js";
import { memberships, organizations, users } from "@/db/schema.js";
import { schemaValidationError } from "@/errors/index.js";
import {
  comparePassword,
  generateToken,
  passwordHashingHelper,
} from "@/lib/auth.js";
import { createSession } from "@/lib/session.js";
import { eq } from "drizzle-orm";
import z from "zod";

export const zPasswordReset = z.object({
  password: z.string().min(8).max(20),
});

export const zResetToken = z.object({
  resetToken: z.string().length(128, "Invalid reset token format"),
});

const passwordResetTokens = new Map<string, string>();

// Bangladesh phone regex (local format like 017xxxxxxxx)
export const BDPhoneRegex = /^01[3-9]\d{8}$/;

const moneyZ = z.coerce.number().min(0, "Amount cannot be negative");

const ZSignin = z.object({
  email: z.email(),
  password: z.string().min(6).max(20),
});
export type ISignin = z.infer<typeof ZSignin>;

const ZUserSchema = z.object({
  name: z.string().min(3).max(225),
  email: z.email(),
  password: z.string().min(6).max(20),
  organizationName: z.string().min(1),
});

const ZChangePassword = z
  .object({
    currentPassword: z.string().min(8).max(20),
    newPassword: z.string().min(8).max(20),
    confirmPassword: z.string().min(8).max(20),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type TChangePassword = z.infer<typeof ZChangePassword>;

const ZForgotPassword = z.object({
  email: z.email(),
});
export type TForgotPassword = z.infer<typeof ZForgotPassword>;

export type TUser = z.infer<typeof ZUserSchema>;

const signupService = async (body: TUser) => {
  const data = ZUserSchema.safeParse(body);

  if (!data.success) {
    return {
      error: schemaValidationError(data.error, "Invalid request body"),
    };
  }
  const { name, email, password, organizationName } = data.data;

  try {
    // Check if the email already exists in the database
    const isUserExist = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email),
    });

    if (isUserExist) {
      return {
        error: {
          message: "This email already exists.",
          fields: [
            {
              name: "email",
              message: "Email must be unique",
            },
          ],
        },
      };
    }
    // create hash of the password
    const hashedPassword = await passwordHashingHelper(password);

    // Create a new user in the database using transaction
    const result = await db.transaction(async (trx) => {
      const newUser = await trx
        .insert(users)
        .values({
          name,
          email,
          password: hashedPassword,
        })
        .returning();
      const userId = newUser[0].id;
      const newOrganization = await trx
        .insert(organizations)
        .values({
          name: organizationName,
          ownerId: userId,
        })
        .returning();
      const orgId = newOrganization[0].id;
      await trx.insert(memberships).values({
        userId,
        organizationId: orgId,
        role: "manager",
      });

      return {
        user: newUser[0],
        organization: newOrganization[0],
      };
    });

    // create sessionId to set cookie for authentication.
    const sessionId = await createSession({
      userId: result.user.id,
      organizationId: result.organization.id,
      role: "manager",
    });

    // response
    return {
      success: true,
      message: "Signup successful",
      data: {
        sessionId,
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
        },
        organization: {
          id: result.organization.id,
          name: result.organization.name,
        },
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

const singinService = async (body: ISignin) => {
  const data = ZSignin.safeParse(body);
  if (!data.success) {
    return {
      error: schemaValidationError(data.error, "Invalid request body"),
    };
  }
  const { email, password } = data.data;

  try {
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email),
    });

    if (!user) {
      return {
        error: {
          message: "Invalid credentials",
          fields: [
            {
              name: "email",
              message: "Invalid credentials",
            },
            {
              name: "password",
              message: "Invalid credentials",
            },
          ],
        },
      };
    }

    // match the hash with isMatchword
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return {
        error: {
          message: "Invalid credentials",
          fields: [
            {
              name: "email",
              message: "Invalid credentials",
            },
            {
              name: "password",
              message: "Invalid credentials",
            },
          ],
        },
      };
    }

    // find the membership
    const membership = await db.query.memberships.findFirst({
      where: (member, { eq }) => eq(member.userId, user.id),
    });
    if (!membership) {
      return {
        error: {
          message: "No organization found for this user",
        },
      };
    }

    // create session
    const sessionId = await createSession({
      organizationId: membership.organizationId,
      role: membership.role as "manager" | "worker",
      userId: user.id,
    });

    return {
      success: true,
      message: "Login successful",
      data: {
        sessionId,
        user: { id: user.id, name: user.name, email: user.email },
        role: membership.role,
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

const changePassword = async ({
  user,
  body,
}: {
  user: any;
  body: TChangePassword;
}) => {
  // Validate body
  const data = ZChangePassword.safeParse(body);
  if (!data.success) {
    return {
      error: schemaValidationError(data.error, "Invalid request body"),
    };
  }

  const { currentPassword, newPassword, confirmPassword } = data.data;

  if (newPassword !== confirmPassword) {
    return {
      error: {
        message: "New password and confirm password do not match",
        fields: [
          {
            name: "confirmPassword",
            message: "Passwords must match",
          },
        ],
      },
    };
  }

  try {
    // Validate current password
    if (!(await user.matchPassword(currentPassword))) {
      return {
        error: {
          message: "Current password is incorrect",
          fields: [
            {
              name: "currentPassword",
              message: "Current password is incorrect",
            },
          ],
        },
      };
    }

    // Update password
    user.password = newPassword;
    await user.save();

    return {
      success: {
        success: true,
        message: "Password changed successfully",
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

const forgotPassword = async (email: TForgotPassword) => {
  const data = ZForgotPassword.safeParse({ email });
  if (!data.success) {
    return {
      error: schemaValidationError(data.error, "Invalid request body"),
    };
  }

  try {
    const user = await db.query.users.findFirst({
      where: (user, { eq }) => eq(user.email, data.data.email),
    });

    if (!user) {
      return {
        error: {
          message: "User not found with this email",
          fields: [
            {
              name: "email",
              message: "User not found with this email",
            },
          ],
        },
      };
    }

    const resetToken = generateToken(64);
    passwordResetTokens.set(resetToken, user.id);

    // Generate URL
    const resetUrl = `${process.env.DOMAIN}/auth/reset-password/${resetToken}`;

    return {
      success: {
        success: true,
        message: "Password reset link sent successfully.",
        token: resetToken,
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

const resetPassword = async ({
  password,
  resetToken,
}: {
  password: string;
  resetToken: string;
}) => {
  const data = zPasswordReset.safeParse({ password });
  const tokenValidation = zResetToken.safeParse({ resetToken });

  if (!data.success) {
    return {
      error: schemaValidationError(data.error, "Invalid request body"),
    };
  }

  if (!tokenValidation.success) {
    return {
      error: {
        message: "Token Validation error",
        fields: tokenValidation.error.issues.map((issue) => ({
          name: String(issue.path[0]),
          message: issue.message,
        })),
      },
    };
  }

  try {
    const userId = passwordResetTokens.get(resetToken);

    if (!userId) {
      return {
        error: {
          message: "Invalid or expired reset token",
          fields: [
            {
              name: "resetToken",
              message: "Invalid or expired reset token",
            },
          ],
        },
      };
    }

    const hashedPassword = await passwordHashingHelper(data.data.password);

    await db
      .update(users)
      .set({
        password: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    passwordResetTokens.delete(resetToken);

    return {
      success: {
        success: true,
        message: "Password reset successfully",
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

export { signupService, singinService };
