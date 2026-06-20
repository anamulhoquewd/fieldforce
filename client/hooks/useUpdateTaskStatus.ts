import { ITask, TaskStatus } from "@/interfaces"
import api from "@/lib/api"
import { handleAxiosError } from "@/lib/utils"
import { useState } from "react"
import { toast } from "sonner"

const useUpdateTaskStatus = () => {
  const [loading, setLoading] = useState(false)

  const updateStatus = async (
    taskId: string,
    status: TaskStatus
  ): Promise<ITask | null> => {
    setLoading(true)
    try {
      const response = await api.patch(`/tasks/${taskId}/status`, { status })
      if (!response.data.success) {
        toast.error("Failed to update task status")
        return null
      }
      toast.success("Status updated")
      return response.data.data as ITask
    } catch (error: any) {
      handleAxiosError(error)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { updateStatus, loading }
}

export default useUpdateTaskStatus
