import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ITask } from '@/interfaces'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface RecentTasksTableProps {
  tasks: ITask[]
}

const statusStyles = {
  Completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  'In Progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
  Pending: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
}

// const priorityStyles = {
//   High: 'text-red-600 dark:text-red-400',
//   Medium: 'text-yellow-600 dark:text-yellow-400',
//   Low: 'text-green-600 dark:text-green-400',
// }

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  if (date.toDateString() === today.toDateString()) {
    return 'Today'
  }
  if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow'
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

export function RecentTasksTable({ tasks }: RecentTasksTableProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Recent Tasks</h3>
        <Link href="/dashboard/tasks">
          <Button variant="ghost" size="sm" className="gap-2">
            View All
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="pb-3 text-left font-medium text-muted-foreground">
                Task
              </th>
              <th className="pb-3 text-left font-medium text-muted-foreground">
                Assignee
              </th>
              <th className="pb-3 text-left font-medium text-muted-foreground">
                Status
              </th>
              <th className="pb-3 text-left font-medium text-muted-foreground">
                Deadline
              </th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id} className="border-b border-border last:border-b-0">
                <td className="py-3">
                  <p className="font-medium text-foreground">{task.title}</p>
                </td>
                <td className="py-3">
                  <p className="text-muted-foreground">{task?.assignedWorker?.name || "_"}</p>
                </td>
                <td className="py-3">
                  <Badge
                    className={
                      statusStyles[task.status as keyof typeof statusStyles]
                    }
                    variant="outline"
                  >
                    {task.status}
                  </Badge>
                </td>
                <td className="py-3">
                  <p
                    className={`${
                      new Date(task.deadline || new Date()) < new Date() &&
                      task.status !== 'completed'
                        ? 'font-semibold text-red-600 dark:text-red-400'
                        : 'text-muted-foreground'
                    }`}
                  >
                    { task.deadline ? formatDate(task.deadline) : "_"}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
