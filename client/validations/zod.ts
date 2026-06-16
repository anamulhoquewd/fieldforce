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
