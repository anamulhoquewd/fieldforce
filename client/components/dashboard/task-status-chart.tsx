"use client"

import { TrendingUp } from "lucide-react"
import { Cell, Pie, PieChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

export const description = "Task Status Distribution"

const chartConfig = {
  count: {
    label: "Task Count",
  },
  pending: {
    label: "Pending",
    color: "#f59e0b",
  },
  inProgress: {
    label: "In Progress",
    color: "#3b82f6",
  },
  completed: {
    label: "Completed",
    color: "#10b981",
  },
  overdue: {
    label: "Overdue",
    color: "#ef4444",
  },
} satisfies ChartConfig

export function TaskStatusChart({
  counting,
}: {
  counting?: {
    pending: number
    inProgress: number
    completed: number
    overdue: number
  }
} = {}) {
  const defaultCounting = {
    pending: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0,
  }

  const data = counting || defaultCounting

  const chartData = [
    {
      status: "pending",
      count: data.pending,
      fill: chartConfig.pending.color,
      label: chartConfig.pending.label,
    },
    {
      status: "inProgress",
      count: data.inProgress,
      fill: chartConfig.inProgress.color,
      label: chartConfig.inProgress.label,
    },
    {
      status: "completed",
      count: data.completed,
      fill: chartConfig.completed.color,
      label: chartConfig.completed.label,
    },
    {
      status: "overdue",
      count: data.overdue,
      fill: chartConfig.overdue.color,
      label: chartConfig.overdue.label,
    },
  ].filter((item) => item.count > 0)

  const totalTasks =
    data.pending + data.inProgress + data.completed + data.overdue

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-2">
        <CardTitle>Task Status Distribution</CardTitle>
        <CardDescription>Overview of all tasks by status</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-2">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-72"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="label"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={({ label, count }: any) => `${label}: ${count}`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-3 px-6 pb-4 text-sm">
        <div className="grid w-full grid-cols-2 gap-4 text-xs">
          {chartData.map((item) => (
            <div key={item.status} className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: item.fill }}
              />
              <span className="text-muted-foreground">
                {item.label}: {item.count}
              </span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 leading-none font-medium">
          Total: {totalTasks} tasks <TrendingUp className="h-4 w-4" />
        </div>
      </CardFooter>
    </Card>
  )
}
