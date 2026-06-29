"use client"

import { mergeData } from "@/app/dashboard/maps/page"
import useMapData from "@/hooks/dashboard/maps/useMapData"
import { ITask } from "@/interfaces"
import { AlertCircle, CheckCircle2, Clock, ListTodo } from "lucide-react"
import { useMemo } from "react"
import { RecentTasksTable } from "./recent-tasks-table"
import { StatCard } from "./stat-card"
import { TaskStatusChart } from "./task-status-chart"
import { WorkerStatusList } from "./worker-status-list"

type GroupedTasks = {
  completed: ITask[]
  inProgress: ITask[]
  pending: ITask[]
  overdue: ITask[]
  recents: ITask[]
}

export function DashboardOverview() {
  const { workers, locationMap, tasks } = useMapData()

  const enrichedWorkers = useMemo(
    () => mergeData(workers, locationMap, tasks),
    [workers, locationMap, tasks]
  )

  // const { tasks, loading: tLoading, refresh } = useTasks()
  // const { loading: wLoading, workers } = useWorkers()
  // const workerWithStatus = useWorkerStatus(workers)

  const recentTasks = tasks.slice(0, 9)

  const groupedTasks = useMemo(() => {
    return tasks.reduce<GroupedTasks>(
      (acc, curr) => {
        switch (curr.status) {
          case "completed":
            acc.completed.push(curr)
            break

          case "in_progress":
            acc.inProgress.push(curr)
            break

          case "pending":
            acc.pending.push(curr)
        }

        if (curr.deadline) {
          if (
            curr.status !== "completed" &&
            new Date(curr.deadline) < new Date()
          ) {
            acc.overdue.push(curr)
          }
        }

        if (acc.recents.length < 5) acc.recents.push(curr)

        return acc
      },
      {
        completed: [],
        inProgress: [],
        overdue: [],
        recents: [],
        pending: [],
      }
    )
  }, [tasks])

  return (
    <div className="space-y-8">
      {/* Statistics Cards */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Welcome back! Here&apos;s what&apos;s happening with your tasks today.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:gap-5">
          <StatCard
            icon={ListTodo}
            label="Total Tasks"
            value={tasks.length}
            subtitle="All tasks"
            accentColor="blue"
            // trend={12}
          />
          <StatCard
            icon={CheckCircle2}
            label="Completed"
            value={groupedTasks.completed.length}
            subtitle="All over in this org"
            accentColor="green"
            // trend={8}
          />
          <StatCard
            icon={CheckCircle2}
            label="Pending"
            value={groupedTasks.pending.length}
            subtitle="All over in this org"
            // trend={8}
            accentColor="blue"
          />
          <StatCard
            icon={Clock}
            label="In Progress"
            value={groupedTasks.inProgress.length}
            subtitle="Active tasks"
            // trend={-2}
            accentColor="purple"
          />
          <StatCard
            icon={AlertCircle}
            label="Overdue"
            value={groupedTasks.overdue.length}
            subtitle="Needs attention"
            // trend={0}
            accentColor="orange"
          />
        </div>
      </div>

      {/* Charts and Lists */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Chart - Full Width on Small Screens */}
        <div className="lg:col-span-2">
          <TaskStatusChart
            counting={{
              completed: groupedTasks.completed.length,
              inProgress: groupedTasks.inProgress.length,
              pending: groupedTasks.pending.length,
              overdue: groupedTasks.overdue.length,
            }}
          />
        </div>

        {/* Worker Status - Sidebar on Large Screens */}
        <div>
          <WorkerStatusList workers={enrichedWorkers} />
        </div>
      </div>

      {/* Recent Tasks Table */}
      <div>
        <RecentTasksTable tasks={recentTasks} />
      </div>
    </div>
  )
}
