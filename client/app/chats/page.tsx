import { MessageThread } from "@/components/chat/message-thread"

export const metadata = {
  title: "Worker Chats",
  description: "Chat with your workers",
}

export default function WorkerChatsPage() {
  return (
    <>
      <MessageThread />
    </>
  )
}
