"use client"

import { IChatMessage, IConversation } from "@/app/dashboard/chats/page"
import { MessageThread } from "@/components/chat/message-thread"
import { useUser } from "@/context/authContext"
import api from "@/lib/api"
import { handleAxiosError } from "@/lib/utils"
import { useCallback, useEffect, useRef, useState } from "react"
import { io, Socket } from "socket.io-client"

export default function WorkerChatsPage() {
  const { user } = useUser()
  const [manager, setManager] = useState<IConversation | null>(null)
  const [messages, setMessages] = useState<IChatMessage[]>([])
  const socketRef = useRef<Socket | null>(null)
  const managerIdRef = useRef<string | undefined>(undefined)
  const userIdRef = useRef<string | undefined>(undefined)

  useEffect(() => {
    userIdRef.current = user?.userId
  }, [user?.userId])

  useEffect(() => {
    managerIdRef.current = manager?.id
  }, [manager?.id])

  // Fetch the single manager for this worker
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/memberships/manager")
        if (res.status === 200 && res.data.success) {
          setManager(res.data.data[0])
        }
      } catch (err) {
        handleAxiosError(err)
      }
    }
    load()
  }, [])

  // Load message history once manager is known
  useEffect(() => {
    if (!manager?.id) return
    const load = async () => {
      try {
        const res = await api.get(`/messages/${manager.id}`)
        if (res.status === 200 && res.data?.success) {
          setMessages(res.data.data)
        }
      } catch (err) {
        handleAxiosError(err)
      }
    }
    load()
  }, [manager?.id])

  // Single socket connection for the page lifetime
  useEffect(() => {
    const socket = io("http://localhost:8000", { withCredentials: true })
    socketRef.current = socket

    socket.on("new-message", (msg: IChatMessage) => {
      const myId = userIdRef.current
      const otherId = msg.senderId === myId ? msg.receiverId : msg.senderId
      if (otherId === managerIdRef.current) {
        setMessages((prev) => [...prev, msg])
      }
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  const handleSend = useCallback(
    (content: string) => {
      if (!manager?.id || !socketRef.current) return
      socketRef.current.emit("send-message", {
        receiverId: manager.id,
        content,
      })
    },
    [manager]
  )

  return (
    <div className="flex h-dvh overflow-hidden pb-16 md:pb-0">
      <MessageThread
        conversation={manager}
        messages={messages}
        currentUserId={user?.userId}
        onSend={handleSend}
      />
    </div>
  )
}
