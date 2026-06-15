import bcrypt from "bcrypt";

import { randomBytes } from "crypto";

// invitation token
function generateToken(byteLength: number = 32): string {
  return randomBytes(byteLength).toString("hex");
}

async function passwordHashingHelper(password: string): Promise<string> {
  if (!password || typeof password !== "string") {
    throw new Error("Invalid password provided. Must be a non-empty string.");
  }

  // Use bcrypt to hash the password
  const salt = await bcrypt.genSalt(10); // Adjust salt rounds as needed
  const hashedPassword = await bcrypt.hash(password, salt);

  return hashedPassword;
}

async function comparePassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  if (
    !password ||
    typeof password !== "string" ||
    !hashedPassword ||
    typeof hashedPassword !== "string"
  ) {
    throw new Error(
      "Invalid password or hashed password provided. Both must be non-empty strings.",
    );
  }

  // Use bcrypt to compare the password with the hashed password
  const isMatch = await bcrypt.compare(password, hashedPassword);

  return isMatch;
}

export { passwordHashingHelper, comparePassword, generateToken };
