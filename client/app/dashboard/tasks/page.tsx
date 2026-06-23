"use client"

import { CreateTaskModal } from "@/components/create-task-modal"
import { ManagerTaskPanel } from "@/components/dashboard/manager-task-panel"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import useTasks from "@/hooks/dashboard/tasks/useTasks"
import { ITask } from "@/interfaces"
import { MapPin, MoreVertical, Search } from "lucide-react"
import { useState } from "react"

// ─── helpers ────────────────────────────────────────────────────────────────

const assigneeColors = [
  "bg-blue-100 text-blue-700",
  "bg-red-100 text-red-700",
  "bg-purple-100 text-purple-700",
  "bg-pink-100 text-pink-700",
  "bg-orange-100 text-orange-700",
  "bg-teal-100 text-teal-700",
]

function getAssigneeColor(name: string) {
  if (!name) return "bg-gray-100 text-gray-500"
  return assigneeColors[name.charCodeAt(0) % assigneeColors.length]
}

function getInitials(name?: string | null) {
  if (!name) return "?"
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("")
}

function formatDeadline(deadline: string | null): {
  text: string
  overdue: boolean
} {
  if (!deadline) return { text: "—", overdue: false }
  const d = new Date(deadline)
  const now = new Date()
  const overdue = d < now
  const isToday = d.toDateString() === now.toDateString()
  const time = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })
  const text = isToday
    ? `Today, ${time}`
    : d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  return { text, overdue }
}

const statusConfig = {
  pending: { dot: "bg-yellow-400", label: "Pending" },
  in_progress: { dot: "bg-blue-500", label: "In Progress" },
  completed: { dot: "bg-green-500", label: "Completed" },
  cancelled: { dot: "bg-gray-400", label: "Cancelled" },
} as const

// ─── component ──────────────────────────────────────────────────────────────

export default function TasksPage() {
  const { tasks, setTasks } = useTasks()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<ITask | null>(null)
  const [filterStatus, setFilterStatus] = useState<
    "all" | "pending" | "in_progress" | "completed"
  >("all")
  const [searchQuery, setSearchQuery] = useState("")

  const handleTaskCreated = (task: ITask) => {
    setTasks((prev) => [task, ...prev])
    setIsCreateOpen(false)
  }

  const handleTaskUpdated = (taskId: string, updated: ITask) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)))
    setSelectedTask(updated)
  }

  const filteredTasks = tasks
    .filter((t) => filterStatus === "all" || t.status === filterStatus)
    .filter(
      (t) =>
        !searchQuery ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase())
    )

  const counts = {
    all: tasks.length,
    pending: tasks.filter((t) => t.status === "pending").length,
    in_progress: tasks.filter((t) => t.status === "in_progress").length,
    completed: tasks.filter((t) => t.status === "completed").length,
  }

  return (
    <>
      {/* Topbar */}
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-100 px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-vertical:h-4 data-vertical:self-auto"
        />
        <h1 className="text-xl font-semibold text-gray-900">Tasks</h1>
        <div className="ml-auto flex items-center gap-3">
          <div className="relative hidden md:block">
            <Search
              className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search tasks…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-56 rounded-lg border border-gray-200 py-2 pr-4 pl-9 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <Button onClick={() => setIsCreateOpen(true)}>+ Create task</Button>
        </div>
      </header>

      {/* Content */}
      <div className="p-6">
        {/* Status filter tabs */}
        <div className="mb-6 flex gap-1 overflow-x-auto border-b border-gray-200">
          {(
            [
              { key: "all", label: "All" },
              { key: "pending", label: "Pending" },
              { key: "in_progress", label: "In Progress" },
              { key: "completed", label: "Completed" },
            ] as const
          ).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilterStatus(key)}
              className={`border-b-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                filterStatus === key
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              {label}{" "}
              <span className="ml-0.5 text-gray-400">{counts[key]}</span>
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  {[
                    "Task",
                    "Assignee",
                    "Status",
                    "Location",
                    "Deadline",
                    "",
                  ].map((col) => (
                    <th
                      key={col}
                      className="px-6 py-3 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredTasks.map((task) => {
                  const { text: deadlineText, overdue } = formatDeadline(
                    task.deadline
                  )
                  const sc = statusConfig[task.status] ?? statusConfig.cancelled
                  const workerName = task.assignedWorker?.name

                  return (
                    <tr
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      className="cursor-pointer transition-colors hover:bg-gray-50"
                    >
                      {/* Task */}
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="mt-0.5 max-w-xs truncate text-sm text-gray-400">
                            {task.description}
                          </p>
                        )}
                      </td>

                      {/* Assignee */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${getAssigneeColor(workerName ?? "")}`}
                          >
                            {workerName ? getInitials(workerName) : "—"}
                          </div>
                          <span
                            className={`text-sm ${!workerName ? "text-gray-400" : "text-gray-800"}`}
                          >
                            {workerName ?? "Unassigned"}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-block h-2 w-2 rounded-full ${sc.dot}`}
                          />
                          <span className="text-sm text-gray-700">
                            {sc.label}
                          </span>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="px-6 py-4">
                        {task.latitude && task.longitude ? (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <MapPin
                              size={13}
                              className="shrink-0 text-gray-400"
                            />
                            <span>
                              {task.latitude.toFixed(3)},{" "}
                              {task.longitude.toFixed(3)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-300">—</span>
                        )}
                      </td>

                      {/* Deadline */}
                      <td className="px-6 py-4">
                        <span
                          className={`text-sm ${
                            overdue
                              ? "font-medium text-red-500"
                              : deadlineText === "—"
                                ? "text-gray-300"
                                : "text-gray-600"
                          }`}
                        >
                          {deadlineText}
                        </span>
                      </td>

                      {/* Actions */}
                      <td
                        className="px-6 py-4"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedTask(task)
                        }}
                      >
                        <button className="rounded p-1 text-gray-300 hover:bg-gray-100 hover:text-gray-600">
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    </tr>
                  )
                })}

                {filteredTasks.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-14 text-center text-sm text-gray-400"
                    >
                      {tasks.length === 0
                        ? "No tasks yet. Create the first one!"
                        : "No tasks match your filter."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create task modal */}
      <CreateTaskModal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onCreated={handleTaskCreated}
      />

      {/* Manager edit panel (right drawer) */}
      <ManagerTaskPanel
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onTaskUpdated={handleTaskUpdated}
      />
    </>
  )
}
