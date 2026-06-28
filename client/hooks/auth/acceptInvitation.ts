import { useUser } from "@/context/authContext"
import api from "@/lib/api"
import { handleAxiosError } from "@/lib/utils"
import {
  acceptInvitationSchema,
  AcceptInvitationValues,
} from "@/validations/zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import type { Resolver } from "react-hook-form"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

function useAcceptInvitation(token: string | null) {
  const router = useRouter()
  const { refresh } = useUser()

  const form = useForm<AcceptInvitationValues>({
    resolver: zodResolver(
      acceptInvitationSchema as unknown as any
    ) as unknown as Resolver<AcceptInvitationValues, any>,
    defaultValues: { name: "", password: "" },
  })

  async function handleSubmit(values: AcceptInvitationValues) {
    if (!token) {
      toast.error("Invalid invitation link")
      return
    }

    try {
      const response = await api.post("/invitations/accept", {
        ...values,
        token,
      })

      if (!response.data.success) {
        throw new Error(
          response.data?.error?.message || "Failed to accept invitation"
        )
      }

      form.reset({ name: "", password: "" })
      await refresh()

      toast.success("Welcome to FieldForce!")

      const role = response.data.data.role as "manager" | "worker"
      router.push(role === "manager" ? "/dashboard" : "/")
    } catch (error: any) {
      handleAxiosError(error)

      if (error.response?.data?.fields) {
        error.response.data.fields.forEach(
          (field: { name: string; message: string }) => {
            form.setError(field.name as keyof AcceptInvitationValues, {
              message: field.message,
            })
          }
        )
      }
    }
  }

  return { form, handleSubmit }
}

export default useAcceptInvitation
