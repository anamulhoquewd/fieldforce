import { IWorker } from "@/interfaces"
import api from "@/lib/api"
import { handleAxiosError } from "@/lib/utils"
import { useEffect, useState } from "react"

const useWorkers = () => {
  const [workers, setWorkers] = useState<IWorker[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const response = await api.get("/memberships?type=worker")
      if (response.status === 200 && response.data.success) {
        setWorkers(response.data.data)
      }
    } catch (error: any) {
      handleAxiosError(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    Promise.resolve().then(load)
  }, [])

  return { workers, loading, setWorkers, refresh: load }
}

export default useWorkers
