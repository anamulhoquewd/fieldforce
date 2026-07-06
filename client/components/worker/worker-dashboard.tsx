"use client"

import { TaskStatusChart } from "@/components/dashboard/task-status-chart"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import useWorkerChat from "@/hooks/chat/useWorkerChat"
import useTasks from "@/hooks/dashboard/tasks/useTasks"
import { ITask } from "@/interfaces"
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Clock,
  User,
} from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts"
import { StatCard } from "../dashboard/stat-card"
import { MessageThread } from "../chat/message-thread"

const statusFilterOptions = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "in_progress", label: "In Progress" },
  { id: "completed", label: "Completed" },
  { id: "overdue", label: "Due" },
]

const statusBadgeStyles: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  in_progress: "bg-blue-100 text-blue-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-gray-100 text-gray-600",
}

const statusDisplay: Record<string, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
  overdue: "Due",
}

function formatRelativeDate(value: string | null) {
  if (!value) return "No date"

  const date = new Date(value)
  const now = new Date()
  const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffSeconds < 60) return "Just now"
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function formatDeadline(value: string | null) {
  if (!value) return "No deadline"
  const date = new Date(value)
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export function isTaskOverdue(task: ITask) {
  if (!task.deadline) return false
  const deadline = new Date(task.deadline)
  const now = new Date()
  return deadline < now && task.status !== "completed"
}

function TaskStatusBarChart({
  data,
}: {
  data: { name: string; count: number; fill: string }[]
}) {
  const config = {
    count: { label: "Task Count", color: "#3b82f6" },
  }

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="items-center justify-between pb-3">
        <div>
          <CardTitle>Task activity</CardTitle>
          <CardDescription>Tasks grouped by state</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="h-90">
        <ChartContainer config={config} className="h-full">
          <BarChart
            data={data}
            margin={{ top: 16, right: 12, left: -10, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              stroke="var(--muted-foreground)"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
            />
            <YAxis
              stroke="var(--muted-foreground)"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              allowDecimals={false}
            />
            <RechartsTooltip
              content={<ChartTooltipContent hideLabel />}
              cursor={{ fill: "rgba(148,163,184,0.12)" }}
            />
            <Bar dataKey="count" radius={[8, 8, 0, 0]}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <div
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: item.fill }}
            />
            <span>{item.name}</span>
          </div>
        ))}
      </CardFooter>
    </Card>
  )
}

export function WorkerDashboard() {
  const { tasks, loading, refresh } = useTasks()
  const { manager, messages } = useWorkerChat()
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const overdueTaskCount = useMemo(
    () => tasks.filter((task) => isTaskOverdue(task)).length,
    [tasks]
  )

  const completedTaskCount = useMemo(
    () => tasks.filter((task) => task.status === "completed").length,
    [tasks]
  )

  const inProgressTaskCount = useMemo(
    () => tasks.filter((task) => task.status === "in_progress").length,
    [tasks]
  )

  const underReviewCount = useMemo(
    () => tasks.filter((task) => task.status === "pending").length,
    [tasks]
  )

  const filteredTasks = useMemo(() => {
    if (statusFilter === "all") return tasks
    if (statusFilter === "overdue") return tasks.filter(isTaskOverdue)
    return tasks.filter((task) => task.status === statusFilter)
  }, [statusFilter, tasks])

  const recentActivity = useMemo(
    () =>
      [...tasks]
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
        .slice(0, 3),
    [tasks]
  )

  const chartData = useMemo(
    () => [
      { name: "Pending", count: underReviewCount, fill: "#f59e0b" },
      { name: "In Progress", count: inProgressTaskCount, fill: "#3b82f6" },
      { name: "Completed", count: completedTaskCount, fill: "#10b981" },
      { name: "Due", count: overdueTaskCount, fill: "#ef4444" },
    ],
    [
      underReviewCount,
      inProgressTaskCount,
      completedTaskCount,
      overdueTaskCount,
    ]
  )

  return (
    <div className="space-y-6 px-4 py-6 md:px-8 md:py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium tracking-[0.18em] text-muted-foreground uppercase">
            Worker dashboard
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Your task overview
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={refresh}>
            Refresh data
          </Button>
          <Link href="/tasks">
            <Button size="sm">View all tasks</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={CheckCircle2}
          label="Completed"
          value={completedTaskCount}
          subtitle="You have finished tasks"
          accentColor="green"
          // trend={8}
        />
        <StatCard
          icon={CheckCircle2}
          label="Pending"
          value={underReviewCount}
          subtitle="Tasks waiting for your action"
          // trend={8}
          accentColor="blue"
        />
        <StatCard
          icon={Clock}
          label="In Progress"
          value={inProgressTaskCount}
          subtitle="Tasks you are currently working on"
          // trend={-2}
          accentColor="purple"
        />
        <StatCard
          icon={AlertCircle}
          label="Overdue"
          value={overdueTaskCount}
          subtitle="Tasks that are past their due date"
          // trend={0}
          accentColor="orange"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <TaskStatusBarChart data={chartData} />
        <TaskStatusChart
          counting={{
            pending: underReviewCount,
            inProgress: inProgressTaskCount,
            completed: completedTaskCount,
            overdue: overdueTaskCount,
          }}
        />
      </div>

      <div className="space-y-4 rounded-3xl border border-border bg-card p-4 shadow-sm md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Filters</h2>
            <p className="text-sm text-muted-foreground">
              Refine your task list by status.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {statusFilterOptions.map((filter) => (
              <Button
                key={filter.id}
                size="sm"
                variant={statusFilter === filter.id ? "secondary" : "outline"}
                onClick={() => setStatusFilter(filter.id)}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.8fr_1fr]">
        <Card className="space-y-4">
          <CardHeader className="flex items-start justify-between">
            <div>
              <CardTitle>Tasks</CardTitle>
              <CardDescription>
                Showing {filteredTasks.length}{" "}
                {filteredTasks.length === 1 ? "task" : "tasks"}
              </CardDescription>
            </div>
            <Link href="/tasks">
              <Button variant="secondary">View all</Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((placeholder) => (
                  <div
                    key={placeholder}
                    className="h-24 animate-pulse rounded-2xl bg-muted"
                  />
                ))}
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="rounded-2xl border border-border/70 bg-background p-8 text-center text-sm text-muted-foreground">
                No tasks match this filter.
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {filteredTasks.slice(0, 4).map((task) => (
                  <div
                    key={task.id}
                    className="rounded-3xl border border-border bg-background p-4 shadow-sm transition hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">
                          {task.title}
                        </h3>
                        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                          {task.description || "No description provided."}
                        </p>
                      </div>
                      <Badge
                        className={
                          statusBadgeStyles[task.status] ??
                          "bg-muted text-foreground"
                        }
                      >
                        {statusDisplay[task.status] ?? task.status}
                      </Badge>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{task.organization?.name ?? "Unknown org"}</span>
                      <span>{formatDeadline(task.deadline)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="max-h-100 overflow-hidden">
            <CardContent>
              <MessageThread />
            </CardContent>
            <CardFooter className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Open chat to continue the conversation.
              </span>
              <Link href="/chats">
                <Button variant="secondary" size="sm">
                  Open chat <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
