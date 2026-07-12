import { useUser } from "@/context/authContext"
import { useSocket } from "@/context/socketContext"
import { IChatMessage, IConversation } from "@/interfaces"
import api from "@/lib/api"
import { handleAxiosError } from "@/lib/utils"
import { useCallback, useEffect, useRef, useState } from "react"

function useWorkerChat() {
  const { user } = useUser()
  const socket = useSocket()
  const [manager, setManager] = useState<IConversation | null>(null)
  const [messages, setMessages] = useState<IChatMessage[]>([])
  const managerIdRef = useRef<string | undefined>(undefined)
  const userIdRef = useRef<string | undefined>(undefined)

  useEffect(() => {
    userIdRef.current = user?.userId
  }, [user?.userId])

  useEffect(() => {
    managerIdRef.current = manager?.userId
  }, [manager?.userId])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/memberships?type=manager")
        if (res.status === 200 && res.data.success) {
          setManager(res.data.data[0])
        }
      } catch (err) {
        handleAxiosError(err)
      }
    }
    load()
  }, [])

  useEffect(() => {
    if (!manager?.userId) return

    const load = async () => {
      try {
        const res = await api.get(`/messages/${manager.userId}`)
        if (res.status === 200 && res.data?.success) {
          setMessages(res.data.data)
        }
      } catch (err) {
        handleAxiosError(err)
      }
    }
    load()
  }, [manager?.userId])

  useEffect(() => {
    if (!socket) return

    const handleNewMessage = (msg: IChatMessage) => {
      const myId = userIdRef.current
      const otherId = msg.senderId === myId ? msg.receiverId : msg.senderId
      if (otherId === managerIdRef.current) {
        setMessages((prev) => [...prev, msg])
      }
    }

    socket.on("new-message", handleNewMessage)
    return () => {
      socket.off("new-message", handleNewMessage)
    }
  }, [socket])

  const handleSend = useCallback(
    (content: string) => {
      if (!manager?.userId || !socket) return
      socket.emit("send-message", {
        receiverId: manager.userId,
        content,
      })
    },
    [manager, socket]
  )

  return { user, manager, messages, handleSend }
}

export default useWorkerChat
