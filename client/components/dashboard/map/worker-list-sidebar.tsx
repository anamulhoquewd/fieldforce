"use client"

import { cn } from "@/lib/utils"
import { Crosshair, Search } from "lucide-react"
import { useState } from "react"
import { getInitials, getWorkerColor, WorkerWithLocation } from "./live-map"

export function timeAgo(updatedAt?: string): string {
  if (!updatedAt) return "a while ago"
  const mins = Math.floor((Date.now() - new Date(updatedAt).getTime()) / 60_000)
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
    <aside className="flex w-90 shrink-0 flex-col border-r border-border bg-background">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3.5">
        {headerLeft}
        <h2 className="flex-1 text-base font-semibold text-foreground">
          Field team
        </h2>
        <span className="flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-semibold text-green-700 dark:text-green-400">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
          {onlineCount} live
        </span>
      </div>

      {/* Search */}
      <div className="px-4 pt-3 pb-1">
        <div className="relative">
          <Search
            className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
            size={14}
          />
          <input
            type="text"
            placeholder="Search workers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-muted/50 py-2 pr-4 pl-8 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none"
          />
        </div>
      </div>

      {/* Filter tabs — pill style */}
      <div className="flex gap-2 px-4 pt-2.5 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={cn(
              "rounded-full px-3 py-1 text-sm font-medium transition-colors",
              filter === tab.key
                ? "bg-foreground text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {tab.label}{" "}
            <span
              className={cn(
                "text-xs",
                filter === tab.key ? "text-primary-foreground/70" : "text-muted-foreground"
              )}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      <div className="mx-4 border-b border-border" />

      {/* Worker list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 && (
          <div className="px-5 py-12 text-center text-sm text-muted-foreground">
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
                "flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-muted/50",
                isSelected &&
                  "border-l-2 border-l-primary bg-primary/10 hover:bg-primary/10"
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
                    "absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full border-2 border-background",
                    worker.isOnline ? "bg-green-500" : "bg-muted-foreground/40"
                  )}
                />
              </div>

              {/* Name + task / status line */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {worker.name}
                </p>
                {worker.isOnline && worker.currentTask ? (
                  <p className="truncate text-xs text-teal-600 dark:text-teal-400">
                    {worker.currentTask.title}
                  </p>
                ) : worker.isOnline ? (
                  <p className="text-xs text-muted-foreground">
                    Online · no active task
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
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
                className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-primary"
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
