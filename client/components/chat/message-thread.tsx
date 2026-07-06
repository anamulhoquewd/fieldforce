"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageGroup,
  MessageHeader,
} from "@/components/ui/message"
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller"
import { IChatMessage, IConversation } from "@/interfaces"
import { cn } from "@/lib/utils"
import {
  ArrowUpIcon,
  MessageCircleDashedIcon,
  RotateCwIcon,
  Users,
} from "lucide-react"
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react"

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

export function dateSeparatorLabel(iso: string): string {
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

interface MessageThreadProps {
  conversation?: IConversation | null
  messages?: IChatMessage[]
  onSend?: (content: string) => void
  currentUserId?: string
  title?: string
  description?: string
  placeholder?: string
  emptyTitle?: string
  emptyDescription?: string
  className?: string
  onReset?: () => void
}

function EmptyState({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <Users size={24} className="text-muted-foreground" />
      </div>
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  )
}

function MessageBubble({
  message,
  conversation,
  currentUserId,
}: {
  message: IChatMessage
  conversation: IConversation | null
  currentUserId?: string
}) {
  const isMine = message.senderId === currentUserId
  const bubbleClassName = isMine
    ? "bg-primary text-primary-foreground"
    : "bg-muted text-foreground"

  return (
    <MessageScrollerItem>
      <Message align={isMine ? "end" : "start"}>
        {!isMine && (
          <MessageAvatar className="h-8 w-8 text-[11px]">
            {getInitials(conversation?.name ?? "Conversation")}
          </MessageAvatar>
        )}
        <MessageContent className={cn("max-w-[80%]", isMine && "items-end")}>
          {!isMine && (
            <MessageHeader className="px-0 text-[11px] tracking-wide uppercase">
              {conversation?.name ?? "Conversation"}
            </MessageHeader>
          )}
          <div
            className={cn(
              "rounded-2xl px-3 py-2 text-sm shadow-sm",
              bubbleClassName
            )}
          >
            {message.content}
          </div>
          <MessageFooter
            className={cn("px-0 text-[11px]", isMine && "justify-end")}
          >
            {formatMsgTime(message.createdAt)}
          </MessageFooter>
        </MessageContent>
      </Message>
    </MessageScrollerItem>
  )
}

export function MessageThread({
  conversation = null,
  messages = [],
  onSend,
  currentUserId,
  title,
  description,
  placeholder = "Type a message",
  emptyTitle = "Select a contact",
  emptyDescription = "Choose a conversation to begin messaging.",
  onReset,
}: MessageThreadProps) {
  const [draft, setDraft] = useState("")
  const viewportRef = useRef<HTMLDivElement>(null)
  const groups = useMemo(() => groupByDay(messages), [messages])

  useEffect(() => {
    if (!conversation || messages.length === 0) return

    const viewport = viewportRef.current
    if (!viewport) return

    const frame = window.requestAnimationFrame(() => {
      viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" })
    })

    return () => window.cancelAnimationFrame(frame)
  }, [conversation, messages])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = draft.trim()
    if (!trimmed || !onSend || !conversation) return
    onSend(trimmed)
    setDraft("")
  }

  return (
    <MessageScrollerProvider autoScroll>
      <Card className="relative mx-auto flex h-full min-h-0 w-full flex-col gap-0 overflow-hidden">
        <CardHeader className="shrink-0 gap-1 border-b">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
              style={{
                backgroundColor: colorFor(
                  conversation?.name ?? title ?? "Conversation"
                ),
              }}
            >
              {getInitials(conversation?.name ?? title ?? "Conversation")}
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="truncate">
                {conversation?.name ?? title ?? "Messages"}
              </CardTitle>
              <CardDescription className="truncate">
                {conversation
                  ? (description ?? "Chat in real time")
                  : (description ?? "Select a contact to start messaging")}
              </CardDescription>
            </div>
          </div>
          {onReset ? (
            <CardAction>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Reset stream"
                onClick={onReset}
              >
                <RotateCwIcon />
              </Button>
            </CardAction>
          ) : null}
        </CardHeader>

        <CardContent className="min-h-0 flex-1 overflow-hidden p-0">
          {!conversation ? (
            <EmptyState title={emptyTitle} description={emptyDescription} />
          ) : messages.length === 0 ? (
            <Empty className="h-full">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <MessageCircleDashedIcon />
                </EmptyMedia>
                <EmptyTitle>Ready to chat</EmptyTitle>
                <EmptyDescription>
                  Start the conversation with a message.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <MessageScroller className="h-full">
              <MessageScrollerViewport ref={viewportRef}>
                <MessageScrollerContent className="p-4">
                  {groups.map((group) => (
                    <MessageGroup key={group.label} className="gap-3">
                      <div className="flex justify-center">
                        <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                          {group.label}
                        </span>
                      </div>
                      {group.msgs.map((message) => (
                        <MessageBubble
                          key={message.id}
                          message={message}
                          conversation={conversation}
                          currentUserId={currentUserId}
                        />
                      ))}
                    </MessageGroup>
                  ))}
                </MessageScrollerContent>
              </MessageScrollerViewport>
              <MessageScrollerButton />
            </MessageScroller>
          )}
        </CardContent>

        <CardFooter className="shrink-0 flex-col gap-2 border-t">
          <form onSubmit={handleSubmit} className="w-full">
            <InputGroup className="min-h-14">
              <InputGroupTextarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault()
                    const syntheticEvent =
                      event as unknown as FormEvent<HTMLFormElement>
                    handleSubmit(syntheticEvent)
                  }
                }}
                placeholder={placeholder}
                className="min-h-12 resize-none py-3"
                rows={1}
              />
              <InputGroupAddon align="block-end" className="pt-1">
                <InputGroupButton
                  type="submit"
                  variant="default"
                  size="icon-sm"
                  disabled={!draft.trim() || !conversation}
                  className="ml-auto"
                >
                  <ArrowUpIcon />
                  <span className="sr-only">Send</span>
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
            <p className="mt-1 text-xs text-muted-foreground">
              Press Enter to send, Shift + Enter for a new line.
            </p>
          </form>
        </CardFooter>
      </Card>
    </MessageScrollerProvider>
  )
}
