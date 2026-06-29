"use client"

import { LiveMap, WorkerWithLocation } from "@/components/dashboard/map/live-map"
import { WorkerListSidebar } from "@/components/dashboard/map/worker-list-sidebar"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useUser } from "@/context/authContext"
import useMapData, { ILocation } from "@/hooks/dashboard/maps/useMapData"
import { ITask, IWorker } from "@/interfaces"
import { useCallback, useMemo, useState } from "react"

const ONLINE_THRESHOLD_MS = 5 * 60 * 1000

export function mergeData(
  workers: IWorker[],
  locationMap: Map<string, ILocation>,
  tasks: ITask[]
): WorkerWithLocation[] {
  return workers.map((worker) => {
    const loc = locationMap.get(worker.id)
    const isOnline = loc
      ? Date.now() - new Date(loc.updatedAt).getTime() < ONLINE_THRESHOLD_MS
      : false
    const currentTask = tasks.find(
      (t) =>
        t.assignedTo === worker.id &&
        (t.status === "in_progress" || t.status === "pending")
    )
    const assignedTasks = tasks.reduce(
      (acc, curr) => {
        const isCurrent =
          curr.assignedTo === worker.id &&
          (curr.status === "in_progress" || curr.status === "pending")
        if (isCurrent) {
          acc.currentTask = curr
        }

        if (curr.assignedTo === worker.id) {
          acc.assignedTasks.push(curr)
        }

        return acc
      },
      { currentTask: {} as ITask, assignedTasks: [] as ITask[] }
    )

    return {
      ...worker,
      latitude: loc?.latitude,
      longitude: loc?.longitude,
      updatedAt: loc?.updatedAt,
      isOnline,
      currentTask: assignedTasks.currentTask,
      totalAssignedTask: assignedTasks.assignedTasks,
    }
  })
}

export default function MapPage() {
  const { user } = useUser()
  const { workers, locationMap, tasks } = useMapData()
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | undefined>()

  const enrichedWorkers = useMemo(
    () => mergeData(workers, locationMap, tasks),
    [workers, locationMap, tasks]
  )

  const handleWorkerSelect = useCallback((workerId: string) => {
    setSelectedWorkerId((prev) => (prev === workerId ? undefined : workerId))
  }, [])

  const handleLocate = useCallback((workerId: string) => {
    setSelectedWorkerId(workerId)
  }, [])

  if (user && user.role !== "manager") {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        This page is only available to managers.
      </div>
    )
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      <WorkerListSidebar
        workers={enrichedWorkers}
        selectedWorkerId={selectedWorkerId}
        onWorkerSelect={handleWorkerSelect}
        onLocate={handleLocate}
        headerLeft={
          <SidebarTrigger className="shrink-0 rounded-md border border-border bg-background shadow-sm hover:bg-muted/50" />
        }
      />

      <div className="relative flex flex-1 overflow-hidden">
        <LiveMap
          workers={enrichedWorkers}
          tasks={tasks}
          selectedWorkerId={selectedWorkerId}
          onWorkerClick={handleWorkerSelect}
        />
      </div>
    </div>
  )
}
