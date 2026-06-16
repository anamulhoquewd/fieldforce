import api from "@/lib/api"
import { handleAxiosError } from "@/lib/utils"
import { SigninValues, singinSchema } from "@/validations/zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import type { Resolver } from "react-hook-form"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

function useSignin() {
  const router = useRouter()

  const form = useForm<SigninValues>({
    resolver: zodResolver(
      singinSchema as unknown as any
    ) as unknown as Resolver<SigninValues, any>,
    defaultValues: { email: "", password: "" },
  })

  async function handleSubmit(values: SigninValues) {
    try {
      const response = await api.post("/auth/signin", values)
      if (!response.data.success) {
        throw new Error(response.data?.error?.message || "Login failed")
      }

      form.reset({
        email: "",
        password: "",
      })

      router.push("/dashboard")
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

export default useSignin
