export interface IWorker {
  id: string
  name: string
  email: string
  status?: 'Online' | 'Away' | 'Offline'
  activeTasks?: number
  lastSeen?: string
}

export interface ICreator {
  id: string
  name: string
  email: string
}

export interface IOrganization {
  id: string
  name: string
}

export interface IInvitation {
  id: string
  organizationId: string
  email: string
  role: "worker" | "manager"
  status: "pending" | "accepted" | "declined"

  createdAt: string
  updatedAt: string
}

export interface IMembership {
  id: string
  userId: string
  organizationId: string
  role: "worker" | "manager"
  name: string
  email: string
  joinedAt: string

  createdAt: string
  updatedAt: string
}

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

export type TaskStatus = "pending" | "in_progress" | "completed" | "cancelled"

export interface ITask {
  id: string
  organizationId: string
  title: string
  description: string
  creatorId: string
  assignedTo: string | null
  status: TaskStatus
  latitude: number
  longitude: number
  deadline: string | null
  createdAt: string
  updatedAt: string

  assignedWorker: IWorker | null
  creator: ICreator
  organization: IOrganization
}
