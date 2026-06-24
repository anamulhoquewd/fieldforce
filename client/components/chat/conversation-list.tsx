"use client"

import { IConversation } from "@/app/dashboard/chats/page"
import { cn } from "@/lib/utils"
import { PenSquare, Search } from "lucide-react"
import { useState } from "react"

// ─── Helpers ─────────────────────────────────────────────────────────────────

const PALETTE = [
  "#f97316",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#6366f1",
  "#f43f5e",
]

function colorFor(name: string): string {
  return PALETTE[name.charCodeAt(0) % PALETTE.length]
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("")
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diffDays = Math.floor(
    (now.setHours(0, 0, 0, 0) - d.setHours(0, 0, 0, 0)) / 86_400_000
  )
  if (diffDays === 0) {
    return new Date(iso).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    })
  }
  if (diffDays === 1) return "Yesterday"
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

// ─── Component ───────────────────────────────────────────────────────────────

interface ConversationListProps {
  conversations: IConversation[]
  selectedId?: string
  onSelect: (id: string) => void
  headerLeft?: React.ReactNode // slot for SidebarTrigger (manager only)
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  headerLeft,
}: ConversationListProps) {
  const [search, setSearch] = useState("")

  const filtered = conversations.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex w-75 shrink-0 flex-col border-r border-gray-100 bg-white">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3.5">
        {headerLeft}
        <h2 className="flex-1 text-base font-semibold text-gray-900">
          Messages
        </h2>
        <button
          title="New conversation"
          className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
        >
          <PenSquare size={17} />
        </button>
      </div>

      {/* Search */}
      <div className="px-4 py-2.5">
        <div className="relative">
          <Search
            className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
            size={14}
          />
          <input
            type="text"
            placeholder="Search messages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pr-3 pl-8 text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-gray-400">
            No conversations found.
          </p>
        )}

        {filtered.map((conv) => {
          const isSelected = selectedId === conv.id
          const color = colorFor(conv.name)

          return (
            <button
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={cn(
                "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50",
                isSelected &&
                  "border-l-2 border-l-blue-500 bg-blue-50 hover:bg-blue-50"
              )}
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                {
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white"
                    style={{ backgroundColor: color }}
                  >
                    {getInitials(conv.name)}
                  </div>
                }
                <span
                  className={cn(
                    "absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full border-2 border-white",
                    true ? "bg-green-500" : "bg-gray-300"
                  )}
                />
              </div>

              {/* Text */}
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-gray-900">
                    {conv.name}
                  </p>
                  {conv.lastMessageAt && (
                    <span
                      className={cn(
                        "shrink-0 text-xs",
                        (conv.unreadCount ?? 0) > 0
                          ? "font-medium text-blue-600"
                          : "text-gray-400"
                      )}
                    >
                      {formatTime(conv.lastMessageAt)}
                    </span>
                  )}
                </div>
                <div className="mt-0.5 flex items-center justify-between gap-2">
                  <p className="truncate text-xs text-gray-500">
                    {conv.lastMessage ?? ""}
                  </p>
                  {(conv.unreadCount ?? 0) > 0 && (
                    <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[10px] font-bold text-white">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
