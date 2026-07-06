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
      <div className="flex max-h-screen w-full min-w-0 flex-1 px-4 py-4">
        <MessageThread
          conversation={selected}
          messages={messages}
          onSend={handleSend}
          currentUserId={user?.userId}
          title={selected?.name ?? "Select a worker"}
          description={
            selected
              ? "Chat with your selected worker"
              : "Choose a worker from the list to view their chat"
          }
          placeholder={
            selected ? `Message ${selected.name}` : "Select a worker to begin"
          }
          emptyTitle={selected ? "No messages yet" : "Select a worker"}
          emptyDescription={
            selected
              ? "Send the first message to start the conversation."
              : "Pick a worker from the left to load their messages."
          }
        />
      </div>
    </div>
  )
}
