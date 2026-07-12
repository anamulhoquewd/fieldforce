import api from "@/lib/api"
import { getRoleHome, setRoleCookie, type UserRole } from "@/lib/auth-role"
import { handleAxiosError } from "@/lib/utils"
import { acceptInvitationSchema, type AcceptInvitationValues } from "@/validations/zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import type { Resolver } from "react-hook-form"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

function useAcceptInvitation(token: string | null) {
  const router = useRouter()

  const form = useForm<AcceptInvitationValues>({
    resolver: zodResolver(
      acceptInvitationSchema as unknown as any
    ) as unknown as Resolver<AcceptInvitationValues, any>,
    defaultValues: { name: "", password: "" },
  })

  async function handleSubmit(values: AcceptInvitationValues) {
    if (!token) {
      toast.error("Missing invitation token")
      return
    }

    try {
      const response = await api.post("/invitations/accept", {
        token,
        ...values,
      })

      if (!response.data.success) {
        throw new Error(response.data?.error?.message || "Accept failed")
      }

      form.reset({ name: "", password: "" })

      const role = response.data.data.role as UserRole
      setRoleCookie(role)
      router.push(getRoleHome(role))
    } catch (error: any) {
      handleAxiosError(error)

      toast.error("Could not accept invitation!")
      if (error.response && error.response.data) {
        const res = error.response.data

        if (res.fields) {
          res.fields.forEach((field: { name: string; message: string }) => {
            form.setError(field.name as "name" | "password", {
              message: field.message,
            })
          })
        }
      }
    }
  }

  return { handleSubmit, form }
}

export default useAcceptInvitation
