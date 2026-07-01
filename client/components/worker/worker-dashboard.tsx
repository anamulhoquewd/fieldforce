'use client'

import useTasks from '@/hooks/dashboard/tasks/useTasks'
// import { getWorkerStats, workerTasks } from '@/lib/worker-data'
import { useState } from 'react'
// import { ActivityFeed } from './activity-feed'
// import { CompletionChart } from './completion-chart'

interface WorkerDashboardProps {
  onTaskStatusChange?: (taskId: string, newStatus: 'todo' | 'in-progress' | 'completed') => void
}

export function WorkerDashboard({ onTaskStatusChange }: WorkerDashboardProps) {
  // const stats = getWorkerStats()
  // const [_, setTasks] = useState(workerTasks)
  const {tasks} = useTasks()

  const [filters, setFilters] = useState({
    status: ['todo', 'in-progress', 'completed'],
    priority: ['high', 'medium', 'low'],
    dueDate: 'all',
    project: 'All Projects',
  })

  // const filteredTasks = useMemo(() => {
  //   return tasks.filter((task) => {
  //     // Status filter
  //     if (!filters.status.includes(task.status)) return false

  //     // Priority filter
  //     if (!filters.priority.includes(task.priority)) return false

  //     // Project filter
  //     if (filters.project !== 'All Projects' && task.project !== filters.project) {
  //       return false
  //     }

  //     // Due date filter
  //     const today = new Date()
  //     today.setHours(0, 0, 0, 0)
  //     const taskDate = new Date(task.dueDate)
  //     taskDate.setHours(0, 0, 0, 0)

  //     if (filters.dueDate === 'today') {
  //       return taskDate.getTime() === today.getTime()
  //     } else if (filters.dueDate === 'this-week') {
  //       const weekEnd = new Date(today)
  //       weekEnd.setDate(weekEnd.getDate() + 7)
  //       return taskDate >= today && taskDate <= weekEnd
  //     } else if (filters.dueDate === 'overdue') {
  //       return taskDate < today && task.status !== 'completed'
  //     }

  //     return true
  //   })
  // }, [tasks, filters])

  // const handleStatusChange = (taskId: string, newStatus: 'todo' | 'in-progress' | 'completed') => {
  //   setTasks(
  //     tasks.map((t) =>
  //       t.id === taskId ? { ...t, status: newStatus, progress: newStatus === 'completed' ? 100 : t.progress } : t
  //     )
  //   )
  //   onTaskStatusChange?.(taskId, newStatus)
  // }

  return (
    <div className="space-y-8">
      {/* Quick Stats */}
      {/* <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Welcome back!</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={CheckCircle2}
            label="Completed Today"
            value={stats.completedTasks}
            subtitle={`${stats.completionRatio}% completion rate`}
            accentColor="green"
          />
          <StatCard
            icon={Clock}
            label="In Progress"
            value={stats.inProgressTasks}
            subtitle="Active tasks"
            accentColor="blue"
          />
          <StatCard
            icon={TrendingUp}
            label="Hours Logged"
            value={`${stats.totalHoursLogged}h`}
            subtitle="This week"
            accentColor="purple"
          />
          <StatCard
            icon={AlertCircle}
            label="Overdue"
            value={stats.overdueTasks}
            subtitle="Need attention"
            accentColor="red"
          />
        </div>
      </div> */}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        {/* <div className="lg:col-span-1">
          <TaskFilters
            filters={filters}
            onStatusChange={(status) => setFilters({ ...filters, status })}
            onPriorityChange={(priority) => setFilters({ ...filters, priority })}
            onDueDateChange={(dueDate) => setFilters({ ...filters, dueDate })}
            onProjectChange={(project) => setFilters({ ...filters, project })}
            onReset={() =>
              setFilters({
                status: ['todo', 'in-progress', 'completed'],
                priority: ['high', 'medium', 'low'],
                dueDate: 'all',
                project: 'All Projects',
              })
            }
          />
        </div> */}

        {/* Tasks Grid */}
        {/* <div className="lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-foreground">
              My Tasks ({filteredTasks.length})
            </h3>
          </div>
          {filteredTasks.length === 0 ? (
            <div className="rounded-lg border border-border/50 bg-card p-12 text-center">
              <p className="text-muted-foreground">No tasks match your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTasks.map((task) => (
                <WorkerTaskCard
                  key={task.id}
                  task={task}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          )}
        </div> */}
      </div>

      {/* Bottom Section - Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* <CompletionChart data={monthlyCompletionData} />
        <ActivityFeed activities={activityLogs.slice(0, 5)} /> */}
      </div>
    </div>
  )
}
