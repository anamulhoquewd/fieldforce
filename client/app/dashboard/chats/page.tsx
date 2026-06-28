"use client"

import { ConversationList } from "@/components/chat/conversation-list"
import { MessageThread } from "@/components/chat/message-thread"
import { SidebarTrigger } from "@/components/ui/sidebar"
import useManagerChat from "@/hooks/chat/useManagerChat"

export default function ManagerChatsPage() {
  const {
    user,
    conversations,
    selectedId,
    messages,
    selected,
    handleSelect,
    handleSend,
  } = useManagerChat()

  return (
    <div className="flex flex-1 overflow-hidden">
      <ConversationList
        conversations={conversations}
        selectedId={selectedId}
        onSelect={handleSelect}
        headerLeft={
          <SidebarTrigger className="shrink-0 rounded-md border border-border bg-background shadow-sm hover:bg-muted/50" />
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
