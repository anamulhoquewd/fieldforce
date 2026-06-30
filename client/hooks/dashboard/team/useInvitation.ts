import { useUser } from "@/context/authContext"
import { IInvitation } from "@/interfaces"
import api from "@/lib/api"
import { handleAxiosError } from "@/lib/utils"
import {
  acceptInvitationSchema,
  AcceptInvitationValues,
  inviteMemberSchema,
  InviteMemberValues,
} from "@/validations/zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/router"
import { useCallback, useEffect, useState } from "react"
import { Resolver, useForm } from "react-hook-form"
import { toast } from "sonner"

const useInvitation = (token: string | null) => {
  const [invitations, setInvitations] = useState<IInvitation[]>([])
  const [loading, setLoading] = useState(true)
  const [invitationOpen, setInvitationOpen] = useState(false)

  const router = useRouter()
  const { refresh } = useUser()

  const registerForm = useForm<InviteMemberValues>({
    resolver: zodResolver(
      inviteMemberSchema as unknown as any
    ) as unknown as Resolver<InviteMemberValues, any>,
    defaultValues: { email: "" },
  })

  const acceptingForm = useForm<AcceptInvitationValues>({
    resolver: zodResolver(
      acceptInvitationSchema as unknown as any
    ) as unknown as Resolver<AcceptInvitationValues, any>,
    defaultValues: { name: "", password: "" },
  })

  const loadInvitations = useCallback(async () => {
    setLoading(true)
    try {
      const response = await api.get("/invitations")
      if (!response.data.success) {
        toast.error("Invitations fetching failed")
        return
      }
      setInvitations(response.data.data)
    } catch (error: any) {
      toast.error("Invitations fetching failed")
      handleAxiosError(error)
    } finally {
      setLoading(false)
    }
  }, [])

  async function handleAcceptSubmit(values: AcceptInvitationValues) {
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

      acceptingForm.reset({ name: "", password: "" })
      await refresh()

      toast.success("Welcome to FieldForce!")

      const role = response.data.data.role as "manager" | "worker"
      router.push(role === "manager" ? "/dashboard" : "/")
    } catch (error: any) {
      handleAxiosError(error)

      if (error.response?.data?.fields) {
        error.response.data.fields.forEach(
          (field: { name: string; message: string }) => {
            acceptingForm.setError(field.name as keyof AcceptInvitationValues, {
              message: field.message,
            })
          }
        )
      }
    }
  }

  async function handleRegisterSubmit(values: InviteMemberValues) {
    try {
      const response = await api.post("/invitations/register", values)
      if (!response.data.success) {
        toast.error("Failed to send invitation")
        registerForm.setError("email", {
          type: "manual",
          message: "Failed to send invitation",
        })
        return
      }

      registerForm.reset({ email: "" })
      toast.success("Invitation sent")
      setInvitationOpen(false)
    } catch (error: any) {
      const err = handleAxiosError(error)
      registerForm.setError("email", {
        type: "manual",
        message: err.message || "An error occurred",
      })
    }
  }

  useEffect(() => {
    // Defer calling loadInvitations to avoid synchronous setState during render/effect
    // which can cause cascading renders. Use a microtask to call it asynchronously.
    Promise.resolve().then(loadInvitations)
  }, [loadInvitations])

  return {
    invitations,
    setInvitations,
    loading,
    refresh: loadInvitations,
    handleAcceptSubmit,
    handleRegisterSubmit,
    registerForm,
    acceptingForm,
    invitationOpen,
    setInvitationOpen,
  }
}

export default useInvitation
