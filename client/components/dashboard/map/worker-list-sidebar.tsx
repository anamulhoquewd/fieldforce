"use client"

import { cn } from "@/lib/utils"
import { Crosshair, Search } from "lucide-react"
import { useState } from "react"
import { getInitials, getWorkerColor, WorkerWithLocation } from "./live-map"

function timeAgo(updatedAt?: string): string {
  if (!updatedAt) return "a while ago"
  const mins = Math.floor(
    (Date.now() - new Date(updatedAt).getTime()) / 60_000
  )
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  return `${Math.floor(mins / 60)}h ago`
}

type Filter = "all" | "online" | "offline"

interface WorkerListSidebarProps {
  workers: WorkerWithLocation[]
  selectedWorkerId?: string
  onWorkerSelect: (workerId: string) => void
  onLocate: (workerId: string) => void
  headerLeft?: React.ReactNode
}

export function WorkerListSidebar({
  workers,
  selectedWorkerId,
  onWorkerSelect,
  onLocate,
  headerLeft,
}: WorkerListSidebarProps) {
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<Filter>("all")

  const onlineCount = workers.filter((w) => w.isOnline).length
  const offlineCount = workers.filter((w) => !w.isOnline).length

  const filtered = workers.filter((w) => {
    const q = search.toLowerCase()
    const matchesSearch =
      !q ||
      w.name.toLowerCase().includes(q) ||
      w.email.toLowerCase().includes(q)
    const matchesFilter =
      filter === "all" ||
      (filter === "online" && w.isOnline) ||
      (filter === "offline" && !w.isOnline)
    return matchesSearch && matchesFilter
  })

  const tabs: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: "All", count: workers.length },
    { key: "online", label: "Online", count: onlineCount },
    { key: "offline", label: "Offline", count: offlineCount },
  ]

  return (
    <aside className="flex w-90 shrink-0 flex-col border-r border-gray-100 bg-white">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3.5">
        {headerLeft}
        <h2 className="flex-1 text-base font-semibold text-gray-900">Field team</h2>
        <span className="flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
          {onlineCount} live
        </span>
      </div>

      {/* Search */}
      <div className="px-4 pb-1 pt-3">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={14}
          />
          <input
            type="text"
            placeholder="Search workers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-8 pr-4 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Filter tabs — pill style */}
      <div className="flex gap-2 px-4 pb-2 pt-2.5">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={cn(
              "rounded-full px-3 py-1 text-sm font-medium transition-colors",
              filter === tab.key
                ? "bg-foreground text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            {tab.label}{" "}
            <span
              className={cn(
                "text-xs",
                filter === tab.key ? "text-blue-100" : "text-gray-400"
              )}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="mx-4 border-b border-gray-100" />

      {/* Worker list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 && (
          <div className="px-5 py-12 text-center text-sm text-gray-400">
            {search
              ? "No workers match your search."
              : "No workers in this view."}
          </div>
        )}

        {filtered.map((worker) => {
          const color = getWorkerColor(worker.name)
          const isSelected = selectedWorkerId === worker.id

          return (
            <button
              key={worker.id}
              onClick={() => onWorkerSelect(worker.id)}
              className={cn(
                "flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-gray-50",
                isSelected &&
                  "border-l-2 border-l-blue-500 bg-blue-50 hover:bg-blue-50"
              )}
            >
              {/* Avatar with status dot */}
              <div className="relative shrink-0">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-white"
                  style={{ backgroundColor: color }}
                >
                  {getInitials(worker.name)}
                </div>
                <span
                  className={cn(
                    "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white",
                    worker.isOnline ? "bg-green-500" : "bg-gray-300"
                  )}
                />
              </div>

              {/* Name + task / status line */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">
                  {worker.name}
                </p>
                {worker.isOnline && worker.currentTask ? (
                  <p className="truncate text-xs text-teal-600">
                    {worker.currentTask.title}
                  </p>
                ) : worker.isOnline ? (
                  <p className="text-xs text-gray-400">
                    Online · no active task
                  </p>
                ) : (
                  <p className="text-xs text-gray-400">
                    Offline · {timeAgo(worker.updatedAt)}
                  </p>
                )}
              </div>

              {/* Locate button */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onLocate(worker.id)
                }}
                title="Locate on map"
                className="shrink-0 rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600"
              >
                <Crosshair size={15} />
              </button>
            </button>
          )
        })}
      </div>
    </aside>
  )
}
