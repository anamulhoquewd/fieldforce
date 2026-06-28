import { IInvitation } from "@/interfaces"
import api from "@/lib/api"
import { handleAxiosError } from "@/lib/utils"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

const useInvitation = () => {
  const [invitations, setInvitations] = useState<IInvitation[]>([])
  const [loading, setLoading] = useState(true)

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

  useEffect(() => {
    loadInvitations()
  }, [loadInvitations])

  return { invitations, setInvitations, loading, refresh: loadInvitations }
}

export default useInvitation
