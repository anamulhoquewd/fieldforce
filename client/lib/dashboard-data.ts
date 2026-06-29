export type Task = {
  id: string
  title: string
  assignee: string
  status: 'Completed' | 'In Progress' | 'Pending'
  location?: string
  deadline: string
  priority: 'High' | 'Medium' | 'Low'
}

export type Worker = {
  id: string
  name: string
  status: 'Online' | 'Away' | 'Offline'
  activeTasks: number
  location?: string
}

export type TaskStatistic = {
  status: 'Completed' | 'In Progress' | 'Pending'
  count: number
}

export const tasks: Task[] = [
  {
    id: '1',
    title: 'Complete Q1 reports',
    assignee: 'Alex Morgan',
    status: 'Completed',
    location: '28.6139°N, 77.2090°E',
    deadline: '2024-01-15',
    priority: 'High',
  },
  {
    id: '2',
    title: 'Review budget proposal',
    assignee: 'Marcus Reyes',
    status: 'In Progress',
    location: '34.0522°N, 118.2437°W',
    deadline: '2024-01-18',
    priority: 'High',
  },
  {
    id: '3',
    title: 'Team sync meeting',
    assignee: 'Dana Cole',
    status: 'Pending',
    deadline: '2024-01-10',
    priority: 'Medium',
  },
  {
    id: '4',
    title: 'Update client documentation',
    assignee: 'Priya Shah',
    status: 'In Progress',
    location: '40.7128°N, 74.0060°W',
    deadline: '2024-01-22',
    priority: 'Medium',
  },
  {
    id: '5',
    title: 'Fix critical bug in API',
    assignee: 'Jordan Webb',
    status: 'Completed',
    deadline: '2024-01-12',
    priority: 'High',
  },
  {
    id: '6',
    title: 'Deploy new feature to production',
    assignee: 'Tom Becker',
    status: 'In Progress',
    location: '51.5074°N, 0.1278°W',
    deadline: '2024-01-20',
    priority: 'High',
  },
  {
    id: '7',
    title: 'Write unit tests for module',
    assignee: 'Sara Lin',
    status: 'Pending',
    deadline: '2024-01-25',
    priority: 'Low',
  },
  {
    id: '8',
    title: 'Client onboarding call',
    assignee: 'Nina Patel',
    status: 'Completed',
    deadline: '2024-01-08',
    priority: 'High',
  },
]

export const workers: Worker[] = [
  {
    id: '1',
    name: 'Alex Morgan',
    status: 'Online',
    activeTasks: 3,
    location: '28.6139°N, 77.2090°E',
  },
  {
    id: '2',
    name: 'Marcus Reyes',
    status: 'Online',
    activeTasks: 2,
    location: '34.0522°N, 118.2437°W',
  },
  {
    id: '3',
    name: 'Dana Cole',
    status: 'Online',
    activeTasks: 1,
  },
  {
    id: '4',
    name: 'Priya Shah',
    status: 'Away',
    activeTasks: 2,
    location: '40.7128°N, 74.0060°W',
  },
  {
    id: '5',
    name: 'Jordan Webb',
    status: 'Offline',
    activeTasks: 0,
  },
]

export const taskStatistics: TaskStatistic[] = [
  { status: 'Completed', count: 3 },
  { status: 'In Progress', count: 3 },
  { status: 'Pending', count: 2 },
]

export function getRecentTasks(limit: number = 5): Task[] {
  return tasks.slice(0, limit)
}

export function getTaskStatistics(): TaskStatistic[] {
  return taskStatistics
}

export function getActiveWorkers(): Worker[] {
  return workers.filter((w) => w.status === 'Online')
}

export function getTotalTasks(): number {
  return tasks.length
}

export function getCompletedTasks(): number {
  return tasks.filter((t) => t.status === 'Completed').length
}

export function getInProgressTasks(): number {
  return tasks.filter((t) => t.status === 'In Progress').length
}

export function getOverdueTasks(): number {
  const today = new Date()
  return tasks.filter((t) => {
    const deadline = new Date(t.deadline)
    return deadline < today && t.status !== 'Completed'
  }).length
}
