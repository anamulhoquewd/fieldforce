import { IInvitation } from "@/interfaces"
import api from "@/lib/api"
import { handleAxiosError } from "@/lib/utils"
import { inviteMemberSchema, InviteMemberValues } from "@/validations/zod"
import { zodResolver } from "@hookform/resolvers/zod"
import type { Resolver } from "react-hook-form"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

function useCreateInvitation(onInvited: (invitation: IInvitation) => void) {
  const form = useForm<InviteMemberValues>({
    resolver: zodResolver(
      inviteMemberSchema as unknown as any
    ) as unknown as Resolver<InviteMemberValues, any>,
    defaultValues: { email: "" },
  })

  async function handleSubmit(values: InviteMemberValues) {
    if (form.formState.isSubmitting) return

    try {
      const response = await api.post("/invitations/register", values)
      if (!response.data.success) {
        toast.error("Failed to send invitation")
        form.setError("email", {
          type: "manual",
          message: "Failed to send invitation",
        })
        return
      }

      form.reset({ email: "" })
      toast.success("Invitation sent")
      onInvited(response.data.data.invitation as IInvitation)
    } catch (error: any) {
      const err = handleAxiosError(error)
      form.setError("email", {
        type: "manual",
        message: err.message || "An error occurred",
      })
    }
  }

  return { form, handleSubmit }
}

export default useCreateInvitation
