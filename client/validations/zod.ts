import { z } from "zod"

export const signupSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.email("Enter a valid work email"),
  organizationName: z
    .string()
    .min(2, "Company name must be at least 2 characters"),
  password: z.string().min(6, "Password must be at least 8 characters").max(20),
})
export type SignupValues = z.infer<typeof signupSchema>

export const singinSchema = z.object({
  email: z.email(),
  password: z.string().min(6, "Password must be at least 8 characters").max(20),
})
export type SigninValues = z.infer<typeof singinSchema>

export const acceptInvitationSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(20, "Password must be at most 20 characters"),
})
export type AcceptInvitationValues = z.infer<typeof acceptInvitationSchema>

export const inviteMemberSchema = z.object({
  email: z.email("Invalid email address"),
})
export type InviteMemberValues = z.infer<typeof inviteMemberSchema>

export const zTasks = z.object({
  id: z.string(),
  organizationId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  creatorId: z.string(),
  assignedTo: z.string().optional(),
  status: z.enum(["pending", "in_progress", "completed"]).default("pending"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  deadline: z.date().optional(),
})

export type TTasks = z.infer<typeof zTasks>
