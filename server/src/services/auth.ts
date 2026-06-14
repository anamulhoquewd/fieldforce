import { db } from "@/db/index.js";
import { memberships, organizations, users } from "@/db/schema.js";
import { comparePassword, hashPassword } from "@/lib/auth.js";
import { createSession } from "@/lib/session.js";

interface SignupData {
  name: string;
  email: string;
  password: string;
  organizationName: string;
}
const signupService = async (data: SignupData) => {
  const { name, email, password, organizationName } = data;
  if (!name || !email || !password || !organizationName) {
    throw new Error("All fields are required");
  }
  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters long");
  }

  // Check if the email already exists in the database
  const existingUser = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.email, email),
  });

  if (existingUser) {
    throw new Error("Email already exists");
  }
  try {
    // create hash of the password
    const hashedPassword = await hashPassword(password);

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
        userId,
        orgId,
      };
    });

    // create sessionId to set cookie for authentication.
    const sessionId = await createSession({
      userId: result.userId,
      organizationId: result.orgId,
      role: "manager",
    });

    // response
    return {
      success: true,
      message: "Signup successful",
      data: {
        sessionId,
        user: {
          id: result.userId,
          name: result.user.name,
          email: result.user.email,
        },
        organization: {
          id: result.orgId,
          name: result.organization.name,
        },
      },
    };
  } catch (error) {
    console.error("Error during signup:", error);
    throw new Error("An error occurred during signup. Please try again.");
  }
};

interface SinginData {
  email: string;
  password: string;
}
const singinService = async (data: SinginData) => {
  const { email, password } = data;
  if (!email || !password) throw new Error("Email and password are required.");

  try {
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email),
    });

    if (!user) throw new Error("Invalid email or password.");

    // match the hash with isMatchword
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) throw new Error("Invalid email or password.");

    // find the membership
    const membership = await db.query.memberships.findFirst({
      where: (member, { eq }) => eq(member.userId, user.id),
    });
    if (!membership) throw new Error("No organization found for this user.");

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
    console.log("Error during signin: ", error);
    throw new Error("An error occurred during signin. Please try again.");
  }
};

export { signupService, singinService };
