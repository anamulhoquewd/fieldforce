"use client"

import { ConversationList } from "@/components/chat/conversation-list"
import { MessageThread } from "@/components/chat/message-thread"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useUser } from "@/context/authContext"
import api from "@/lib/api"
import { handleAxiosError } from "@/lib/utils"
import { useCallback, useEffect, useRef, useState } from "react"
import { io, Socket } from "socket.io-client"

export interface IConversation {
  id: string
  name: string
  email: string
  role: "worker" | "manager"
  lastMessage?: string
  lastMessageAt?: string
  unreadCount?: number
}

export interface IChatMessage {
  id: string
  receiverId: string
  senderId: string
  content: string
  createdAt: string
}

export default function ManagerChatsPage() {
  const { user } = useUser()
  const [conversations, setConversations] = useState<IConversation[]>([])
  const [selectedId, setSelectedId] = useState<string | undefined>()
  const [messages, setMessages] = useState<IChatMessage[]>([])
  const socketRef = useRef<Socket | null>(null)
  const selectedIdRef = useRef<string | undefined>()
  const userIdRef = useRef<string | undefined>()

  useEffect(() => {
    selectedIdRef.current = selectedId
  }, [selectedId])

  useEffect(() => {
    userIdRef.current = user?.userId
  }, [user?.userId])

  // Load conversations once
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/memberships/workers")
        if (res.status === 200 && res.data.success) {
          setConversations(res.data.data)
        }
      } catch (err) {
        handleAxiosError(err)
      }
    }
    load()
  }, [])

  // Single socket connection for the page lifetime
  useEffect(() => {
    const socket = io("http://localhost:8000", { withCredentials: true })
    socketRef.current = socket

    socket.on("new-message", (msg: IChatMessage) => {
      const myId = userIdRef.current
      const otherId = msg.senderId === myId ? msg.receiverId : msg.senderId
      const isOpen = otherId === selectedIdRef.current

      if (isOpen) {
        setMessages((prev) => [...prev, msg])
      }

      setConversations((prev) =>
        prev.map((c) =>
          c.id === otherId
            ? {
                ...c,
                lastMessage: msg.content,
                lastMessageAt: msg.createdAt,
                unreadCount: isOpen ? 0 : (c.unreadCount ?? 0) + 1,
              }
            : c
        )
      )
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  // Load message history when a conversation is selected
  useEffect(() => {
    if (!selectedId) {
      setMessages([])
      return
    }
    const load = async () => {
      try {
        const res = await api.get(`/messages/${selectedId}`)
        if (res.status === 200 && res.data?.success) {
          setMessages(res.data.data)
          setConversations((prev) =>
            prev.map((c) => (c.id === selectedId ? { ...c, unreadCount: 0 } : c))
          )
        }
      } catch (err) {
        handleAxiosError(err)
      }
    }
    load()
  }, [selectedId])

  const handleSelect = useCallback((id: string) => setSelectedId(id), [])

  const handleSend = useCallback(
    (content: string) => {
      if (!selectedId || !socketRef.current) return
      socketRef.current.emit("send-message", { receiverId: selectedId, content })
    },
    [selectedId]
  )

  const selected = conversations.find((c) => c.id === selectedId) ?? null

  return (
    <div className="flex flex-1 overflow-hidden">
      <ConversationList
        conversations={conversations}
        selectedId={selectedId}
        onSelect={handleSelect}
        headerLeft={
          <SidebarTrigger className="shrink-0 rounded-md border border-gray-200 bg-white shadow-sm hover:bg-gray-50" />
        }
      />
      <MessageThread
        conversation={selected}
        messages={messages}
        currentUserId={user?.userId}
        onSend={handleSend}
      />
    </div>
  )
}
