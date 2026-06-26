"use client"

import { LiveMap, WorkerWithLocation } from "@/components/dashboard/map/live-map"
import { WorkerListSidebar } from "@/components/dashboard/map/worker-list-sidebar"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useUser } from "@/context/authContext"
import { ITask, IWorker } from "@/interfaces"
import api from "@/lib/api"
import { handleAxiosError } from "@/lib/utils"
import { useCallback, useEffect, useState } from "react"
import { useSocket } from "@/context/socketContext"

// ─── Types ───────────────────────────────────────────────────────────────────

interface ILocation {
  userId: string
  latitude: number
  longitude: number
  updatedAt: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ONLINE_THRESHOLD_MS = 5 * 60 * 1000 // 5 minutes

function mergeData(
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
    return {
      ...worker,
      latitude: loc?.latitude,
      longitude: loc?.longitude,
      updatedAt: loc?.updatedAt,
      isOnline,
      currentTask,
    }
  })
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function MapPage() {
  const { user } = useUser()
  const socket = useSocket()
  const [workers, setWorkers] = useState<IWorker[]>([])
  const [locationMap, setLocationMap] = useState<Map<string, ILocation>>(
    new Map()
  )
  const [tasks, setTasks] = useState<ITask[]>([])
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | undefined>()

  // Fetch workers, locations, and tasks in parallel
  useEffect(() => {
    const load = async () => {
      try {
        const [wRes, lRes, tRes] = await Promise.allSettled([
          api.get("/memberships/workers"),
          api.get("/locations"),
          api.get("/tasks/list"),
        ])

        if (wRes.status === "fulfilled" && wRes.value.data.success) {
          setWorkers(wRes.value.data.data)
        }

        if (lRes.status === "fulfilled") {
          const raw = lRes.value.data
          const locs: ILocation[] = raw.success
            ? raw.data
            : Array.isArray(raw)
              ? raw
              : []
          setLocationMap(new Map(locs.map((l) => [l.userId, l])))
        }

        if (tRes.status === "fulfilled" && tRes.value.data.success) {
          setTasks(tRes.value.data.data)
        }
      } catch (err) {
        handleAxiosError(err)
      }
    }
    load()
  }, [])

  useEffect(() => {
    if (!socket) return

    const handleWorkerLocation = (data: { userId: string; latitude: number; longitude: number; updatedAt?: string }) => {
      setLocationMap((prev) => {
        const next = new Map(prev)
        next.set(data.userId, {
          userId: data.userId,
          latitude: data.latitude,
          longitude: data.longitude,
          updatedAt: data.updatedAt ?? new Date().toISOString(),
        })
        return next
      })
    }

    socket.on("worker-location", handleWorkerLocation)

    return () => {
      socket.off("worker-location", handleWorkerLocation)
    }
  }, [socket])

  const enrichedWorkers = mergeData(workers, locationMap, tasks)

  const handleWorkerSelect = useCallback((workerId: string) => {
    setSelectedWorkerId((prev) => (prev === workerId ? undefined : workerId))
  }, [])

  const handleLocate = useCallback((workerId: string) => {
    setSelectedWorkerId(workerId)
  }, [])

  if (user && user.role !== "manager") {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-gray-400">
        This page is only available to managers.
      </div>
    )
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Left: worker list — SidebarTrigger lives in the header, same as chat page */}
      <WorkerListSidebar
        workers={enrichedWorkers}
        selectedWorkerId={selectedWorkerId}
        onWorkerSelect={handleWorkerSelect}
        onLocate={handleLocate}
        headerLeft={
          <SidebarTrigger className="shrink-0 rounded-md border border-gray-200 bg-white shadow-sm hover:bg-gray-50" />
        }
      />

      {/* Right: map panel */}
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
