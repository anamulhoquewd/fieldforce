"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { IConversation } from "@/interfaces"
import { cn } from "@/lib/utils"
import { PenSquare, Search } from "lucide-react"
import { useState } from "react"

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

interface ConversationListProps {
  conversations: IConversation[]
  selectedId?: string
  onSelect: (id: string) => void
  headerLeft?: React.ReactNode
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
    <div className="flex w-75 shrink-0 flex-col border-r border-border bg-background">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3.5">
        {headerLeft}
        <h2 className="flex-1 text-base font-semibold text-foreground">
          Messages
        </h2>
        <button
          title="New conversation"
          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <PenSquare size={17} />
        </button>
      </div>

      <div className="px-4 py-2.5">
        <div className="relative">
          <Search
            className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
            size={14}
          />
          <input
            type="text"
            placeholder="Search messages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-muted/50 py-2 pr-3 pl-8 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none"
          />
        </div>
      </div>

      <ScrollArea className="h-screen min-h-0 flex-1">
        {filtered.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            No conversations found.
          </p>
        )}

        {filtered.map((conv) => {
          const isSelected = selectedId === conv.userId
          const color = colorFor(conv.name)

          return (
            <button
              key={conv.id}
              onClick={() => onSelect(conv.userId)}
              className={cn(
                "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50",
                isSelected &&
                  "border-l-2 border-l-primary bg-primary/10 hover:bg-primary/10"
              )}
            >
              <div className="relative shrink-0">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white"
                  style={{ backgroundColor: color }}
                >
                  {getInitials(conv.name)}
                </div>
                <span className="absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full border-2 border-background bg-green-500" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {conv.name}
                  </p>
                  {conv.lastMessageAt && (
                    <span
                      className={cn(
                        "shrink-0 text-xs",
                        (conv.unreadCount ?? 0) > 0
                          ? "font-medium text-primary"
                          : "text-muted-foreground"
                      )}
                    >
                      {formatTime(conv.lastMessageAt)}
                    </span>
                  )}
                </div>
                <div className="mt-0.5 flex items-center justify-between gap-2">
                  <p className="truncate text-xs text-muted-foreground">
                    {conv.lastMessage ?? ""}
                  </p>
                  {(conv.unreadCount ?? 0) > 0 && (
                    <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </ScrollArea>
    </div>
  )
}
