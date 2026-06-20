import { IWorker } from "@/interfaces"
import api from "@/lib/api"
import { handleAxiosError } from "@/lib/utils"
import { useEffect, useState } from "react"

const useWorkers = () => {
  const [workers, setWorkers] = useState<IWorker[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get("/memberships/workers")
        if (response.data.success) {
          setWorkers(response.data.data)
        }
      } catch (error: any) {
        handleAxiosError(error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return { workers, loading }
}

export default useWorkers
