// ─── Types ───────────────────────────────────────────────────────────────────

export type MessageStatus = "sent" | "delivered" | "read"

export interface ChatMessage {
  id: string
  conversationId: string
  senderId: string // 'me' = current user, anything else = other party
  senderName: string
  content: string
  timestamp: string // ISO string
  status: MessageStatus
}

export interface Conversation {
  id: string
  type: "direct" | "group"
  name: string
  participantId?: string // userId for direct chats
  isOnline?: boolean // only for direct chats
  lastMessage: string
  lastMessageAt: string // ISO string
  unreadCount: number
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function ts(hh: number, mm: number, daysAgo = 0): string {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  d.setHours(hh, mm, 0, 0)
  return d.toISOString()
}

// ─── Mock data ────────────────────────────────────────────────────────────────
// When the backend is ready, replace these with real API calls in the
// service functions below. The types and function signatures stay the same.

const MOCK_CONVERSATIONS_MANAGER: Conversation[] = [
  {
    id: "conv-marcus",
    type: "direct",
    name: "Marcus Reyes",
    participantId: "worker-marcus",
    isOnline: true,
    lastMessage: "Done with the meter. Pressure looks good before and after.",
    lastMessageAt: ts(10, 24),
    unreadCount: 0,
  },
  {
    id: "conv-dana",
    type: "direct",
    name: "Dana Cole",
    participantId: "worker-dana",
    isOnline: true,
    lastMessage: "Might need a second hand on this one.",
    lastMessageAt: ts(10, 18),
    unreadCount: 2,
  },
  {
    id: "conv-priya",
    type: "direct",
    name: "Priya Shah",
    participantId: "worker-priya",
    isOnline: true,
    lastMessage: "Pump 3 valve checked.",
    lastMessageAt: ts(9, 54),
    unreadCount: 0,
  },
  {
    id: "conv-crew",
    type: "group",
    name: "Northgate Crew",
    isOnline: undefined,
    lastMessage: "Dana: anyone carrying a spare coupling?",
    lastMessageAt: ts(9, 40),
    unreadCount: 5,
  },
  {
    id: "conv-tom",
    type: "direct",
    name: "Tom Becker",
    participantId: "worker-tom",
    isOnline: false,
    lastMessage: "Service restored on Elm St.",
    lastMessageAt: ts(16, 30, 1),
    unreadCount: 0,
  },
  {
    id: "conv-jordan",
    type: "direct",
    name: "Jordan Webb",
    participantId: "worker-jordan",
    isOnline: false,
    lastMessage: "Depot 4 survey is blocked — gate locked.",
    lastMessageAt: ts(14, 15, 1),
    unreadCount: 0,
  },
]

// Subset of conversations visible to a worker
const MOCK_CONVERSATIONS_WORKER: Conversation[] = [
  {
    id: "conv-manager",
    type: "direct",
    name: "Alex Morgan",
    participantId: "manager-alex",
    isOnline: true,
    lastMessage: "Nice work. Head to Elm St next when you can.",
    lastMessageAt: ts(10, 25),
    unreadCount: 1,
  },
  {
    id: "conv-crew",
    type: "group",
    name: "Northgate Crew",
    isOnline: undefined,
    lastMessage: "Dana: anyone carrying a spare coupling?",
    lastMessageAt: ts(9, 40),
    unreadCount: 5,
  },
]

// Mutable message store — new messages are pushed here at runtime
const messageStore: Record<string, ChatMessage[]> = {
  "conv-marcus": [
    {
      id: "m1",
      conversationId: "conv-marcus",
      senderId: "me",
      senderName: "Alex Morgan",
      content: "Morning Marcus — meter swap at 1284 Elm is the priority today.",
      timestamp: ts(8, 2),
      status: "read",
    },
    {
      id: "m2",
      conversationId: "conv-marcus",
      senderId: "worker-marcus",
      senderName: "Marcus Reyes",
      content: "On it. Heading there now.",
      timestamp: ts(8, 5),
      status: "read",
    },
    {
      id: "m3",
      conversationId: "conv-marcus",
      senderId: "me",
      senderName: "Alex Morgan",
      content: "Customer will be home after 9.",
      timestamp: ts(8, 6),
      status: "read",
    },
    {
      id: "m4",
      conversationId: "conv-marcus",
      senderId: "worker-marcus",
      senderName: "Marcus Reyes",
      content: "Done with the meter. Pressure looks good before and after.",
      timestamp: ts(10, 24),
      status: "read",
    },
    {
      id: "m5",
      conversationId: "conv-marcus",
      senderId: "me",
      senderName: "Alex Morgan",
      content: "Nice work. Head to Elm St next when you can.",
      timestamp: ts(10, 25),
      status: "delivered",
    },
  ],
  "conv-dana": [
    {
      id: "d1",
      conversationId: "conv-dana",
      senderId: "worker-dana",
      senderName: "Dana Cole",
      content: "At the transformer site. Looks older than the report says.",
      timestamp: ts(10, 5),
      status: "read",
    },
    {
      id: "d2",
      conversationId: "conv-dana",
      senderId: "me",
      senderName: "Alex Morgan",
      content: "Take photos before you open anything.",
      timestamp: ts(10, 8),
      status: "read",
    },
    {
      id: "d3",
      conversationId: "conv-dana",
      senderId: "worker-dana",
      senderName: "Dana Cole",
      content: "Might need a second hand on this one.",
      timestamp: ts(10, 18),
      status: "delivered",
    },
  ],
  "conv-priya": [
    {
      id: "p1",
      conversationId: "conv-priya",
      senderId: "me",
      senderName: "Alex Morgan",
      content: "How is the pressure test on line B going?",
      timestamp: ts(9, 30),
      status: "read",
    },
    {
      id: "p2",
      conversationId: "conv-priya",
      senderId: "worker-priya",
      senderName: "Priya Shah",
      content: "Pump 3 valve checked.",
      timestamp: ts(9, 54),
      status: "read",
    },
  ],
  "conv-crew": [
    {
      id: "g1",
      conversationId: "conv-crew",
      senderId: "worker-marcus",
      senderName: "Marcus",
      content: "Anyone near sector 4 right now?",
      timestamp: ts(9, 15),
      status: "read",
    },
    {
      id: "g2",
      conversationId: "conv-crew",
      senderId: "worker-priya",
      senderName: "Priya",
      content: "I can be there in 20.",
      timestamp: ts(9, 22),
      status: "read",
    },
    {
      id: "g3",
      conversationId: "conv-crew",
      senderId: "worker-dana",
      senderName: "Dana",
      content: "Anyone carrying a spare coupling?",
      timestamp: ts(9, 40),
      status: "delivered",
    },
  ],
  "conv-tom": [
    {
      id: "t1",
      conversationId: "conv-tom",
      senderId: "me",
      senderName: "Alex Morgan",
      content: "How is Elm St looking?",
      timestamp: ts(14, 0, 1),
      status: "read",
    },
    {
      id: "t2",
      conversationId: "conv-tom",
      senderId: "worker-tom",
      senderName: "Tom Becker",
      content: "Service restored on Elm St.",
      timestamp: ts(16, 30, 1),
      status: "read",
    },
  ],
  "conv-jordan": [
    {
      id: "j1",
      conversationId: "conv-jordan",
      senderId: "worker-jordan",
      senderName: "Jordan Webb",
      content: "Depot 4 survey is blocked — gate locked.",
      timestamp: ts(14, 15, 1),
      status: "delivered",
    },
  ],
  "conv-manager": [
    {
      id: "wm1",
      conversationId: "conv-manager",
      senderId: "manager-alex",
      senderName: "Alex Morgan",
      content: "Morning Marcus — meter swap at 1284 Elm is the priority today.",
      timestamp: ts(8, 2),
      status: "read",
    },
    {
      id: "wm2",
      conversationId: "conv-manager",
      senderId: "me",
      senderName: "Marcus Reyes",
      content: "On it. Heading there now.",
      timestamp: ts(8, 5),
      status: "read",
    },
    {
      id: "wm3",
      conversationId: "conv-manager",
      senderId: "manager-alex",
      senderName: "Alex Morgan",
      content: "Customer will be home after 9.",
      timestamp: ts(8, 6),
      status: "read",
    },
    {
      id: "wm4",
      conversationId: "conv-manager",
      senderId: "me",
      senderName: "Marcus Reyes",
      content: "Done with the meter. Pressure looks good before and after.",
      timestamp: ts(10, 24),
      status: "read",
    },
    {
      id: "wm5",
      conversationId: "conv-manager",
      senderId: "manager-alex",
      senderName: "Alex Morgan",
      content: "Nice work. Head to Elm St next when you can.",
      timestamp: ts(10, 25),
      status: "delivered",
    },
  ],
}

// ─── Service functions ────────────────────────────────────────────────────────
// Swap the mock returns for real api.get() / api.post() calls when the
// backend is ready. Keep the function signatures identical.
//
// Socket events to subscribe to for real-time updates:
//   "chat:message"  → { conversationId, message: ChatMessage }
//   "chat:read"     → { conversationId, userId }
//   "chat:typing"   → { conversationId, userId, typing: boolean }

export async function getConversations(
  role: "manager" | "worker"
): Promise<Conversation[]> {
  // TODO: const res = await api.get('/conversations'); return res.data.data
  return role === "manager"
    ? MOCK_CONVERSATIONS_MANAGER
    : MOCK_CONVERSATIONS_WORKER
}

export async function getMessages(
  conversationId: string
): Promise<ChatMessage[]> {
  // TODO: const res = await api.get(`/conversations/${conversationId}/messages`); return res.data.data
  return messageStore[conversationId] ?? []
}

export async function sendMessage(
  conversationId: string,
  senderName: string,
  content: string
): Promise<ChatMessage> {
  // TODO: const res = await api.post(`/conversations/${conversationId}/messages`, { content }); return res.data.data
  const msg: ChatMessage = {
    id: `msg-${Date.now()}`,
    conversationId,
    senderId: "me",
    senderName,
    content,
    timestamp: new Date().toISOString(),
    status: "sent",
  }
  if (!messageStore[conversationId]) messageStore[conversationId] = []
  messageStore[conversationId].push(msg)
  return msg
}

export async function markAsRead(conversationId: string): Promise<void> {
  // TODO: await api.post(`/conversations/${conversationId}/read`)
}
