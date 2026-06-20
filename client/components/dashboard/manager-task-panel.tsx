"use client"

import { ITask, TaskStatus } from "@/interfaces"
import useWorkers from "@/hooks/useWorkers"
import api from "@/lib/api"
import { handleAxiosError } from "@/lib/utils"
import { cn } from "@/lib/utils"
import {
  X,
  MapPin,
  Clock,
  User,
  Calendar,
  Loader2,
  ExternalLink,
} from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

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
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus>("pending")
  const [selectedWorker, setSelectedWorker] = useState<string>("")
  const [saving, setSaving] = useState(false)
  const { workers } = useWorkers()

  // Sync local state when a different task is selected
  useEffect(() => {
    if (task) {
      setSelectedStatus(task.status)
      setSelectedWorker(task.assignedTo ?? "")
    }
  }, [task])

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

    setSaving(true)
    try {
      const res = await api.patch(`/tasks/${task.id}`, updates)
      if (!res.data.success) {
        toast.error("Failed to update task")
        return
      }
      // The patch endpoint doesn't re-fetch relations; merge locally
      const updatedWorker =
        updates.assignedTo != null
          ? workers.find((w) => w.id === updates.assignedTo) ?? null
          : updates.assignedTo === null
            ? null
            : task.assignedWorker

      const merged: ITask = {
        ...task,
        ...res.data.data,
        assignedWorker: updatedWorker,
        creator: task.creator,
        organization: task.organization,
      }

      toast.success("Task updated")
      onTaskUpdated(task.id, merged)
    } catch (err: any) {
      handleAxiosError(err)
    } finally {
      setSaving(false)
    }
  }

  const isDirty =
    task != null &&
    (selectedStatus !== task.status || selectedWorker !== (task.assignedTo ?? ""))

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
          "fixed right-0 top-0 z-40 flex h-full w-105 flex-col bg-white shadow-2xl transition-transform duration-300",
          task ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
          <div className="min-w-0 pr-4">
            <div className="mb-1 flex items-center gap-2">
              <span
                className={cn(
                  "inline-block h-2 w-2 rounded-full",
                  task ? statusDot[task.status] : "bg-gray-300"
                )}
              />
              <span className="text-xs font-medium text-gray-500">
                #{task?.id.slice(0, 8).toUpperCase()}
              </span>
            </div>
            <h2 className="text-base font-semibold text-gray-900 leading-snug">
              {task?.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Editable: Status */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as TaskStatus)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
              Assigned worker
            </label>
            <select
              value={selectedWorker}
              onChange={(e) => setSelectedWorker(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <hr className="border-gray-100" />

          {/* Read-only info */}
          <div className="space-y-4">
            {/* Description */}
            {task?.description && (
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Description
                </p>
                <p className="text-sm leading-relaxed text-gray-700">
                  {task.description}
                </p>
              </div>
            )}

            {/* Deadline */}
            <div className="flex gap-3">
              <Clock size={16} className="mt-0.5 shrink-0 text-gray-400" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Deadline
                </p>
                <p className="text-sm text-gray-800">
                  {formatDate(task?.deadline ?? null)}
                </p>
              </div>
            </div>

            {/* Location */}
            {task?.latitude && task?.longitude && (
              <div className="flex gap-3">
                <MapPin size={16} className="mt-0.5 shrink-0 text-gray-400" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Location
                  </p>
                  <p className="text-sm text-gray-800">
                    {task.latitude.toFixed(5)}, {task.longitude.toFixed(5)}
                  </p>
                  <a
                    href={`https://www.google.com/maps?q=${task.latitude},${task.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-0.5 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                  >
                    View on map <ExternalLink size={10} />
                  </a>
                </div>
              </div>
            )}

            {/* Created by */}
            <div className="flex gap-3">
              <User size={16} className="mt-0.5 shrink-0 text-gray-400" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Created by
                </p>
                <p className="text-sm text-gray-800">
                  {task?.creator?.name ?? "—"}
                </p>
              </div>
            </div>

            {/* Created at */}
            <div className="flex gap-3">
              <Calendar size={16} className="mt-0.5 shrink-0 text-gray-400" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Created
                </p>
                <p className="text-sm text-gray-800">
                  {formatDate(task?.createdAt ?? null)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t border-gray-100 px-6 py-4">
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
