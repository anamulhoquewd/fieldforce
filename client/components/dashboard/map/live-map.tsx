"use client"

import { ITask } from "@/interfaces"
import { useEffect, useRef, useState } from "react"

export interface WorkerWithLocation {
  id: string
  name: string
  email: string
  latitude?: number
  longitude?: number
  updatedAt?: string
  isOnline: boolean
  currentTask?: ITask
  totalAssignedTask?: ITask[]
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const WORKER_PALETTE = [
  "#f97316", // orange
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#14b8a6", // teal
  "#6366f1", // indigo
  "#f43f5e", // rose
]

export function getWorkerColor(name: string): string {
  return WORKER_PALETTE[name.charCodeAt(0) % WORKER_PALETTE.length]
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("")
}

function firstName(name: string): string {
  return name.split(" ")[0] ?? name
}

// ─── SVG Marker builders ─────────────────────────────────────────────────────

function createWorkerIcon(
  initials: string,
  name: string,
  online: boolean
): google.maps.Icon {
  const color = online ? getWorkerColor(name) : "#9ca3af"
  const label = firstName(name)
  const pillW = Math.max(44, label.length * 7 + 16)
  const pillX = 30 - pillW / 2
  // Teal border attached directly to the circle edge (no gap)
  const stroke = online ? "#14b8a6" : "#e5e7eb"
  const strokeW = online ? 3 : 1.5

  // viewBox 60×72 — circle center (30,28) r=22
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 72">
    <circle cx="30" cy="28" r="22" fill="${color}" stroke="${stroke}" stroke-width="${strokeW}"/>
    <text x="30" y="28" text-anchor="middle" dominant-baseline="central" fill="white" font-size="13" font-weight="700" font-family="system-ui,Arial,sans-serif">${initials}</text>
    <rect x="${pillX}" y="54" width="${pillW}" height="15" rx="7.5" fill="white" fill-opacity="0.93"/>
    <text x="30" y="61.5" text-anchor="middle" dominant-baseline="central" fill="#111827" font-size="10" font-weight="600" font-family="system-ui,Arial,sans-serif">${label}</text>
  </svg>`

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new google.maps.Size(60, 72),
    anchor: new google.maps.Point(30, 50),
  }
}

function createTaskIcon(status: string): google.maps.Icon {
  const colorMap: Record<string, string> = {
    pending: "#3b82f6",
    in_progress: "#f97316",
    completed: "#22c55e",
    cancelled: "#ef4444",
  }
  const color = colorMap[status] ?? "#6b7280"
  // Classic teardrop / map-pin shape
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 34">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 8.28 12 22 12 22S24 20.28 24 12C24 5.37 18.63 0 12 0z" fill="${color}"/>
    <circle cx="12" cy="12" r="5" fill="white" fill-opacity="0.55"/>
  </svg>`
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new google.maps.Size(24, 34),
    anchor: new google.maps.Point(12, 34),
  }
}

// ─── InfoWindow HTML ─────────────────────────────────────────────────────────

function buildInfoWindowContent(worker: WorkerWithLocation): string {
  const initials = getInitials(worker.name)
  const color = worker.isOnline ? getWorkerColor(worker.name) : "#9ca3af"
  const taskRef = worker.currentTask
    ? `FF-${worker.currentTask.id.slice(0, 4).toUpperCase()}`
    : null

  return `
    <div style="min-width:240px;max-width:272px;font-family:system-ui,-apple-system,sans-serif;padding:2px 0 4px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
        <div style="width:42px;height:42px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;color:white;font-size:15px;font-weight:700;flex-shrink:0">${initials}</div>
        <div style="min-width:0">
          <div style="font-weight:600;font-size:15px;color:#111827;line-height:1.2">${worker.name}</div>
          <div style="display:flex;align-items:center;gap:5px;margin-top:3px">
            <span style="width:7px;height:7px;border-radius:50%;background:${worker.isOnline ? "#22c55e" : "#9ca3af"};flex-shrink:0;display:inline-block"></span>
            <span style="font-size:12px;color:#6b7280">${worker.isOnline ? "Online" : "Offline"}</span>
          </div>
        </div>
      </div>
      <div style="border-top:1px solid #f3f4f6;padding-top:10px;margin-bottom:12px">
        ${
          worker.currentTask && taskRef
            ? `<div style="font-size:12px;color:#6b7280;margin-bottom:3px">On task &middot; <span style="font-family:monospace;font-size:11px;color:#4b5563;font-weight:600">${taskRef}</span></div>
               <div style="font-size:13px;color:#111827;font-weight:600;line-height:1.35">${worker.currentTask.title}</div>`
            : `<div style="font-size:12px;color:#9ca3af">No active task assigned</div>`
        }
      </div>
      <div style="display:flex;gap:8px">
        <button style="flex:1;padding:7px 0;border:1.5px solid #e5e7eb;border-radius:7px;font-size:12px;font-weight:600;color:#374151;background:white;cursor:default;font-family:inherit">Message</button>
        <button style="flex:1;padding:7px 0;border:none;border-radius:7px;font-size:12px;font-weight:600;color:white;background:#2563eb;cursor:default;font-family:inherit">Assign task</button>
      </div>
    </div>
  `
}

// ─── Legend ──────────────────────────────────────────────────────────────────

const LEGEND_ITEMS = [
  { label: "Open", color: "#3b82f6" },
  { label: "Overdue", color: "#f97316" },
  { label: "Blocked", color: "#ef4444" },
  { label: "Completed", color: "#22c55e" },
]

// ─── Component ───────────────────────────────────────────────────────────────

interface LiveMapProps {
  workers: WorkerWithLocation[]
  tasks: ITask[]
  selectedWorkerId?: string
  onWorkerClick: (workerId: string) => void
}

export function LiveMap({
  workers,
  tasks,
  selectedWorkerId,
  onWorkerClick,
}: LiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<google.maps.Map | null>(null)
  const workerMarkers = useRef<Map<string, google.maps.Marker>>(new Map())
  const taskMarkersRef = useRef<google.maps.Marker[]>([])
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null)
  const onWorkerClickRef = useRef(onWorkerClick)
  const [mapReady, setMapReady] = useState(false)

  useEffect(() => {
    onWorkerClickRef.current = onWorkerClick
  }, [onWorkerClick])

  // Initialize map once
  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current || mapInstance.current) return
      if (typeof google === "undefined" || !google.maps) return

      mapInstance.current = new google.maps.Map(mapRef.current, {
        center: { lat: 23.8103, lng: 90.4125 },
        zoom: 12,
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
        zoomControl: true,
        zoomControlOptions: {
          position: google.maps.ControlPosition.RIGHT_BOTTOM,
        },
      })

      infoWindowRef.current = new google.maps.InfoWindow({ maxWidth: 290 })
      setMapReady(true)
    }

    if (typeof google !== "undefined" && google.maps) {
      initMap()
    } else {
      window.addEventListener("google-maps-loaded", initMap)
      return () => window.removeEventListener("google-maps-loaded", initMap)
    }
  }, [])

  // Sync worker markers when data changes
  useEffect(() => {
    if (!mapReady || !mapInstance.current) return

    const currentIds = new Set<string>()

    workers.forEach((worker) => {
      if (!worker.latitude || !worker.longitude) return
      currentIds.add(worker.id)

      const pos = { lat: worker.latitude, lng: worker.longitude }
      const icon = createWorkerIcon(
        getInitials(worker.name),
        worker.name,
        worker.isOnline
      )

      if (workerMarkers.current.has(worker.id)) {
        const marker = workerMarkers.current.get(worker.id)!
        marker.setPosition(pos)
        marker.setIcon(icon)
      } else {
        const marker = new google.maps.Marker({
          position: pos,
          map: mapInstance.current,
          icon,
          title: worker.name,
          zIndex: 10,
        })
        marker.addListener("click", () => {
          onWorkerClickRef.current(worker.id)
        })
        workerMarkers.current.set(worker.id, marker)
      }
    })

    workerMarkers.current.forEach((marker, id) => {
      if (!currentIds.has(id)) {
        marker.setMap(null)
        workerMarkers.current.delete(id)
      }
    })
  }, [mapReady, workers])

  // Rebuild task pins when tasks change
  useEffect(() => {
    if (!mapReady || !mapInstance.current) return

    taskMarkersRef.current.forEach((m) => m.setMap(null))
    taskMarkersRef.current = []

    tasks.forEach((task) => {
      if (!task.latitude || !task.longitude) return
      const marker = new google.maps.Marker({
        position: { lat: task.latitude, lng: task.longitude },
        map: mapInstance.current,
        icon: createTaskIcon(task.status),
        title: task.title,
        zIndex: 5,
      })
      taskMarkersRef.current.push(marker)
    })
  }, [mapReady, tasks])

  // Pan + open InfoWindow when selected worker changes
  useEffect(() => {
    if (!mapReady || !mapInstance.current || !infoWindowRef.current) return

    if (!selectedWorkerId) {
      infoWindowRef.current.close()
      return
    }

    const worker = workers.find((w) => w.id === selectedWorkerId)
    if (!worker || !worker.latitude || !worker.longitude) {
      infoWindowRef.current.close()
      return
    }

    mapInstance.current.panTo({ lat: worker.latitude, lng: worker.longitude })
    mapInstance.current.setZoom(15)

    const marker = workerMarkers.current.get(selectedWorkerId)
    infoWindowRef.current.setContent(buildInfoWindowContent(worker))
    infoWindowRef.current.open(mapInstance.current, marker)
  }, [mapReady, selectedWorkerId, workers])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      workerMarkers.current.forEach((m) => m.setMap(null))
      workerMarkers.current.clear()
      taskMarkersRef.current.forEach((m) => m.setMap(null))
      taskMarkersRef.current = []
    }
  }, [])

  return (
    <div className="relative flex-1 overflow-hidden">
      <div ref={mapRef} className="h-full w-full" />

      {/* Task pin legend — bottom-left, 2-col grid */}
      <div className="absolute bottom-6 left-4 rounded-xl border border-border bg-background px-4 py-3.5 shadow-md">
        <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
          Task pins
        </p>
        <div className="grid grid-cols-2 gap-x-5 gap-y-1.5">
          {LEGEND_ITEMS.map(({ label, color }) => (
            <div key={label} className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs text-gray-600">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
