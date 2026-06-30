import { ITask } from "@/interfaces"
import api from "@/lib/api"
import { handleAxiosError } from "@/lib/utils"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

const useTasks = () => {
  const [tasks, setTasks] = useState<ITask[]>([])
  const [loading, setLoading] = useState(true)

  const loadTasks = useCallback(async () => {
    setLoading(true)
    try {
      const response = await api.get("/tasks/list")
      if (!response.data.success) {
        toast.error("Tasks fetching failed")
        return
      }
      setTasks(response.data.data)
    } catch (error: any) {
      toast.error("Tasks fetching failed")
      handleAxiosError(error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    Promise.resolve().then(loadTasks)
  }, [loadTasks])

  return { tasks, setTasks, loading, refresh: loadTasks }
}

export default useTasks
