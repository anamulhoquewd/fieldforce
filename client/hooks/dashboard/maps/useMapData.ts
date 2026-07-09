import { useSocket } from "@/context/socketContext"
import { ITask, IWorker } from "@/interfaces"
import api from "@/lib/api"
import { handleAxiosError } from "@/lib/utils"
import { useEffect, useState } from "react"

export interface ILocation {
  userId: string
  latitude: number
  longitude: number
  updatedAt: string
}

function useMapData() {
  const socket = useSocket()
  const [workers, setWorkers] = useState<IWorker[]>([])
  const [locationMap, setLocationMap] = useState<Map<string, ILocation>>(
    new Map()
  )
  const [tasks, setTasks] = useState<ITask[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [wRes, lRes, tRes] = await Promise.allSettled([
          api.get("/memberships?type=worker"),
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
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    if (!socket) return

    const handleWorkerLocation = (data: {
      userId: string
      latitude: number
      longitude: number
      updatedAt?: string
    }) => {
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

  return { workers, locationMap, tasks, loading }
}

export default useMapData
