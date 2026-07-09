"use client"

import { Button } from "@/components/ui/button"
import usePatchTask from "@/hooks/dashboard/tasks/usePatchTask"
import useWorkers from "@/hooks/useWorkers"
import { ITask, TaskStatus } from "@/interfaces"
import { cn } from "@/lib/utils"
import {
  Calendar,
  Clock,
  ExternalLink,
  Loader2,
  MapPin,
  User,
  X,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"

interface ManagerTaskPanelProps {
  task: ITask | null
  onClose: () => void
  onTaskUpdated: (taskId: string, updated: ITask) => void
}

const statusOptions: { value: TaskStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
]

const statusDot: Record<TaskStatus, string> = {
  pending: "bg-yellow-400",
  in_progress: "bg-blue-500",
  completed: "bg-green-500",
  cancelled: "bg-gray-400",
}

function formatDate(iso: string | null) {
  if (!iso) return "—"
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export function ManagerTaskPanel({
  task,
  onClose,
  onTaskUpdated,
}: ManagerTaskPanelProps) {
  return (
    <ManagerTaskPanelContent
      key={task?.id ?? "empty"}
      task={task}
      onClose={onClose}
      onTaskUpdated={onTaskUpdated}
    />
  )
}

function ManagerTaskPanelContent({
  task,
  onClose,
  onTaskUpdated,
}: ManagerTaskPanelProps) {
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus>(
    task?.status ?? "pending"
  )
  const [selectedWorker, setSelectedWorker] = useState<string>(
    task?.assignedTo ?? ""
  )
  const { patchTask, saving } = usePatchTask()
  const { workers } = useWorkers()

  const handleSave = async () => {
    if (!task) return

    const updates: Record<string, unknown> = {}
    if (selectedStatus !== task.status) updates.status = selectedStatus
    if (selectedWorker !== (task.assignedTo ?? "")) {
      updates.assignedTo = selectedWorker || null
    }

    if (Object.keys(updates).length === 0) {
      toast.info("No changes to save")
      return
    }

    const patched = await patchTask(task.id, updates)
    if (!patched) return

    const updatedWorker =
      updates.assignedTo != null
        ? (workers.find((w) => w.id === updates.assignedTo) ?? null)
        : updates.assignedTo === null
          ? null
          : task.assignedWorker

    const merged: ITask = {
      ...task,
      ...patched,
      assignedWorker: updatedWorker,
      creator: task.creator,
      organization: task.organization,
    }

    onTaskUpdated(task.id, merged)
  }

  const isDirty =
    task != null &&
    (selectedStatus !== task.status ||
      selectedWorker !== (task.assignedTo ?? ""))

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-30 bg-black/20 transition-opacity duration-300",
          task ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
      />

      {/* Panel */}
      <aside
        className={cn(
          "fixed top-0 right-0 z-40 flex h-full w-105 flex-col bg-background shadow-2xl transition-transform duration-300",
          task ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border px-6 py-5">
          <div className="min-w-0 pr-4">
            <div className="mb-1 flex items-center gap-2">
              <span
                className={cn(
                  "inline-block h-2 w-2 rounded-full",
                  task ? statusDot[task.status] : "bg-gray-300"
                )}
              />
              <span className="text-xs font-medium text-muted-foreground">
                #{task?.id.slice(0, 8).toUpperCase()}
              </span>
            </div>
            <h2 className="text-base leading-snug font-semibold text-foreground">
              {task?.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
          {/* Editable: Status */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as TaskStatus)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {statusOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* Editable: Assignee */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Assigned worker
            </label>
            <select
              value={selectedWorker}
              onChange={(e) => setSelectedWorker(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">— Unassigned —</option>
              {workers.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.email})
                </option>
              ))}
            </select>
          </div>

          {/* Divider */}
          <hr className="border-border" />

          {/* Read-only info */}
          <div className="space-y-4">
            {/* Description */}
            {task?.description && (
              <div>
                <p className="mb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Description
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {task.description}
                </p>
              </div>
            )}

            {/* Deadline */}
            <div className="flex gap-3">
              <Clock
                size={16}
                className="mt-0.5 shrink-0 text-muted-foreground"
              />
              <div>
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Deadline
                </p>
                <p className="text-sm text-foreground">
                  {formatDate(task?.deadline ?? null)}
                </p>
              </div>
            </div>

            {/* Location */}
            {task?.latitude && task?.longitude && (
              <div className="flex gap-3">
                <MapPin
                  size={16}
                  className="mt-0.5 shrink-0 text-muted-foreground"
                />
                <div>
                  <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Location
                  </p>
                  <p className="text-sm text-foreground">
                    {task.latitude.toFixed(5)}, {task.longitude.toFixed(5)}
                  </p>
                  <Link
                    href={`https://www.google.com/maps?q=${task.latitude},${task.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-0.5 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                  >
                    View on map <ExternalLink size={10} />
                  </Link>
                </div>
              </div>
            )}

            {/* Created by */}
            <div className="flex gap-3">
              <User
                size={16}
                className="mt-0.5 shrink-0 text-muted-foreground"
              />
              <div>
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Created by
                </p>
                <p className="text-sm text-foreground">
                  {task?.creator?.name ?? "—"}
                </p>
              </div>
            </div>

            {/* Created at */}
            <div className="flex gap-3">
              <Calendar
                size={16}
                className="mt-0.5 shrink-0 text-muted-foreground"
              />
              <div>
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Created
                </p>
                <p className="text-sm text-foreground">
                  {formatDate(task?.createdAt ?? null)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t border-border px-6 py-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !isDirty}
            className="flex-1 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" />
                Saving…
              </span>
            ) : (
              "Save changes"
            )}
          </Button>
        </div>
      </aside>
    </>
  )
}
