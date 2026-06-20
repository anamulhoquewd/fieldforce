import z from "zod";

export const zPasswordReset = z.object({
  password: z.string().min(8).max(20),
});

export const zResetToken = z.object({
  resetToken: z.string().length(128, "Invalid reset token format"),
});

export const passwordResetTokens = new Map<string, string>();

// Bangladesh phone regex (local format like 017xxxxxxxx)
export const BDPhoneRegex = /^01[3-9]\d{8}$/;

export const moneyz = z.coerce.number().min(0, "Amount cannot be negative");

export const zSignin = z.object({
  email: z.email(),
  password: z.string().min(6).max(20),
});
export type ISignin = z.infer<typeof zSignin>;

export const zUserSchema = z.object({
  name: z.string().min(3).max(225),
  email: z.email(),
  password: z.string().min(6).max(20),
  organizationName: z.string().min(1),
});

export const zChangePassword = z
  .object({
    currentPassword: z.string().min(8).max(20),
    newPassword: z.string().min(8).max(20),
    confirmPassword: z.string().min(8).max(20),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type TChangePassword = z.infer<typeof zChangePassword>;

export const zForgotPassword = z.object({
  email: z.email(),
});
export type TForgotPassword = z.infer<typeof zForgotPassword>;

export type TUser = z.infer<typeof zUserSchema>;


export const zTasks = z.object({
  organizationId: z.string(),
  title: z.string(),
  description: z.string().optional().default(""),
  creatorId: z.string(),
  assignedTo: z.string().optional(),
  status: z.enum(["pending", "in_progress", "completed"]).default("pending"),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  deadline: z.coerce.date().optional(),
});

export type TTasks = z.infer<typeof zTasks>;
