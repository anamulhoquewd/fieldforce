"use client"

import { TaskDetailSheet } from "@/components/worker/task-detail-sheet"
import { useUser } from "@/context/authContext"
import useTasks from "@/hooks/dashboard/tasks/useTasks"
import { ITask, TaskStatus } from "@/interfaces"
import { ChevronRight, Clock, MapPin } from "lucide-react"
import { useEffect, useState } from "react"
import { io } from "socket.io-client"

function getInitials(name?: string) {
  if (!name) return "?"
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("")
}

const statusLabel: Record<TaskStatus, string> = {
  pending: "Pending",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
}

const statusBadge: Record<TaskStatus, string> = {
  pending: "bg-yellow-100 text-yellow-600",
  in_progress: "bg-blue-100 text-blue-600",
  completed: "bg-green-100 text-green-600",
  cancelled: "bg-gray-100 text-gray-500",
}

const statusDot: Record<TaskStatus, string> = {
  pending: "#EAB308",
  in_progress: "#3B82F6",
  completed: "#22C55E",
  cancelled: "#9CA3AF",
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

function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  })
}

export default function WorkerTasksPage() {
  const { tasks, setTasks, loading } = useTasks()
  const { user } = useUser()
  const [selectedTask, setSelectedTask] = useState<ITask | null>(null)

  const completedCount = tasks.filter((t) => t.status === "completed").length
  const inProgressCount = tasks.filter((t) => t.status === "in_progress").length
  const totalCount = tasks.length

  const handleStatusUpdate = (taskId: string, updated: ITask) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)))
    setSelectedTask(updated)
  }

  useEffect(() => {
    const socket = io(
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8000",
      {
        withCredentials: true,
      }
    )

    let watchId: number | null = null

    if (typeof navigator !== "undefined" && "geolocation" in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          socket.emit("location-update", { latitude, longitude })
        },
        (error) => {
          console.error("Geolocation error:", error)
        },
        {
          enableHighAccuracy: true,
          maximumAge: 5000,
          timeout: 10000,
        }
      )
    } else {
      console.warn("Geolocation is not available in this browser.")
    }

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId)
      }
      socket.disconnect()
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 border-b border-gray-200 bg-white px-4 py-4 md:px-8 md:py-6">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 md:text-2xl">
              My tasks
            </h1>
            <p className="text-sm text-gray-500">
              {formatDate(new Date())} · {inProgressCount} in progress
            </p>
          </div>
          {user?.name && (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-200 text-sm font-bold text-blue-700">
              {getInitials(user.name)}
            </div>
          )}
        </div>

        {/* Progress bar: completed / total */}
        <div className="h-1 w-full rounded-full bg-gray-200">
          <div
            className="h-1 rounded-full bg-teal-500 transition-all"
            style={{
              width: totalCount
                ? `${(completedCount / totalCount) * 100}%`
                : "0%",
            }}
          />
        </div>
        <p className="mt-1 text-right text-xs text-gray-400">
          {completedCount}/{totalCount} done
        </p>
      </div>

      {/* Task list */}
      <div className="max-w-2xl px-4 py-4 pb-20 md:px-8 md:py-6">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-lg bg-gray-200"
              />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <p className="py-12 text-center text-sm text-gray-400">
            No tasks assigned to you.
          </p>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <button
                key={task.id}
                onClick={() => setSelectedTask(task)}
                className="block w-full text-left"
              >
                <div className="rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md">
                  <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <div
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ backgroundColor: statusDot[task.status] }}
                        />
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge[task.status]}`}
                        >
                          {statusLabel[task.status]}
                        </span>
                        <span className="ml-auto text-xs text-gray-400">
                          #{task.id.slice(0, 6).toUpperCase()}
                        </span>
                      </div>

                      <h3 className="mb-2 text-sm font-semibold text-gray-900">
                        {task.title}
                      </h3>

                      {task.latitude && task.longitude && (
                        <div className="mb-1 flex items-start gap-2 text-xs text-gray-500">
                          <MapPin size={13} className="mt-0.5 shrink-0" />
                          <span>
                            {task.latitude.toFixed(4)},{" "}
                            {task.longitude.toFixed(4)}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock size={13} className="shrink-0" />
                        <span>{formatDeadline(task.deadline)}</span>
                      </div>
                    </div>

                    <ChevronRight
                      className="mt-1 shrink-0 text-gray-400"
                      size={20}
                    />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Full-screen task detail sheet */}
      <TaskDetailSheet
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  )
}
