import { useUser } from "@/context/authContext"
import { useSocket } from "@/context/socketContext"
import { IChatMessage, IConversation } from "@/interfaces"
import api from "@/lib/api"
import { handleAxiosError } from "@/lib/utils"
import { useCallback, useEffect, useRef, useState } from "react"

function useManagerChat() {
  const { user } = useUser()
  const socket = useSocket()
  const [conversations, setConversations] = useState<IConversation[]>([])
  const [selectedId, setSelectedId] = useState<string | undefined>()
  const [messages, setMessages] = useState<IChatMessage[]>([])
  const selectedIdRef = useRef<string | undefined>(undefined)
  const userIdRef = useRef<string | undefined>(undefined)

  useEffect(() => {
    selectedIdRef.current = selectedId
  }, [selectedId])

  useEffect(() => {
    userIdRef.current = user?.userId
  }, [user?.userId])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/memberships?type=worker")
        if (res.status === 200 && res.data.success) {
          setConversations(res.data.data)
        }
      } catch (err) {
        handleAxiosError(err)
      }
    }
    load()
  }, [])

  useEffect(() => {
    if (!socket) return

    const handleNewMessage = (msg: IChatMessage) => {
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
    }

    socket.on("new-message", handleNewMessage)
    return () => {
      socket.off("new-message", handleNewMessage)
    }
  }, [socket])

  useEffect(() => {
    if (!selectedId) {
      Promise.resolve().then(() => setMessages([]))
      return
    }

    const load = async () => {
      try {
        const res = await api.get(`/messages/${selectedId}`)
        if (res.status === 200 && res.data?.success) {
          setMessages(res.data.data)
          setConversations((prev) =>
            prev.map((c) =>
              c.id === selectedId ? { ...c, unreadCount: 0 } : c
            )
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
      if (!selectedId || !socket) return
      socket.emit("send-message", { receiverId: selectedId, content })
    },
    [selectedId, socket]
  )

  const selected =
    conversations.find((c) => c.id === selectedId) ?? null

  return {
    user,
    conversations,
    selectedId,
    messages,
    selected,
    handleSelect,
    handleSend,
  }
}

export default useManagerChat
