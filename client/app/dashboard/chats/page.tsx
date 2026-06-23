"use client"

import { ConversationList } from "@/components/chat/conversation-list"
import { MessageThread } from "@/components/chat/message-thread"
import { SidebarTrigger } from "@/components/ui/sidebar"
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

export default function ManagerChatsPage() {
  const { user } = useUser()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedId, setSelectedId] = useState<string | undefined>()
  const [messages, setMessages] = useState<ChatMessage[]>([])

  // Load conversations on mount
  useEffect(() => {
    getConversations("manager").then(setConversations)
  }, [])

  // Load messages whenever selected conversation changes
  useEffect(() => {
    if (!selectedId) {
      setMessages([])
      return
    }
    getMessages(selectedId).then(setMessages)
    markAsRead(selectedId)
    // Clear unread badge locally
    setConversations((prev) =>
      prev.map((c) => (c.id === selectedId ? { ...c, unreadCount: 0 } : c))
    )
  }, [selectedId])

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id)
  }, [])

  const handleSend = useCallback(
    async (content: string) => {
      if (!selectedId) return
      const senderName = user?.name ?? "Manager"
      const msg = await sendMessage(selectedId, senderName, content)
      setMessages((prev) => [...prev, msg])
      // Update last message in conversation list
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
    <div className="flex flex-1 overflow-hidden">
      {/* Left: conversation list */}
      <ConversationList
        conversations={conversations}
        selectedId={selectedId}
        onSelect={handleSelect}
        headerLeft={
          <SidebarTrigger className="shrink-0 rounded-md border border-gray-200 bg-white shadow-sm hover:bg-gray-50" />
        }
      />

      {/* Right: message thread */}
      <MessageThread
        conversation={selected}
        messages={messages}
        onSend={handleSend}
      />
    </div>
  )
}
