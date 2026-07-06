"use client"

import { MessageThread } from "@/components/chat/message-thread"
import useWorkerChat from "@/hooks/chat/useWorkerChat"

export default function WorkerChatsPage() {
  const { user, manager, messages, handleSend } = useWorkerChat()

  return (
    <div className="max-h-screen w-full min-w-0 flex-1 p-4">
      <MessageThread
        conversation={manager}
        messages={messages}
        onSend={handleSend}
        currentUserId={user?.userId}
        title={manager?.name ?? "Manager"}
        description={
          manager
            ? "Chat with your manager"
            : "Select your manager to start messaging"
        }
        placeholder="Write to your manager"
        emptyTitle={manager ? "No messages yet" : "Select a manager"}
        emptyDescription={
          manager
            ? "Start the conversation with your first message."
            : "Your default manager will appear here once available."
        }
      />
    </div>
  )
}
