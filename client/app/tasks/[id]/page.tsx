"use client"

import { TaskMap } from "@/components/worker/task-map"
import { Button } from "@/components/ui/button"
import { ITask, TaskStatus } from "@/interfaces"
import useTasks from "@/hooks/dashboard/tasks/useTasks"
import useUpdateTaskStatus from "@/hooks/useUpdateTaskStatus"
import { ArrowLeft, Clock, MapPin, Navigation, User } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

const statusLabel: Record<TaskStatus, string> = {
  pending: "Pending",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
}

const statusColor: Record<TaskStatus, string> = {
  pending: "#EAB308",
  in_progress: "#3B82F6",
  completed: "#22C55E",
  cancelled: "#9CA3AF",
}

const nextStatus: Partial<Record<TaskStatus, TaskStatus>> = {
  pending: "in_progress",
  in_progress: "completed",
  completed: "pending",
}

const actionLabel: Partial<Record<TaskStatus, string>> = {
  pending: "Start task",
  in_progress: "Mark as done",
  completed: "Reopen",
}

function formatDeadline(deadline: string | null) {
  if (!deadline) return "No deadline"
  const d = new Date(deadline)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  const isTomorrow =
    d.toDateString() === new Date(now.getTime() + 86400000).toDateString()
  const time = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })
  if (isToday) return `Today, ${time}`
  if (isTomorrow) return `Tomorrow, ${time}`
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export default function TaskDetailPage() {
  const params = useParams()
  const router = useRouter()
  const taskId = params.id as string
  const { tasks, loading } = useTasks()
  const { updateStatus, loading: updating } = useUpdateTaskStatus()
  const [task, setTask] = useState<ITask | null>(null)

  useEffect(() => {
    if (!loading && tasks.length > 0) {
      const found = tasks.find((t) => t.id === taskId) ?? null
      setTask(found)
    }
  }, [tasks, loading, taskId])

  const handleStatusAction = async () => {
    if (!task) return
    const next = nextStatus[task.status]
    if (!next) return
    const updated = await updateStatus(task.id, next)
    if (updated) setTask({ ...task, ...updated })
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" />
      </div>
    )
  }

  if (!task) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Task not found.</p>
      </div>
    )
  }

  const coords: [number, number] | null =
    task.latitude && task.longitude ? [task.latitude, task.longitude] : null

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky header */}
      <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 md:hidden">
        <button
          onClick={() => router.back()}
          className="rounded-lg p-1 hover:bg-gray-100"
        >
          <ArrowLeft size={24} className="text-gray-700" />
        </button>
        <div>
          <h1 className="font-semibold text-gray-900">{task.title}</h1>
          <p className="text-xs text-gray-400">
            #{task.id.slice(0, 8).toUpperCase()}
          </p>
        </div>
      </div>

      {/* Map */}
      {coords ? (
        <div className="h-64 w-full md:h-96">
          <TaskMap coordinates={coords} title={task.title} />
        </div>
      ) : (
        <div className="flex h-40 w-full items-center justify-center bg-gray-100">
          <span className="text-sm text-gray-400">No location set</span>
        </div>
      )}

      {/* Content */}
      <div className="px-4 py-4 md:px-8 md:py-6">
        {/* Status + code */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: statusColor[task.status] }}
            />
            <span
              className="text-sm font-semibold"
              style={{ color: statusColor[task.status] }}
            >
              {statusLabel[task.status]}
            </span>
          </div>
          <span className="text-xs font-medium text-gray-400">
            #{task.id.slice(0, 8).toUpperCase()}
          </span>
        </div>

        {/* Title */}
        <h1 className="mb-6 text-2xl font-bold text-gray-900 md:text-3xl">
          {task.title}
        </h1>

        {/* Meta */}
        <div className="mb-8 space-y-4">
          {coords && (
            <div className="flex gap-4">
              <MapPin size={20} className="mt-1 shrink-0 text-gray-400" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Location
                </p>
                <p className="font-medium text-gray-900">
                  {task.latitude?.toFixed(5)}, {task.longitude?.toFixed(5)}
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <Clock size={20} className="mt-1 shrink-0 text-gray-400" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Deadline
              </p>
              <p className="font-medium text-gray-900">
                {formatDeadline(task.deadline)}
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <User size={20} className="mt-1 shrink-0 text-gray-400" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Assigned by
              </p>
              <p className="font-medium text-gray-900">
                {task.creator?.name ?? "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <div className="mb-8">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Description
            </p>
            <p className="leading-relaxed text-gray-700">{task.description}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex max-w-lg gap-3">
          {nextStatus[task.status] && (
            <Button
              onClick={handleStatusAction}
              disabled={updating}
              className="flex-1 bg-teal-500 py-3 font-medium text-white hover:bg-teal-600 disabled:opacity-60"
            >
              {actionLabel[task.status]}
            </Button>
          )}
          {coords && (
            <Button
              variant="outline"
              className="flex-1 border-gray-300 py-3 font-medium text-teal-600 hover:bg-gray-50"
              onClick={() =>
                window.open(
                  `https://www.google.com/maps/dir/?api=1&destination=${task.latitude},${task.longitude}`,
                  "_blank"
                )
              }
            >
              <Navigation size={18} className="mr-2" />
              Navigate
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
