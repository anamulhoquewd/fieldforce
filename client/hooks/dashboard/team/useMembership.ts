import { IMembership } from "@/interfaces"
import api from "@/lib/api"
import { handleAxiosError } from "@/lib/utils"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

const useMembership = (type: "worker" | "manager" = "worker") => {
  const [memberships, setMembership] = useState<IMembership[]>([])
  const [loading, setLoading] = useState(true)

  const loadMemberships = useCallback(async (type: "manager" | "worker") => {
    setLoading(true)
    try {
      const response = await api.get(`/memberships/${type}s`)
      if (!response.data.success) {
        toast.error("Memberships fetching failed")
        return
      }
      setMembership(response.data.data)
    } catch (error: any) {
      toast.error("Memberships fetching failed")
      handleAxiosError(error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMemberships(type)
  }, [loadMemberships, type])

  return {
    memberships,
    setMembership,
    loading,
    refresh: () => loadMemberships(type),
  }
}

export default useMembership
