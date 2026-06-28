import { ITask } from "@/interfaces"
import api from "@/lib/api"
import { handleAxiosError } from "@/lib/utils"
import { useState } from "react"
import { toast } from "sonner"

function usePatchTask() {
  const [saving, setSaving] = useState(false)

  async function patchTask(
    taskId: string,
    updates: Record<string, unknown>
  ): Promise<ITask | null> {
    setSaving(true)
    try {
      const res = await api.patch(`/tasks/${taskId}`, updates)
      if (!res.data.success) {
        toast.error("Failed to update task")
        return null
      }
      toast.success("Task updated")
      return res.data.data as ITask
    } catch (err) {
      handleAxiosError(err)
      return null
    } finally {
      setSaving(false)
    }
  }

  return { patchTask, saving }
}

export default usePatchTask
