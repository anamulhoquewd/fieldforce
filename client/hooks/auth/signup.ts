import api from "@/lib/api"
import { getRoleHome, setRoleCookie } from "@/lib/auth-role"
import { handleAxiosError } from "@/lib/utils"
import { signupSchema, SignupValues } from "@/validations/zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import type { Resolver } from "react-hook-form"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

function useSignup() {
  const router = useRouter()

  const form = useForm<SignupValues>({
    resolver: zodResolver(
      signupSchema as unknown as any
    ) as unknown as Resolver<SignupValues, any>,
    defaultValues: { name: "", email: "", organizationName: "", password: "" },
  })

  async function handleSubmit(values: SignupValues) {
    try {
      const response = await api.post("/auth/signup", values)
      if (!response.data.success) {
        throw new Error(response.data?.error?.message || "Login failed")
      }

      form.reset({
        name: "",
        email: "",
        organizationName: "",
        password: "",
      })

      setRoleCookie("manager")
      router.push(getRoleHome("manager"))
    } catch (error: any) {
      handleAxiosError(error)

      toast.error("User creation failed!")
      if (error.response && error.response.data) {
        const res = error.response.data

        if (res.fields) {
          // Set form errors
          res.fields.forEach((field: { name: string; message: string }) => {
            form.setError(field.name as "email" | "password", {
              message: field.message,
            })
          })
        }
      }
    }
  }

  return { handleSubmit, form }
}

export default useSignup
