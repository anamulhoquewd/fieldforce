"use client"

import { MessageThread } from "@/components/chat/message-thread"
import useWorkerChat from "@/hooks/chat/useWorkerChat"

export default function WorkerChatsPage() {
  const { user, manager, messages, handleSend } = useWorkerChat()

  return (
    <MessageThread
      conversation={manager}
      messages={messages}
      currentUserId={user?.userId}
      onSend={handleSend}
      onBack={() => window.history.back()}
    />
  )
}
