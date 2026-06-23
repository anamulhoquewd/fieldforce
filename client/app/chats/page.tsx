"use client"

import { ConversationList } from "@/components/chat/conversation-list"
import { MessageThread } from "@/components/chat/message-thread"
import { useUser } from "@/context/authContext"
import {
  ChatMessage,
  Conversation,
  getConversations,
  getMessages,
  markAsRead,
  sendMessage,
} from "@/lib/chat-service"
import { useCallback, useEffect, useState } from "react"

export default function WorkerChatsPage() {
  const { user } = useUser()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedId, setSelectedId] = useState<string | undefined>()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  // On mobile: track whether we're showing the list or the thread
  const [showThread, setShowThread] = useState(false)

  useEffect(() => {
    getConversations("worker").then(setConversations)
  }, [])

  useEffect(() => {
    if (!selectedId) {
      setMessages([])
      return
    }
    getMessages(selectedId).then(setMessages)
    markAsRead(selectedId)
    setConversations((prev) =>
      prev.map((c) => (c.id === selectedId ? { ...c, unreadCount: 0 } : c))
    )
  }, [selectedId])

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id)
    setShowThread(true)
  }, [])

  const handleBack = useCallback(() => {
    setShowThread(false)
  }, [])

  const handleSend = useCallback(
    async (content: string) => {
      if (!selectedId) return
      const senderName = user?.name ?? "Worker"
      const msg = await sendMessage(selectedId, senderName, content)
      setMessages((prev) => [...prev, msg])
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedId
            ? { ...c, lastMessage: content, lastMessageAt: msg.timestamp }
            : c
        )
      )
    },
    [selectedId, user?.name]
  )

  const selected = conversations.find((c) => c.id === selectedId) ?? null

  return (
    // pb-16 on mobile to clear the bottom navigation bar
    <div className="flex h-[100dvh] overflow-hidden pb-16 md:pb-0">
      {/*
       * Mobile: show list OR thread (not both).
       * Desktop (md+): show both side by side.
       */}
      <div
        className={`w-full flex-shrink-0 md:w-auto md:flex md:block ${
          showThread ? "hidden md:flex" : "flex"
        }`}
      >
        <ConversationList
          conversations={conversations}
          selectedId={selectedId}
          onSelect={handleSelect}
        />
      </div>

      <div
        className={`flex-1 overflow-hidden ${
          showThread ? "flex" : "hidden md:flex"
        }`}
      >
        <MessageThread
          conversation={selected}
          messages={messages}
          onSend={handleSend}
          onBack={handleBack}
        />
      </div>
    </div>
  )
}
