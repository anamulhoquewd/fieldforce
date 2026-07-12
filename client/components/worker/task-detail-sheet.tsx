"use client"

import { ITask, TaskStatus } from "@/interfaces"
import useUpdateTaskStatus from "@/hooks/useUpdateTaskStatus"
import { TaskMap } from "@/components/worker/task-map"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ArrowLeft, Clock, MapPin, Navigation, User } from "lucide-react"
import { useEffect, useState } from "react"

interface TaskDetailSheetProps {
  task: ITask | null
  onClose: () => void
  onStatusUpdate: (taskId: string, updated: ITask) => void
}

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
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export function TaskDetailSheet({
  task,
  onClose,
  onStatusUpdate,
}: TaskDetailSheetProps) {
  const [visible, setVisible] = useState(false)
  const { updateStatus, loading } = useUpdateTaskStatus()

  // Slide in on mount
  useEffect(() => {
    if (task) {
      requestAnimationFrame(() => setVisible(true))
    }
  }, [task])

  // Lock body scroll while sheet is open
  useEffect(() => {
    if (task) {
      document.body.style.overflow = "hidden"
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [task])

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 300)
  }

  const handleStatusAction = async () => {
    if (!task) return
    const next = nextStatus[task.status]
    if (!next) return
    const updated = await updateStatus(task.id, next)
    if (updated) {
      onStatusUpdate(task.id, { ...task, ...updated })
    }
  }

  if (!task) return null

  const coords: [number, number] | null =
    task.latitude && task.longitude ? [task.latitude, task.longitude] : null

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex flex-col bg-background transition-transform duration-300 ease-out",
        visible ? "translate-y-0" : "translate-y-full"
      )}
    >
      {/* Sticky header with back button */}
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background px-4 py-3">
        <button
          onClick={handleClose}
          className="rounded-lg p-1 hover:bg-muted"
          aria-label="Go back"
        >
          <ArrowLeft size={24} className="text-foreground" />
        </button>
        <div className="min-w-0">
          <h1 className="truncate font-semibold text-foreground">
            {task.title}
          </h1>
          <p className="text-xs text-muted-foreground">
            {task.organization?.name ?? ""}
          </p>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pb-6">
        {/* Map */}
        {coords ? (
          <div className="h-56 w-full md:h-72">
            <TaskMap coordinates={coords} title={task.title} />
          </div>
        ) : (
          <div className="flex h-40 w-full items-center justify-center bg-muted">
            <span className="text-sm text-muted-foreground">
              No location set
            </span>
          </div>
        )}

        {/* Status + code */}
        <div className="flex items-center justify-between px-4 pt-5">
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
          <span className="text-xs font-medium text-muted-foreground">
            #{task.id.slice(0, 8).toUpperCase()}
          </span>
        </div>

        {/* Title */}
        <h2 className="px-4 pt-3 text-2xl font-bold">{task.title}</h2>

        {/* Meta details */}
        <div className="mt-6 space-y-4 px-4">
          {coords && (
            <div className="flex gap-4">
              <MapPin
                size={20}
                className="mt-0.5 shrink-0 text-muted-foreground"
              />
              <div>
                <p className="text-xs font-semibold tracking-wide text-foreground uppercase">
                  Location
                </p>
                <p className="font-medium text-foreground">
                  {task.latitude?.toFixed(5)}, {task.longitude?.toFixed(5)}
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <Clock
              size={20}
              className="mt-0.5 shrink-0 text-muted-foreground"
            />
            <div>
              <p className="text-xs font-semibold tracking-wide text-foreground uppercase">
                Deadline
              </p>
              <p className="font-medium text-muted-foreground">
                {formatDeadline(task.deadline)}
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <User size={20} className="mt-0.5 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-xs font-semibold tracking-wide text-foreground uppercase">
                Assigned by
              </p>
              <p className="font-medium text-muted-foreground">
                {task.creator?.name ?? "-"}
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <div className="mt-6 px-4">
            <p className="mb-2 text-xs font-semibold tracking-wide text-foreground uppercase">
              Description
            </p>
            <p className="leading-relaxed text-foreground">
              {task.description}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 flex gap-3 px-4">
          {nextStatus[task.status] && (
            <Button
              onClick={handleStatusAction}
              disabled={loading}
              className="flex-1 bg-primary py-3 font-medium text-background hover:bg-primary/80 disabled:opacity-60"
            >
              {actionLabel[task.status]}
            </Button>
          )}
          {coords && (
            <Button
              variant="outline"
              className="flex-1 border-border py-3 font-medium text-primary hover:bg-muted"
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
