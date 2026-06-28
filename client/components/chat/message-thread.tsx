"use client"

import { IChatMessage, IConversation } from "@/interfaces"
import { cn } from "@/lib/utils"
import { ArrowUp, ChevronLeft, Paperclip, Phone, Users } from "lucide-react"
import { useEffect, useRef, useState } from "react"

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

function formatMsgTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })
}

function dateSeparatorLabel(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diffDays = Math.floor(
    (Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) -
      Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())) /
      86_400_000
  )
  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Yesterday"
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
}

// Group messages into runs per calendar day
function groupByDay(
  messages: IChatMessage[]
): { label: string; msgs: IChatMessage[] }[] {
  const groups: { label: string; msgs: IChatMessage[] }[] = []
  let currentLabel = ""

  for (const msg of messages) {
    const label = dateSeparatorLabel(msg?.createdAt)
    if (label !== currentLabel) {
      currentLabel = label
      groups.push({ label, msgs: [] })
    }
    groups[groups.length - 1].msgs.push(msg)
  }
  return groups
}

// ─── Status icon ─────────────────────────────────────────────────────────────

// function StatusIcon({ status }: { status: IChatMessage["status"] }) {
//   if (status === "sent") return <Check size={12} className="text-blue-200" />
//   if (status === "delivered")
//     return <CheckCheck size={12} className="text-blue-200" />
//   return <CheckCheck size={12} className="text-white" />
// }

// ─── Placeholder when no conversation selected ────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <Users size={24} className="text-muted-foreground" />
      </div>
      <p className="text-sm font-medium text-foreground">Select a conversation</p>
      <p className="text-xs text-muted-foreground">
        Choose a contact from the list to start messaging.
      </p>
    </div>
  )
}

// ─── Component ───────────────────────────────────────────────────────────────

interface MessageThreadProps {
  conversation: IConversation | null
  messages: IChatMessage[]
  currentUserId?: string
  onSend: (content: string) => void
  onBack?: () => void
}

export function MessageThread({
  conversation,
  messages,
  currentUserId,
  onSend,
  onBack,
}: MessageThreadProps) {
  const [input, setInput] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed) return
    onSend(trimmed)
    setInput("")
  }

  if (!conversation) {
    return (
      <div className="flex flex-1 flex-col bg-muted/30">
        <EmptyState />
      </div>
    )
  }

  const groups = groupByDay(messages)
  const color = colorFor(conversation.name)

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-background">
      {/* Header */}
      <div className="flex shrink-0 items-center gap-3 border-b border-border px-5 py-3.5">
        {onBack && (
          <button
            onClick={onBack}
            className="mr-1 shrink-0 rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
          >
            <ChevronLeft size={20} />
          </button>
        )}

        {/* Avatar */}
        <div className="relative shrink-0">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-white"
            style={{ backgroundColor: color }}
          >
            {getInitials(conversation.name)}
          </div>

          <span className="absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full border-2 border-background bg-green-500" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm leading-tight font-semibold text-foreground">
            {conversation.name}
          </p>
          <p className="text-xs leading-tight text-green-600 dark:text-green-400">
            Online
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
            <Phone size={17} />
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto px-5 py-4">
        {groups.map(({ label, msgs }) => (
          <div key={label}>
            {/* Date separator */}
            <div className="flex items-center gap-3 py-3">
              <div className="flex-1 border-t border-border" />
              <span className="text-xs text-muted-foreground lowercase">{label}</span>
              <div className="flex-1 border-t border-border" />
            </div>

            {/* Messages in this day */}
            <div className="space-y-2">
              {msgs.map((msg, i) => {
                const isMine = !!currentUserId && msg.senderId === currentUserId
                const isFirstInRun =
                  i === 0 || msgs[i - 1].senderId !== msg.senderId
                const isLastInRun =
                  i === msgs.length - 1 || msgs[i + 1].senderId !== msg.senderId

                return (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex items-end gap-2",
                      isMine ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    {/* Avatar for group chats — only on last in run */}
                    {/* {conversation.type === "group" && !isMine && (
                      <div className="shrink-0 w-7">
                        {isLastInRun && (
                          <div
                            className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                            style={{ backgroundColor: colorFor(msg.senderName) }}
                          >
                            {getInitials(msg.senderName)}
                          </div>
                        )}
                      </div>
                    )} */}

                    <div
                      className={cn(
                        "flex flex-col",
                        isMine ? "items-end" : "items-start"
                      )}
                    >
                      {/* Sender name in group (first in run only) */}
                      {/* {conversation.type === "group" && !isMine && isFirstInRun && (
                        <span className="mb-0.5 ml-1 text-[11px] font-semibold text-gray-500">
                          {msg.senderName}
                        </span>
                      )} */}

                      {/* Bubble */}
                      <div
                        className={cn(
                          "max-w-xs px-3.5 py-2 text-sm leading-relaxed",
                          isMine
                            ? "rounded-2xl rounded-br-sm bg-primary text-primary-foreground"
                            : "rounded-2xl rounded-bl-sm bg-muted text-foreground"
                        )}
                        style={{ maxWidth: "min(320px, 65vw)" }}
                      >
                        {msg.content}
                      </div>

                      {/* Timestamp + status */}
                      {isLastInRun && (
                        <div
                          className={cn(
                            "mt-0.5 flex items-center gap-1",
                            isMine ? "flex-row-reverse" : "flex-row"
                          )}
                        >
                          <span className="text-[11px] text-muted-foreground">
                            {formatMsgTime(msg.createdAt)}
                          </span>
                          {/* {isMine && <StatusIcon status={msg.status} />} */}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="flex shrink-0 items-center gap-2 border-t border-border bg-background px-4 py-3"
      >
        <button
          type="button"
          className="shrink-0 rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <Paperclip size={18} />
        </button>
        <input
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 rounded-xl border border-border bg-muted/50 px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
        >
          <ArrowUp size={18} />
        </button>
      </form>
    </div>
  )
}
